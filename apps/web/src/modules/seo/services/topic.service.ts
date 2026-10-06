import { Blog, IBlog } from "@/lib/models/Blog";
import dbConnect from "@/lib/mongoose";

export class TopicService {
  /**
   * Normalizes an SEO tag/slug: "Indo Pacific" -> "indo-pacific", "China-Taiwan Conflict" -> "china-taiwan-conflict"
   */
  static normalizeSlug(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')        // Replace spaces with -
      .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
      .replace(/\-\-+/g, '-');     // Replace multiple - with single -
  }

  /**
   * Extracts all unique normalized topics from blog tags for the sitemap.
   */
  static async getAllUniqueTopics(): Promise<{ slug: string; original: string }[]> {
    await dbConnect();
    
    const blogTags = await Blog.distinct("tags", { status: "published" });

    const uniqueMap = new Map<string, string>();

    for (const tag of blogTags) {
      if (!tag) continue;
      const slug = this.normalizeSlug(tag);
      if (!uniqueMap.has(slug)) {
        uniqueMap.set(slug, tag);
      }
    }

    return Array.from(uniqueMap.entries()).map(([slug, original]) => ({ slug, original }));
  }

  /**
   * Fetches the "Topic Dashboard" payload for a specific topic slug.
   */
  static async getTopicHubData(slug: string) {
    await dbConnect();

    const slugRegex = new RegExp(slug.replace(/-/g, '.*'), "i");

    const blogs = await Blog.find({ tags: { $regex: slugRegex }, status: "published" }).lean<IBlog[]>();

    return {
      reports: blogs.map((b: any) => ({ ...b, _id: b._id?.toString(), createdAt: b.createdAt?.toISOString(), updatedAt: b.updatedAt?.toISOString(), publishAt: b.publishAt?.toISOString(), type: "report" })),
    };
  }
}
