import { IntelligenceEvent } from "../../models/IntelligenceEvent";
import { SystemConfig } from "../../models/SystemConfig";
import { redis } from "../../redis";
import { RSSProvider } from "./providers/rss.provider";
import { EventNormalizer, EntityDictionary } from "./eventNormalizer";
import { generateEmbeddings } from "@/lib/ai/embeddings";
import { findLiveSemanticMatches } from "@/lib/ai/vectorSearch";
import { groqProvider, RateLimitError } from "@/lib/ai/providers/groq.provider";
import { liveEventEnrichmentJsonSchema, liveEventEnrichmentSchema } from "../validators";
import { Country } from "../../models/Country";
import { Leader } from "../../models/Leader";
import { Conflict } from "../../models/Conflict";
import { PushService } from "@/lib/notifications/push.service";

const DEFAULT_EXECUTION_BUDGET_MS = Number(process.env.INGESTION_BUDGET_MS) || 50000;

export interface IngestionOptions {
  maxDurationMs?: number;
  maxCandidates?: number;
}

export class LiveIngestionService {
  private providers = [
    new RSSProvider("BBC", "http://feeds.bbci.co.uk/news/world/rss.xml"),
    new RSSProvider("Al Jazeera", "https://www.aljazeera.com/xml/rss/all.xml"),
    new RSSProvider("UN News", "https://news.un.org/feed/subscribe/en/news/all/rss.xml")
  ];

