import { redis } from "@/lib/redis";
import dbConnect from "@/lib/mongoose";
import { BlogPublishingRun } from "@/lib/models/BlogPublishingRun";
import { randomUUID } from "crypto";
import { BlogService } from "./blog.service";
import { generateEmbeddings } from "@/lib/ai/embeddings";
import { findSemanticMatches } from "@/lib/ai/vectorSearch";
import { Blog } from "@/lib/models/Blog";
import { Country } from "@/lib/models/Country";
import { Leader } from "@/lib/models/Leader";
import { Conflict } from "@/lib/models/Conflict";
import { groqProvider } from "@/lib/ai/providers/groq.provider";
import { WikipediaImageService } from "./wikipediaImage.service";
import { IImageSearchProvider } from "./imageSearchProvider.interface";
import mongoose from "mongoose";
import { IntelligenceEvent } from "@/lib/models/IntelligenceEvent";
import { ragIndexerService } from "@/modules/intelligence/services/ragIndexer.service";
import { PushService } from "@/lib/notifications/push.service";
import { tavilyResearchService, TavilySearchResponse } from "./tavilyResearch.service";
import { 
  FactExtractionJsonSchema, 
  TopicDiscoveryJsonSchema,
  StrategicDriversActorAnalysisSchema,
  OrderEffectsSchema,
  RegionalImplicationsSchema,
  StrategicThesisSchema,
  ScenarioAnalysisSchema,
  IntelligenceForecastSchema,
  ArticleOutlineSchema,
  ArticleSectionSchema,
  SEOMetadataSchema
} from "./research.validators";

const PUBLISHING_LOCK_KEY = "publishing:engine:lock";
const LOCK_TTL_SECONDS = 300; 

export interface PublishingMetrics {
  tavilyCalls: number;
  groqCalls: number;
  successfulCalls: number;
  failedCalls: number;
  tavilyExecutionTimeMs: number;
  groqExecutionTimeMs: number;
  retries: number;
  timeoutEvents: number;
  rateLimits: number;
  totalResearchTimeMs: number;
  totalGenerationTimeMs: number;
  totalEndToEndTimeMs: number;
  promptTokens: number;
  completionTokens: number;
}

export class BlogPublishingEngine {
  private workerId: string;
  public lastMetrics!: PublishingMetrics;
  public lastRunData: any = {}; // to export full pipeline data for audit

  constructor() {
    this.workerId = `pub-engine-${randomUUID().substring(0, 8)}`;
    this.resetMetrics();
  }

  public async releaseLock() {
    await redis.delIfOwner(PUBLISHING_LOCK_KEY, this.workerId);
  }

  private resetMetrics() {
    this.lastMetrics = {
      tavilyCalls: 0,
      groqCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      tavilyExecutionTimeMs: 0,
      groqExecutionTimeMs: 0,
      retries: 0,
      timeoutEvents: 0,
      rateLimits: 0,
      totalResearchTimeMs: 0,
      totalGenerationTimeMs: 0,
      totalEndToEndTimeMs: 0,
      promptTokens: 0,
      completionTokens: 0
    };
    this.lastRunData = {};
  }

  private async trackGroqCall<T>(options: any): Promise<T> {
    const start = Date.now();
    try {
      this.lastMetrics.groqCalls++;
      const res = await groqProvider.generateStructured<T>(options);
      
      if (res.usage) {
        this.lastMetrics.promptTokens += (res.usage.promptTokens || 0);
        this.lastMetrics.completionTokens += (res.usage.completionTokens || 0);
      }
      
      this.lastMetrics.groqExecutionTimeMs += (Date.now() - start);
      this.lastMetrics.successfulCalls++;
      return res.data;
    } catch (err: any) {
      this.lastMetrics.failedCalls++;
      if (err.message?.includes("RateLimit")) this.lastMetrics.rateLimits++;
      if (err.message?.includes("timeout") || err.message?.includes("abort")) this.lastMetrics.timeoutEvents++;
      throw err;
    }
  }

