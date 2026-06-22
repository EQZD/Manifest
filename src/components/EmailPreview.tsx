import { useMemo } from "react";
import type { ParsedContact } from "../types/campaign";

interface EmailPreviewProps {
  html: string;
  subject: string;
  sampleContact: ParsedContact | null;
}

function applySampleData(html: string, contact: ParsedContact | null): string {
  if (!contact) return html;
  return html.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key: string) => {
    const value = contact[key.toLowerCase()];
    return value !== undefined && value !== "" ? value : match;
  });
}

export function EmailPreview({ html, subject, sampleContact }: EmailPreviewProps) {
  const resolvedHtml = useMemo(() => applySampleData(html, sampleContact), [html, sampleContact]);

  if (!html.trim()) {
    return (
      <p className="border border-dashed border-[var(--color-line-strong)] bg-white px-4 py-6 text-center text-sm text-[var(--color-muted)]">
        Вставьте HTML шаблона, чтобы увидеть предпросмотр
      </p>
    );
  }

  return (
    <div className="border border-[var(--color-line)] bg-white">
      <div className="flex items-center gap-2 border-b border-[var(--color-line)] bg-[var(--color-paper-dim)] px-3 py-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-muted)]">
          Тема:
        </span>
        <span className="truncate text-sm font-medium text-[var(--color-ink)]">
          {subject || "(без темы)"}
        </span>
      </div>
      <iframe
        title="Предпросмотр письма"
        srcDoc={resolvedHtml}
        sandbox=""
        className="h-80 w-full bg-white"
      />
      {sampleContact && (
        <p className="border-t border-[var(--color-line)] px-3 py-2 font-mono text-[11px] text-[var(--color-muted)]">
          Показан пример с данными: {sampleContact.email}
        </p>
      )}
    </div>
  );
}
