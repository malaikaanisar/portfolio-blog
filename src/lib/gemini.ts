import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

let client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set.');
  }
  if (!client) {
    client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return client;
}

/* ── Model rotation / auto-fallback ─────────────────────────── */

/** Ordered list of models to try – from best to lightest */
export const MODEL_CASCADE = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash-lite',
] as const;

export type GeminiModelId = (typeof MODEL_CASCADE)[number];

export function getModel(modelName: string = MODEL_CASCADE[0]): GenerativeModel {
  return getClient().getGenerativeModel({ model: modelName });
}

/** Returns true when the error looks like a quota / rate-limit problem */
function isQuotaError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const m = err.message;
  return (
    m.includes('429') ||
    m.includes('RESOURCE_EXHAUSTED') ||
    m.includes('Quota exceeded') ||
    m.includes('quota') ||
    m.includes('rate limit')
  );
}

export interface GenerateWithFallbackResult {
  text: string;
  modelUsed: string;
}

/**
 * Try generating content with automatic model fallback.
 * Walks through MODEL_CASCADE; on quota/rate errors falls back to the next model.
 * If caller passes a specific `preferredModel` it is tried first.
 */
export async function generateWithFallback(
  prompt: string,
  preferredModel?: string,
): Promise<GenerateWithFallbackResult> {
  const modelsToTry: string[] = preferredModel
    ? [preferredModel, ...MODEL_CASCADE.filter((m) => m !== preferredModel)]
    : [...MODEL_CASCADE];

  let lastError: unknown;
  for (const modelName of modelsToTry) {
    try {
      const model = getModel(modelName);
      const result = await model.generateContent(prompt);
      return { text: result.response.text(), modelUsed: modelName };
    } catch (err) {
      lastError = err;
      if (isQuotaError(err)) {
        console.warn(`[Gemini] Quota hit on ${modelName}, falling back…`);
        continue;
      }
      throw err; // non-quota errors propagate immediately
    }
  }
  // All models exhausted
  throw lastError;
}

/** Safely parse JSON from a Gemini response that may include markdown code fences */
export function parseJsonFromText<T>(text: string): T {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();
  return JSON.parse(cleaned) as T;
}
