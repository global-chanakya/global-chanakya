import { Blog } from "@/lib/models/Blog";
import { BlogChunk } from "@/lib/models/BlogChunk";
import { MarkdownSplitter } from "@/lib/ai/textSplitter";
import { generateEmbeddings } from "@/lib/ai/embeddings";
import mongoose from "mongoose";
import { SystemConfig } from "@/lib/models/SystemConfig";
import { redisCache } from "@/lib/cache/redis.cache";

export class SemanticIndexerService {
  async incrementCorpusVersion(): Promise<void> {
    try {
      const config = await SystemConfig.findOneAndUpdate(
        { isActive: true },
        { $inc: { ragCorpusVersion: 1 } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      if (config) {
        await redisCache.set("rag_corpus_version", config.ragCorpusVersion, 86400); // 24h TTL
      }
    } catch (e) {
      console.error("[RAGIndexerService] Failed to increment corpus version:", e);
    }
  }

  /**
   * Indexes a single blog post into the Vector Database (BlogChunk)
   */
  async indexBlog(blogId: string | mongoose.Types.ObjectId): Promise<{ success: boolean; chunks: number; error?: string }> {
    try {
      const blog = await Blog.findById(blogId);
      if (!blog) {
        throw new Error("Blog not found");
      }

      if (blog.status !== "published") {
        throw new Error("Cannot index unpublished blog");
      }

      const contentToHash = `${blog.title}\n${blog.content}`;
      const newHash = MarkdownSplitter.generateHash(contentToHash);

      // Check if already indexed with same content
      const existingChunks = await BlogChunk.find({ blogId: blog._id }).limit(1);
      if (existingChunks.length > 0 && existingChunks[0].contentHash === newHash) {
        return { success: true, chunks: 0 }; // No changes needed
      }

      // We need to re-index. Check if we need to delete old chunks first.
      // If contentHash changed, we must delete the old chunks.
      // But we will delete them safely by contentHash so we don't delete what we're currently inserting.
      await BlogChunk.deleteMany({ blogId: blog._id, contentHash: { $ne: newHash } });

      // Create raw text for splitting. We will append keyInsights and tags if available to ensure semantic richness.
      let fullContent = blog.content;
      if (blog.keyInsights && blog.keyInsights.length > 0) {
        fullContent += `\n\n## Key Insights\n${blog.keyInsights.join("\n")}`;
      }

      const rawChunks = MarkdownSplitter.splitText(fullContent, 800);
      const blogChunksToInsert = [];

      // Process chunks and generate embeddings
      for (let i = 0; i < rawChunks.length; i++) {
        const chunk = rawChunks[i];
        
        // We embed a slightly richer string than just the chunk content
        // to give the vector database context about the article title.
        const stringToEmbed = `Title: ${blog.title}\nCategory: ${blog.category}\n\n${chunk.content}`;
        
        const embedding = await generateEmbeddings(stringToEmbed);

        blogChunksToInsert.push({
          blogId: blog._id,
          slug: blog.slug,
          title: blog.title,
          publishedAt: blog.publishedAt || blog.createdAt,
          chunkIndex: i,
          content: chunk.content,
          embedding: embedding,
          embeddingModel: "Xenova/all-MiniLM-L6-v2",
          embeddingDimensions: embedding.length,
          contentHash: newHash,
          metadata: {
            ...chunk.metadata,
            category: blog.category,
            tags: blog.tags
          }
        });
      }

      if (blogChunksToInsert.length > 0) {
        try {
          await BlogChunk.insertMany(blogChunksToInsert, { ordered: false });
        } catch (insertError: any) {
          // If we get an E11000 duplicate key error, it means another process already inserted these exact chunks concurrently.
          if (insertError.code === 11000) {
            console.log(`[RAGIndexerService] Concurrency lock engaged (11000) for blog ${blogId}. Chunks already exist.`);
            return { success: true, chunks: blogChunksToInsert.length };
          }
          throw insertError;
        }
      }

      await this.incrementCorpusVersion();
      return { success: true, chunks: blogChunksToInsert.length };

    } catch (error: any) {
      console.error(`[RAGIndexerService] Error indexing blog ${blogId}:`, error);
      return { success: false, chunks: 0, error: error.message };
    }
  }

  /**
   * Deletes a blog's chunks from the vector database.
   */
  async unindexBlog(blogId: string | mongoose.Types.ObjectId): Promise<void> {
    await BlogChunk.deleteMany({ blogId });
    await this.incrementCorpusVersion();
  }
}

export const semanticIndexerService = new SemanticIndexerService();
