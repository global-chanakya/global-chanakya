import mongoose, { Schema, Document } from "mongoose";
import { sanitizeBlogContent } from "@/lib/utils/contentSanitizer";

export interface IBlogRevision {
  content: string;
  title: string;
  editedBy: mongoose.Types.ObjectId;
  editedAt: Date;
  note?: string;
}

export interface IBlog extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string; // TipTap HTML
  markdown?: string;
  seo: {
    focusKeyword?: string;
    title: string;
    description: string;
    keywords: string[];
    canonicalUrl?: string;
    robots?: string;
    schemaMarkup?: string;
  };
  ogImage?: string;
  category: string;
  categoryId?: mongoose.Types.ObjectId;
  regions?: mongoose.Types.ObjectId[];
  organizations?: mongoose.Types.ObjectId[];
  reportType?: string;
  tags: string[];
  featuredImage?: string;
  featuredImageWidth?: number;
  featuredImageHeight?: number;
  visibility: "public" | "premium" | "private";
  publishAt: Date;
  earlyAccessUntil?: Date; // publishAt + 24 hours for non-premium users
  status: "draft" | "published" | "archived" | "scheduled";
  analytics: {
    views: number;
    likes: number;
    bookmarks: number;
    readTime: number; // in minutes
    ctr: number; // click through rate %
  };
  revisions: IBlogRevision[];
  author: mongoose.Types.ObjectId;
  commentsEnabled: boolean;
  isTrending: boolean;
  isBreaking?: boolean;
  isFeatured?: boolean;
  source?: string;
  isSystemGenerated?: boolean;
  unpublishAt?: Date;
  breakingUntil?: Date;
  featuredUntil?: Date;
  readingTime?: number; // auto-calculated
  keyInsights?: string[];
  faq?: { question: string; answer: string }[];
  semanticBlocks?: { type: string; content: string }[];
  aiSummary?: string;
  citations?: { type: "Primary" | "Secondary" | "Government" | "Think Tank"; source: string; url?: string }[];
  reviewedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
  version: number;
  previousVersions?: any[];
  draftSnapshot?: any;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;
  contentType: "standard" | "platform-seo" | "breaking_news" | "geopolitical_analysis" | "defence_analysis" | "economic_analysis" | "strategic_analysis" | "explainer" | "country_analysis" | "conflict_update" | "trade_energy_analysis";
  timeSensitivity?: "high" | "medium" | "low";
  searchIntent?: "informational" | "transactional" | "navigational" | "commercial";
  seoStatus?: "PUBLISHED" | "SITEMAP_INCLUDED" | "DISCOVERABLE" | "INDEXING_CHECK_REQUIRED" | "INDEXED" | "LOW_IMPRESSION" | "LOW_CTR" | "NEEDS_REVIEW";
  embedding?: number[];
  embeddingContentHash?: string;
}

const BlogRevisionSchema = new Schema<IBlogRevision>(
  {
    content: { type: String, required: true },
    title: { type: String, required: true },
    editedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    editedAt: { type: Date, default: Date.now },
    note: { type: String },
  },
  { _id: false }
);

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    markdown: { type: String },
    seo: {
      focusKeyword: { type: String },
      title: { type: String },
      description: { type: String },
      keywords: [{ type: String }],
      canonicalUrl: { type: String },
      robots: { type: String, default: "index,follow" },
      schemaMarkup: { type: String },
    },
    ogImage: { type: String },
    category: { type: String, required: true, index: true },

    reportType: { type: String },
    tags: [{ type: String }],
    featuredImage: { type: String },
    featuredImageWidth: { type: Number },
    featuredImageHeight: { type: Number },
    visibility: {
      type: String,
      enum: ["public", "premium", "private"],
      default: "public",
    },
    publishAt: { type: Date, default: Date.now },
    earlyAccessUntil: { type: Date }, // Set automatically: publishAt + 24h
    status: {
      type: String,
      enum: ["draft", "published", "archived", "scheduled"],
      default: "draft",
    },
    analytics: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      bookmarks: { type: Number, default: 0 },
      readTime: { type: Number, default: 0 },
      ctr: { type: Number, default: 0 },
    },
    revisions: [BlogRevisionSchema],
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    commentsEnabled: { type: Boolean, default: true },
    isTrending: { type: Boolean, default: false },
    isBreaking: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    source: { type: String, default: "manual" },
    isSystemGenerated: { type: Boolean, default: false },
    unpublishAt: { type: Date },
    breakingUntil: { type: Date },
    featuredUntil: { type: Date },
    readingTime: { type: Number },
    keyInsights: [{ type: String }],
    faq: [{
      question: { type: String },
      answer: { type: String }
    }],
    semanticBlocks: [{
      type: { type: String },
      content: { type: String }
    }],
    aiSummary: { type: String },
    citations: [{
      type: { type: String, enum: ["Primary", "Secondary", "Government", "Think Tank"] },
      source: { type: String },
      url: { type: String }
    }],
    reviewedAt: { type: Date },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
    regions: [{ type: Schema.Types.ObjectId, ref: "Region" }],
    organizations: [{ type: Schema.Types.ObjectId, ref: "Organization" }],
    contentType: {
      type: String,
      default: "standard",
      index: true,
    },
    timeSensitivity: { type: String, enum: ["high", "medium", "low"] },
    searchIntent: { type: String },
    seoStatus: { 
      type: String, 
      enum: ["PUBLISHED", "SITEMAP_INCLUDED", "DISCOVERABLE", "INDEXING_CHECK_REQUIRED", "INDEXED", "LOW_IMPRESSION", "LOW_CTR", "NEEDS_REVIEW"],
      default: "NEEDS_REVIEW"
    },
    embedding: { type: [Number] },
    embeddingContentHash: { type: String },

  },
  { timestamps: true }
);

