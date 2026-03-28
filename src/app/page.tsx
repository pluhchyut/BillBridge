"use client";

import { useState } from "react";
import { useAnalyze } from "@/hooks/useAnalyze";
import { AnalysisResult } from "@/components/AnalysisResult";
import { INPUT_LIMITS } from "@/lib/validate";

const PLACEHOLDER = `Paste the full text of a bill, school policy, local ordinance, or public proposal here.

Example: a school attendance policy, a local zoning ordinance, or a state bill on healthcare.`;

const FEATURE_CHIPS = [
  "Plain-English summary",
  "Who's affected",
  "Tradeoffs",
  "Debate arguments",
  "Lawmaker questions",
  "Complexity meter",
] as const;

const HOW_IT_WORKS = [
  {
    number: "01",
    title: "Paste",
    description: "Paste any bill, policy, or proposal",
  },
  {
    number: "02",
    title: "Analyze",
    description: "Our model reads and structures the full text",
  },
  {
    number: "03",
    title: "Understand",
    description: "Get plain-English analysis in seconds",
  },
] as const;

const BRIEFING_NOTES = [
  "Full bill text in, structured civic briefing out.",
  "Built for students, journalists, and everyday voters.",
  "Educational use only. Never legal advice.",
] as const;

const FORM_NOTES = [
  "Paste the full language, not just a headline or summary.",
  "Longer excerpts usually produce better tradeoff and debate sections.",
  "BillBridge does not store a database record or create an account in v1.",
] as const;

