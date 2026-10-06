import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import { BlogService } from "@/modules/blog/services/blog.service";
import mongoose from "mongoose";
import { createBlogSchema } from "@/lib/validators/blog.schema";

import { semanticIndexerService } from "@/modules/seo/services/semanticIndexer.service";
import { PushService } from "@/lib/notifications/push.service";
import { revalidateTag, revalidatePath } from "next/cache";
import { SeoPreflightService } from "@/modules/seo/services/seo-preflight.service";
import { PublishPipelineService } from "@/modules/seo/services/publish-pipeline.service";
import { waitUntil } from "@vercel/functions";

// Give Vercel 30s before cutting off the function
export const maxDuration = 30;

async function requireAdmin() {
  // Run auth check and DB connection in parallel — saves ~500ms
  const [session] = await Promise.all([auth(), dbConnect()]);
  if (!session || session.user.role !== "admin") return null;
  return session;
}

// Helper: clean error message from any error type
function errorMsg(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

// GET - fetch single blog or list
export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const id = req.nextUrl.searchParams.get("id");

    if (id) {
      const blog = await BlogService.getBlogById(id);
      if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(blog);
    }

    const blogs = await BlogService.getAdminBlogs();
    return NextResponse.json(blogs);
  } catch (err) {
    console.error("[GET /api/admin/blogs]", err);
    return NextResponse.json({ error: errorMsg(err) }, { status: 500 });
  }
}

