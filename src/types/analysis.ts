// Core analysis response returned from the API and consumed by the frontend
export interface PolicyAnalysis {
  summary: string;
  affectedGroups: string[];
  keyPoints: string[];
  pros: string[];
  cons: string[];
  debateFor: string[];
  debateAgainst: string[];
  lawmakerQuestions: string[];

  // Derived complexity metrics computed server-side from the raw text
  complexity: ComplexityMetrics;

  // Plain-English variants for the reading-level toggle
  readingLevels: ReadingLevels;
}

export interface ComplexityMetrics {
  /** 0–100: estimated legal density based on jargon frequency */
  legalDensity: number;
  /** 0–100: breadth of impact (groups affected × provisions) */
  scope: number;
  /** 0–100: placeholder for future bill-tracking integration; 50 = unknown */
  bipartisanScore: number;
  /** Flesch-Kincaid grade level approximation */
  gradeLevelEstimate: number;
}

export interface ReadingLevels {
  /** The original pasted text, trimmed */
  legalText: string;
  /** Plain English restatement of the summary (~adult general public) */
  plainEnglish: string;
  /** Simplified restatement for grades K-8 */
  simple: string;
}

// Shape returned by the OpenAI structured output (before we attach derived fields)
export interface RawModelOutput {
  summary: string;
  affectedGroups: string[];
  keyPoints: string[];
  pros: string[];
  cons: string[];
  debateFor: string[];
  debateAgainst: string[];
  lawmakerQuestions: string[];
  plainEnglish: string;
  simple: string;
}

// API route — success response
export interface AnalyzeSuccessResponse {
  ok: true;
  data: PolicyAnalysis;
}

// API route — error response
export interface AnalyzeErrorResponse {
  ok: false;
  error: string;
  code: ErrorCode;
}

export type AnalyzeResponse = AnalyzeSuccessResponse | AnalyzeErrorResponse;

export type ErrorCode =
  | "EMPTY_INPUT"
  | "TOO_SHORT"
  | "TOO_LONG"
  | "MODEL_ERROR"
  | "PARSE_ERROR"
  | "RATE_LIMITED"
  | "SERVER_ERROR";
