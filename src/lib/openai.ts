import OpenAI from "openai";
import {
  SYSTEM_PROMPT,
  buildUserMessage,
  MODEL_CONFIG,
  FALLBACK_MODEL_CONFIG,
} from "./prompt";
import type { RawModelOutput } from "@/types/analysis";

// Singleton client — Vercel reuses warm instances, so this avoids repeated instantiation
let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new ConfigurationError("OPENAI_API_KEY environment variable is not set.");
    }
    _client = new OpenAI({ apiKey });
  }
  return _client;
}

const REQUIRED_KEYS: (keyof RawModelOutput)[] = [
  "summary",
  "affectedGroups",
  "keyPoints",
  "pros",
  "cons",
  "debateFor",
  "debateAgainst",
  "lawmakerQuestions",
  "plainEnglish",
  "simple",
] as const;

interface ModelConfig {
  model: string;
  temperature: number;
  max_tokens: number;
  response_format: { type: "json_object" };
}

const MODEL_SEQUENCE: ModelConfig[] = [MODEL_CONFIG, FALLBACK_MODEL_CONFIG];
const MAX_ATTEMPTS_PER_MODEL = 3;

/**
 * Calls OpenAI with backoff and a lighter-model fallback when the primary model is throttled.
 * Returns a validated RawModelOutput or throws a typed Error.
 */
export async function analyzePolicy(policyText: string): Promise<RawModelOutput> {
  const client = getClient();
  const messages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    { role: "user" as const, content: buildUserMessage(policyText) },
  ];

  let lastError: unknown;
  let sawRateLimit = false;
  let retryAfterSeconds: number | undefined;

  for (const modelConfig of MODEL_SEQUENCE) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_MODEL; attempt++) {
      try {
        const response = await client.chat.completions.create({
          ...modelConfig,
          messages,
        });

        const raw = response.choices[0]?.message?.content;
        if (!raw) throw new ParseError("Model returned an empty response.");

        return parseAndValidate(raw);
      } catch (err) {
        lastError = err;

        if (err instanceof ParseError) throw err;

        if (err instanceof OpenAI.APIError) {
          if (err.status === 429) {
            sawRateLimit = true;
            retryAfterSeconds = getRetryAfterSeconds(err.headers) ?? retryAfterSeconds;

            if (attempt < MAX_ATTEMPTS_PER_MODEL) {
              await sleep(getRetryDelayMs(err.headers, attempt));
              continue;
            }

            break;
          }

          if (err.status && err.status < 500) {
            throw err;
          }
        }

        if (attempt === MAX_ATTEMPTS_PER_MODEL) {
          break;
        }

        await sleep(800 * attempt);
      }
    }
  }

  if (sawRateLimit) {
    throw new ProviderRateLimitError(
      retryAfterSeconds
        ? `OpenAI rate limited the analysis request. Retry after ${retryAfterSeconds} seconds.`
        : "OpenAI rate limited the analysis request.",
      retryAfterSeconds
    );
  }

  throw lastError;
}

function parseAndValidate(raw: string): RawModelOutput {
  let parsed: unknown;

  try {
    // Strip accidental markdown fences the model sometimes adds despite instructions
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    parsed = JSON.parse(cleaned);
  } catch {
    throw new ParseError(`Could not parse model output as JSON. Raw: ${raw.slice(0, 200)}`);
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new ParseError("Model output is not a JSON object.");
  }

  const obj = parsed as Record<string, unknown>;

  for (const key of REQUIRED_KEYS) {
    if (!(key in obj)) {
      throw new ParseError(`Model output is missing required field: "${key}"`);
    }
  }

  const arrayFields: (keyof RawModelOutput)[] = [
    "affectedGroups",
    "keyPoints",
    "pros",
    "cons",
    "debateFor",
    "debateAgainst",
    "lawmakerQuestions",
  ];

  for (const field of arrayFields) {
    const val = obj[field];
    if (!Array.isArray(val) || val.length === 0 || typeof val[0] !== "string") {
      throw new ParseError(`Field "${field}" must be a non-empty string array.`);
    }
  }

  return obj as unknown as RawModelOutput;
}

function getRetryAfterSeconds(headers: Record<string, string> | undefined): number | undefined {
  const rawValue = headers?.["retry-after"] ?? headers?.["Retry-After"];
  if (!rawValue) return undefined;

  const parsed = Number(rawValue);
  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.ceil(parsed);
  }

  return undefined;
}

function getRetryDelayMs(headers: Record<string, string> | undefined, attempt: number): number {
  const retryAfterSeconds = getRetryAfterSeconds(headers);
  if (retryAfterSeconds) {
    return retryAfterSeconds * 1000;
  }

  return 1000 * Math.pow(2, attempt - 1);
}

class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParseError";
  }
}

class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}

class ProviderRateLimitError extends Error {
  readonly retryAfterSeconds?: number;

  constructor(message: string, retryAfterSeconds?: number) {
    super(message);
    this.name = "ProviderRateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
