import type { ReactNode } from "react";

interface SectionFrameProps {
  index: string;
  title: string;
  description?: string;
  children: ReactNode;
  id?: string;
}

export function SectionFrame({ index, title, description, children, id }: SectionFrameProps) {
  return (
    <section id={id} className="border-b border-[var(--color-line)] py-8 first:pt-0 last:border-b-0">
      <div className="mb-5 flex items-baseline gap-3">
        <span className="font-mono text-xs text-[var(--color-stamp)]">{index}</span>
        <h2 className="font-[var(--font-display)] text-base font-bold tracking-tight text-[var(--color-ink)]">
          {title}
        </h2>
      </div>
      {description && (
        <p className="mb-5 -mt-2 max-w-2xl text-sm text-[var(--color-muted)]">{description}</p>
      )}
      {children}
    </section>
  );
}
