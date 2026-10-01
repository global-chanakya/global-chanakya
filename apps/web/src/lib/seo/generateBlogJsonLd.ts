import { SITE_URL } from "@/constants";

export function sanitizeOgImageUrl(url: string | undefined | null): string {
  const fallback = `${SITE_URL}/default-og.jpg`;
  if (!url) return fallback;
  if (url.includes('encrypted-tbn0.gstatic.com') || url.includes('gstatic.com/images')) {
    return fallback;
  }
  return url;
}

export function generateArticleSchema(blog: any) {
  // Determine if this is a NewsArticle or just an Article
  const newsCategories = ['intelligence', 'conflict', 'geopolitics', 'defence', 'breaking', 'report'];
  const isNews = blog.category && newsCategories.some((c: string) => blog.category.toLowerCase().includes(c)) || blog.isBreaking;
  const articleType = isNews ? "NewsArticle" : "Article";

  // Clean article text by stripping HTML tags
  const rawText = blog.content ? blog.content.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim() : "";

  // Author Resolution
  let authorData: any;
  if (blog.author && blog.author.name && blog.author.name !== "Global Chanakya Editorial") {
    authorData = {
      "@type": "Person",
      name: blog.author.name,
      ...(blog.author.avatar && { image: blog.author.avatar }),
      ...(blog.author.url && { url: blog.author.url }),
      ...(blog.author.socialLinks && Object.keys(blog.author.socialLinks).length > 0 && {
        sameAs: Object.values(blog.author.socialLinks).filter(v => v)
      })
    };
  } else {
    authorData = {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`
    };
  }

  const articleUrl = blog.seo?.canonicalUrl || `${SITE_URL}/blogs/${blog.slug}`;

  // Related Entities mapped to schema.org "about" or "mentions"
  const aboutEntities: any[] = [];
  
  if (blog.countries && Array.isArray(blog.countries)) {
    blog.countries.forEach((c: any) => aboutEntities.push({ "@type": "Country", name: c.name || c }));
  }
  if (blog.leaders && Array.isArray(blog.leaders)) {
    blog.leaders.forEach((l: any) => aboutEntities.push({ "@type": "Person", name: l.name || l }));
  }
  if (blog.organizations && Array.isArray(blog.organizations)) {
    blog.organizations.forEach((o: any) => aboutEntities.push({ "@type": "Organization", name: o.name || o }));
  }
  if (blog.topics && Array.isArray(blog.topics)) {
    blog.topics.forEach((t: any) => aboutEntities.push({ "@type": "Thing", name: t.name || t }));
  }
  if (blog.regions && Array.isArray(blog.regions)) {
    blog.regions.forEach((r: any) => aboutEntities.push({ "@type": "Place", name: r.name || r }));
  }
  if (blog.conflicts && Array.isArray(blog.conflicts)) {
    blog.conflicts.forEach((c: any) => aboutEntities.push({ "@type": "Event", name: c.name || c }));
  }
  
  const keywordsStr = blog.tags?.join(", ") || (blog.seo?.keywords && Array.isArray(blog.seo.keywords) ? blog.seo.keywords.join(", ") : "");
  const keywordsList = keywordsStr ? keywordsStr.split(",").map((k: string) => k.trim()).filter(Boolean) : [];

  const mainImage = sanitizeOgImageUrl(blog.featuredImage || blog.ogImage);

  // Google Discover: NewsArticle needs image at least 1200px wide. Flag that in schema.
  const imageObject: any = {
    "@type": "ImageObject",
    url: mainImage,
    // We can't know actual dimensions without a lookup, but we declare
    // what we know so Google can validate. Editors should upload 1200x630+ images.
  };
  if (blog.featuredImageWidth) imageObject.width = blog.featuredImageWidth;
  if (blog.featuredImageHeight) imageObject.height = blog.featuredImageHeight;

  const jsonLd: any[] = [
    {
      "@context": "https://schema.org",
      "@type": articleType,
      headline: blog.seo?.title || blog.title,
      description: blog.seo?.description || blog.excerpt,
      articleBody: rawText || undefined,
      image: imageObject,
      datePublished: blog.publishAt ? new Date(blog.publishAt).toISOString() : undefined,
      dateModified: blog.updatedAt ? new Date(blog.updatedAt).toISOString() : (blog.publishAt ? new Date(blog.publishAt).toISOString() : undefined),
      author: authorData,
      publisher: {
        "@id": `${SITE_URL}/#organization`
      },
      mainEntityOfPage: {
        "@id": `${articleUrl}#webpage`
      },
      ...(keywordsList.length > 0 && { keywords: keywordsList }),
      ...(blog.category && { articleSection: blog.category }),
      inLanguage: "en-US",
      isAccessibleForFree: blog.visibility !== "premium",
      ...(aboutEntities.length > 0 && { about: aboutEntities }),
      // Speakable: headline + description are speakable — improves voice assistant discovery
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", ".article-excerpt"]
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${articleUrl}#webpage`,
      url: articleUrl,
      name: blog.seo?.title || blog.title,
      description: blog.seo?.description || blog.excerpt,
      isPartOf: {
        "@id": `${SITE_URL}/#website`
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${SITE_URL}`
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Reports",
          item: `${SITE_URL}/blogs`
        },
        {
          "@type": "ListItem",
          position: 3,
          name: blog.seo?.title || blog.title,
          item: articleUrl
        }
      ]
    }
  ];

  if (blog.faq && Array.isArray(blog.faq) && blog.faq.length > 0) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: blog.faq.map((q: any) => ({
        "@type": "Question",
        name: q.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: q.answer
        }
      }))
    });
  }

  return jsonLd;
}
