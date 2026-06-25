import { useEffect, useRef } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-markup";

interface HtmlCodeFieldProps {
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
  placeholder?: string;
}

export function HtmlCodeField({ value, onChange, hasError, placeholder }: HtmlCodeFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (preRef.current) {
      const highlighted = Prism.highlight(value || "", Prism.languages.markup, "markup");
      preRef.current.innerHTML = highlighted + "\n";
    }
  }, [value]);

  const syncScroll = () => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  return (
    <div
      className={`relative h-72 w-full overflow-hidden border bg-[#1f2d3d] ${
        hasError ? "border-[var(--color-err)]" : "border-[var(--color-line)]"
      }`}
    >
      <pre
        ref={preRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 m-0 overflow-auto whitespace-pre-wrap break-words p-3 font-mono text-[13px] leading-[1.6] text-[#d7dde4]"
      />
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onScroll={syncScroll}
        placeholder={placeholder}
        spellCheck={false}
        className="absolute inset-0 h-full w-full resize-none overflow-auto whitespace-pre-wrap break-words bg-transparent p-3 font-mono text-[13px] leading-[1.6] text-transparent caret-white outline-none placeholder:text-[#5b6b7a]"
      />
    </div>
  );
}
