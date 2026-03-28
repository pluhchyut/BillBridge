import type { ErrorCode } from "@/types/analysis";

export const INPUT_LIMITS = {
  MIN_CHARS: 80,       // Enough to form a real policy sentence
  MAX_CHARS: 60_000,   // Allows longer bills while staying within practical latency/cost bounds
} as const;

export interface ValidationResult {
  valid: boolean;
  sanitized: string;
  error?: string;
  code?: ErrorCode;
}

/**
 * Validates and sanitizes raw policy text submitted by the user.
 * Returns a sanitized string on success or a structured error on failure.
 */
export function validatePolicyInput(raw: unknown): ValidationResult {
  if (typeof raw !== "string" || raw.trim().length === 0) {
    return {
      valid: false,
      sanitized: "",
      error: "Please paste some policy text before submitting.",
      code: "EMPTY_INPUT",
    };
  }

  const sanitized = raw
    .trim()
    // Collapse runs of 3+ blank lines to a maximum of two (preserve paragraph breaks)
    .replace(/\n{3,}/g, "\n\n")
    // Strip null bytes and other non-printable control characters (keep tabs + newlines)
    .replace(/[^\x09\x0A\x0D\x20-\x7E\x80-\xFF]/g, "");

  if (sanitized.length < INPUT_LIMITS.MIN_CHARS) {
    return {
      valid: false,
      sanitized,
      error: `Please paste at least ${INPUT_LIMITS.MIN_CHARS} characters of policy text so we can produce a meaningful analysis.`,
      code: "TOO_SHORT",
    };
  }

  if (sanitized.length > INPUT_LIMITS.MAX_CHARS) {
    return {
      valid: false,
      sanitized,
      error: `The pasted text is too long (${sanitized.length.toLocaleString()} characters). Please trim it to under ${INPUT_LIMITS.MAX_CHARS.toLocaleString()} characters and try again.`,
      code: "TOO_LONG",
    };
  }

  return { valid: true, sanitized };
}
