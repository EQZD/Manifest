interface ManifestSection {
  index: string;
  label: string;
  complete: boolean;
}

interface ManifestRailProps {
  sections: ManifestSection[];
  activeIndex: string;
}

export function ManifestRail({ sections, activeIndex }: ManifestRailProps) {
  return (
    <nav className="hidden flex-col gap-0 lg:flex" aria-label="Разделы манифеста">
      {sections.map((section) => {
        const isActive = section.index === activeIndex;
        return (
          <a
            key={section.index}
            href={`#section-${section.index}`}
            className="group flex items-start gap-3 border-l-2 py-3 pl-4 transition-colors"
            style={{
              borderColor: isActive ? "var(--color-stamp)" : "var(--color-line)",
            }}
          >
            <span
              className="font-mono text-xs tabular-nums"
              style={{
                color: section.complete ? "var(--color-ok)" : "var(--color-muted)",
              }}
            >
              {section.complete ? "✓" : section.index}
            </span>
            <span
              className="text-sm leading-tight"
              style={{
                color: isActive ? "var(--color-ink)" : "var(--color-ink-soft)",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {section.label}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
