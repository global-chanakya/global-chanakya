import { config } from "dotenv";
config({ path: ".env.local" });

import { SeoMetadataService } from "../src/modules/seo/services/seo-metadata.service";

async function run() {
  console.log("Testing SeoMetadataService.generateSearchIntentMetadata with llama-3.1-8b-instant...");
  
  try {
    const start = Date.now();
    const result = await SeoMetadataService.generateSearchIntentMetadata(
      "UAE signs new defense pact with South Korea",
      "The United Arab Emirates and South Korea have signed a major new defense agreement focused on air defense systems and technology transfer. The Cheongung II system is the centerpiece.",
      ["UAE", "South Korea", "Defense", "Middle East"],
      "Breaking News"
    );
    
    console.log("Response Time:", Date.now() - start, "ms");
    console.log("\nParsed Output:");
    console.log(JSON.stringify(result, null, 2));
    
    if (result.seoTitle && result.seoDescription && result.searchIntent) {
      console.log("\n✅ Structured output validation passed!");
    } else {
      console.log("\n❌ Structured output missing critical fields.");
    }
  } catch (err: any) {
    console.error("Test failed:", err);
  }
}

run();
