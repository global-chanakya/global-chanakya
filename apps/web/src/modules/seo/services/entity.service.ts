/* eslint-disable @typescript-eslint/no-explicit-any */
import dbConnect from "@/lib/mongoose";
import mongoose from "mongoose";
import { Blog } from "@/lib/models/Blog";
import "@/lib/models/Category";
import "@/lib/models/Region";
import "@/lib/models/Organization";

export interface EntityQueryResult {
  entity: any;
  articleCount: number;
  indexable: boolean;
  status: "404" | "noindex" | "index";
}

export class EntityService {
  /**
   * Defines the thin entity indexation rule.
   * 0 articles -> 404
   * 1 article -> noindex
   * 2-3 articles -> conditional (default noindex, override possible)
   * 4+ articles -> index
   */
  static determineIndexation(articleCount: number): EntityQueryResult["status"] {
    if (articleCount === 0) return "404";
    if (articleCount === 1) return "noindex";
    if (articleCount >= 2 && articleCount <= 3) return "noindex"; // Safe conditional default
    return "index";
  }

  static async getEntityData(modelName: string, slug: string, relationshipField: string): Promise<EntityQueryResult | null> {
    await dbConnect();
    
    const Model = mongoose.models[modelName];
    if (!Model) {
      throw new Error(`Model ${modelName} not found`);
    }

    const entity = await Model.findOne({ slug }).lean();
    if (!entity) return null;

    // Fast count query using the specific relationship index
    const articleCount = await Blog.countDocuments({
      [relationshipField]: entity._id,
      status: "published"
    });

    const status = this.determineIndexation(articleCount);

    return {
      entity: { ...entity, _id: entity._id.toString() },
      articleCount,
      status,
      indexable: status === "index"
    };
  }

  static async getEntityArticles(relationshipField: string, entityId: string, limit: number = 500, skip: number = 0) {
    await dbConnect();
    const articles = await Blog.find({
      [relationshipField]: new mongoose.Types.ObjectId(entityId),
      status: "published"
    })
      .select("title slug excerpt featuredImage publishAt author category analytics isTrending visibility")
      .populate("author", "name")
      .sort({ publishAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return articles.map(a => ({ ...a, _id: a._id.toString() }));
  }

  /**
   * Gathers related entities from the articles associated with this entity.
   * This builds the contextual Entity -> Entity internal link graph based on real article overlaps.
   */
  static async getContextualRelatedEntities(relationshipField: string, entityId: string) {
    await dbConnect();
    
    // We sample up to 20 recent articles to build the graph
    const recentArticles = await Blog.find({
      [relationshipField]: new mongoose.Types.ObjectId(entityId),
      status: "published"
    })
      .select("regions organizations categoryId")
      .sort({ publishAt: -1 })
      .limit(20)
      .lean();

    const relatedIds = {
      regions: new Set<string>(),
      organizations: new Set<string>(),
      categories: new Set<string>()
    };

    recentArticles.forEach(article => {
      if (article.regions) article.regions.forEach((id: any) => relatedIds.regions.add(id.toString()));
      if (article.organizations) article.organizations.forEach((id: any) => relatedIds.organizations.add(id.toString()));
      if (article.categoryId) relatedIds.categories.add(article.categoryId.toString());
    });

    // Remove self from the relationship sets
    if (relationshipField in relatedIds) {
      (relatedIds as any)[relationshipField].delete(entityId);
    }

    // Now populate the sets to get names and slugs
    const populateSet = async (modelName: string, idSet: Set<string>) => {
      if (idSet.size === 0) return [];
      const Model = mongoose.models[modelName];
      if (!Model) return [];
      const docs = await Model.find({ _id: { $in: Array.from(idSet).map(id => new mongoose.Types.ObjectId(id)) } })
        .select("name slug")
        .limit(5)
        .lean();
      return docs.map((d: any) => ({ name: d.name, slug: d.slug, type: modelName.toLowerCase() }));
    };

    const [regions, organizations, categories] = await Promise.all([
      populateSet("Region", relatedIds.regions),
      populateSet("Organization", relatedIds.organizations),
      populateSet("Category", relatedIds.categories),
    ]);

    return {
      regions,
      organizations,
      categories
    };
  }
}
