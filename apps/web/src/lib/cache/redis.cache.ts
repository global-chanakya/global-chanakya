import { ICacheService } from "./cache.interface";
import dbConnect from "@/lib/mongoose";
import { SemanticCache } from "@/lib/models/SemanticCache";

export class RedisCache implements ICacheService {
  async get<T>(key: string): Promise<T | null> {
    try {
      await dbConnect();
      // We must explicitly ensure expiresAt is in the future, as TTL deletion is asynchronous.
      const entry = await SemanticCache.findOne({ 
        cacheKey: key, 
        expiresAt: { $gt: new Date() } 
      }).lean();
      
      if (!entry) return null;
      return entry.value as T;
    } catch (error) {
      console.warn("[MongoCache] Failed to get cache:", error);
      return null; // Gracefully fallback to normal execution
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number = 3600): Promise<void> {
    try {
      await dbConnect();
      const expiresAt = new Date(Date.now() + (ttlSeconds * 1000));
      
      // Atomic upsert protects against concurrent identical requests crashing
      await SemanticCache.findOneAndUpdate(
        { cacheKey: key },
        { value, expiresAt },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.warn("[MongoCache] Failed to set cache:", error);
      // Gracefully continue; cache SET failure should not fail AI response
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await dbConnect();
      await SemanticCache.deleteOne({ cacheKey: key });
    } catch (error) {
      console.warn("[MongoCache] Failed to delete cache:", error);
    }
  }
}

// Retain the 'redisCache' export name for compatibility so we don't break existing imports
export const redisCache = new RedisCache();