  private async trackGroqCallRaw(options: any): Promise<string> {
    const start = Date.now();
    try {
      this.lastMetrics.groqCalls++;
      const res = await groqProvider.generateRaw(options);
      
      if (res.usage) {
        this.lastMetrics.promptTokens += (res.usage.promptTokens || 0);
        this.lastMetrics.completionTokens += (res.usage.completionTokens || 0);
      }
      
      this.lastMetrics.groqExecutionTimeMs += (Date.now() - start);
      this.lastMetrics.successfulCalls++;
      return res.text;
    } catch (err: any) {
      this.lastMetrics.failedCalls++;
      if (err.message?.includes("RateLimit")) this.lastMetrics.rateLimits++;
      if (err.message?.includes("timeout") || err.message?.includes("abort")) this.lastMetrics.timeoutEvents++;
      throw err;
    }
  }

  async processNextPublication(isDryRun: boolean = false) {
    this.resetMetrics();
    const globalStart = Date.now();
    await dbConnect();
    
    const acquired = await redis.setNX(PUBLISHING_LOCK_KEY, this.workerId, LOCK_TTL_SECONDS);
    if (!acquired) {
      throw new Error("A publishing operation is currently executing. Please wait.");
    }

    try {
      let run = await BlogPublishingRun.findOne({ 
        status: { $in: ["QUEUED", "RUNNING", "IDLE"] }
      }).sort({ createdAt: -1 });

      // Auto-expire stale runs:
      // (a) isDryRun mismatch — a dry-run audit left a QUEUED/RUNNING run that blocks real publishing
      // (b) No remaining PENDING/RETRYING categories — run is exhausted but never marked COMPLETED
      // (c) A RUNNING run older than the lock TTL — orphaned by a crashed worker
      if (run) {
        const hasPending = run.categoryResults.some((c: any) => c.status === "PENDING" || c.status === "RETRYING");
        const isOrphaned = run.status === "RUNNING" && 
          (Date.now() - new Date(run.updatedAt || run.createdAt).getTime()) > (LOCK_TTL_SECONDS * 1000);

        if (run.isDryRun !== isDryRun || !hasPending || isOrphaned) {
          console.warn(
            `[BlogPublishingEngine] Auto-expiring stale run ${run.runId} ` +
            `(isDryRunMismatch=${run.isDryRun !== isDryRun}, hasPending=${hasPending}, isOrphaned=${isOrphaned})`
          );
          run.status = "COMPLETED";
          run.completedAt = new Date();
          await run.save();
          run = null as any;
        }
      }

      if (!run) {
        const systemAuthorId = process.env.SYSTEM_BLOG_AUTHOR_ID;
        if (!systemAuthorId || !mongoose.Types.ObjectId.isValid(systemAuthorId)) {
          throw new Error("CRITICAL: SYSTEM_BLOG_AUTHOR_ID is missing or invalid.");
        }
        
        const categoriesRaw = await Blog.distinct("category", { 
          status: "published", 
          contentType: { $ne: "platform-seo" } 
        });
        const categories = categoriesRaw.filter(Boolean);
        
        if (!categories || categories.length === 0) {
          throw new Error("No active categories found to publish.");
        }

        run = new BlogPublishingRun({
          runId: `run_${Date.now()}`,
          status: "QUEUED",
          totalCategories: categories.length,
          isDryRun,
          categoryResults: categories.map((cat: string) => ({
            category: cat,
            status: "PENDING"
          }))
        });
        await run.save();
      }

      const nextCategory = run.categoryResults.find((c: any) => c.status === "PENDING" || c.status === "RETRYING");
      
      if (nextCategory) {
        run.status = "RUNNING";
        await run.save();

        await this.processCategory(nextCategory.category, run.runId);

        run = await BlogPublishingRun.findOne({ runId: run.runId });
      }

      const stillPending = run.categoryResults.some((c: any) => c.status === "PENDING" || c.status === "RETRYING");
      if (!stillPending) {
        run.status = "COMPLETED";
        run.completedAt = new Date();
        await run.save();
      }

      this.lastMetrics.totalEndToEndTimeMs = Date.now() - globalStart;
      return { 
        runId: run.runId, 
        workerId: this.workerId, 
        categories: run.categoryResults,
        status: run.status
      };
    } finally {
      await redis.delIfOwner(PUBLISHING_LOCK_KEY, this.workerId);
    }
  }

