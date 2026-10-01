import { Blog, IBlog } from "@/lib/models/Blog";
import { BlogChunk } from "@/lib/models/BlogChunk";
import mongoose from "mongoose";

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export class RelatedArticleService {
  /**
   * Improved Related Article Algorithm using MongoDB Vector Search + weighted relevance.
   */
  static async getHighlyRelevantArticles(sourceBlog: IBlog, limit: number = 5): Promise<IBlog[]> {
    const candidateIds = new Set<string>();
    const vectorScores = new Map<string, number>();

    // 1. Vector Search for Semantic Candidates (if source has an embedding)
    // We use the existing BlogChunk vector_index instead of requiring a new index on Blog
    if (sourceBlog.embedding && sourceBlog.embedding.length > 0) {
      try {
        const pipeline = [
          {
            $vectorSearch: {
              index: "vector_index",
              path: "embedding",
              queryVector: sourceBlog.embedding,
              numCandidates: 100,
              limit: 20
            }
          },
          {
            $project: {
              blogId: 1,
              score: { $meta: "vectorSearchScore" }
            }
          }
        ];
        
        const semanticResults = await BlogChunk.aggregate(pipeline);
        for (const res of semanticResults) {
          const bId = res.blogId.toString();
          if (bId !== sourceBlog._id.toString()) {
            candidateIds.add(bId);
            // Keep the highest semantic score if multiple chunks from the same blog match
            const currentScore = vectorScores.get(bId) || 0;
            if (res.score > currentScore) {
              vectorScores.set(bId, res.score);
            }
          }
        }
      } catch (e) {
        console.warn("[RelatedArticleService] Vector search failed, falling back to metadata search", e);
      }
    }

    // 2. Fetch candidates: Vector matches + Metadata matches
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const candidates = await Blog.find({
      status: "published",
      _id: { $ne: sourceBlog._id },
      $or: [
        { _id: { $in: Array.from(candidateIds) } },
        { category: sourceBlog.category },
        { tags: { $in: sourceBlog.tags || [] } },
        { topics: { $in: sourceBlog.topics || [] } },
        { countries: { $in: sourceBlog.countries || [] } },
        { leaders: { $in: sourceBlog.leaders || [] } },
        { conflicts: { $in: sourceBlog.conflicts || [] } },
        { publishAt: { $gt: oneYearAgo } }
      ]
    }).lean();

    // 2. Score candidates
    const scored = candidates.map((candidate: any) => {
      let score = 0;
      let semSim = 0;
      const cId = candidate._id.toString();
      
      // Semantic Similarity (highest weight)
      // Use pre-computed vector search score if available, otherwise calculate locally
      if (vectorScores.has(cId)) {
        semSim = vectorScores.get(cId)!;
      } else if (sourceBlog.embedding && candidate.embedding) {
        semSim = cosineSimilarity(sourceBlog.embedding, candidate.embedding);
      }
      
      if (semSim > 0) {
        if (semSim >= 0.85) score += 30;
        else if (semSim >= 0.75) score += 20;
        else if (semSim >= 0.65) score += 10;
        else if (semSim < 0.5) score -= 10; // Penalize truly unrelated
      }
      
      // Topic overlap (high weight)
      const commonTopics = candidate.topics?.filter((t: any) => 
        sourceBlog.topics?.some((st: any) => st.toString() === t.toString())
      ) || [];
      score += commonTopics.length * 15;

      // Entity overlap (countries, leaders, conflicts) - high weight
      const commonCountries = candidate.countries?.filter((c: any) => 
        sourceBlog.countries?.some((sc: any) => sc.toString() === c.toString())
      ) || [];
      score += commonCountries.length * 10;
      
      const commonLeaders = candidate.leaders?.filter((l: any) => 
        sourceBlog.leaders?.some((sl: any) => sl.toString() === l.toString())
      ) || [];
      score += commonLeaders.length * 10;

      // Category match (medium weight)
      if (candidate.category === sourceBlog.category) {
        score += 5;
      }

      // Tag overlap (medium weight)
      const commonTags = candidate.tags?.filter((t: string) => 
        sourceBlog.tags?.includes(t)
      ) || [];
      score += commonTags.length * 3;

      // Recency (secondary weight)
      const ageInDays = (Date.now() - new Date(candidate.publishAt).getTime()) / (1000 * 60 * 60 * 24);
      if (ageInDays < 7) score += 5;
      else if (ageInDays < 30) score += 2;
      else if (ageInDays > 365) score -= 5;

      return { blog: candidate, score, semSim };
    });

    // 3. Filter out negative scores and sort
    const validScored = scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score);

    // Filter duplicates strictly by ID
    const uniqueIds = new Set();
    let related = [];
    for (const s of validScored) {
      if (!uniqueIds.has(s.blog._id.toString())) {
        uniqueIds.add(s.blog._id.toString());
        related.push(s.blog);
        if (related.length === limit) break;
      }
    }

    // Fallback if not enough
    if (related.length < limit) {
      const needed = limit - related.length;
      const relatedIds = related.map(r => r._id);
      const fallback = await Blog.find({
        status: "published",
        _id: { $ne: sourceBlog._id, $nin: relatedIds },
        category: sourceBlog.category
      }).sort({ publishAt: -1 }).limit(needed).lean();
      
      related = [...related, ...fallback];
    }

    // 4. Return
    return related;
  }
}
