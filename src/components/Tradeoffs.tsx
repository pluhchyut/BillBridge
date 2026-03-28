"use client";

interface Props {
  pros: string[];
  cons: string[];
}

export function Tradeoffs({ pros, cons }: Props) {
  return (
    <div className="rounded-xl border border-civic/15 bg-white p-5 md:p-6">
      <div className="border-b border-navy/10 pb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7A8D]">
          Key tradeoffs
        </p>
        <h3 className="mt-2 font-serif text-2xl font-bold text-navy">
          What supporters gain, and what critics worry about
        </h3>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <section className="rounded-xl border border-[#4A7C6B]/15 bg-[#4A7C6B]/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#4A7C6B]">
            Potential upsides
          </p>
          <ul className="mt-4 space-y-4">
            {pros.map((point, index) => (
              <li key={`pro-${index}`} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#4A7C6B] text-xs font-bold text-white">
                  +
                </span>
                <p className="text-sm leading-relaxed text-slate">{point}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-[#B84040]/15 bg-[#B84040]/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#B84040]">
            Potential tensions
          </p>
          <ul className="mt-4 space-y-4">
            {cons.map((point, index) => (
              <li key={`con-${index}`} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#B84040] text-xs font-bold text-white">
                  −
                </span>
                <p className="text-sm leading-relaxed text-slate">{point}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