// POST - create new blog
export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    
    // Validating request body with Zod
    const validation = createBlogSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message, details: validation.error.format() }, { status: 400 });
    }

    const { title, slug, excerpt, content, category, tags, visibility, status,
      isTrending, commentsEnabled, seo, featuredImage, contentType,
      ogImage, aiSummary, reportType, citations,
      publishAt, unpublishAt, isBreaking, breakingUntil, isFeatured, featuredUntil,
      countries, leaders, conflicts, organizations, topics, featuredImageWidth, featuredImageHeight } = validation.data;

    // Get author ObjectId from the authenticated session (never trust client-provided authorId)
    let authorObjectId: mongoose.Types.ObjectId;
    try {
      authorObjectId = new mongoose.Types.ObjectId(session.user.id);
    } catch {
      return NextResponse.json({ error: "Invalid session user ID" }, { status: 400 });
    }

    // Handle slug conflict: if slug exists, append timestamp suffix
    let finalSlug = slug;
    const existing = await BlogService.getBlogBySlug(slug);
    if (existing) {
      // If it's a draft with same slug, just update it instead of creating duplicate
      if (existing.status === "draft") {
        const updateData: Record<string, unknown> = {
          title, excerpt, content, category,
          tags: tags ?? [],
          visibility: visibility ?? "public",
          status: status ?? "published",
          isTrending: isTrending ?? false,
          commentsEnabled: commentsEnabled ?? true,
          featuredImage: featuredImage ?? "",
          ogImage: ogImage ?? "",
          aiSummary: aiSummary ?? "",
          reportType: reportType ?? "",
          citations: citations ?? [],
          isBreaking: isBreaking ?? false,
          breakingUntil: breakingUntil || undefined,
          isFeatured: isFeatured ?? false,
          featuredUntil: featuredUntil || undefined,
          unpublishAt: unpublishAt || undefined,
          countries: countries ?? [],
          leaders: leaders ?? [],
          conflicts: conflicts ?? [],
          organizations: organizations ?? [],
          topics: topics ?? [],
          featuredImageWidth: featuredImageWidth,
          featuredImageHeight: featuredImageHeight,
          seo: {
            focusKeyword: seo?.focusKeyword || "",
            title: seo?.title || title,
            description: seo?.description || excerpt,
            keywords: seo?.keywords ?? [],
            canonicalUrl: seo?.canonicalUrl || "",
            robots: seo?.robots || "index,follow",
          },
          publishAt: publishAt ? new Date(publishAt as string) : new Date(),
        };
        if (updateData.status === "published") {
          const seoErrors = SeoPreflightService.validateForPublishing(updateData as any);
          if (seoErrors.length > 0) {
            return NextResponse.json({ error: "SEO Pre-flight failed", details: seoErrors }, { status: 400 });
          }
        }
        
        const updated = await BlogService.updateBlog(existing._id.toString(), updateData);
        if (updated?.status === "published") {
          revalidateTag("blogs");
          revalidatePath("/", "page");
          revalidatePath("/blogs", "page");
          if (updated.category) {
            revalidatePath(`/categories/${updated.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, "page");
          }
          revalidatePath("/sitemap.xml", "layout");
          revalidatePath("/sitemap-index.xml");

          await PushService.notifyBlog(updated).catch(e => console.error("[PushService] Failed:", e));
        } else {
          semanticIndexerService.unindexBlog(existing._id.toString()).catch(e => console.error("Semantic Unindexing Failed:", e));
        }
        return NextResponse.json({ success: true, id: updated!._id.toString(), slug: updated!.slug }, { status: 200 });
      }
      return NextResponse.json(
        {
          success: false,
          code: "SLUG_ALREADY_PUBLISHED",
          error: "An article with this slug is already published.",
          existingBlogId: existing._id.toString()
        },
        { status: 409 }
      );
    }

    const newBlogData = {
      title,
      slug: finalSlug,
      excerpt,
      content,
      category,
      tags: tags ?? [],
      visibility: visibility ?? "public",
      status: status ?? "draft",
      isTrending: isTrending ?? false,
      commentsEnabled: commentsEnabled ?? true,
      featuredImage: featuredImage ?? "",
      contentType: contentType ?? "standard",
      ogImage: ogImage ?? "",
      aiSummary: aiSummary ?? "",
      reportType: reportType ?? "",
      citations: citations ?? [],
      isBreaking: isBreaking ?? false,
      breakingUntil: breakingUntil ? new Date(breakingUntil as string) : undefined,
      isFeatured: isFeatured ?? false,
      featuredUntil: featuredUntil ? new Date(featuredUntil as string) : undefined,
      unpublishAt: unpublishAt ? new Date(unpublishAt as string) : undefined,
      countries: (countries ?? []).map((id: string) => new mongoose.Types.ObjectId(id)),
      leaders: (leaders ?? []).map((id: string) => new mongoose.Types.ObjectId(id)),
      conflicts: (conflicts ?? []).map((id: string) => new mongoose.Types.ObjectId(id)),
      organizations: (organizations ?? []).map((id: string) => new mongoose.Types.ObjectId(id)),
      topics: (topics ?? []).map((id: string) => new mongoose.Types.ObjectId(id)),
      featuredImageWidth,
      featuredImageHeight,
      seo: {
        focusKeyword: seo?.focusKeyword || "",
        title: seo?.title || title,
        description: seo?.description || excerpt,
        keywords: seo?.keywords ?? [],
        canonicalUrl: seo?.canonicalUrl || "",
        robots: seo?.robots || "index,follow",
      },
      author: authorObjectId,
      publishAt: publishAt ? new Date(publishAt as string) : new Date(),
      analytics: { views: 0, likes: 0, bookmarks: 0, readTime: 0, ctr: 0 },
    };

    if (newBlogData.status === "published") {
      const seoErrors = SeoPreflightService.validateForPublishing(newBlogData as any);
      if (seoErrors.length > 0) {
        return NextResponse.json({ error: "SEO Pre-flight failed", details: seoErrors }, { status: 400 });
      }
    }

    const blog = await BlogService.createBlog(newBlogData as any);

    if (blog.status === "published") {
      waitUntil(
        PublishPipelineService.execute(blog._id.toString()).catch(e =>
          console.error("[PublishPipeline] POST failed:", e)
        )
      );
      waitUntil(PushService.notifyBlog(blog).catch(e => console.error("[PushService] Failed:", e)));
    }

    return NextResponse.json({ success: true, id: blog._id.toString(), slug: blog.slug }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/blogs]", err);
    return NextResponse.json({ error: errorMsg(err) }, { status: 500 });
  }
}

// PATCH - update blog (admin - permissive, trusts editor)
export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { id, ...rest } = body;
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    // Allowlist updatable fields (everything from the editor)
    const ALLOWED = [
      "title", "slug", "excerpt", "content", "category", "tags",
      "visibility", "status", "isTrending", "commentsEnabled",
      "featuredImage", "ogImage", "seo", "aiSummary", "reportType",
      "publishAt", "unpublishAt", "isBreaking", "breakingUntil",
      "isFeatured", "featuredUntil", "citations", "contentType",
      "entityRelations", "draftSnapshot", "previousVersions",
      "countries", "leaders", "conflicts", "organizations", "topics",
      "featuredImageWidth", "featuredImageHeight",
    ];

    const updateData: Record<string, unknown> = {};
    for (const key of ALLOWED) {
      if (rest[key] !== undefined) updateData[key] = rest[key];
    }

    // Auto-fill SEO defaults on publish
    if (rest.status === "published") {
      if (!rest.publishAt) updateData.publishAt = new Date();

      // Auto-set canonical URL if not provided
      const seo = (updateData.seo as any) || rest.seo || {};
      if (!seo.canonicalUrl && rest.slug) {
        seo.canonicalUrl = `https://www.globalchanakya.in/blogs/${rest.slug}`;
      }
      // Auto-fill meta title/description from content if empty
      if (!seo.title && rest.title) {
        seo.title = rest.title.length > 60 ? rest.title.slice(0, 57) + "..." : rest.title;
      }
      if (!seo.description && rest.excerpt) {
        seo.description = rest.excerpt.length > 160 ? rest.excerpt.slice(0, 157) + "..." : rest.excerpt;
      }
      updateData.seo = seo;
    }

    const existing = await BlogService.getBlogById(id);
    const wasDraft = existing?.status === "draft";

    const isPublishing = updateData.status === "published" || (updateData.status === undefined && existing?.status === "published");
    if (isPublishing) {
      const mergedData = { ...existing, ...updateData };
      const seoErrors = SeoPreflightService.validateForPublishing(mergedData as any);
      if (seoErrors.length > 0) {
        return NextResponse.json({ error: "SEO Pre-flight failed", details: seoErrors }, { status: 400 });
      }
    }

    const updated = await BlogService.updateBlog(id, updateData);
    if (!updated) return NextResponse.json({ error: "Blog not found" }, { status: 404 });

    if (updated.status === "published") {
      waitUntil(
        PublishPipelineService.execute(id).catch(e =>
          console.error("[PublishPipeline] PATCH failed:", e)
        )
      );
      if (wasDraft) {
        waitUntil(PushService.notifyBlog(updated).catch(e => console.error("[PushService] Failed:", e)));
      }
    } else {
      waitUntil(semanticIndexerService.unindexBlog(id).catch(e => console.error("Semantic Unindexing Failed:", e)));
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PATCH /api/admin/blogs]", err);
    return NextResponse.json({ error: errorMsg(err) }, { status: 500 });
  }
}


// DELETE - delete blog
export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Blog ID required" }, { status: 400 });

    const blogToDelete = await BlogService.getBlogById(id);
    if (!blogToDelete) return NextResponse.json({ error: "Blog not found" }, { status: 404 });

    await semanticIndexerService.unindexBlog(id).catch(e => console.error("Semantic Unindexing Failed:", e));
    const deleted = await BlogService.deleteBlog(id);
    if (!deleted) return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    
    revalidateTag("blogs");
    revalidatePath("/", "page");
    revalidatePath("/blogs", "page");
    if (blogToDelete.category) {
      revalidatePath(`/categories/${blogToDelete.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, "page");
    }
    revalidatePath("/sitemap.xml", "layout");
    revalidatePath("/sitemap-index.xml");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/admin/blogs]", err);
    return NextResponse.json({ error: errorMsg(err) }, { status: 500 });
  }
}
