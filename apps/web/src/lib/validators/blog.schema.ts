import { z } from "zod";

// ─── SEO Sub-Schema ───────────────────────────────────────────────────────────
const seoSchema = z.object({
  focusKeyword: z.string().max(100, "Focus keyword too long").optional(),
  title: z.string().max(70, "Meta title max 70 chars").optional(),
  description: z.string().max(200, "Meta description max 200 chars").optional(),
  keywords: z.array(z.string()).max(20, "Max 20 keywords").optional(),
  canonicalUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  robots: z.enum(["index,follow", "noindex,follow", "index,nofollow", "noindex,nofollow"]).optional(),
  schemaMarkup: z.string().optional(),
}).optional();

// ─── Citations Sub-Schema ─────────────────────────────────────────────────────
const citationSchema = z.object({
  url: z.string().url("Citation URL must be valid").or(z.literal("")),
  label: z.string().optional(),
  addedAt: z.any().optional(),
}).optional();



// ─── Create Blog Schema ──────────────────────────────────────────────────────
export const createBlogSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200, "Title max 200 chars"),
  slug: z.string().min(3, "Slug is required").max(150, "Slug too long"),
  excerpt: z.string().min(10, "Excerpt is required").max(500, "Excerpt max 500 chars"),
  content: z.string().min(20, "Content is required"),
  category: z.string().min(2, "Category is required"),

  reportType: z.enum(["Analysis", "Briefing", "Op-Ed", "Intelligence", "Report"]).optional(),
  tags: z.array(z.string()).max(30, "Max 30 tags").optional(),
  visibility: z.enum(["public", "premium", "private"]).optional().default("public"),
  status: z.enum(["draft", "published", "archived", "scheduled"]).optional().default("draft"),
  isTrending: z.boolean().optional().default(false),
  commentsEnabled: z.boolean().optional().default(true),
  featuredImage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  featuredImageWidth: z.number().optional(),
  featuredImageHeight: z.number().optional(),
  ogImage: z.string().url("OG image must be a valid URL").optional().or(z.literal("")),
  seo: seoSchema,
  aiSummary: z.string().max(500, "AI Summary max 500 chars").optional(),
  citations: z.array(z.any()).optional(), // Flexible — validated on display
  contentType: z.enum(["standard", "platform-seo"]).optional().default("standard"),

  // Scheduling & flags
  publishAt: z.string().or(z.date()).optional(),
  unpublishAt: z.string().or(z.date()).optional().or(z.literal("")),
  isBreaking: z.boolean().optional().default(false),
  breakingUntil: z.string().or(z.date()).optional().or(z.literal("")),
  isFeatured: z.boolean().optional().default(false),
  featuredUntil: z.string().or(z.date()).optional().or(z.literal("")),

  // Entity relations (ObjectId strings)
  countries: z.array(z.string()).optional(),
  leaders: z.array(z.string()).optional(),
  conflicts: z.array(z.string()).optional(),
  organizations: z.array(z.string()).optional(),
});

// ─── Update Blog Schema ──────────────────────────────────────────────────────
export const updateBlogSchema = createBlogSchema.partial().extend({
  id: z.string().min(1, "Blog ID is required"),
});
