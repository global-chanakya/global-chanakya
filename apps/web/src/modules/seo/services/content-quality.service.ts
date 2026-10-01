import { Blog } from "@/lib/models/Blog";

export interface CannibalizationWarning {
  existingSlug: string;
  existingTitle: string;
  similarity: "HIGH" | "MEDIUM" | "LOW";
  reason: string;
}

export interface ContentQualityReport {
  passed: boolean;
  warnings: string[];
  cannibalization: CannibalizationWarning[];
}

/**
 * Thresholds by contentType
 */
const WORD_COUNT_THRESHOLDS: Record<string, number> = {
  breaking_news: 80,
  conflict_update: 100,
  explainer: 250,
  country_analysis: 400,
  geopolitical_analysis: 400,
  defence_analysis: 400,
  economic_analysis: 400,
  strategic_analysis: 400,
  trade_energy_analysis: 300,
  standard: 200,
};

function wordCount(html: string): number {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length;
}

/**
 * Compute rough Jaccard similarity between two strings using bigrams.
 */
function jaccardSimilarity(a: string, b: string): number {
  const bigrams = (s: string): Set<string> => {
    const clean = s.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/).filter(Boolean);
    const set = new Set<string>();
    for (let i = 0; i < clean.length - 1; i++) {
      set.add(`${clean[i]} ${clean[i + 1]}`);
    }
    return set;
  };

  const setA = bigrams(a);
  const setB = bigrams(b);
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  setA.forEach((v) => { if (setB.has(v)) intersection++; });
  return intersection / (setA.size + setB.size - intersection);
}

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

export class ContentQualityService {
  /**
   * Run a full quality and cannibalization check before publishing.
   */
  static async check(
    newTitle: string,
    newContent: string,
    newTags: string[],
    contentType: string = "standard",
    excludeSlug?: string
  ): Promise<ContentQualityReport> {
    const warnings: string[] = [];
    const cannibalization: CannibalizationWarning[] = [];

    // 1. Word count check
    const wc = wordCount(newContent);
    const threshold = WORD_COUNT_THRESHOLDS[contentType] ?? 200;
    if (wc < threshold) {
      warnings.push(
        `Content is too short (${wc} words). Minimum for "${contentType}" is ${threshold} words.`
      );
    }

    // 2. Source/Context check
    const hasExternalLinks = /<a\s[^>]*href=["']https?:\/\/[^"']+["'][^>]*>/i.test(newContent);
    if (!hasExternalLinks && contentType !== "breaking_news") {
      warnings.push("Consider adding external references or source links to support claims.");
    }

    // Generate local embedding for semantic cannibalization detection
    let currentEmbedding: number[] | null = null;
    try {
      const { generateEmbeddings } = require("@/lib/ai/embeddings");
      // Use similar string to embed as the publish pipeline
      const stringToEmbed = `Title: ${newTitle}\nTags: ${newTags.join(", ")}\nExcerpt: ${newContent.replace(/<[^>]*>?/gm, '').substring(0, 500)}`;
      currentEmbedding = await generateEmbeddings(stringToEmbed);
    } catch (e) {
      console.warn("[ContentQualityService] Could not generate embedding for cannibalization check");
    }

    // 3. Cannibalization detection
    const existingBlogs = await Blog.find({
      status: "published",
      ...(excludeSlug ? { slug: { $ne: excludeSlug } } : {}),
    })
      .select("title slug tags category embedding searchIntent")
      .lean();

    for (const existing of existingBlogs) {
      const titleSimilarity = jaccardSimilarity(newTitle, existing.title);
      let semSim = 0;

      if (currentEmbedding && existing.embedding) {
        semSim = cosineSimilarity(currentEmbedding, existing.embedding);
      }

      // Evaluate if the overlap is intentional (e.g. an analysis or breaking news on the same topic)
      const isDifferentIntent = (existing.searchIntent && existing.searchIntent !== "informational" && existing.searchIntent !== "navigational" /* simplified check */);
      const isUpdate = contentType === "breaking_news" || contentType === "conflict_update";
      const isAnalysisOfNews = (contentType === "geopolitical_analysis" || contentType === "strategic_analysis") && existing.category === "news";
      
      const isLegitimateOverlap = isDifferentIntent || isUpdate || isAnalysisOfNews;

      // Exact or near-duplicate title OR VERY high semantic similarity
      if (titleSimilarity >= 0.7 || semSim >= 0.88) {
        if (!isLegitimateOverlap) {
          cannibalization.push({
            existingSlug: existing.slug,
            existingTitle: existing.title,
            similarity: "HIGH",
            reason: titleSimilarity >= 0.7 
              ? `Title is ${Math.round(titleSimilarity * 100)}% similar`
              : `Semantic similarity is extremely high (${Math.round(semSim * 100)}%)`,
          });
          continue;
        } else {
          // Downgrade to MEDIUM if it's a legitimate follow-up
          cannibalization.push({
            existingSlug: existing.slug,
            existingTitle: existing.title,
            similarity: "MEDIUM",
            reason: `High similarity (${Math.round(semSim * 100)}%), but classified as legitimate ${contentType} follow-up.`,
          });
          continue;
        }
      }

      if (titleSimilarity >= 0.45 || semSim >= 0.78) {
        // Also check tag overlap
        const sharedTags = (existing.tags || []).filter((t: string) => newTags.includes(t));
        if (sharedTags.length >= 2 || semSim >= 0.82) {
          cannibalization.push({
            existingSlug: existing.slug,
            existingTitle: existing.title,
            similarity: "LOW", // Downgrade from MEDIUM to LOW so it's just a soft warning
            reason: semSim >= 0.78
              ? `Moderate semantic similarity (${Math.round(semSim * 100)}%) and shared tags.`
              : `Similar title (${Math.round(titleSimilarity * 100)}%) and shared tags: ${sharedTags.join(", ")}`,
          });
        }
      }
    }

    return {
      passed: warnings.length === 0 && cannibalization.filter((c) => c.similarity === "HIGH").length === 0,
      warnings,
      cannibalization,
    };
  }
}
