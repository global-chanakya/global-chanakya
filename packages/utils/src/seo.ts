type Metadata = any;

export interface SeoOptions {
  title: string;
  description: string;
  canonicalUrl: string;
  keywords?: string;
  imageUrl?: string;
  type?: "website" | "article" | "profile";
  authorName?: string;
  publishedTime?: string;
  modifiedTime?: string;
  robots?: string;        // e.g. "index,follow" or "noindex,nofollow"
  siteName?: string;
  locale?: string;
  category?: string;
  twitterHandle?: string;
}

export function generateSeoMetadata({
  title,
  description,
  canonicalUrl,
  keywords,
  imageUrl,
  type = "website",
  authorName,
  publishedTime,
  modifiedTime,
  robots,
  siteName = "Global Chanakya",
  locale = "en_US",
  category,
  twitterHandle = "@globalchanakya",
}: SeoOptions): Metadata {
  const safeTitle = (title || "").trim() || siteName;
  const safeDescription = (description || "").trim() || "Global Chanakya Intelligence - Strategic Affairs, Geopolitics, and Defence Analysis";
  
  let safeCanonicalUrl = (canonicalUrl || "").trim();
  if (safeCanonicalUrl && !/^https?:\/\//i.test(safeCanonicalUrl)) {
    safeCanonicalUrl = `https://${safeCanonicalUrl.replace(/^\/+/, "")}`;
  }

  const openGraph: any = {
    title: safeTitle,
    description: safeDescription,
    url: safeCanonicalUrl,
    type,
    siteName,
    locale,
    ...(imageUrl ? { images: [{ url: imageUrl, alt: safeTitle }] } : {}),
  };

  if (type === "article") {
    if (publishedTime) openGraph.publishedTime = publishedTime;
    if (modifiedTime) openGraph.modifiedTime = modifiedTime;
    if (authorName) openGraph.authors = [authorName];
    if (category) openGraph.section = category;
    if (keywords) {
      openGraph.tags = keywords.split(",").map(k => k.trim()).filter(Boolean);
    }
  }

  const metadata: any = {
    title: safeTitle,
    description: safeDescription,
    keywords,
    alternates: {
      canonical: safeCanonicalUrl,
    },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title: safeTitle,
      description: safeDescription,
      creator: twitterHandle,
      site: twitterHandle,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };

  // Robots directive
  if (robots) {
    const parts = robots.split(",").map((p: string) => p.trim().toLowerCase());
    metadata.robots = {
      index: !parts.includes("noindex"),
      follow: !parts.includes("nofollow"),
    };
  }

  // Category
  if (category) {
    metadata.category = category;
  }

  return metadata;
}
