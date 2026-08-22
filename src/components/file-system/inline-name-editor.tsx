"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface InlineNameEditorProps {
  value: string;
  disabled?: boolean;
  saving?: boolean;
  onSave: (value: string) => void;
  onCancel: () => void;
}

export function InlineNameEditor({
  value,
  disabled = false,
  saving = false,
  onSave,
  onCancel,
}: InlineNameEditorProps) {
  const [draft, setDraft] = useState(value);

  const inputRef = useRef<HTMLInputElement>(null);

  const initialValueRef = useRef(value);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const commit = () => {
    const nextValue = draft.trim();

    if (!nextValue) {
      onCancel();
      return;
    }

    if (nextValue === initialValueRef.current) {
      onCancel();
      return;
    }

    onSave(nextValue);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        width: "100%",
        minWidth: 0,
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={draft}
        disabled={disabled || saving}
        maxLength={255}
        onChange={(event) => {
          setDraft(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit();
          }

          if (event.key === "Escape") {
            event.preventDefault();
            onCancel();
          }
        }}
        onBlur={() => {
          commit();
        }}
        style={{
          flex: 1,
          minWidth: 0,
          height: "32px",
          padding: "0 0.5rem",
          borderRadius: "0.375rem",
          border: "1px solid rgba(93, 184, 58, 0.45)",
          outline: "none",
          background: "var(--color-surface-raised)",
          color: "var(--color-foreground)",
          fontSize: "0.875rem",
          fontWeight: 600,
          boxSizing: "border-box",
          opacity: saving ? 0.65 : 1,
        }}
      />

      {saving && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.375rem",
            flexShrink: 0,
            color: "var(--color-foreground-muted)",
            fontSize: "0.6875rem",
            whiteSpace: "nowrap",
          }}
        >
          <Loader2 size={14} className="animate-spin" />
          Enregistrement...
        </div>
      )}
    </div>
  );
}
