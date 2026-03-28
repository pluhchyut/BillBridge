import OpenAI from "openai";
import { SYSTEM_PROMPT, buildUserMessage, MODEL_CONFIG } from "./prompt";
import type { RawModelOutput } from "@/types/analysis";

// Singleton client — Vercel reuses warm instances, so this avoids repeated instantiation
let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY environment variable is not set.");
    _client = new OpenAI({ apiKey });
  }
  return _client;
}

const REQUIRED_KEYS: (keyof RawModelOutput)[] = [
  "summary","affectedGroups","keyPoints","pros","cons",
  "debateFor","debateAgainst","lawmakerQuestions","plainEnglish","simple",
];

/**
 * Calls the OpenAI API with one automatic retry on transient failures.
 * Returns a validated RawModelOutput or throws a typed Error.
 */
export async function analyzePolicy(policyText: string): Promise<RawModelOutput> {
  const client = getClient();

  let lastError: unknown;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await client.chat.completions.create({
        ...MODEL_CONFIG,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user",   content: buildUserMessage(policyText) },
        ],
      });

      const raw = response.choices[0]?.message?.content;
      if (!raw) throw new ParseError("Model returned an empty response.");

      return parseAndValidate(raw);
    } catch (err) {
      lastError = err;

      // Don't retry on parse errors — a second call with the same input won't fix bad JSON
      if (err instanceof ParseError) throw err;

      // Don't retry on OpenAI auth/rate-limit errors (4xx)
      if (err instanceof OpenAI.APIError && err.status && err.status < 500) throw err;

      // Retry only on transient errors (5xx, network timeouts) on the first attempt
      if (attempt === 2) throw lastError;

      await sleep(800);
    }
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

  // Ensure array fields are actually arrays with string items
  const arrayFields: (keyof RawModelOutput)[] = [
    "affectedGroups","keyPoints","pros","cons","debateFor","debateAgainst","lawmakerQuestions",
  ];
  for (const field of arrayFields) {
    const val = obj[field];
    if (!Array.isArray(val) || val.length === 0 || typeof val[0] !== "string") {
      throw new ParseError(`Field "${field}" must be a non-empty string array.`);
    }
  }

  return obj as unknown as RawModelOutput;
}

class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParseError";
  }
}

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
