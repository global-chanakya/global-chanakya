import { SeoPreflightService } from "../src/modules/seo/services/seo-preflight.service";

async function run() {
  const invalidArticle = {
    title: "Test",
    content: "Short.",
    tags: [], // missing
    image: null,
    author: null,
    topic: null
  };
  
  const validArticle = {
    title: "A valid geopolitical article with enough length",
    content: "<p>This is a valid geopolitical article with enough length. It contains enough characters to pass the minimum validation requirements. This represents a good chunk of text. A valid geopolitical article with enough length. It contains enough characters to pass the minimum validation requirements. This represents a good chunk of text.</p>",
    tags: ["geopolitics", "test"],
    topic: "test-topic",
    author: { name: "Test Author", _id: "123" },
    image: { url: "https://example.com/image.jpg", width: 1200, height: 630 },
    canonicalUrl: "https://example.com/test",
  };

  const invalidRes = SeoPreflightService.validateForPublishing(invalidArticle as any);
  console.log("Invalid Article Passed:", invalidRes.length === 0);
  console.log("Invalid Article Errors:", invalidRes);

  const validRes = SeoPreflightService.validateForPublishing(validArticle as any);
  console.log("Valid Article Passed:", validRes.length === 0);
  console.log("Valid Article Errors:", validRes);
}

run();
