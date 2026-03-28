"use client";

import type { PolicyAnalysis } from "@/types/analysis";
import { ReadingLevelToggle } from "./ReadingLevelToggle";
import { AffectedGroups } from "./AffectedGroups";
import { Tradeoffs } from "./Tradeoffs";
import { ComplexityMeter } from "./ComplexityMeter";
import { DebateSection } from "./DebateSection";

interface Props {
  analysis: PolicyAnalysis;
  onReset: () => void;
}

export function AnalysisResult({ analysis, onReset }: Props) {
  return (
    <div className="animate-fadeIn mx-auto max-w-6xl space-y-6 pb-12">
      <div className="sticky top-4 z-20 border-y border-navy/10 bg-cream/95 py-4 backdrop-blur-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gold text-lg text-white">
              ⚖
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7A8D]">
                Public policy reader
              </p>
              <p className="font-serif text-3xl font-bold leading-none text-navy">
                Bill<span className="text-gold">Bridge</span>
              </p>
            </div>
          </div>

          <button
            onClick={onReset}
            className="rounded-lg border border-civic/25 bg-white px-4 py-2 text-xs font-semibold text-civic transition hover:bg-frost focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-civic/15 motion-reduce:transition-none"
          >
            ← Analyze another
          </button>
        </div>
      </div>

      <section className="grid gap-6 border-b border-navy/10 pb-6 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">
            Analysis Complete
          </p>
          <h2 className="font-serif text-4xl font-bold leading-tight text-navy md:text-5xl">
            Policy Summary
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-[#6B7A8D]">
            A structured civic briefing generated from the pasted document. Use it to
            orient yourself quickly, then return to the primary text for formal details.
          </p>
        </div>

        <aside className="rounded-xl border border-civic/15 bg-white p-5 lg:col-span-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7A8D]">
            Reading posture
          </p>
          <div className="mt-4 border-l-4 border-gold pl-4">
            <p className="font-serif text-xl font-bold leading-snug text-navy">
              Start with the overview, then compare the plain-English and legal-text
              views side by side.
            </p>
          </div>
        </aside>
      </section>

      <div className="grid gap-6 lg:grid-cols-12">
        <section className="rounded-xl border border-civic/15 bg-white p-5 md:p-6 lg:col-span-7">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7A8D]">
            Overview
          </p>
          <div className="mt-5 border-l-4 border-civic pl-5">
            <EditorialParagraph text={analysis.summary} />
          </div>
        </section>

        <div className="lg:col-span-5">
          <ReadingLevelToggle levels={analysis.readingLevels} />
        </div>
      </div>

      <section className="rounded-xl border border-civic/15 bg-white p-5 md:p-6">
        <div className="flex flex-col gap-2 border-b border-navy/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7A8D]">
              Key provisions
            </p>
            <h3 className="mt-2 font-serif text-2xl font-bold text-navy">
              What the document actually does
            </h3>
          </div>
          <p className="text-xs text-[#6B7A8D]">Ordered from the biggest operative ideas</p>
        </div>

        <ol className="mt-5 grid gap-4 md:grid-cols-2">
          {analysis.keyPoints.map((point, index) => (
            <li
              key={`${point}-${index}`}
              className="rounded-xl border border-civic/10 bg-frost/70 p-4"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-civic text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <p className="pt-1 text-sm leading-relaxed text-slate">{point}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <AffectedGroups groups={analysis.affectedGroups} />
        <ComplexityMeter metrics={analysis.complexity} />
      </div>

      <Tradeoffs pros={analysis.pros} cons={analysis.cons} />

      <DebateSection
        debateFor={analysis.debateFor}
        debateAgainst={analysis.debateAgainst}
        lawmakerQuestions={analysis.lawmakerQuestions}
      />

      <p className="text-center text-xs text-[#6B7A8D]">
        BillBridge is for educational use only and does not replace primary sources or
        professional legal advice.
      </p>
    </div>
  );
}

function EditorialParagraph({ text }: { text: string }) {
  const trimmed = text.trim();
  const firstCharacter = trimmed.charAt(0);
  const remainingText = trimmed.slice(1);

  return (
    <p className="font-serif text-base leading-8 text-slate">
      <span className="float-left mr-3 font-serif text-5xl font-bold leading-none text-gold md:text-6xl">
        {firstCharacter}
      </span>
      {remainingText}
    </p>
  );
}
