import { useRef, useState } from "react";
import type { ContactsParseResult } from "../types/campaign";

interface ContactsUploaderProps {
  fileName: string | null;
  parseResult: ContactsParseResult | null;
  isParsing: boolean;
  hasError?: boolean;
  onFileSelected: (file: File) => void;
  onClear: () => void;
}

export function ContactsUploader({
  fileName,
  parseResult,
  isParsing,
  hasError,
  onFileSelected,
  onClear,
}: ContactsUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) {
      onFileSelected(file);
    }
  };

  return (
    <div>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 border px-6 py-8 text-center transition-colors ${
          hasError
            ? "border-[var(--color-err)] bg-[var(--color-err-bg)]"
            : isDragging
              ? "border-[var(--color-ink)] bg-[var(--color-paper-dim)]"
              : "border-dashed border-[var(--color-line-strong)] bg-white hover:bg-[var(--color-paper-dim)]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={(event) => handleFiles(event.target.files)}
        />
        {fileName ? (
          <>
            <p className="text-sm font-medium text-[var(--color-ink)]">{fileName}</p>
            <p className="text-xs text-[var(--color-muted)]">
              {isParsing ? "Разбираем файл…" : "Нажмите, чтобы заменить файл"}
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-[var(--color-ink)]">
              Перетащите .xlsx файл сюда или нажмите для выбора
            </p>
            <p className="text-xs text-[var(--color-muted)]">
              Обязательные колонки: email, name, company
            </p>
          </>
        )}
      </div>

      {fileName && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onClear();
            if (inputRef.current) inputRef.current.value = "";
          }}
          className="mt-2 font-mono text-xs text-[var(--color-muted)] underline hover:text-[var(--color-ink)]"
        >
          убрать файл
        </button>
      )}

      {parseResult && (
        <div className="mt-4 space-y-2 border border-[var(--color-line)] bg-[var(--color-paper-dim)] p-4 text-sm">
          <div className="flex items-center justify-between font-mono text-xs text-[var(--color-muted)]">
            <span>строк прочитано: {parseResult.totalRows}</span>
            <span>контактов готово: {parseResult.contacts.length}</span>
          </div>

          {parseResult.missingFields.length > 0 && (
            <p className="text-[var(--color-err)]">
              Отсутствуют обязательные колонки: {parseResult.missingFields.join(", ")}
            </p>
          )}

          {parseResult.rowErrors.length > 0 && (
            <details className="text-[var(--color-err)]">
              <summary className="cursor-pointer">
                Пропущено строк с ошибками: {parseResult.rowErrors.length}
              </summary>
              <ul className="mt-1 ml-4 list-disc space-y-0.5 text-xs">
                {parseResult.rowErrors.slice(0, 10).map((rowError) => (
                  <li key={rowError.row}>
                    строка {rowError.row}: {rowError.reason}
                  </li>
                ))}
                {parseResult.rowErrors.length > 10 && (
                  <li>и ещё {parseResult.rowErrors.length - 10}…</li>
                )}
              </ul>
            </details>
          )}

          {parseResult.missingFields.length === 0 && parseResult.contacts.length > 0 && (
            <p className="text-[var(--color-ok)]">Файл прошёл проверку.</p>
          )}
        </div>
      )}
    </div>
  );
}
