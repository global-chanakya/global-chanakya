import sanitizeHtmlLib from "sanitize-html";

/**
 * Sanitizes an HTML string to prevent XSS attacks.
 * @param html The raw HTML string
 * @returns Safe HTML string
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";
  
  return sanitizeHtmlLib(html, {
    allowedTags: [
      "b", "i", "em", "strong", "a", "p", "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li", "blockquote", "code", "pre", "br", "hr", "img", "span", "div"
    ],
    allowedAttributes: {
      '*': ["class", "id", "style"],
      'a': ["href", "title"],
      'img': ["src", "alt"]
    },
  });
}