  async checkDuplicate(proposedTopic: string, category: string) {
    const exactMatch = await Blog.findOne({ title: proposedTopic, category });
    if (exactMatch) return { isDuplicate: true };

    const slug = proposedTopic.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    if (await Blog.findOne({ slug, category })) return { isDuplicate: true };

    try {
      const topicEmbedding = await generateEmbeddings(proposedTopic);
      const semanticMatches = await findSemanticMatches(topicEmbedding, 3, 0.85);
      if (semanticMatches.length > 0) return { isDuplicate: true };
    } catch (e) {}
    
    return { isDuplicate: false };
  }

  /** STAGE 1: Topic Discovery */
  private async stage1_TopicDiscovery(category: string) {
    const rStart = Date.now();
    const recentEvents = await IntelligenceEvent.find({ status: "published" }).sort({ publishedAt: -1 }).limit(10).lean();
    const internalContext = recentEvents.map(e => `- ${e.title}`).join('\n');
    
    const intentMap: Record<string, string> = {
      "Geopolitics": "current geopolitical developments strategic shifts diplomatic crises",
      "Defense": "military developments defence policy procurement deployments operations",
      "Economy": "trade sanctions energy supply chains central banks economic policy",
    };
    const intent = intentMap[category] || `latest developments in ${category}`;
    const discoveryQuery = `${intent} news ${new Date().toISOString().split('T')[0]}`;
    
    this.lastMetrics.tavilyCalls++;
    const tavilyStart = Date.now();
    const searchRes = await tavilyResearchService.search(discoveryQuery, 3);
    this.lastMetrics.tavilyExecutionTimeMs += (Date.now() - tavilyStart);
    
    const externalContext = searchRes.results.map(r => `- ${r.title}\n  ${r.content.substring(0, 200)}...`).join('\n\n');

    const data = await this.trackGroqCall<any>({
      model: process.env.GROQ_DEFAULT_MODEL || "llama-3.1-8b-instant",
      systemPrompt: `You are a Senior Intelligence Director. Select exactly 3 distinct, high-impact current events topics for a new report in: "${category}". Topics MUST be grounded in REAL CURRENT EVENTS from provided contexts.`,
      userPrompt: `Internal Context:\n${internalContext}\n\nExternal Context:\n${externalContext}`,
      schema: TopicDiscoveryJsonSchema,
      schemaName: "TopicDiscovery"
    });

    for (const cand of data.candidateTopics) {
      if (!(await this.checkDuplicate(cand.title, category)).isDuplicate) {
        this.lastMetrics.totalResearchTimeMs += (Date.now() - rStart);
        return { ...cand, discoveryContext: discoveryQuery };
      }
    }
    throw new Error("All generated topics were duplicates.");
  }

  /** STAGE 2: Source Fetching (2-Pass) */
  private async stage2_SourceFetching(candidate: any) {
    const rStart = Date.now();
    this.lastMetrics.tavilyCalls += 2; // 2 passes
    const tStart = Date.now();
    const sources = await tavilyResearchService.search(`${candidate.topic} ${candidate.title}`, 7);
    this.lastMetrics.tavilyExecutionTimeMs += (Date.now() - tStart);
    this.lastMetrics.totalResearchTimeMs += (Date.now() - rStart);
    if (!sources.results.length) throw new Error("No sources found during research.");
    return sources;
  }

  /** STAGE 3: Verified Facts */
  private async stage3_VerifiedFacts(candidate: any, sources: TavilySearchResponse) {
    const sourceContext = sources.results.map((r, i) => `SOURCE [${i+1}]: ${r.title}\nURL: ${r.url}\nCONTENT:\n${r.content.substring(0, 1000)}...`).join('\n\n');
    const data = await this.trackGroqCall<any>({
      model: process.env.GROQ_DEFAULT_MODEL || "llama-3.1-8b-instant",
      systemPrompt: "Extract verifiable claims from sources. Classify as FACT, CONFIRMED, REPORTED, DISPUTED. sourceType is PRIMARY if from gov/mil/org, else SECONDARY. Do not invent facts. STRICT LIMIT: Extract MAXIMUM 10 most critical facts to save space.",
      userPrompt: `Topic: ${candidate.title}\n\nSources:\n${sourceContext}`,
      schema: FactExtractionJsonSchema,
      schemaName: "FactExtraction",
      maxTokens: 8000
    });

    if (data.verifiedFacts) {
      data.verifiedFacts = data.verifiedFacts.filter((fact: any) => typeof fact === 'object' && fact !== null);
      data.verifiedFacts.forEach((fact: any) => {
        let publisher = "Unknown";
        let publicationDate = "Unknown";
        if (fact.sourceUrls && fact.sourceUrls.length > 0) {
          const matchedSource = sources.results.find(s => fact.sourceUrls.includes(s.url));
          if (matchedSource) {
            publisher = matchedSource.publisher || "Unknown";
            publicationDate = matchedSource.publishedDate || "Unknown";
          }
        }
        fact.publisher = publisher;
        fact.publicationDate = publicationDate;
      });
    }

    return data;
  }