  async pollAllProviders(options?: IngestionOptions) {
    console.log(`[LiveIngestionService] Starting live intelligence ingestion. Options:`, options);
    const stats = { fetched: 0, normalized: 0, duplicates: 0, inserted: 0, published: 0, failed: 0, pending: 0, archived: 0, providersHealthy: 0, providersFailed: 0, status: 'completed', error: null as string | null };
    const startedAt = Date.now();
    const budgetMs = options?.maxDurationMs || DEFAULT_EXECUTION_BUDGET_MS;

    const dict = await this.loadEntityDictionary();
    stats.archived = await this.pruneStaleEvents();

    // 1. Fetch from all providers in parallel (fast network requests)
    const fetchPromises = this.providers.map(p => this.fetchFromProvider(p, dict));
    const providerResults = await Promise.all(fetchPromises);

    let newItemsToProcess: any[] = [];
    for (const r of providerResults) {
      stats.fetched += r.fetched;
      stats.normalized += r.normalized;
      stats.duplicates += r.duplicates;
      if (r.status === 'healthy') stats.providersHealthy++;
      if (r.status === 'failed') stats.providersFailed++;
      newItemsToProcess = newItemsToProcess.concat(r.items);
    }

    // 2. Fetch retry items (limited to 2)
    const retryEvents = await IntelligenceEvent.find({
      status: "draft",
      $or: [
        { enrichmentStatus: "FAILED" },
        { enrichmentStatus: "PENDING" },
        { enrichmentStatus: "BUDGET_EXHAUSTED" },
        { enrichmentStatus: null },
        { enrichmentStatus: { $exists: false } }
      ]
    }).limit(2);

    // 3. Combine into a single global queue
    const processingQueue = [...retryEvents, ...newItemsToProcess];
    if (options?.maxCandidates && processingQueue.length > options.maxCandidates) {
      processingQueue.splice(options.maxCandidates);
    }

    let hasNewInserts = false;

    // 4. Process sequentially enforcing a strict global budget
    for (const item of processingQueue) {
      const elapsedTotal = Date.now() - startedAt;
      const remainingBudget = budgetMs - elapsedTotal;

      // Budget exhaustion check BEFORE Groq
      if (remainingBudget < 4000) {
        console.warn(`[LiveIngestionService] Budget exhausted (${remainingBudget}ms left). Saving as PENDING.`);
        if (!item._id) {
          // New item, save it to DB as PENDING
          try {
            console.log(`[INTELLIGENCE_DIAGNOSTIC] EMBEDDING_STARTED candidate=${item.slug}`);
            const embedding = await generateEmbeddings(item.content);
            console.log(`[INTELLIGENCE_DIAGNOSTIC] EMBEDDING_SUCCESS candidate=${item.slug}`);
            const eventDoc = new IntelligenceEvent({
              ...item,
              embedding,
              embeddingModel: "Xenova/all-MiniLM-L6-v2",
              embeddingDimensions: 384,
              enrichmentStatus: "PENDING",
              status: "draft"
            });
            await eventDoc.save();
            stats.inserted++;
          } catch (e) {
             console.error("Failed to save pending item", e);
          }
        } else {
          // Retry item, ensure status is PENDING so it can be retried without being classed as permanent failure
          if (item.enrichmentStatus !== "PENDING") {
            item.enrichmentStatus = "PENDING";
            item.status = "draft";
            await item.save();
          }
        }
        stats.pending++;
        stats.status = 'partial';
        stats.error = "Execution budget reached";
        continue;
      }

      // We have enough budget, proceed
      if (!item._id) {
        // --- NEW ITEM ---
        try {
          console.log(`[INTELLIGENCE_DIAGNOSTIC] EMBEDDING_STARTED candidate=${item.slug}`);
          const embedding = await generateEmbeddings(item.content);
          console.log(`[INTELLIGENCE_DIAGNOSTIC] EMBEDDING_SUCCESS candidate=${item.slug}`);
          const semanticMatches = await findLiveSemanticMatches(embedding, 1, 0.95);
          
          if (semanticMatches.length > 0) {
            const matchedId = semanticMatches[0].blogId;
            const existingEvent = await IntelligenceEvent.findById(matchedId);
            if (existingEvent) {
              let hasChanges = false;
              if (item.sourceUrls?.[0] && !existingEvent.sourceUrls.includes(item.sourceUrls[0])) {
                existingEvent.sourceUrls.push(item.sourceUrls[0]);
                hasChanges = true;
              }
              if (item.sourceNames?.[0] && !existingEvent.sourceNames.includes(item.sourceNames[0])) {
                existingEvent.sourceNames.push(item.sourceNames[0]);
                hasChanges = true;
              }
              if (existingEvent.status === "archived" && existingEvent.enrichmentStatus === "COMPLETED") {
                existingEvent.status = "published";
                hasChanges = true;
              }
              if (hasChanges) await existingEvent.save();
              stats.duplicates++;
              continue; // skip enrichment
            }
          }

          // New event - Enrich
          let enrichmentStatus = "PENDING";
          const finalEnrichment = await this.enrichEvent(item, startedAt, budgetMs);
          
          if (finalEnrichment) {
            enrichmentStatus = "COMPLETED";
          } else {
            // Check if failure was due to budget exhaustion in enrichEvent
            if ((Date.now() - startedAt) > budgetMs - 1500) {
              enrichmentStatus = "PENDING";
            } else {
              enrichmentStatus = "FAILED";
            }
          }

          const eventDoc = new IntelligenceEvent({
            ...item,
            embedding,
            embeddingModel: "Xenova/all-MiniLM-L6-v2",
            embeddingDimensions: 384,
            ...(finalEnrichment || {}),
            enrichmentStatus,
            status: enrichmentStatus === "COMPLETED" ? "published" : "draft"
          });
          await eventDoc.save();
          console.log(`[INTELLIGENCE_DIAGNOSTIC] EVENT_SAVED candidate=${item.slug}`);
          stats.inserted++;
          hasNewInserts = true;

          if (enrichmentStatus === "COMPLETED") {
             stats.published++;
             console.log(`[INTELLIGENCE_DIAGNOSTIC] EVENT_PUBLISHED candidate=${item.slug}`);
             console.log(`[LiveIngestionService] ✅ Published: "${item.title.substring(0, 60)}..."`);
             await PushService.notifyIntelligence(eventDoc).catch(e => console.error("[PushService] Failed:", e));
          } else if (enrichmentStatus === "PENDING") {
             stats.pending++;
             console.warn(`[LiveIngestionService] ⏸️ Pending: "${item.title.substring(0, 60)}..."`);
          } else {
             stats.failed++;
             console.warn(`[LiveIngestionService] ⚠️ Failed: "${item.title.substring(0, 60)}..."`);
          }

        } catch (e: any) {
           console.error("Failed to process new item", e);
           stats.failed++;
        }
      } else {
        // --- RETRY ITEM ---
        try {
          const finalEnrichment = await this.enrichEvent(item, startedAt, budgetMs);
          if (finalEnrichment) {
             Object.assign(item, finalEnrichment);
             item.enrichmentStatus = "COMPLETED";
             item.status = "published";
             await item.save();
             stats.published++;
             console.log(`[LiveIngestionService] ✅ Retry Published: "${item.slug}"`);
             await PushService.notifyIntelligence(item).catch(e => console.error("[PushService] Failed:", e));
          } else {
             if ((Date.now() - startedAt) > budgetMs - 1500) {
                item.enrichmentStatus = "PENDING";
                stats.pending++;
             } else {
                item.enrichmentStatus = "FAILED";
                stats.failed++;
             }
             item.status = "draft";
             await item.save();
          }
        } catch (e: any) {
           console.error("Failed to process retry item", e);
           stats.failed++;
        }
      }
    }

    if (hasNewInserts) {
      await this.incrementLiveCorpusVersion();
    }

    const durationMs = Date.now() - startedAt;
    if (stats.status === 'completed' && durationMs > budgetMs) {
       stats.status = 'partial';
       stats.error = "Execution budget reached";
    }
    await this.logTelemetry(stats, durationMs);
    
    return stats;
  }

