import mongoose, { Schema, Document } from "mongoose";

export interface ISemanticCache extends Document {
  cacheKey: string;
  value: any;
  expiresAt: Date;
  createdAt: Date;
}

const SemanticCacheSchema = new Schema<ISemanticCache>({
  cacheKey: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed, required: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

// TTL index on expiresAt (deletes automatically in background)
SemanticCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const SemanticCache = mongoose.models.SemanticCache || mongoose.model<ISemanticCache>("SemanticCache", SemanticCacheSchema);
