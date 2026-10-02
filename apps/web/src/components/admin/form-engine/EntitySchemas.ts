export type FieldType = 
  | "text" | "textarea" | "richtext" 
  | "number" | "boolean" | "date" 
  | "select" | "multiselect" | "async-relation" 
  | "media-picker" | "media-gallery" 
  | "citations" | "string-array";

import { BLOG_CATEGORIES } from "@/constants";

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { label: string; value: string }[];
  relationModel?: string; // For async-relation
  description?: string;
  placeholder?: string;
  maxLength?: number;      // Hard max length for validation
  charCountHint?: string;  // Display hint like "30–60 chars recommended"
}

export interface FormTab {
  id: string;
  label: string;
  fields: FormField[];
}

export interface EntitySchema {
  id: string;
  name: string;
  apiPath: string; // e.g. "/api/admin/blogs"
  frontendBasePath?: string; // Correct path for the admin UI e.g. "/gc-control-9x7k/blogs"
  tabs: FormTab[];
}

// Reusable Shared Tabs
const SEO_TAB: FormTab = {
  id: "seo",
  label: "SEO & Discovery",
  fields: [
    { name: "seo.focusKeyword", label: "Focus Keyword", type: "text",
      description: "Primary keyword to optimize this page for",
      placeholder: "e.g. India defence strategy 2026" },
    { name: "seo.title", label: "Meta Title", type: "text",
      charCountHint: "30–60 chars recommended",
      maxLength: 70,
      placeholder: "Compelling title for search engines" },
    { name: "seo.description", label: "Meta Description", type: "textarea",
      charCountHint: "120–160 chars recommended",
      maxLength: 200,
      placeholder: "Concise summary that appears in Google search results" },
    { name: "seo.keywords", label: "Keywords", type: "string-array",
      description: "Add relevant search terms (comma-separated)" },
    { name: "seo.canonicalUrl", label: "Canonical URL", type: "text",
      description: "Only set if this content exists at another primary URL",
      placeholder: "https://www.globalchanakya.in/blogs/..." },
    { name: "ogImage", label: "OG Image (Social Sharing)", type: "media-picker",
      description: "1200×630px recommended — shown when shared on social media" },
    { name: "seo.robots", label: "Robots Directive", type: "select",
      description: "Controls search engine indexing behavior",
      options: [
        { label: "Index & Follow (Default)", value: "index,follow" },
        { label: "No Index, Follow Links", value: "noindex,follow" },
        { label: "Index, No Follow Links", value: "index,nofollow" },
        { label: "No Index, No Follow", value: "noindex,nofollow" },
      ]},

    { name: "aiSummary", label: "AI Summary (llms.txt)", type: "textarea",
      charCountHint: "100–300 chars recommended",
      maxLength: 500,
      description: "Structured summary for AI/LLM ingestion",
      placeholder: "2-3 sentence summary of this content for AI crawlers" },
  ]
};

const SCHEDULING_TAB: FormTab = {
  id: "scheduling",
  label: "Scheduling & Publish",
  fields: [
    { name: "status", label: "Status", type: "select", options: [
      { label: "Draft", value: "draft" },
      { label: "Published", value: "published" },
      { label: "Scheduled", value: "scheduled" },
      { label: "Archived", value: "archived" }
    ]},
    { name: "publishAt", label: "Publish Date", type: "date" },
    { name: "unpublishAt", label: "Unpublish Date", type: "date" },
    { name: "isBreaking", label: "Is Breaking?", type: "boolean" },
    { name: "breakingUntil", label: "Breaking Until", type: "date" },
    { name: "isFeatured", label: "Is Featured?", type: "boolean" },
    { name: "featuredUntil", label: "Featured Until", type: "date" },
  ]
};

const MEDIA_TAB: FormTab = {
  id: "media",
  label: "Media",
  fields: [
    { name: "featuredImage", label: "Featured Image", type: "media-picker" },
    { name: "ogImage", label: "OG Image (Socials)", type: "media-picker" },
  ]
};

const CITATIONS_TAB: FormTab = {
  id: "citations",
  label: "Citations",
  fields: [
    { name: "citations", label: "References", type: "citations" }
  ]
};

const VERSIONING_TAB: FormTab = {
  id: "versioning",
  label: "Revision History",
  fields: [
    { name: "versionHistory", label: "History", type: "text" } // type string-array or custom, GenericEditor handles field.name === "versionHistory"
  ]
};