// Enforce strict SEO slugs
BlogSchema.pre("validate", function () {
  if (this.slug) {
    this.slug = this.slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  } else if (this.title) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  }
});

// Auto-set earlyAccessUntil = publishAt + 24 hours on save
BlogSchema.pre("save", async function () {
  if (this.isModified("publishAt") || !this.earlyAccessUntil) {
    const publishDate = this.publishAt || new Date();
    this.earlyAccessUntil = new Date(publishDate.getTime() + 24 * 60 * 60 * 1000);
  }
});

// Sanitize BEFORE validation
BlogSchema.pre("validate", function () {
  if (this.title) this.title = sanitizeBlogContent(this.title, "text");
  if (this.excerpt) this.excerpt = sanitizeBlogContent(this.excerpt, "text");
  if (this.content) this.content = sanitizeBlogContent(this.content, "html");
  if (this.markdown) this.markdown = sanitizeBlogContent(this.markdown, "markdown");
  
  if (this.seo) {
    if (this.seo.title) this.seo.title = sanitizeBlogContent(this.seo.title, "seo");
    if (this.seo.description) this.seo.description = sanitizeBlogContent(this.seo.description, "seo");
  }
});

// Final publication guard
BlogSchema.pre("validate", function () {
  if (this.status === "published") {
    const artifactRegex = /:antCitation\s*\[.*?\]\s*\{.*?\}/;
    const aiSymbolRegex = /[—]/; // At least check for EM DASH
    
    if (this.content && artifactRegex.test(this.content)) {
      throw new Error("Validation Error: Internal citation artifacts detected in content during publication attempt.");
    }
    if (this.markdown && artifactRegex.test(this.markdown)) {
      throw new Error("Validation Error: Internal citation artifacts detected in markdown during publication attempt.");
    }

    const fieldsToCheck = [
      this.title, this.excerpt, this.content, this.markdown, 
      this.seo?.title, this.seo?.description, this.seo?.keywords?.join(" ")
    ];

    for (const field of fieldsToCheck) {
      if (field && aiSymbolRegex.test(field)) {
        throw new Error("Blog contains prohibited AI-generated formatting symbols.");
      }
    }
  }
});

// Sanitize on update
const sanitizeUpdate = function (this: any) {
  const update = this.getUpdate();
  if (update) {
    const sanitizeObj = (obj: any) => {
      if (!obj) return;
      if (typeof obj.title === 'string') obj.title = sanitizeBlogContent(obj.title, 'text');
      if (typeof obj.excerpt === 'string') obj.excerpt = sanitizeBlogContent(obj.excerpt, 'text');
      if (typeof obj.content === 'string') obj.content = sanitizeBlogContent(obj.content, 'html');
      if (typeof obj.markdown === 'string') obj.markdown = sanitizeBlogContent(obj.markdown, 'markdown');
      
      // Dot notation
      if (typeof obj['seo.title'] === 'string') obj['seo.title'] = sanitizeBlogContent(obj['seo.title'], 'seo');
      if (typeof obj['seo.description'] === 'string') obj['seo.description'] = sanitizeBlogContent(obj['seo.description'], 'seo');
      
      // Nested object
      if (obj.seo && typeof obj.seo === 'object') {
        if (typeof obj.seo.title === 'string') obj.seo.title = sanitizeBlogContent(obj.seo.title, 'seo');
        if (typeof obj.seo.description === 'string') obj.seo.description = sanitizeBlogContent(obj.seo.description, 'seo');
      }
    };

    if (update.$set) sanitizeObj(update.$set);
    sanitizeObj(update);
  }
};

BlogSchema.pre("findOneAndUpdate", sanitizeUpdate);
BlogSchema.pre("updateOne", sanitizeUpdate);
BlogSchema.pre("updateMany", sanitizeUpdate);

// Compound indexes for performance
BlogSchema.index({ status: 1, publishAt: -1 });
BlogSchema.index({ category: 1, status: 1 });
BlogSchema.index({ tags: 1 });
BlogSchema.index({ "analytics.views": -1 });

// Relational Taxonomy Compound Indexes (supports exact match + status filter + sort)
BlogSchema.index({ categoryId: 1, status: 1, publishAt: -1 });
BlogSchema.index({ regions: 1, status: 1, publishAt: -1 });
BlogSchema.index({ organizations: 1, status: 1, publishAt: -1 });

export const Blog =
  mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);
