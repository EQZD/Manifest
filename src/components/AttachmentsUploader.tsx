import React, { useRef } from "react";

interface AttachmentsUploaderProps {
  files: File[];
  onFilesChanged: (files: File[]) => void;
}

export function AttachmentsUploader({ files, onFilesChanged }: AttachmentsUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      onFilesChanged([...files, ...newFiles]);
    }
    // Reset input so the same file can be selected again if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = (indexToRemove: number) => {
    const updated = files.filter((_, idx) => idx !== indexToRemove);
    onFilesChanged(updated);
  };

  return (
    <div className="mt-4">
      <p className="field-label mb-1.5">Вложения (необязательно)</p>
      
      <div className="flex flex-col gap-3">
        {files.length > 0 && (
          <ul className="divide-y divide-[var(--color-line)] rounded-md border border-[var(--color-line)] bg-white">
            {files.map((file, idx) => (
              <li key={idx} className="flex items-center justify-between p-3 text-sm">
                <div className="flex items-center gap-2 overflow-hidden">
                  <svg className="h-5 w-5 flex-shrink-0 text-[var(--color-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span className="truncate font-medium text-[var(--color-ink)]">{file.name}</span>
                  <span className="text-xs text-[var(--color-muted)]">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="ml-4 flex-shrink-0 text-[var(--color-err)] hover:text-red-700"
                  title="Удалить"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
        
        <div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded border border-dashed border-[var(--color-line)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-ink)] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] focus:ring-offset-1"
          >
            + Добавить файл
          </button>
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
