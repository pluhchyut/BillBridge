"use client";

import { useState } from "react";
import type { ReadingLevels } from "@/types/analysis";

type Level = "legalText" | "plainEnglish" | "simple";

interface Props {
  levels: ReadingLevels;
}

const TABS: { key: Level; label: string; note: string }[] = [
  { key: "legalText", label: "Legal Text", note: "Closest to the document" },
  { key: "plainEnglish", label: "Plain English", note: "General public reading level" },
  { key: "simple", label: "Simple (K–8)", note: "Shortest, simplest version" },
];

export function ReadingLevelToggle({ levels }: Props) {
  const [active, setActive] = useState<Level>("plainEnglish");
  const activeTab = TABS.find((tab) => tab.key === active) ?? TABS[1];

  return (
    <div className="rounded-xl border border-civic/15 bg-white p-5 md:p-6">
      <div className="border-b border-navy/10 pb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7A8D]">
          Reading lens
        </p>
        <h3 className="mt-2 font-serif text-2xl font-bold text-navy">Choose a version</h3>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg border border-civic/10 bg-frost p-1">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActive(key)}
            className={[
              "rounded-lg px-3 py-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-civic/15 motion-reduce:transition-none",
              active === key
                ? "bg-navy text-white"
                : "bg-frost text-[#6B7A8D] hover:bg-white hover:text-slate",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-civic/10 bg-frost p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7A8D]">
          {activeTab.note}
        </p>

        <div
          key={active}
          className={[
            "animate-fadeIn mt-3 rounded-r-xl border-l-4 border-civic bg-white px-4 py-4 text-sm leading-relaxed text-slate transition-opacity duration-150 motion-reduce:transition-none",
            active === "legalText" ? "font-serif italic" : "font-sans",
          ].join(" ")}
        >
          {levels[active]}
        </div>
      </div>

      {active === "legalText" && (
        <p className="mt-3 text-xs text-[#6B7A8D]">
          Showing trimmed original text. Not a substitute for the full document.
        </p>
      )}
    </div>
  );
}
