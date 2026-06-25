interface VariableChecklistProps {
  variables: string[];
  availableColumns: string[];
}

export function VariableChecklist({ variables, availableColumns }: VariableChecklistProps) {
  if (variables.length === 0) {
    return (
      <p className="font-mono text-xs text-[var(--color-muted)]">
        В шаблоне не найдено переменных вида {"{{name}}"}.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {variables.map((variable) => {
        const resolvable = availableColumns.length === 0 || availableColumns.includes(variable);
        return (
          <span
            key={variable}
            className="inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-xs"
            style={{
              borderColor: resolvable ? "var(--color-line)" : "var(--color-err)",
              color: resolvable ? "var(--color-ink-soft)" : "var(--color-err)",
              backgroundColor: resolvable ? "white" : "var(--color-err-bg)",
            }}
          >
            {`{{${variable}}}`}
            {!resolvable && <span aria-hidden="true"> — нет в файле</span>}
          </span>
        );
      })}
    </div>
  );
}
