import mongoose, { Schema, Document } from "mongoose";

export interface IIntelligenceEvent extends Document {
  title: string;
  slug: string;
  summary: string;
  content: string;
  region?: string;
  organizations?: mongoose.Types.ObjectId[];
  category?: string;
  eventType?: string; // e.g. "BREAKING", "ANALYSIS", "DIPLOMACY"
  importance: number; // 1 to 100
  status: "published" | "draft" | "archived" | "error";
  sourceUrls: string[];
  sourceNames: string[];
  publishedAt: Date;
  discoveredAt: Date;
  updatedAt: Date;
  language: string;
  contentHash: string; // deterministic hash of URL + normalized title/body for exact dedup
  duplicateOf?: mongoose.Types.ObjectId; // if it was marked as a semantic duplicate of another event
  embedding?: number[]; // 384 dimensions
  embeddingModel: string;
  embeddingDimensions: number;
  whyItMatters?: string;
  indiaImpact?: string;
  riskLevel?: string;
  strategicSignificance?: string;
  confidence?: string;
  enrichmentStatus: "PENDING" | "COMPLETED" | "FAILED";
}

const IntelligenceEventSchema = new Schema<IIntelligenceEvent>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    summary: { type: String, required: true },
    content: { type: String, required: true },
    region: { type: String },
    organizations: [{ type: Schema.Types.ObjectId, ref: "Organization" }],
    category: { type: String, index: true },
    eventType: { type: String, index: true },
    importance: { type: Number, default: 50, index: true },
    status: {
      type: String,
      enum: ["published", "draft", "archived", "error"],
      default: "published",
      index: true
    },
    sourceUrls: [{ type: String }],
    sourceNames: [{ type: String }],
    publishedAt: { type: Date, required: true, index: true },
    discoveredAt: { type: Date, default: Date.now },
    language: { type: String, default: "en" },
    contentHash: { type: String, required: true, unique: true }, // critical for ingestion exact deduplication
    duplicateOf: { type: Schema.Types.ObjectId, ref: "IntelligenceEvent" },
    embedding: { type: [Number], index: false }, // Indexed in Atlas Vector Search
    embeddingModel: { type: String, default: "Xenova/all-MiniLM-L6-v2" },
    embeddingDimensions: { type: Number, default: 384 },
    whyItMatters: { type: String },
    indiaImpact: { type: String },
    riskLevel: { type: String },
    strategicSignificance: { type: String },
    confidence: { type: String },
    enrichmentStatus: { type: String, enum: ["PENDING", "COMPLETED", "FAILED"], default: "PENDING", index: true }
  },
  { timestamps: true }
);

// Taxonomy / performance indexes
IntelligenceEventSchema.index({ status: 1, publishedAt: -1 });
IntelligenceEventSchema.index({ importance: -1, status: 1, publishedAt: -1 });
IntelligenceEventSchema.index({ status: 1, enrichmentStatus: 1, publishedAt: -1 });
IntelligenceEventSchema.index({ status: 1, updatedAt: 1, publishedAt: 1 }); // Phase 6.9 lifecycle index

export const IntelligenceEvent =
  mongoose.models.IntelligenceEvent ||
  mongoose.model<IIntelligenceEvent>("IntelligenceEvent", IntelligenceEventSchema);
