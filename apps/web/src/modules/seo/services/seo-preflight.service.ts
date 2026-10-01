import { IBlog } from "@/lib/models/Blog";

export class SeoPreflightService {
  /**
   * Validates if a blog meets all SEO requirements for publication.
   * Returns an array of error messages. If array is empty, it's valid.
   */
  static validateForPublishing(blog: Partial<IBlog>): string[] {
    const errors: string[] = [];

    if (!blog.title || blog.title.length < 15) {
      errors.push("Title must be at least 15 characters long.");
    }
    
    if (!blog.slug || blog.slug.length < 5) {
      errors.push("Slug is missing or too short.");
    }

    if (!blog.seo?.title) {
      errors.push("SEO meta title is missing.");
    }

    if (!blog.seo?.description || blog.seo.description.length < 50) {
      errors.push("SEO meta description must be at least 50 characters.");
    }

    if (!blog.content || blog.content.length < 300) {
      errors.push("Article content is too short (minimum 300 characters for publishing).");
    } else {
      // Check for headings
      if (!/<h[1-6]/.test(blog.content)) {
        errors.push("Article content must contain at least one heading (H2/H3).");
      }
    }

    if (!blog.category) {
      errors.push("Article must belong to a category.");
    }

    if (!blog.tags || blog.tags.length === 0) {
      errors.push("Article must have at least one tag.");
    }

    if (!blog.featuredImage) {
      errors.push("Featured image is required for publishing.");
    } else {
      try {
        const imgUrl = new URL(blog.featuredImage);
        if (imgUrl.protocol !== "http:" && imgUrl.protocol !== "https:") {
          errors.push("Featured image URL must be http or https.");
        }
      } catch {
        errors.push("Featured image URL is invalid.");
      }

      // Image Dimension Validation for Google Discover readiness
      if (blog.featuredImageWidth && blog.featuredImageHeight) {
        if (blog.featuredImageWidth < 1200) {
          errors.push(`Featured image width is ${blog.featuredImageWidth}px. Google Discover recommends at least 1200px for large image display (this does not guarantee inclusion).`);
        }
        const aspectRatio = blog.featuredImageWidth / blog.featuredImageHeight;
        if (aspectRatio < 1.3 || aspectRatio > 2.0) {
          errors.push(`Featured image aspect ratio is ${aspectRatio.toFixed(2)}. Google Discover recommends 16:9 or similar.`);
        }
      } else {
         errors.push("Featured image dimensions (width/height) are missing. Unable to verify Discover large-image eligibility.");
      }
    }

    // Entity + Topic Graph Validation
    if (!blog.primaryTopic && (!blog.topics || blog.topics.length === 0)) {
      errors.push("Article must have at least one topic associated with it.");
    }

    if (!blog.author) {
      errors.push("Author is missing.");
    }

    // Content Quality Signals
    if (blog.content) {
      // Keyword stuffing check (basic)
      if (blog.seo?.focusKeyword) {
        const keywordPattern = new RegExp(blog.seo.focusKeyword, 'gi');
        const matches = blog.content.match(keywordPattern);
        const density = (matches?.length || 0) / (blog.content.split(' ').length) * 100;
        if (density > 5) {
          errors.push(`Keyword density for '${blog.seo.focusKeyword}' is too high (${density.toFixed(1)}%). Max allowed is 5%.`);
        }
      }
    }

    return errors;
  }
}
