"use client";

import { Copy, Loader2, X } from "lucide-react";
import { useState } from "react";

interface QuestionDuplicateDialogProps {
  question: {
    id: number;
    code: string;
    name: string;
    description: string | null;
  };
  isPending: boolean;
  onClose: () => void;
  onSubmit: (data: {
    code: string;
    name: string;
    description: string | null;
  }) => void;
}

export function QuestionDuplicateDialog({
  question,
  isPending,
  onClose,
  onSubmit,
}: QuestionDuplicateDialogProps) {
  const [code, setCode] = useState(`${question.code}_COPY`);

  const [name, setName] = useState(`${question.name} (copie)`);

  const [description, setDescription] = useState(question.description ?? "");

  const handleSubmit = () => {
    const normalizedCode = code.trim().toUpperCase();

    const normalizedName = name.trim();

    if (!normalizedCode || !normalizedName) {
      return;
    }

    onSubmit({
      code: normalizedCode,
      name: normalizedName,
      description: description.trim() ? description.trim() : null,
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 140,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        background: "rgba(0, 0, 0, 0.35)",
        backdropFilter: "blur(4px)",
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPending) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="duplicate-question-title"
        style={{
          width: "100%",
          maxWidth: "460px",
          borderRadius: "1rem",
          border: "1px solid var(--color-border)",
          background: "var(--color-surface)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.18)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1rem 1.125rem",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div>
            <div
              id="duplicate-question-title"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.9375rem",
                fontWeight: 700,
                color: "var(--color-foreground)",
              }}
            >
              <Copy size={16} />
              Dupliquer la question
            </div>

            <div
              style={{
                marginTop: "0.25rem",
                fontSize: "0.75rem",
                color: "var(--color-foreground-muted)",
              }}
            >
              Une nouvelle question indépendante sera créée.
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            aria-label="Fermer"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "0.5rem",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface-raised)",
              color: "var(--color-foreground-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: isPending ? "not-allowed" : "pointer",
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div
          style={{
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.875rem",
          }}
        >
          <Field label="Nouveau code" required>
            <input
              value={code}
              onChange={(event) => {
                setCode(event.target.value.toUpperCase());
              }}
              maxLength={100}
              disabled={isPending}
              style={inputStyle}
            />
          </Field>

          <Field label="Nouveau nom" required>
            <input
              value={name}
              onChange={(event) => {
                setName(event.target.value);
              }}
              maxLength={255}
              disabled={isPending}
              style={inputStyle}
            />
          </Field>

          <Field label="Description">
            <textarea
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
              }}
              rows={4}
              disabled={isPending}
              style={{
                ...inputStyle,
                height: "auto",
                minHeight: "90px",
                padding: "0.75rem 0.875rem",
                resize: "vertical",
              }}
            />
          </Field>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.625rem",
            padding: "0.875rem 1.125rem",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            style={secondaryButtonStyle}
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !code.trim() || !name.trim()}
            style={{
              ...primaryButtonStyle,
              opacity: isPending || !code.trim() || !name.trim() ? 0.55 : 1,
              cursor:
                isPending || !code.trim() || !name.trim()
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {isPending ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Duplication...
              </>
            ) : (
              <>
                <Copy size={15} />
                Dupliquer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          marginBottom: "0.425rem",
          fontSize: "0.75rem",
          fontWeight: 600,
          color: "var(--color-foreground)",
        }}
      >
        {label}

        {required && (
          <span
            style={{
              marginLeft: "0.2rem",
              color: "#EF4444",
            }}
          >
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  minHeight: "40px",
  padding: "0 0.75rem",
  borderRadius: "0.625rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface-raised)",
  color: "var(--color-foreground)",
  outline: "none",
  fontSize: "0.8125rem",
  boxSizing: "border-box" as const,
};

const secondaryButtonStyle = {
  height: "38px",
  padding: "0 0.875rem",
  borderRadius: "0.625rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface-raised)",
  color: "var(--color-foreground)",
  display: "flex",
  alignItems: "center",
  gap: "0.375rem",
  fontSize: "0.8125rem",
  fontWeight: 600,
  cursor: "pointer",
};

const primaryButtonStyle = {
  height: "38px",
  padding: "0 0.875rem",
  borderRadius: "0.625rem",
  border: "1px solid rgba(93, 184, 58, 0.3)",
  background: "rgba(93, 184, 58, 0.12)",
  color: "#5DB83A",
  display: "flex",
  alignItems: "center",
  gap: "0.375rem",
  fontSize: "0.8125rem",
  fontWeight: 600,
  cursor: "pointer",
};
