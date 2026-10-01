import { config } from "dotenv";
config({ path: ".env.local" });

import mongoose from "mongoose";
import { Blog } from "../src/lib/models/Blog";
import { RelatedArticleService } from "../src/modules/seo/services/related-article.service";

async function run() {
  const MONGO_URI = process.env.MONGODB_URI;
  if (!MONGO_URI) {
    console.error("Missing MONGODB_URI");
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);

  // Get 5 distinct articles
  const articles = await Blog.find({ status: "published" }).sort({ createdAt: -1 }).limit(10);
  
  for (const blog of articles.slice(0, 5)) {
    console.log(`\n===========================================`);
    console.log(`TARGET: ${blog.slug}`);
    console.log(`TITLE: ${blog.title}`);
    console.log(`===========================================`);
    const related = await RelatedArticleService.getHighlyRelevantArticles(blog as any, 5);
    related.forEach((r, i) => console.log(`  ${i+1}. ${r.slug}`));
  }

  mongoose.disconnect();
}

run().catch(console.error);
