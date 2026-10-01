import mongoose, { Document, Schema, Types } from "mongoose";

export interface ISeoPerformance extends Document {
  date: Date;
  page: string;
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  blogId?: Types.ObjectId; // Optional ref to Blog if the URL maps to a known blog
  isBlogUrl: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const seoPerformanceSchema = new Schema<ISeoPerformance>(
  {
    date: {
      type: Date,
      required: true,
    },
    page: {
      type: String,
      required: true,
      trim: true,
    },
    query: {
      type: String,
      required: true,
      trim: true,
    },
    clicks: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    impressions: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    ctr: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    position: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    blogId: {
      type: Schema.Types.ObjectId,
      ref: "Blog",
      required: false,
    },
    isBlogUrl: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

// Idempotency constraint: each combination of date + page + query must be unique
seoPerformanceSchema.index({ date: 1, page: 1, query: 1 }, { unique: true });

// Optimize lookups for specific articles over time
seoPerformanceSchema.index({ page: 1, date: -1 });
seoPerformanceSchema.index({ blogId: 1, date: -1 });

// Optimize lookups for specific queries over time
seoPerformanceSchema.index({ query: 1, date: -1 });

export const SeoPerformance =
  mongoose.models.SeoPerformance ||
  mongoose.model<ISeoPerformance>("SeoPerformance", seoPerformanceSchema);
