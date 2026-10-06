import dbConnect from "@/lib/mongoose";
import { Blog } from "@/lib/models/Blog";
import { RelatedArticleService } from "@/modules/seo/services/related-article.service";

async function test() {
  await dbConnect();
  const sourceBlog = await Blog.findOne({ status: "published" }).select("_id category tags topics countries leaders conflicts embedding").lean();
  if (!sourceBlog) {
    console.log("No source blog found");
    return;
  }
  
  console.log("Source blog selected:", sourceBlog._id);
  const start = Date.now();
  const related = await RelatedArticleService.getHighlyRelevantArticles(sourceBlog as any, 5);
  const elapsed = Date.now() - start;
  
  console.log(`Found ${related.length} related articles in ${elapsed}ms`);
  
  // Verify that the output does not contain large fields
  for (const r of related) {
    if ((r as any).content || (r as any).markdown) {
      throw new Error("Related article contains full content fields! Bounding failed.");
    }
  }
  
  console.log("Success! Related articles are safely bounded.");
  process.exit(0);
}

test().catch(err => {
  console.error("Test failed", err);
  process.exit(1);
});
