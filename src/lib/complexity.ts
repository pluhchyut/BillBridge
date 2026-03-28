import type { ComplexityMetrics } from "@/types/analysis";

/**
 * Legal jargon wordlist used for density estimation.
 * Deliberately limited — just enough for a meaningful heuristic.
 */
const LEGAL_TERMS = new Set([
  "notwithstanding","heretofore","hereinafter","pursuant","aforementioned",
  "whereas","thereof","whereby","hereto","therein","hereunder","hereof",
  "indemnify","indemnification","subrogation","enjoin","injunctive",
  "promulgate","adjudicate","jurisdiction","statute","ordinance","regulation",
  "appropriation","appropriations","amendment","codify","enumerate",
  "subsection","subparagraph","thereof","thereto","herewith","forthwith",
  "per annum","ipso facto","inter alia","de facto","bona fide","mens rea",
  "actus reus","tortious","fiduciary","estoppel","lien","covenant","waiver",
]);

/**
 * Computes a rough ComplexityMetrics object from raw policy text.
 *
 * These are intentionally heuristic — they give the UI something meaningful
 * to display without requiring NLP infrastructure in v1.
 */
export function computeComplexity(text: string, affectedGroupCount: number): ComplexityMetrics {
  const words = text.toLowerCase().match(/\b[a-z]+\b/g) ?? [];
  const totalWords = Math.max(words.length, 1);

  // Legal density: % of words that are legal terms, scaled to 0–100
  const legalWordCount = words.filter((w) => LEGAL_TERMS.has(w)).length;
  const legalDensity = Math.min(100, Math.round((legalWordCount / totalWords) * 1000));

  // Scope: combines affected group count and document length as a proxy
  const lengthScore = Math.min(50, Math.round((text.length / 25_000) * 50));
  const groupScore = Math.min(50, affectedGroupCount * 5);
  const scope = Math.min(100, lengthScore + groupScore);

  // Bipartisan score: unknown without external data — surfaced as 50 (neutral)
  const bipartisanScore = 50;

  // Flesch-Kincaid Grade Level approximation
  const sentences = (text.match(/[.!?]+/g) ?? []).length || 1;
  const avgWordsPerSentence = totalWords / sentences;
  // Syllable approximation: count vowel groups
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const avgSyllablesPerWord = syllables / totalWords;
  const gradeLevelEstimate = Math.max(
    1,
    Math.min(18, Math.round(0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59))
  );

  return { legalDensity, scope, bipartisanScore, gradeLevelEstimate };
}

function countSyllables(word: string): number {
  const stripped = word.toLowerCase().replace(/[^a-z]/g, "");
  if (stripped.length <= 3) return 1;
  const matches = stripped.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
                           .replace(/^y/, "")
                           .match(/[aeiouy]{1,2}/g);
  return Math.max(1, matches?.length ?? 1);
}
