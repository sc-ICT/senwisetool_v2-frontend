"use client";

import { FolderPlus, Loader2, X } from "lucide-react";
import { useState } from "react";

interface FormSectionCreateDialogProps {
  isPending: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string | null;
    config: Record<string, unknown>;
  }) => void;
}

export function FormSectionCreateDialog({
  isPending,
  onClose,
  onSubmit,
}: FormSectionCreateDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const submit = () => {
    const normalizedName = name.trim();

    if (!normalizedName) {
      return;
    }

    onSubmit({
      name: normalizedName,
      description: description.trim() || null,
      config: {},
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 150,
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
        aria-labelledby="form-section-create-title"
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
              id="form-section-create-title"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.9375rem",
                fontWeight: 700,
                color: "var(--color-foreground)",
              }}
            >
              <FolderPlus size={16} />
              Nouvelle section
            </div>

            <div
              style={{
                marginTop: "0.25rem",
                fontSize: "0.75rem",
                color: "var(--color-foreground-muted)",
              }}
            >
              Structurez votre formulaire par étapes ou thèmes.
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            aria-label="Fermer"
            style={closeButtonStyle}
          >
            <X size={16} />
          </button>
        </div>

        <div
          style={{
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <Field label="Nom" required>
            <input
              value={name}
              onChange={(event) => {
                setName(event.target.value);
              }}
              autoFocus
              maxLength={255}
              disabled={isPending}
              placeholder="Ex. Informations du planteur"
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
              placeholder="Description facultative..."
              style={{
                ...inputStyle,
                height: "auto",
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
            onClick={submit}
            disabled={isPending || !name.trim()}
            style={{
              ...primaryButtonStyle,
              opacity: isPending || !name.trim() ? 0.55 : 1,
              cursor: isPending || !name.trim() ? "not-allowed" : "pointer",
            }}
          >
            {isPending ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Création...
              </>
            ) : (
              <>
                <FolderPlus size={15} />
                Créer la section
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

const closeButtonStyle = {
  width: "32px",
  height: "32px",
  borderRadius: "0.5rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface-raised)",
  color: "var(--color-foreground-muted)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
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
