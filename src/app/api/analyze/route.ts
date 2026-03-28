import { NextRequest, NextResponse } from "next/server";
import { validatePolicyInput } from "@/lib/validate";
import { analyzePolicy } from "@/lib/openai";
import { computeComplexity } from "@/lib/complexity";
import { checkRateLimit, pruneRateLimitStore } from "@/lib/rateLimiter";
import type { AnalyzeResponse, PolicyAnalysis } from "@/types/analysis";

export const runtime = "nodejs";   // Required for OpenAI SDK
export const maxDuration = 60;     // Vercel Pro allows up to 60s; Fine for GPT-4o

export async function POST(req: NextRequest): Promise<NextResponse<AnalyzeResponse>> {
  // --- Rate limiting ---
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  pruneRateLimitStore(); // Opportunistic cleanup — no separate cron needed for MVP

  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: `Too many requests. Please wait ${rateLimit.resetInSeconds} seconds before trying again.`,
        code: "RATE_LIMITED",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.resetInSeconds),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  // --- Parse request body ---
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse("Invalid request body. Expected JSON with a 'text' field.", "EMPTY_INPUT", 400);
  }

  const rawText = (body as Record<string, unknown>)?.text;

  // --- Validate input ---
  const validation = validatePolicyInput(rawText);
  if (!validation.valid) {
    return errorResponse(validation.error!, validation.code!, 400);
  }

  // --- Call OpenAI ---
  let modelOutput;
  try {
    modelOutput = await analyzePolicy(validation.sanitized);
  } catch (err) {
    console.error("[BillBridge] OpenAI error:", err);

    if (err instanceof Error && err.name === "ParseError") {
      return errorResponse(
        "The analysis model returned an unexpected response. Please try again.",
        "PARSE_ERROR",
        502
      );
    }

    return errorResponse(
      "The analysis service is temporarily unavailable. Please try again in a moment.",
      "MODEL_ERROR",
      502
    );
  }

  // --- Assemble final response ---
  const complexity = computeComplexity(validation.sanitized, modelOutput.affectedGroups.length);

  const analysis: PolicyAnalysis = {
    summary:           modelOutput.summary,
    affectedGroups:    modelOutput.affectedGroups,
    keyPoints:         modelOutput.keyPoints,
    pros:              modelOutput.pros,
    cons:              modelOutput.cons,
    debateFor:         modelOutput.debateFor,
    debateAgainst:     modelOutput.debateAgainst,
    lawmakerQuestions: modelOutput.lawmakerQuestions,
    complexity,
    readingLevels: {
      legalText:    validation.sanitized,
      plainEnglish: modelOutput.plainEnglish,
      simple:       modelOutput.simple,
    },
  };

  return NextResponse.json(
    { ok: true, data: analysis },
    {
      status: 200,
      headers: {
        "X-RateLimit-Remaining": String(rateLimit.remaining),
        // Cache-Control: no caching — each submission is user-specific
        "Cache-Control": "no-store",
      },
    }
  );
}

// Only POST is supported
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}

// ---

function errorResponse(
  error: string,
  code: AnalyzeResponse extends { ok: false } ? AnalyzeResponse["code"] : never,
  status: number
): NextResponse<AnalyzeResponse> {
  return NextResponse.json({ ok: false, error, code } as AnalyzeResponse, { status });
}