export const SCHEMAS: Record<string, EntitySchema> = {
  blogs: {
    id: "blogs",
    name: "Blog / Report",
    apiPath: "/api/admin/blogs",
    frontendBasePath: "/gc-control-9x7k/blogs",
    tabs: [
      {
        id: "main",
        label: "Main Content",
        fields: [
          { name: "title", label: "Title", type: "text", required: true },
          { name: "slug", label: "Slug", type: "text", required: true },
          { name: "excerpt", label: "Excerpt / Summary", type: "textarea", required: true },
          { name: "content", label: "Content", type: "richtext", required: true },
          { name: "category", label: "Category", type: "select", options: BLOG_CATEGORIES.map(c => ({ label: c, value: c })) },
          { name: "reportType", label: "Report Type", type: "select", options: [
            { label: "Analysis", value: "Analysis" },
            { label: "Briefing", value: "Briefing" },
            { label: "Op-Ed", value: "Op-Ed" },
            { label: "Intelligence", value: "Intelligence" },
            { label: "Report", value: "Report" },
          ]},
          { name: "visibility", label: "Visibility", type: "select", options: [
            { label: "Public", value: "public" },
            { label: "Premium", value: "premium" },
            { label: "Private", value: "private" },
          ]},
          { name: "tags", label: "Tags", type: "string-array" },
          { name: "isTrending", label: "Mark as Trending", type: "boolean" },
          { name: "commentsEnabled", label: "Enable Comments", type: "boolean" },
        ]
      },
      MEDIA_TAB,
      CITATIONS_TAB,
      SEO_TAB,
      SCHEDULING_TAB,
      VERSIONING_TAB
    ]
  },
  countries: {
    id: "countries",
    name: "Country",
    apiPath: "/api/admin/intelligence/countries",
    frontendBasePath: "/gc-control-9x7k/intelligence/countries",
    tabs: [
      {
        id: "main",
        label: "General",
        fields: [
          { name: "name", label: "Name", type: "text", required: true },
          { name: "slug", label: "Slug", type: "text", required: true },
          { name: "status", label: "Status", type: "select", options: [{label: "Active", value: "active"}, {label: "Inactive", value: "inactive"}] },
          { name: "aliases", label: "Aliases", type: "string-array" }
        ]
      }
    ]
  },
  leaders: {
    id: "leaders",
    name: "Leader",
    apiPath: "/api/admin/intelligence/leaders",
    frontendBasePath: "/gc-control-9x7k/intelligence/leaders",
    tabs: [
      {
        id: "main",
        label: "General",
        fields: [
          { name: "name", label: "Name", type: "text", required: true },
          { name: "slug", label: "Slug", type: "text", required: true },
          { name: "status", label: "Status", type: "select", options: [{label: "Active", value: "active"}, {label: "Inactive", value: "inactive"}] },
          { name: "countryId", label: "Country", type: "text", description: "ObjectId of the Country" },
          { name: "aliases", label: "Aliases", type: "string-array" }
        ]
      }
    ]
  },
  conflicts: {
    id: "conflicts",
    name: "Conflict",
    apiPath: "/api/admin/intelligence/conflicts",
    frontendBasePath: "/gc-control-9x7k/intelligence/conflicts",
    tabs: [
      {
        id: "main",
        label: "General",
        fields: [
          { name: "name", label: "Name", type: "text", required: true },
          { name: "slug", label: "Slug", type: "text", required: true },
          { name: "status", label: "Status", type: "select", options: [{label: "Active", value: "active"}, {label: "Inactive", value: "inactive"}] },
          { name: "aliases", label: "Aliases", type: "string-array" }
        ]
      }
    ]
  },
  topics: {
    id: "topics",
    name: "Topic",
    apiPath: "/api/admin/intelligence/topics",
    frontendBasePath: "/gc-control-9x7k/intelligence/topics",
    tabs: [
      {
        id: "main",
        label: "General",
        fields: [
          { name: "name", label: "Name", type: "text", required: true },
          { name: "slug", label: "Slug", type: "text", required: true },
          { name: "description", label: "Description", type: "textarea" },
          { name: "status", label: "Status", type: "select", options: [{label: "Active", value: "active"}, {label: "Inactive", value: "inactive"}] },
        ]
      },
      SEO_TAB,
      MEDIA_TAB
    ]
  }
};

