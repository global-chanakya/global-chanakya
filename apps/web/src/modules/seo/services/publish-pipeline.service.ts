import { Blog } from "@/lib/models/Blog";
import { revalidateTag, revalidatePath } from "next/cache";
import crypto from "crypto";

export class PublishPipelineService {
  /**
   * Centralized pipeline to handle all discovery, cache, and SEO enrichment
   * mechanics automatically when a blog transitions to "published".
   * Safely wrapped so errors do not propagate.
   */
  static async execute(blogId: string) {
    try {
      const blog = await Blog.findById(blogId);
      if (!blog || blog.status !== "published") return;

      // 1. Cache Invalidation (Immediate homepage and list visibility)
      try {
        revalidateTag("blogs");
        revalidatePath("/", "page");
        revalidatePath("/blogs", "page");
        revalidatePath(`/blogs/${blog.slug}`, "page");
        if (blog.category) {
          revalidatePath(
            `/categories/${blog.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
            "page"
          );
        }
        revalidatePath("/sitemap.xml", "layout");
        revalidatePath("/sitemap-index.xml");
      } catch (cacheErr) {
        console.error("[PublishPipeline] Cache invalidation failed:", cacheErr);
      }

      // 2. Semantic Embedding Generation (Non-blocking, background AI enrichment)
      try {
        const contentToHash = `${blog.title}\n${blog.category}\n${blog.tags?.join(",")}\n${blog.excerpt}\n${blog.content.substring(0, 3000)}`;
        const currentHash = crypto.createHash('md5').update(contentToHash).digest('hex');

        if (blog.embeddingContentHash !== currentHash) {
          const { generateEmbeddings } = await import("@/lib/ai/embeddings");
          const stringToEmbed = `Title: ${blog.title}\nCategory: ${blog.category}\nTags: ${blog.tags?.join(", ")}\nExcerpt: ${blog.excerpt}`;
          const embedding = await generateEmbeddings(stringToEmbed);
          
          await Blog.findByIdAndUpdate(blogId, {
            $set: {
              embedding: embedding,
              embeddingContentHash: currentHash
            }
          });
          console.log(`[PublishPipeline] Generated semantic embedding for: ${blog.slug}`);
        } else {
          console.log(`[PublishPipeline] Reusing existing embedding for: ${blog.slug}`);
        }
      } catch (embErr) {
        console.error("[PublishPipeline] Embedding generation failed:", embErr);
      }

      // 4. Chunk Indexing (for Vector Search)
      try {
        const { ragIndexerService } = await import("@/modules/intelligence/services/ragIndexer.service");
        await ragIndexerService.indexBlog(blogId);
      } catch (ragErr) {
        console.error("[PublishPipeline] RAG indexing failed:", ragErr);
      }

      // 5. Progress SEO status
      try {
        await Blog.findByIdAndUpdate(blogId, {
          $set: { seoStatus: "DISCOVERABLE" },
        });
      } catch (statusErr) {
        console.error("[PublishPipeline] Status update failed:", statusErr);
      }

      console.log(`[PublishPipeline] Orchestrated discovery for blog: ${blog.slug}`);
    } catch (e) {
      console.error("[PublishPipeline] Complete pipeline failure:", e);
    }
  }
}
