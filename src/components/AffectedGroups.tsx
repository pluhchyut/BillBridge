"use client";

interface Props {
  groups: string[];
}

const ICONS = ["🎓", "🏛️", "🏫", "🏥", "👪", "💼", "🚜", "🏘️", "🏦", "⚖️"];

export function AffectedGroups({ groups }: Props) {
  return (
    <div className="rounded-xl border border-civic/15 bg-frost p-5 md:p-6">
      <div className="border-b border-navy/10 pb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7A8D]">
          Who&rsquo;s affected
        </p>
        <h3 className="mt-2 font-serif text-2xl font-bold text-navy">
          Stakeholders to watch
        </h3>
      </div>

      <ul className="mt-5 space-y-3">
        {groups.map((group, index) => (
          <li
            key={`${group}-${index}`}
            className={[
              "flex items-center gap-4 rounded-xl border px-4 py-4",
              index % 2 === 0
                ? "border-civic/10 bg-white"
                : "border-white bg-white/70",
            ].join(" ")}
          >
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-white text-lg">
              {ICONS[index % ICONS.length]}
            </span>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7A8D]">
                Stakeholder {String(index + 1).padStart(2, "0")}
              </p>
              <p className="mt-1 text-sm font-medium text-navy">{group}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