export default function HomePage() {
  const [text, setText] = useState("");
  const { data, loading, error, analyze, reset } = useAnalyze();

  const charCount = text.trim().length;
  const isTooShort = charCount < INPUT_LIMITS.MIN_CHARS;
  const isTooLong = charCount > INPUT_LIMITS.MAX_CHARS;
  const isDisabled = loading || isTooShort || isTooLong;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    analyze(text);
  }

  function handleReset() {
    setText("");
    reset();
  }

  if (data) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-cream text-slate">
        <BackgroundWash />
        <PaperLines />
        <div className="relative mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
          <AnalysisResult analysis={data} onReset={handleReset} />
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-cream text-slate">
      <BackgroundWash />
      <PaperLines />

      <div className="relative mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <LandingNav />

        <section className="grid gap-8 border-b border-navy/10 pb-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-gold">
              Civic-tech policy translator
            </p>
            <h1 className="mt-5 max-w-4xl font-serif text-5xl font-bold leading-none text-navy md:text-6xl">
              Understand Any Policy.
              <br />
              <span className="text-civic">In Plain English.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#6B7A8D] md:text-base">
              BillBridge reads dense legislation like a public-interest editor: it
              extracts the core idea, flags who is affected, and organizes the debate
              into a civic briefing you can actually use.
            </p>
          </div>

          <aside className="rounded-xl border border-civic/15 bg-white p-5 lg:col-span-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7A8D]">
              BillBridge Brief
            </p>
            <div className="mt-4 border-l-4 border-gold pl-4">
              <p className="font-serif text-xl font-bold leading-snug text-navy">
                A calmer interface for reading complicated public policy.
              </p>
            </div>
            <ul className="mt-5 space-y-3">
              {BRIEFING_NOTES.map((note) => (
                <li key={note} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-civic" />
                  <span className="text-sm leading-relaxed text-slate">{note}</span>
                </li>
              ))}
            </ul>
          </aside>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="rounded-xl border border-civic/15 bg-white p-5 md:p-6">
              <div className="flex flex-col gap-3 border-b border-navy/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7A8D]">
                    Policy Intake
                  </p>
                  <h2 className="mt-2 font-serif text-2xl font-bold text-navy">
                    Paste the full document
                  </h2>
                </div>
                <span className="rounded-full border border-civic/20 bg-frost px-3 py-1 text-xs font-medium text-slate">
                  Up to {INPUT_LIMITS.MAX_CHARS.toLocaleString()} characters
                </span>
              </div>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4" aria-busy={loading}>
                <div>
                  <label
                    htmlFor="policy-input"
                    className="mb-3 block text-xs font-semibold uppercase tracking-widest text-[#6B7A8D]"
                  >
                    Paste policy text
                  </label>

                  <textarea
                    id="policy-input"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={PLACEHOLDER}
                    rows={18}
                    spellCheck={false}
                    disabled={loading}
                    className={[
                      "w-full resize-none rounded-lg border bg-[#FAFAF8] px-5 py-5 font-serif text-sm leading-7 text-slate outline-none transition focus:border-civic focus:ring-2 focus:ring-civic/15 disabled:cursor-not-allowed disabled:bg-[#FAFAF8]",
                      isTooLong ? "border-[#B84040]" : "border-mist",
                    ].join(" ")}
                  />

                  <div className="mt-3 flex flex-col gap-2 border-t border-navy/10 pt-3 text-xs sm:flex-row sm:items-center sm:justify-between">
                    <span
                      className={[
                        "text-xs",
                        isTooLong ? "font-medium text-[#B84040]" : "text-[#6B7A8D]",
                      ].join(" ")}
                    >
                      {charCount.toLocaleString()} / {INPUT_LIMITS.MAX_CHARS.toLocaleString()} characters
                    </span>

                    <span
                      className={[
                        "text-xs",
                        isTooLong
                          ? "text-[#B84040]"
                          : isTooShort
                            ? "text-gold"
                            : "text-[#6B7A8D]",
                      ].join(" ")}
                    >
                      {isTooLong
                        ? "Trim the text to stay within the analysis limit."
                        : isTooShort
                          ? `Minimum ${INPUT_LIMITS.MIN_CHARS} characters of policy text`
                          : "Ready to analyze"}
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg border border-[#B84040]/20 bg-cream px-4 py-3 text-sm leading-relaxed text-[#B84040]">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isDisabled}
                  className={[
                    "w-full rounded-lg px-4 py-3 text-sm font-semibold text-white transition motion-reduce:transition-none",
                    isDisabled
                      ? "cursor-not-allowed bg-[#C8DDEF] text-[#6B7A8D]"
                      : "bg-navy hover:bg-slate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-civic/15",
                  ].join(" ")}
                >
                  {loading ? "Analyzing policy…" : "Analyze Policy →"}
                </button>
              </form>
            </div>
          </div>

          <aside className="space-y-4 lg:col-span-4">
            <div className="rounded-xl border border-civic/15 bg-frost p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7A8D]">
                What works best
              </p>
              <ul className="mt-4 space-y-4">
                {FORM_NOTES.map((note, index) => (
                  <li key={note} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-civic/20 bg-white text-xs font-semibold text-civic">
                      {index + 1}
                    </span>
                    <span className="text-sm leading-relaxed text-slate">{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-civic/15 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7A8D]">
                What you&rsquo;ll get
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {FEATURE_CHIPS.map((feature) => (
                  <span
                    key={feature}
                    className="rounded-full border border-civic/20 bg-frost px-3 py-2 text-xs font-medium text-slate"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </section>

        {loading && <LoadingPreview />}

        <section className="mt-10 border-t border-navy/10 pt-6">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7A8D]">
              How it works
            </p>
            <p className="hidden text-xs text-[#6B7A8D] md:block">
              Structured in three editorial steps
            </p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {HOW_IT_WORKS.map(({ number, title, description }) => (
              <article
                key={title}
                className="rounded-xl border border-civic/15 bg-white p-5 transition hover:bg-frost motion-reduce:transition-none"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-gold">
                  {number}
                </p>
                <h2 className="mt-4 font-serif text-2xl font-bold text-navy">{title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="mt-12 border-t border-navy/10 pt-6 text-center text-xs text-[#6B7A8D]">
          © 2025 BillBridge · For educational use only · Not legal advice
        </footer>
      </div>
    </main>
  );
}

function LandingNav() {
  return (
    <header className="mb-8 border-y border-navy/10 py-4">
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

        <p className="text-xs text-[#6B7A8D]">Educational use only — not legal advice</p>
      </div>
    </header>
  );
}

function LoadingPreview() {
  return (
    <section className="mt-8 animate-fadeIn space-y-4" aria-live="polite" aria-label="Loading">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7A8D]">
          Preparing your analysis
        </p>
        <div className="h-px flex-1 bg-navy/10" />
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <article className="rounded-xl border border-civic/15 bg-white p-6 lg:col-span-8">
          <div className="space-y-4">
            <PlaceholderBlock className="h-3 w-32" />
            <PlaceholderBlock className="h-5 w-3/4 rounded-lg" />
            <PlaceholderBlock className="h-4 w-full rounded-lg" />
            <PlaceholderBlock className="h-4 w-5/6 rounded-lg" />
            <PlaceholderBlock className="h-4 w-4/5 rounded-lg" />
          </div>
        </article>

        <article className="rounded-xl border border-civic/15 bg-frost p-5 lg:col-span-4">
          <div className="space-y-4">
            <PlaceholderBlock className="h-3 w-24" />
            <PlaceholderBlock className="h-10 w-full rounded-lg" />
            <PlaceholderBlock className="h-10 w-full rounded-lg" />
            <PlaceholderBlock className="h-10 w-5/6 rounded-lg" />
          </div>
        </article>

        <article className="rounded-xl border border-civic/15 bg-white p-5 lg:col-span-6">
          <div className="space-y-3">
            <div className="flex gap-2">
              <PlaceholderBlock className="h-8 w-24 rounded-full" />
              <PlaceholderBlock className="h-8 w-28 rounded-full" />
              <PlaceholderBlock className="h-8 w-24 rounded-full" />
            </div>
            <PlaceholderBlock className="h-4 w-full rounded-lg" />
            <PlaceholderBlock className="h-4 w-11/12 rounded-lg" />
            <PlaceholderBlock className="h-4 w-3/4 rounded-lg" />
          </div>
        </article>

        <article className="rounded-xl border border-civic/15 bg-white p-5 lg:col-span-6">
          <div className="space-y-4">
            <PlaceholderBlock className="h-3 w-24" />
            <PlaceholderBlock className="h-2 w-full rounded-full" />
            <PlaceholderBlock className="h-2 w-5/6 rounded-full" />
            <PlaceholderBlock className="h-2 w-2/3 rounded-full" />
            <PlaceholderBlock className="h-3 w-40" />
          </div>
        </article>
      </div>
    </section>
  );
}

function PlaceholderBlock({ className }: { className: string }) {
  return (
    <div
      className={[
        "bg-mist/80 motion-safe:animate-pulse motion-reduce:animate-none",
        className,
      ].join(" ")}
    />
  );
}

function BackgroundWash() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-frost opacity-80 blur-3xl" />
      <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-mist opacity-40 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-frost opacity-60 blur-3xl" />
    </div>
  );
}

function PaperLines() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40">
      <div className="absolute left-0 top-24 h-px w-full bg-navy/10" />
      <div className="absolute left-0 top-1/2 h-px w-full bg-navy/5" />
    </div>
  );
}
