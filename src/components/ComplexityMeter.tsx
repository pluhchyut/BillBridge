"use client";

import { useEffect, useState } from "react";
import type { ComplexityMetrics } from "@/types/analysis";

interface Props {
  metrics: ComplexityMetrics;
}

interface MeterRow {
  label: string;
  value: number;
  fillClass: string;
  textClass: string;
  tooltip: string;
}

export function ComplexityMeter({ metrics }: Props) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsVisible(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const rows: MeterRow[] = [
    {
      label: "Legal Density",
      value: metrics.legalDensity,
      fillClass: "bg-civic",
      textClass: "text-civic",
      tooltip: "How much the document relies on formal legal phrasing, jargon, and cross-references.",
    },
    {
      label: "Scope",
      value: metrics.scope,
      fillClass: "bg-gold",
      textClass: "text-gold",
      tooltip: "How broad the policy seems based on its reach, length, and number of affected areas.",
    },
    {
      label: "Bipartisan Support",
      value: metrics.bipartisanScore,
      fillClass: "bg-[#4A7C6B]",
      textClass: "text-[#4A7C6B]",
      tooltip: "A rough estimate of cross-party alignment. It is neutral when clear vote data is unavailable.",
    },
  ];

  return (
    <div className="rounded-xl border border-civic/15 bg-frost p-5 md:p-6">
      <div className="border-b border-navy/10 pb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7A8D]">
          Complexity meter
        </p>
        <h3 className="mt-2 font-serif text-2xl font-bold text-navy">How dense this feels</h3>
        <p className="mt-2 text-xs text-[#6B7A8D]">
          Grade level estimate:{" "}
          <span className="font-semibold text-navy">{metrics.gradeLevelEstimate}</span>
        </p>
      </div>

      <div className="mt-5 space-y-5">
        {rows.map((row) => {
          const width = `${Math.max(0, Math.min(100, row.value))}%`;

          return (
            <div key={row.label} className="rounded-xl border border-white/80 bg-white/70 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <TooltipLabel label={row.label} tooltip={row.tooltip} />
                <span className={["text-sm font-semibold", row.textClass].join(" ")}>
                  {row.value}
                </span>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-[#C8DDEF]">
                <div
                  className={[
                    "h-full rounded-full transition-all duration-700 motion-reduce:transition-none",
                    row.fillClass,
                  ].join(" ")}
                  style={{ width: isVisible ? width : "0%" }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-5 text-xs leading-relaxed text-[#6B7A8D]">
        Scores are estimated heuristics, not official legislative ratings.
      </p>
    </div>
  );
}

function TooltipLabel({ label, tooltip }: { label: string; tooltip: string }) {
  return (
    <div className="group relative">
      <button
        type="button"
        title={tooltip}
        className="inline-flex items-center gap-2 rounded-full text-left text-sm font-medium text-slate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-civic/15"
      >
        <span>{label}</span>
        <span className="flex h-5 w-5 items-center justify-center rounded-full border border-civic/20 bg-white text-xs text-civic">
          ?
        </span>
      </button>

      <div className="pointer-events-none absolute left-0 top-full z-10 mt-2 hidden w-56 rounded-lg border border-civic/15 bg-white p-3 text-xs leading-relaxed text-slate group-hover:block group-focus-within:block">
        {tooltip}
      </div>
    </div>
  );
}
