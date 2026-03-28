"use client";

import { useState } from "react";

interface Props {
  debateFor: string[];
  debateAgainst: string[];
  lawmakerQuestions: string[];
}

type TabKey = "for" | "against" | "questions";

const TABS: { key: TabKey; label: string; caption: string }[] = [
  { key: "for", label: "Arguments For", caption: "Supporters emphasize these points" },
  {
    key: "against",
    label: "Arguments Against",
    caption: "Critics and skeptics tend to emphasize these concerns",
  },
  {
    key: "questions",
    label: "Lawmaker Questions",
    caption: "Questions that deserve a closer legislative read",
  },
];

export function DebateSection({ debateFor, debateAgainst, lawmakerQuestions }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("for");

  const contentByTab: Record<TabKey, string[]> = {
    for: debateFor,
    against: debateAgainst,
    questions: lawmakerQuestions,
  };

  const activeDescriptor = TABS.find((tab) => tab.key === activeTab) ?? TABS[0];

  return (
    <div className="rounded-xl border border-civic/15 bg-white p-5 md:p-6">
      <div className="border-b border-navy/10 pb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7A8D]">
          Debate map
        </p>
        <h3 className="mt-2 font-serif text-2xl font-bold text-navy">
          How the argument tends to break down
        </h3>
      </div>

      <div
        className="mt-4 flex flex-wrap gap-4 border-b border-civic/10"
        role="tablist"
        aria-label="Debate tabs"
      >
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={activeTab === key}
            onClick={() => setActiveTab(key)}
            className={[
              "rounded-t-lg border-b-2 border-transparent px-1 pb-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-civic/15 motion-reduce:transition-none",
              activeTab === key
                ? "border-civic text-civic"
                : "text-[#6B7A8D] hover:bg-frost hover:text-slate",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-civic/10 bg-frost p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7A8D]">
          {activeDescriptor.caption}
        </p>

        <ul
          key={activeTab}
          className="animate-fadeIn mt-4 space-y-3 rounded-r-xl border-l-4 border-civic bg-white px-4 py-4 transition-opacity duration-150 motion-reduce:transition-none"
          role="tabpanel"
        >
          {contentByTab[activeTab].map((item, index) => (
            <li key={`${activeTab}-${index}`} className="flex items-start gap-3">
              <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-civic" aria-hidden />
              <p className="text-sm leading-relaxed text-slate">{item}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