  /** STAGE 4: Strategic Drivers */
  private async stage4_StrategicDrivers(candidate: any, facts: any) {
    return await this.trackGroqCall<any>({
      model: process.env.GROQ_DEFAULT_MODEL || "llama-3.1-8b-instant",
      systemPrompt: "Analyze the provided facts. Identify strategic significance, historical continuity, power centers, and hidden drivers.",
      userPrompt: `Topic: ${candidate.title}\nFacts:\n${JSON.stringify(facts.verifiedFacts)}`,
      schema: StrategicDriversActorAnalysisSchema,
      schemaName: "StrategicDrivers"
    });
  }

  /** STAGE 5: Order Effects */
  private async stage5_OrderEffects(candidate: any, facts: any, drivers: any) {
    return await this.trackGroqCall<any>({
      model: process.env.GROQ_DEFAULT_MODEL || "llama-3.1-8b-instant",
      systemPrompt: "Determine the 2nd and 3rd order knock-on effects based on the evidence and drivers.",
      userPrompt: `Topic: ${candidate.title}\nDrivers: ${JSON.stringify(drivers)}`,
      schema: OrderEffectsSchema,
      schemaName: "OrderEffects"
    });
  }

  /** STAGE 6: Regional Implications */
  private async stage6_RegionalImplications(candidate: any, effects: any) {
    return await this.trackGroqCall<any>({
      model: process.env.GROQ_DEFAULT_MODEL || "llama-3.1-8b-instant",
      systemPrompt: "Analyze implications for India and the broader Global South.",
      userPrompt: `Topic: ${candidate.title}\nEffects: ${JSON.stringify(effects)}`,
      schema: RegionalImplicationsSchema,
      schemaName: "RegionalImplications"
    });
  }

  /** STAGE 7: Strategic Thesis */
  private async stage7_StrategicThesis(candidate: any, drivers: any) {
    return await this.trackGroqCall<any>({
      model: process.env.GROQ_DEFAULT_MODEL || "llama-3.1-8b-instant",
      systemPrompt: "Write a single powerful sentence summarizing the ultimate strategic judgment.",
      userPrompt: `Topic: ${candidate.title}\nDrivers: ${JSON.stringify(drivers)}`,
      schema: StrategicThesisSchema,
      schemaName: "StrategicThesis"
    });
  }

  /** STAGE 8: Scenario Analysis */
  private async stage8_ScenarioAnalysis(candidate: any, thesis: any) {
    return await this.trackGroqCall<any>({
      model: process.env.GROQ_DEFAULT_MODEL || "llama-3.1-8b-instant",
      systemPrompt: "Develop base, bull, and bear scenarios based on the thesis.",
      userPrompt: `Topic: ${candidate.title}\nThesis: ${thesis.strategicThesis}`,
      schema: ScenarioAnalysisSchema,
      schemaName: "ScenarioAnalysis"
    });
  }

  /** STAGE 9: Intelligence Forecast */
  private async stage9_IntelligenceForecast(candidate: any, scenarios: any) {
    return await this.trackGroqCall<any>({
      model: process.env.GROQ_DEFAULT_MODEL || "llama-3.1-8b-instant",
      systemPrompt: "Provide a 6-to-24 month forecast and exact indicators to monitor.",
      userPrompt: `Topic: ${candidate.title}\nScenarios: ${JSON.stringify(scenarios)}`,
      schema: IntelligenceForecastSchema,
      schemaName: "IntelligenceForecast"
    });
  }

