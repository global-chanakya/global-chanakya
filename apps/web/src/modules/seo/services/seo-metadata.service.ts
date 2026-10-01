import { groqProvider } from "@/lib/ai/providers/groq.provider";

interface GeneratedMetadata {
  seoTitle: string;
  seoDescription: string;
  searchIntent: "informational" | "transactional" | "navigational" | "commercial";
  contentType: string;
  timeSensitivity: "high" | "medium" | "low";
}

const METADATA_SCHEMA = {
  type: "object",
  properties: {
    seoTitle: { type: "string", maxLength: 65 },
    seoDescription: { type: "string", maxLength: 160 },
    searchIntent: { type: "string", enum: ["informational", "transactional", "navigational", "commercial"] },
    contentType: {
      type: "string",
      enum: [
        "breaking_news", "geopolitical_analysis", "defence_analysis",
        "economic_analysis", "strategic_analysis", "explainer",
        "country_analysis", "conflict_update", "trade_energy_analysis"
      ]
    },
    timeSensitivity: { type: "string", enum: ["high", "medium", "low"] }
  },
  required: ["seoTitle", "seoDescription", "searchIntent", "contentType", "timeSensitivity"]
};

export class SeoMetadataService {
  static async generateSearchIntentMetadata(
    title: string,
    content: string,
    category: string
  ): Promise<GeneratedMetadata | null> {
    const cleanContent = content.replace(/<[^>]*>?/gm, '').substring(0, 3000);

    const systemPrompt = `You are an expert SEO metadata generator for a geopolitical intelligence platform called Global Chanakya. Generate structured metadata strictly as JSON.`;

    const userPrompt = `
Title: ${title}
Category: ${category}
Content Extract: ${cleanContent}

Rules:
1. seoTitle: accurately represents the article without keyword stuffing. Max 60 chars.
2. seoDescription: compelling, matches search intent. Max 155 chars.
3. searchIntent: one of informational, transactional, navigational, commercial.
4. contentType: classify into one of: breaking_news, geopolitical_analysis, defence_analysis, economic_analysis, strategic_analysis, explainer, country_analysis, conflict_update, trade_energy_analysis.
5. timeSensitivity: high (breaking events), medium (recent analysis), low (evergreen).

Respond with JSON only.`;

    try {
      const result = await groqProvider.generateStructured<GeneratedMetadata>({
        model: "llama-3.1-8b-instant",
        systemPrompt,
        userPrompt,
        schema: METADATA_SCHEMA,
        schemaName: "SeoMetadata",
        temperature: 0.2,
        maxTokens: 512,
      });
      return result.data;
    } catch (e) {
      console.error("[SeoMetadataService] AI Metadata Generation Failed:", e);
      return null;
    }
  }
}

