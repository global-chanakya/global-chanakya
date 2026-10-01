import Groq from "groq-sdk";
import { IAIProvider, StructuredGenerateOptions } from "../provider.interface";
import { GroqKeyManager } from "../groqKeyManager";

export class RateLimitError extends Error {
  constructor(message: string, public retryAfterMs?: number) {
    super(message);
    this.name = "RateLimitError";
  }
}

export class GroqProvider implements IAIProvider {
  async generateStructured<T>(options: StructuredGenerateOptions): Promise<{
    data: T;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  }> {
    const { 
      systemPrompt, 
      userPrompt, 
      schema, 
      schemaName, 
      temperature = 0, 
      maxTokens = 4000,
      signal
    } = options;

    const model = process.env.GROQ_MODEL;
    if (!model) {
      throw new Error("GROQ_MODEL is not configured in the environment.");
    }

    const MAX_RETRY_DURATION_MS = 60000; // 1 minute maximum retry duration
    const MAX_ATTEMPTS = 6; // Bounded attempts to prevent infinite loops (enough to try 5 keys)
    const globalStart = Date.now();
    let attempts = 0;
    
    while (attempts < MAX_ATTEMPTS && (Date.now() - globalStart < MAX_RETRY_DURATION_MS)) {
      attempts++;
      const keyConfig = await GroqKeyManager.getAvailableKey();
      
      if (!keyConfig) {
        throw new RateLimitError("All API keys are currently exhausted or in cooldown.");
      }

      const client = new Groq({ apiKey: keyConfig.value });

      let chatCompletion;
      try {
        chatCompletion = await client.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          model: model,
          temperature: temperature,
          max_tokens: maxTokens,
          response_format: { 
            type: "json_schema", 
            json_schema: {
              name: schemaName,
              strict: false,
              schema: schema
            }
          }
        }, { signal });
        
        // Success
        await GroqKeyManager.markSuccess(keyConfig.id);

        const responseText = chatCompletion.choices[0]?.message?.content;
        
        if (!responseText) {
          throw new Error("No response received from Groq");
        }

        try {
          const parsedData = JSON.parse(responseText) as T;
          return {
            data: parsedData,
            usage: chatCompletion.usage ? {
              promptTokens: chatCompletion.usage.prompt_tokens,
              completionTokens: chatCompletion.usage.completion_tokens,
              totalTokens: chatCompletion.usage.total_tokens
            } : undefined
          };
        } catch (e) {
          console.error("[GroqProvider] Failed to parse JSON response:", responseText);
          throw new Error("Failed to parse structured output from provider");
        }

      } catch (e: any) {
        if (e.status === 429) {
          let retryAfterMs = undefined;
          if (e.headers) {
            const retryAfterStr = e.headers['retry-after'] || e.headers['retry-after-ms'];
            if (retryAfterStr) {
              const parsed = parseFloat(retryAfterStr);
              if (!isNaN(parsed)) {
                retryAfterMs = parsed < 1000 ? parsed * 1000 : parsed;
              }
            }
          }
          console.warn(`[GroqProvider] Rate limit hit on key ${keyConfig.id.substring(0, 6)}: ${e.message}. Headers: ${JSON.stringify(e.headers)}`);
          await GroqKeyManager.markRateLimited(keyConfig.id, retryAfterMs);
          continue;
        } else if (e.status >= 500 || e.code === 'ECONNRESET' || e.code === 'ETIMEDOUT') {
          // Provider error or network timeout
          console.warn(`[GroqProvider] Network/Provider error on key ${keyConfig.id.substring(0, 6)}... Retrying with fallback.`);
          await GroqKeyManager.markFailure(keyConfig.id);
          continue;
        } else if (e.status === 400 && (e.message?.includes("Failed to generate JSON") || e.error?.error?.code === "json_validate_failed")) {
          console.warn(`[GroqProvider] JSON validation failed (likely maxTokens reached). Retrying...`);
          if (attempts > 3) throw e;
          continue;
        }
        
        // Other errors (e.g. 400 Bad Request) shouldn't trigger key failover
        throw e;
      }
    }
    
    throw new RateLimitError(`Exhausted retry budget of ${MAX_ATTEMPTS} attempts or ${MAX_RETRY_DURATION_MS}ms.`);
  }

  async generateRaw(options: any): Promise<{ text: string; usage?: { promptTokens: number; completionTokens: number; totalTokens: number; } }> {
    const { systemPrompt, userPrompt, temperature = 0, maxTokens = 8000, signal } = options;
    const model = process.env.GROQ_MODEL;
    if (!model) {
      throw new Error("GROQ_MODEL is not configured in the environment.");
    }
    const MAX_RETRY_DURATION_MS = 60000;
    const MAX_ATTEMPTS = 6;
    const globalStart = Date.now();
    let attempts = 0;

    while (attempts < MAX_ATTEMPTS && (Date.now() - globalStart < MAX_RETRY_DURATION_MS)) {
      attempts++;
      const keyConfig = await GroqKeyManager.getAvailableKey();
      
      if (!keyConfig) {
        throw new RateLimitError("All API keys are currently exhausted or in cooldown.");
      }

      const client = new Groq({ apiKey: keyConfig.value });
      try {
        const chatCompletion = await client.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          model,
          temperature,
          max_tokens: maxTokens,
        }, { signal });

        await GroqKeyManager.markSuccess(keyConfig.id);
        const text = chatCompletion.choices[0]?.message?.content || "";
        return {
          text,
          usage: chatCompletion.usage ? {
            promptTokens: chatCompletion.usage.prompt_tokens,
            completionTokens: chatCompletion.usage.completion_tokens,
            totalTokens: chatCompletion.usage.total_tokens
          } : undefined
        };
      } catch (e: any) {
        if (e.status === 429) {
          const retryAfterStr = e.headers?.['retry-after'] || e.headers?.['retry-after-ms'];
          let retryAfterMs: number | undefined;
          if (retryAfterStr) {
            const parsed = parseFloat(retryAfterStr);
            if (!isNaN(parsed)) retryAfterMs = parsed < 1000 ? parsed * 1000 : parsed;
          }
          await GroqKeyManager.markRateLimited(keyConfig.id, retryAfterMs);
          continue;
        } else if (e.status >= 500 || e.code === 'ECONNRESET' || e.code === 'ETIMEDOUT') {
          await GroqKeyManager.markFailure(keyConfig.id);
          continue;
        }
        throw e;
      }
    }
    
    throw new RateLimitError(`Exhausted retry budget of ${MAX_ATTEMPTS} attempts or ${MAX_RETRY_DURATION_MS}ms.`);
  }

  getProviderName(): string {
    return "groq";
  }
}

// Export a singleton instance
export const groqProvider = new GroqProvider();