  /** STAGE 10A & 10B: Outline and Section-by-Section HTML Generation */
  private async stage10_ArticleGeneration(candidate: any, packageData: any) {
    const gStart = Date.now();
    // 10A: Outline
    const outline = await this.trackGroqCall<any>({
      model: process.env.GROQ_DEFAULT_MODEL || "llama-3.1-8b-instant",
      systemPrompt: "Create a detailed section-by-section outline for a 5000+ word premium intelligence article. To optimize API throughput, you MUST group logically related content into EXACTLY 6 to 8 large combined sections. Do NOT create more than 8 sections. Each grouped section MUST have a targetWordCount of at least 800 to ensure the total exceeds 5000 words. Example groupings: 'Executive Summary & Strategic Background', 'Power Center & Actor Analysis', 'Military & Economic Impact', 'Scenario Analysis & Intelligence Forecast'.",
      userPrompt: `Topic: ${candidate.title}`,
      schema: ArticleOutlineSchema,
      schemaName: "ArticleOutline"
    });

    let fullHtml = "";
    let accumulatedWords = 0;

    // 10B: Iterative Generation
    for (const section of outline.sections) {
      // Fact Context Filtering and Relevance Ranking
      const focusTopics = [
        section.headerText.toLowerCase(), 
        ...(section.focusTopics || []).map((c: string) => c.toLowerCase())
      ];
      
      const highlyRelevant: any[] = [];
      const supporting: any[] = [];
      const disputed: any[] = [];
      
      packageData.facts.verifiedFacts.forEach((fact: any) => {
        const text = (fact.fact + " " + fact.context).toLowerCase();
        
        if (fact.classification === "DISPUTED") {
          disputed.push(fact);
        } else if (focusTopics.some(topic => text.includes(topic))) {
          highlyRelevant.push(fact);
        } else {
          supporting.push(fact);
        }
      });
      
      // NOTE: Source URLs are intentionally excluded from the fact context.
      // Passing raw URLs to the model causes it to dump them verbatim as plain text
      // inside article paragraphs. Citations are handled separately at the DB level.
      const formatFacts = (facts: any[]) => facts.map((f: any) => `Fact: ${f.claim || f.fact || ''}\nEvidence: ${f.supportingEvidence || f.context || ''}`).join('\n\n');
      
      const contextSlice = `
HIGHLY RELEVANT FACTS:
${highlyRelevant.length > 0 ? formatFacts(highlyRelevant) : 'None'}

SUPPORTING / BACKGROUND FACTS:
${supporting.length > 0 ? formatFacts(supporting) : 'None'}

DISPUTED / CONFLICTING FACTS:
${disputed.length > 0 ? formatFacts(disputed) : 'None'}

Thesis: ${packageData.thesis.strategicThesis}
Section Focus: ${section.focusTopics?.join(', ') || 'None'}
      `;

      let sectionRes: any = null;
      let retries = 0;
      let valid = false;

      while (!valid && retries < 4) {
        try {
          const rawHtml = await this.trackGroqCallRaw({
            model: process.env.GROQ_DEFAULT_MODEL || "llama-3.1-8b-instant",
            systemPrompt: `You are an elite intelligence analyst writing a large, grouped section of a 5000+ word intelligence report. You MUST write at least 700 words for this section — do not stop until you have written at least 700 words of substantive prose.
Your section is: ${section.headerText}.
Target word count for this section: ~${section.targetWordCount} words.
Write 6 to 8 long, well-developed analytical paragraphs. Each paragraph must be at least 80 words. Do NOT invent facts. Use only the provided evidence.
Do NOT include an "in conclusion", "to summarize", "in summary", or "overall" opener or closer.
CRITICAL: Do NOT write any raw URLs or hyperlinks in the article body. Never include http:// or https:// links in the text. Do not cite sources by URL. Write prose only.
Return ONLY raw HTML starting with <h2> and ending with </p>. Do NOT return JSON. Do NOT add any markdown fences or code blocks.`,
            userPrompt: `Topic: ${candidate.title}\n\nContext for this section:\n${contextSlice}`,
            maxTokens: 8000
          });
          
          // Post-process: strip any raw URLs the model may have written despite instructions.
          // Matches bare URLs in text nodes (href= attributes in <a> tags are preserved).
          const strippedHtml = rawHtml
            .replace(/(?<!["'=])(https?:\/\/[^\s<>"'\)]+)/g, '')
            .replace(/\s{2,}/g, ' ')
            .trim();
          sectionRes = { htmlContent: strippedHtml };

          const cleanTextForRetry = sectionRes.htmlContent.replace(/<[^>]*>?/gm, '');
          const actualWordsForRetry = cleanTextForRetry.split(/\s+/).filter((w: string) => w.length > 0).length;

          // Section-Level Humanization QC
          const sectionQc = this.stage12_HumanizationQC(sectionRes.htmlContent);

          if (actualWordsForRetry < 300) {
            console.warn(`[BlogPublishingEngine] Section '${section.headerText}' too short (${actualWordsForRetry} words). Preview: ${cleanTextForRetry.substring(0, 200)}. Retrying...`);
            retries++;
          } else if (!sectionQc.passed) {
            console.warn(`[BlogPublishingEngine] Section '${section.headerText}' failed humanization QC (${sectionQc.flags.join(", ")}). Retrying...`);
            retries++;
          } else {
            valid = true;
          }
        } catch (e: any) {
          if (e.message?.includes("RateLimitTimeout") || e.message?.includes("Exhausted retry budget")) {
            throw e; // Bubble up rate limit timeouts immediately
          }
          console.warn(`[BlogPublishingEngine] Error generating section '${section.headerText}': ${e.message}. Retrying...`);
          retries++;
        }
      }

      if (!valid) {
        throw new Error(`Failed to generate valid section '${section.headerText}' after 3 attempts (Humanization or Word Count failures).`);
      }

      // Deterministic word count
      const cleanText = sectionRes.htmlContent.replace(/<[^>]*>?/gm, '');
      const actualSectionWords = cleanText.split(/\s+/).filter((w: string) => w.length > 0).length;

      fullHtml += `\n\n${sectionRes.htmlContent}`;
      accumulatedWords += actualSectionWords;
    }

    if (accumulatedWords < 5000) {
      throw new Error(`Final accumulated word count (${accumulatedWords}) is below the strict 5000 word minimum.`);
    }

    this.lastMetrics.totalGenerationTimeMs += (Date.now() - gStart);
    return { htmlContent: fullHtml, actualWordCount: accumulatedWords, outline };
  }

  /** STAGE 11: SEO Metadata (With Auto-Repair) */
  private async stage11_SEOMetadata(candidate: any, articleHtml: string) {
    const gStart = Date.now();
    let seoData: any = null;
    let attempts = 0;
    
    while (attempts < 3) {
      attempts++;
      seoData = await this.trackGroqCall<any>({
        model: process.env.GROQ_DEFAULT_MODEL || "llama-3.1-8b-instant",
        systemPrompt: `Generate strict SEO metadata. 
CRITICAL CONSTRAINTS: 
- metaTitle MUST be <= 60 characters.
- metaDescription MUST be <= 160 characters.
- keywords MUST be exactly 15 to 20 items.`,
        userPrompt: `Topic: ${candidate.title}\nExcerpt of Content: ${articleHtml.substring(0, 2000)}...`,
        schema: SEOMetadataSchema,
        schemaName: "SEOMetadata"
      });

      let valid = true;
      if (seoData.metaTitle.length > 60) valid = false;
      if (seoData.metaDescription.length > 160) valid = false;
      if (seoData.keywords.length < 15 || seoData.keywords.length > 20) valid = false;

      if (valid) {
        this.lastMetrics.totalGenerationTimeMs += (Date.now() - gStart);
        return seoData;
      } else {
        this.lastMetrics.retries++;
        console.warn(`[BlogPublishingEngine] SEO limits violated on attempt ${attempts}. Retrying.`);
      }
    }
    
    // If it fails 3 times, we return the invalid data and let Stage 13 hard-fail it.
    this.lastMetrics.totalGenerationTimeMs += (Date.now() - gStart);
    return seoData;
  }

  /** STAGE 12: Humanization QC */
  private stage12_HumanizationQC(html: string) {
    const flags = [];
    const lowerHtml = html.toLowerCase();
    
    // Banned phrases
    const badPhrases = ["in today's rapidly changing world", "only time will tell", "at the end of the day", "it is important to note", "in conclusion"];
    for (const phrase of badPhrases) {
      if (lowerHtml.includes(phrase)) flags.push(`Banned phrase: "${phrase}"`);
    }

    // Repetitive structural checks (basic heuristics)
    const paragraphs = lowerHtml.split('<p>');
    let moreoverCount = 0;
    let furthermoreCount = 0;
    for (const p of paragraphs) {
      if (p.trim().startsWith("moreover,")) moreoverCount++;
      if (p.trim().startsWith("furthermore,")) furthermoreCount++;
    }
    if (moreoverCount > 5) flags.push("Repetitive transition: 'Moreover'");
    if (furthermoreCount > 5) flags.push("Repetitive transition: 'Furthermore'");

    return { flags, passed: flags.length === 0 };
  }

  /** STAGE 13: Final Validation (Hard Gates) */
  private stage13_FinalValidation(runData: any) {
    const fails: string[] = [];
    
    // 1. Research Completed
    if (!runData.sources?.results?.length) fails.push("GATE FAIL: No research sources.");
    // 2. Primary Source Coverage (Log warning, but only fail if 0 sources total)
    if (!runData.sources.primarySourcesFound) console.warn("LIMITATION: No primary sources reasonably available.");
    // 3. Facts Extracted
    if (!runData.facts?.verifiedFacts?.length) fails.push("GATE FAIL: No verified facts extracted.");
    // 4. Strategic Thesis
    if (!runData.thesis?.strategicThesis) fails.push("GATE FAIL: Missing strategic thesis.");
    // 5. Scenarios (Base/Bull/Bear)
    if (!runData.scenarios?.baseCase || !runData.scenarios?.bullCase || !runData.scenarios?.bearCase) fails.push("GATE FAIL: Missing scenarios.");
    // 6. Forecast (6-24)
    if (!runData.forecast?.sixMonthForecast) fails.push("GATE FAIL: Missing 6-month forecast.");
    // 7. Indicators
    if (!runData.forecast?.indicatorsToMonitor?.length) fails.push("GATE FAIL: Missing indicators to monitor.");
    // 8. HTML Word Count (5000+ words)
    const actualWords = runData.article.htmlContent.split(/\s+/).length;
    if (actualWords < 5000) fails.push(`GATE FAIL: Article word count is ${actualWords}. Required: 5000+`);
    // 9. SEO Title <= 60
    if (runData.seo?.metaTitle?.length > 60) fails.push(`GATE FAIL: Meta title > 60 chars (${runData.seo.metaTitle.length})`);
    // 10. SEO Desc <= 160
    if (runData.seo?.metaDescription?.length > 160) fails.push(`GATE FAIL: Meta desc > 160 chars (${runData.seo.metaDescription.length})`);
    // 11. SEO Keywords 15-20
    const kwCount = runData.seo?.keywords?.length || 0;
    if (kwCount < 15 || kwCount > 20) fails.push(`GATE FAIL: Keywords not 15-20 (Found ${kwCount})`);
    // 12. Humanization
    if (!runData.qc.passed) fails.push(`GATE FAIL: Humanization failed: ${runData.qc.flags.join(", ")}`);
    // 13. Image
    if (!runData.image?.url) fails.push("GATE FAIL: No valid image generated.");
    
    if (fails.length > 0) {
      throw new Error(`FINAL VALIDATION FAILED:\n${fails.join('\n')}`);
    }
  }

  async processCategory(category: string, runId: string) {
    console.log(`[BlogPublishingEngine] Processing category: ${category}`);
    const run = await BlogPublishingRun.findOne({ runId });
    if (!run) throw new Error(`Run ${runId} not found`);

    const categoryResult = run.categoryResults.find((c: any) => c.category === category);
    categoryResult.status = "RUNNING";
    categoryResult.startedAt = new Date();
    await run.save();

    try {
      let candidate;
      let sources;
      
      if (categoryResult.researchData && categoryResult.researchData.candidate && categoryResult.researchData.sources) {
        console.log(`[BlogPublishingEngine] Tavily Research Package Cached. Downstream failures will not consume additional search credits.`);
        candidate = categoryResult.researchData.candidate;
        sources = categoryResult.researchData.sources;
      } else {
        candidate = await this.stage1_TopicDiscovery(category);
        categoryResult.topic = candidate.topic;
        categoryResult.reportType = candidate.reportType;

        sources = await this.stage2_SourceFetching(candidate);
        
        // Cache the research data
        categoryResult.researchData = { candidate, sources };
        run.tavilySearchCalls = (run.tavilySearchCalls || 0) + this.lastMetrics.tavilyCalls;
        await run.save();
      }
      const facts = await this.stage3_VerifiedFacts(candidate, sources);
      const drivers = await this.stage4_StrategicDrivers(candidate, facts);
      const effects = await this.stage5_OrderEffects(candidate, facts, drivers);
      const regional = await this.stage6_RegionalImplications(candidate, effects);
      const thesis = await this.stage7_StrategicThesis(candidate, drivers);
      const scenarios = await this.stage8_ScenarioAnalysis(candidate, thesis);
      const forecast = await this.stage9_IntelligenceForecast(candidate, scenarios);
      
      const packageData = { facts, drivers, effects, regional, thesis, scenarios, forecast };
      const article = await this.stage10_ArticleGeneration(candidate, packageData);
      
      const seo = await this.stage11_SEOMetadata(candidate, article.htmlContent);
      const qc = this.stage12_HumanizationQC(article.htmlContent);
      
      const imageProvider: IImageSearchProvider = new WikipediaImageService();
      const imageResult = await imageProvider.searchImage(seo.imageSearchQuery);
      
      const runData = {
        candidate, sources, ...packageData, article, seo, qc, image: imageResult
      };
      this.lastRunData = runData; // cache for strict-audit.ts

      this.stage13_FinalValidation(runData);

      if (run.isDryRun) {
        console.log(`[BlogPublishingEngine] Dry run enabled. Skipping DB write.`);
        categoryResult.status = "PUBLISHED";
        categoryResult.completedAt = new Date();
        run.completedCategories++;
      } else {
        const { countries, leaders, conflicts } = await this.mapEntities(seo);
        const cleanText = article.htmlContent.replace(/<[^>]*>?/gm, '');
        const wordCount = cleanText.split(/\s+/).filter(w => w.length > 0).length;
        const readingTime = Math.max(1, Math.ceil(wordCount / 200));

        const blog = await BlogService.createBlog({
          title: seo.title,
          slug: seo.slug,
          excerpt: seo.excerpt,
          content: article.htmlContent,
          readingTime,
          category,
          reportType: candidate.reportType,
          tags: seo.tags,
          seo: {
            focusKeyword: seo.focusKeyword,
            title: seo.metaTitle,
            description: seo.metaDescription,
            keywords: seo.keywords,
            robots: "index,follow"
          },
          aiSummary: seo.aiSummary,
          featuredImage: imageResult!.url,
          ogImage: imageResult!.url, // Ensures OG matches Featured Image
          status: "published",
          visibility: "public",
          countries,
          leaders,
          conflicts,
          author: new mongoose.Types.ObjectId(process.env.SYSTEM_BLOG_AUTHOR_ID!),
          isSystemGenerated: true
        });

        ragIndexerService.indexBlog(blog._id.toString()).catch(() => {});
        PushService.notifyBlog(blog).catch(() => {});

        categoryResult.status = "PUBLISHED";
        categoryResult.blogId = blog._id;
        categoryResult.completedAt = new Date();
        run.completedCategories++;
        run.publishedBlogIds.push(blog._id);
      }
    } catch (error: any) {
      console.error(`[BlogPublishingEngine] Category ${category} failed:`, error.message);
      categoryResult.status = "FAILED";
      categoryResult.error = error.message || String(error);
      categoryResult.completedAt = new Date();
      run.failedCategories++;
    }

    await run.save();
  }

  async mapEntities(seoData: any) {
    const mapToIds = async (model: any, names: string[]) => {
      if (!names || names.length === 0) return [];
      const entities = await model.find({ name: { $in: names.map(n => new RegExp(`^${n}$`, "i")) } }).select("_id");
      return entities.map((e: any) => e._id.toString());
    };
    return {
      countries: await mapToIds(Country, seoData.linkedCountries),
      leaders: await mapToIds(Leader, seoData.linkedLeaders),
      conflicts: await mapToIds(Conflict, seoData.linkedConflicts)
    };
  }
}

export const blogPublishingEngine = new BlogPublishingEngine();