  private async fetchFromProvider(provider: RSSProvider, dict: EntityDictionary) {
    const stats = { fetched: 0, normalized: 0, duplicates: 0, items: [] as any[], status: 'healthy' };
    const circuitBreakerKey = `circuit_breaker:rss:${provider.name.replace(/\s+/g, '_')}`;
    const failures = await redis.get<number>(circuitBreakerKey) || 0;
    
    if (failures >= 3) {
      console.warn(`[LiveIngestionService] Circuit Breaker open for ${provider.name}. Skipping.`);
      stats.status = 'failed';
      return stats;
    }

    try {
      const rawEvents = await Promise.race([
        provider.fetchLatestEvents(),
        new Promise<any[]>((_, reject) => setTimeout(() => reject(new Error("RSS Fetch Timeout")), 4000))
      ]);
      
      stats.fetched += rawEvents.length;
      if (failures > 0) await redis.set(circuitBreakerKey, 0, "EX", 86400);

      for (const item of rawEvents) {
        try {
          const normalized = EventNormalizer.normalize(item, dict);
          stats.normalized++;

          const exactDup = await IntelligenceEvent.findOne({ contentHash: normalized.contentHash }).lean();
          if (exactDup) {
            stats.duplicates++;
            continue;
          }

          stats.items.push(normalized);
        } catch (err: any) {
           // Skip bad items
        }
      }
    } catch (err: any) {
      console.error(`[LiveIngestionService] Provider ${provider.name} failed entirely:`, err.message);
      stats.status = 'failed';
      await redis.set(circuitBreakerKey, failures + 1, "EX", 86400);
    }
    return stats;
  }

  private async enrichEvent(normalized: any, startedAt: number, budgetMs: number): Promise<any> {
    const maxRetries = 1;
    let attempt = 0;
    let enrichmentData = null;

    const systemPrompt = `
IDENTITY: Global Chanakya Intelligence — AI Enrichment Engine.
RULES:
1. STRICT JSON OUTPUT ONLY.
2. Use ONLY the <UNTRUSTED_SOURCE_DATA> provided. DO NOT invent geopolitical facts, entities, dates, or implications.
3. For India Impact: If the source material does not support a meaningful connection to India's strategic, economic, diplomatic, defence, energy, trade, technology, or regional interests, you MUST return "NEUTRAL". NEVER invent an India connection.
4. Assess riskLevel and confidence based solely on the text provided.
    `.trim();

    const userPrompt = `
<UNTRUSTED_SOURCE_DATA>
TITLE: ${normalized.title}
SUMMARY: ${normalized.summary}
CONTENT: ${normalized.content}
</UNTRUSTED_SOURCE_DATA>

Extract the structured intelligence fields from the source data above.
    `.trim();

    while (attempt <= maxRetries) {
      const elapsedTotal = Date.now() - startedAt;
      if (elapsedTotal > budgetMs) {
         console.warn(`[LiveIngestionService] Aborting enrichment, global budget exceeded.`);
         break;
      }

      try {
        const remainingBudget = Math.max(2000, budgetMs - elapsedTotal - 500);
        
        console.log(`[INTELLIGENCE_DIAGNOSTIC] GROQ_STARTED candidate=${normalized.slug} attempt=${attempt}`);
        // Pass AbortSignal to Groq so it cancels the network request cleanly
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), remainingBudget);
        
        const response = await Promise.race([
          groqProvider.generateStructured({
            model: process.env.GROQ_DEFAULT_MODEL || "llama-3.1-8b-instant",
            systemPrompt,
            userPrompt,
            schema: liveEventEnrichmentJsonSchema as Record<string, unknown>,
            schemaName: "LiveEventEnrichment",
            temperature: 0.1,
            signal: controller.signal
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Groq Timeout")), remainingBudget))
        ]).finally(() => clearTimeout(timeoutId));

        const validationResult = liveEventEnrichmentSchema.safeParse((response as any).data);
        if (!validationResult.success) {
           throw new Error("AI Validation Error: " + validationResult.error.message);
        }
        
        console.log(`[INTELLIGENCE_DIAGNOSTIC] GROQ_SUCCESS candidate=${normalized.slug} attempt=${attempt}`);
        enrichmentData = validationResult.data;
        break;
      } catch (err: any) {
        console.warn(`[LiveIngestionService] Enrichment attempt ${attempt + 1} failed:`, err.message);
        attempt++;
        if (attempt <= maxRetries) {
           let delayMs = Math.pow(2, attempt - 1) * 1000;
           if (err instanceof RateLimitError && err.retryAfterMs) {
             delayMs = err.retryAfterMs;
           }
           const jitter = delayMs * 0.1 * (Math.random() * 2 - 1);
           const elapsed = Date.now() - startedAt;
           if (budgetMs - elapsed > delayMs + 3000) {
               await new Promise(res => setTimeout(res, Math.max(delayMs + jitter, 100)));
           } else {
               break; // No time to retry
           }
        }
      }
    }
    
    return enrichmentData;
  }

