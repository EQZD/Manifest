import type { DispatchStatus } from "../types/campaign";

interface SummaryRow {
  label: string;
  value: string;
  ok: boolean;
}

interface DispatchSummaryProps {
  rows: SummaryRow[];
  allReady: boolean;
  status: DispatchStatus;
  statusMessage: string | null;
  onLaunch: () => void;
}

export function DispatchSummary({
  rows,
  allReady,
  status,
  statusMessage,
  onLaunch,
}: DispatchSummaryProps) {
  const isSending = status === "sending" || status === "validating";

  return (
    <div className="sticky top-6">
      <div className="border border-[var(--color-ink)] bg-white">
        <div className="flex items-center justify-between border-b border-[var(--color-line)] px-4 py-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-muted)]">
            Сводка отправки
          </span>
          <span
            className="font-mono text-[11px] uppercase tracking-[0.08em]"
            style={{ color: allReady ? "var(--color-ok)" : "var(--color-stamp)" }}
          >
            {allReady ? "готово" : "черновик"}
          </span>
        </div>

        <ul className="px-4 py-3">
          {rows.map((row) => (
            <li
              key={row.label}
              className="flex items-center justify-between gap-3 border-b border-dotted border-[var(--color-line)] py-2 text-sm last:border-b-0"
            >
              <span className="text-[var(--color-ink-soft)]">{row.label}</span>
              <span
                className="flex items-center gap-1.5 font-mono text-xs"
                style={{ color: row.ok ? "var(--color-ok)" : "var(--color-muted)" }}
              >
                <span aria-hidden="true">{row.ok ? "✓" : "—"}</span>
                <span className="max-w-[11rem] truncate text-right">{row.value}</span>
              </span>
            </li>
          ))}
        </ul>

        <div
          className="border-t border-[var(--color-line)] px-4 py-3"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to right, var(--color-line) 0, var(--color-line) 6px, transparent 6px, transparent 12px)",
            backgroundSize: "12px 1px",
            backgroundPosition: "top",
            backgroundRepeat: "repeat-x",
          }}
        >
          <button
            type="button"
            disabled={!allReady || isSending}
            onClick={onLaunch}
            className="w-full border px-4 py-3 font-[var(--font-display)] text-sm font-semibold uppercase tracking-[0.04em] transition-colors disabled:cursor-not-allowed"
            style={
              allReady
                ? {
                    backgroundColor: "var(--color-stamp)",
                    borderColor: "var(--color-stamp-dark)",
                    color: "white",
                  }
                : {
                    backgroundColor: "var(--color-paper-dim)",
                    borderColor: "var(--color-line)",
                    color: "var(--color-muted)",
                  }
            }
          >
            {isSending ? "Отправляем…" : "Запустить рассылку"}
          </button>

          {!allReady && (
            <p className="mt-2 text-center text-xs text-[var(--color-muted)]">
              Заполните все поля манифеста, чтобы открыть отправку
            </p>
          )}

          {statusMessage && (
            <p
              className="mt-2 text-center text-xs"
              style={{
                color: status === "error" ? "var(--color-err)" : "var(--color-ok)",
              }}
            >
              {statusMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
