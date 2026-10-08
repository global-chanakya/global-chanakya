import { Blog, IBlog } from "@/lib/models/Blog";
import dbConnect from "@/lib/mongoose";
import mongoose from "mongoose";
import { sanitizeBlogContent } from "@/lib/utils/contentSanitizer";
import { escapeRegExp } from "@/lib/utils/regex";

export class BlogRepository {
  static async findById(id: string): Promise<any | null> {
    await dbConnect();
    const result = await Blog.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "blogchunks",
          localField: "_id",
          foreignField: "blogId",
          as: "chunks"
        }
      },
      {
        $addFields: {
          chunkCount: { $size: "$chunks" }
        }
      },
      {
        $project: {
          chunks: 0
        }
      }
    ]);
    return result[0] || null;
  }

  static async findBySlug(slug: string): Promise<IBlog | null> {
    await dbConnect();
    const decodedSlug = decodeURIComponent(slug);
    return Blog.findOne({ slug: decodedSlug, contentType: { $ne: "platform-seo" } }).lean();
  }

  static async searchBlogs(query: string, limit: number = 5): Promise<IBlog[]> {
    await dbConnect();
    const escapedQuery = escapeRegExp(query);
    return Blog.find(
      {
        status: "published",
        contentType: { $ne: "platform-seo" },
        visibility: { $in: ["public", "premium", "private"] },
        $or: [
          { title: { $regex: escapedQuery, $options: "i" } },
          { excerpt: { $regex: escapedQuery, $options: "i" } },
          { category: { $regex: escapedQuery, $options: "i" } },
        ]
      },
      {
        title: 1, slug: 1, excerpt: 1, category: 1,
        featuredImage: 1, publishAt: 1
      }
    )
      .sort({ publishAt: -1 })
      .limit(limit)
      .lean();
  }

  static async getTrending(limit: number = 6): Promise<IBlog[]> {
    await dbConnect();
    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    return Blog.aggregate([
      {
        $match: {
          status: "published",
          contentType: { $ne: "platform-seo" },
          visibility: { $in: ["public", "premium", "private"] },
        },
      },
      {
        $addFields: {
          trendingScore: {
            $add: [
              { $multiply: ["$analytics.views", 1] },
              { $multiply: ["$analytics.likes", 3] },
              { $multiply: ["$analytics.bookmarks", 2] },
              { $cond: ["$isTrending", 500, 0] },
              { $cond: [{ $gte: ["$publishAt", fortyEightHoursAgo] }, 200, 0] },
            ],
          },
        },
      },
      { $sort: { trendingScore: -1, publishAt: -1 } },
      { $limit: limit },
      {
        $project: {
          title: 1, slug: 1, excerpt: 1, category: 1, visibility: 1,
          featuredImage: 1, isTrending: 1, trendingScore: 1, analytics: 1,
          publishAt: 1, createdAt: 1
        }
      }
    ]);
  }

  static async getLatest(limit: number = 6): Promise<IBlog[]> {
    await dbConnect();
    return Blog.find({ status: "published", contentType: { $ne: "platform-seo" } }, {
      title: 1, slug: 1, excerpt: 1, category: 1, visibility: 1,
      featuredImage: 1, isTrending: 1, analytics: 1, publishAt: 1, createdAt: 1
    })
      .sort({ publishAt: -1 })
      .limit(limit)
      .lean();
  }

  static async getBlogsByCategory(category: string, limit: number = 4): Promise<IBlog[]> {
    await dbConnect();
    const safeCategory = escapeRegExp(category);
    return Blog.find({ status: "published", contentType: { $ne: "platform-seo" }, category: new RegExp(`^${safeCategory}$`, 'i') }, {
      title: 1, slug: 1, excerpt: 1, category: 1, visibility: 1,
      featuredImage: 1, isTrending: 1, analytics: 1, publishAt: 1, createdAt: 1
    })
      .sort({ publishAt: -1 })
      .limit(limit)
      .lean();
  }

  static async getMostViewed(): Promise<IBlog | null> {
    await dbConnect();
    const result = await Blog.find({ status: "published", contentType: { $ne: "platform-seo" }, visibility: { $in: ["public", "premium", "private"] } }, {
      title: 1, slug: 1, excerpt: 1, category: 1, visibility: 1,
      featuredImage: 1, isTrending: 1, analytics: 1, publishAt: 1, createdAt: 1
    })
      .sort({ "analytics.views": -1 })
      .limit(1)
      .lean();
    return result[0] || null;
  }

  static async getMostViewedPast7Days(): Promise<IBlog | null> {
    await dbConnect();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const result = await Blog.find({ 
      status: "published", 
      contentType: { $ne: "platform-seo" },
      visibility: { $in: ["public", "premium", "private"] },
      publishAt: { $gte: sevenDaysAgo }
    }, {
      title: 1, slug: 1, excerpt: 1, category: 1, visibility: 1,
      featuredImage: 1, isTrending: 1, analytics: 1, publishAt: 1, createdAt: 1
    })
      .sort({ "analytics.views": -1 })
      .limit(1)
      .lean();
    return result[0] || null;
  }

  static async getAdminBlogs(limit: number = 0): Promise<any[]> {
    await dbConnect();
    const pipeline: any[] = [
      { $sort: { createdAt: -1 } },
      ...(limit > 0 ? [{ $limit: limit }] : []),
      {
        $lookup: {
          from: "blogchunks",
          localField: "_id",
          foreignField: "blogId",
          as: "chunks"
        }
      },
      {
        $addFields: {
          chunkCount: { $size: { $ifNull: ["$chunks", []] } }
        }
      },
      {
        $project: {
          chunks: 0
        }
      }
    ];
    return Blog.aggregate(pipeline);
  }

  static async findBlogsByStatus(status: string, limit: number): Promise<IBlog[]> {
    await dbConnect();
    return Blog.find({ status })
      .sort({ publishAt: -1 })
      .limit(limit)
      .populate('author', 'name avatar')
      .lean();
  }

  static async create(data: Partial<IBlog>): Promise<IBlog> {
    await dbConnect();
    if (data.content) data.content = sanitizeBlogContent(data.content, 'html');
    if (data.markdown) data.markdown = sanitizeBlogContent(data.markdown, 'markdown');
    return Blog.create(data);
  }

  static async update(id: string, data: Partial<IBlog>): Promise<IBlog | null> {
    await dbConnect();
    if (data.content) data.content = sanitizeBlogContent(data.content, 'html');
    if (data.markdown) data.markdown = sanitizeBlogContent(data.markdown, 'markdown');
    return Blog.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
  }

  static async incrementAnalytics(id: string, field: string, amount: number): Promise<void> {
    await dbConnect();
    const filter: any = { _id: id };
    if (amount < 0) {
      filter[`analytics.${field}`] = { $gt: 0 };
    }
    await Blog.updateOne(
      filter,
      { $inc: { [`analytics.${field}`]: amount } }
    ).exec();
  }

  static async delete(id: string): Promise<boolean> {
    await dbConnect();
    const result = await Blog.findByIdAndDelete(id);
    return !!result;
  }

  static async getBreakingBlogs(limit: number = 10): Promise<IBlog[]> {
    await dbConnect();
    const now = new Date();
    return Blog.find({ 
      status: "published", 
      contentType: { $ne: "platform-seo" },
      isBreaking: true,
      $or: [
        { breakingUntil: { $exists: false } },
        { breakingUntil: { $gte: now } }
      ]
    }, {
      title: 1, slug: 1, excerpt: 1, category: 1, visibility: 1,
      featuredImage: 1, isBreaking: 1, analytics: 1, publishAt: 1, createdAt: 1
    })
      .sort({ publishAt: -1 })
      .limit(limit)
      .lean();
  }
}