  private async loadEntityDictionary(): Promise<EntityDictionary> {
    const dict: EntityDictionary = { countries: [], leaders: [], conflicts: [] };
    try {
      const [countries, leaders, conflicts] = await Promise.all([
        Country.find({ status: { $ne: "inactive" } }).select("_id name aliases").lean(),
        Leader.find({ status: { $ne: "inactive" } }).select("_id name aliases").lean(),
        Conflict.find({ status: { $ne: "inactive" } }).select("_id name aliases").lean()
      ]);
      dict.countries = countries.map(c => ({ _id: (c as any)._id, name: (c as any).name, aliases: (c as any).aliases || [] }));
      dict.leaders = leaders.map(l => ({ _id: (l as any)._id, name: (l as any).name, aliases: (l as any).aliases || [] }));
      dict.conflicts = conflicts.map(c => ({ _id: (c as any)._id, name: (c as any).name, aliases: (c as any).aliases || [] }));
    } catch (e) {
      console.warn("[LiveIngestionService] Failed to load entity dictionary", e);
    }
    return dict;
  }

  private async pruneStaleEvents(): Promise<number> {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const result = await IntelligenceEvent.updateMany(
        { 
          status: "published",
          enrichmentStatus: "COMPLETED",
          publishedAt: { $lt: sevenDaysAgo },
          updatedAt: { $lt: sevenDaysAgo }
        },
        { $set: { status: "archived" } }
      );
      if (result.modifiedCount > 0) {
        console.log(`[LiveIngestionService] Archived ${result.modifiedCount} stale events.`);
      }
      return result.modifiedCount || 0;
    } catch (e) {
      console.warn("[LiveIngestionService] Failed to prune stale events", e);
      return 0;
    }
  }

  private async incrementLiveCorpusVersion() {
    try {
      const config = await SystemConfig.findOneAndUpdate(
        { isActive: true },
        { $inc: { liveCorpusVersion: 1 } },
        { new: true }
      );
      if (config) {
        await redis.set("live_corpus_version", config.liveCorpusVersion, "EX", 86400);
      }
    } catch (err) {
      console.error("[LiveIngestionService] Failed to increment liveCorpusVersion:", err);
    }
  }

  private async logTelemetry(stats: any, durationMs: number) {
    const telemetry = {
      timestamp: new Date().toISOString(),
      providers: this.providers.length,
      fetched: stats.fetched,
      normalized: stats.normalized,
      duplicates: stats.duplicates,
      inserted: stats.inserted,
      published: stats.published,
      failed: stats.failed,
      pending: stats.pending,
      archived: stats.archived,
      durationMs: Math.round(durationMs)
    };
    console.log(`[LIVE_INGESTION_LATENCY] \n${JSON.stringify(telemetry, null, 2)}`);
    try {
      await redis.set("live_ingestion_stats", telemetry, "EX", 86400 * 7);
    } catch (e) {}
  }
}

export const liveIngestionService = new LiveIngestionService();
