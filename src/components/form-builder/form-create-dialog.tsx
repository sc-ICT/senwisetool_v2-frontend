"use client";

import { FolderKanban, Loader2, X } from "lucide-react";
import { useState } from "react";

interface FormCreateDialogProps {
  isPending: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string | null;
    formType: string;
  }) => void;
}

const formTypes = [
  {
    value: "INSPECTION_INITIALE",
    label: "Inspection initiale",
  },
  {
    value: "INSPECTION_INTERNE",
    label: "Inspection interne",
  },
  {
    value: "ENQUETE",
    label: "Enquête",
  },
  {
    value: "AUDIT",
    label: "Audit",
  },
  {
    value: "SUIVI",
    label: "Suivi",
  },
];

export function FormCreateDialog({
  isPending,
  onClose,
  onSubmit,
}: FormCreateDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formType, setFormType] = useState("INSPECTION_INITIALE");

  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);

    const normalizedName = name.trim();

    const normalizedDescription = description.trim();

    if (!normalizedName) {
      setError("Le nom du formulaire est obligatoire.");
      return;
    }

    onSubmit({
      name: normalizedName,
      description: normalizedDescription || null,
      formType,
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
        aria-labelledby="form-create-title"
        style={{
          width: "100%",
          maxWidth: "720px",
          maxHeight: "min(820px, 90vh)",
          display: "flex",
          flexDirection: "column",
          borderRadius: "1rem",
          border: "1px solid var(--color-border)",
          background: "var(--color-surface)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.18)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
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
              id="form-create-title"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.9375rem",
                fontWeight: 700,
                color: "var(--color-foreground)",
              }}
            >
              <FolderKanban size={16} />
              Nouveau formulaire
            </div>

            <div
              style={{
                marginTop: "0.25rem",
                fontSize: "0.75rem",
                color: "var(--color-foreground-muted)",
              }}
            >
              Préparez le cadre général de votre formulaire.
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

        {/* Corps */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            padding: "1.25rem",
          }}
        >
          {error && (
            <div
              style={{
                marginBottom: "1rem",
                padding: "0.75rem 0.875rem",
                borderRadius: "0.625rem",
                border: "1px solid rgba(239, 68, 68, 0.18)",
                background: "rgba(239, 68, 68, 0.08)",
                color: "#DC2626",
                fontSize: "0.75rem",
              }}
            >
              {error}
            </div>
          )}

          <section>
            <SectionTitle>Informations générales</SectionTitle>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <Field label="Nom" required>
                <input
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                  }}
                  maxLength={255}
                  disabled={isPending}
                  placeholder="Ex. Inspection initiale cacao"
                  style={inputStyle}
                />
              </Field>

              <Field label="Type de formulaire">
                <select
                  value={formType}
                  onChange={(event) => {
                    setFormType(event.target.value);
                  }}
                  disabled={isPending}
                  style={inputStyle}
                >
                  {formTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </Field>

              <div
                style={{
                  gridColumn: "1 / -1",
                }}
              >
                <Field label="Description">
                  <textarea
                    value={description}
                    onChange={(event) => {
                      setDescription(event.target.value);
                    }}
                    rows={3}
                    disabled={isPending}
                    placeholder="Décrivez l'objectif de ce formulaire..."
                    style={{
                      ...inputStyle,
                      height: "auto",
                      minHeight: "84px",
                      padding: "0.75rem 0.875rem",
                      resize: "vertical",
                    }}
                  />
                </Field>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
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
                <FolderKanban size={15} />
                Créer le formulaire
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        marginBottom: "0.75rem",
        fontSize: "0.8125rem",
        fontWeight: 700,
        color: "var(--color-foreground)",
      }}
    >
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

function Field({
  label,
  required = false,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
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

      {hint && (
        <div
          style={{
            marginTop: "0.3rem",
            fontSize: "0.6875rem",
            color: "var(--color-foreground-muted)",
          }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}
