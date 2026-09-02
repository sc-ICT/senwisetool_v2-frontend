"use client";

import { FolderKanban, Loader2, X } from "lucide-react";
import { useState } from "react";

interface ProjectCreateDialogProps {
  isPending: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string | null;
    projectType: string;
  }) => void;
}

const projectTypes = [
  {
    value: "SURVEY",
    label: "Enquête",
  },
  {
    value: "INSPECTION",
    label: "Inspection",
  },
  {
    value: "AUDIT",
    label: "Audit",
  },
  {
    value: "MONITORING",
    label: "Suivi",
  },
];

export function ProjectCreateDialog({
  isPending,
  onClose,
  onSubmit,
}: ProjectCreateDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [projectType, setProjectType] = useState("SURVEY");

  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);

    const normalizedName = name.trim();
    const normalizedDescription = description.trim();

    if (!normalizedName) {
      setError("Le nom du projet est obligatoire.");
      return;
    }

    onSubmit({
      name: normalizedName,
      description: normalizedDescription || null,
      projectType,
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
        aria-labelledby="project-create-title"
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
              id="project-create-title"
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
              Nouveau projet
            </div>

            <div
              style={{
                marginTop: "0.25rem",
                fontSize: "0.75rem",
                color: "var(--color-foreground-muted)",
              }}
            >
              Créez le cadre général de votre projet de collecte.
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
            <div
              style={{
                marginBottom: "0.75rem",
                fontSize: "0.8125rem",
                fontWeight: 700,
                color: "var(--color-foreground)",
              }}
            >
              Informations générales
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div>
                <label style={labelStyle}>
                  Nom
                  <span
                    style={{
                      color: "#DC2626",
                    }}
                  >
                    {" "}
                    *
                  </span>
                </label>

                <input
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                  }}
                  maxLength={255}
                  disabled={isPending}
                  placeholder="Ex. Suivi des plantations cacao"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Type de projet</label>

                <select
                  value={projectType}
                  onChange={(event) => {
                    setProjectType(event.target.value);
                  }}
                  disabled={isPending}
                  style={inputStyle}
                >
                  {projectTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  gridColumn: "1 / -1",
                }}
              >
                <label style={labelStyle}>Description</label>

                <textarea
                  value={description}
                  onChange={(event) => {
                    setDescription(event.target.value);
                  }}
                  rows={4}
                  disabled={isPending}
                  placeholder="Décrivez l'objectif général du projet..."
                  style={{
                    ...inputStyle,
                    height: "auto",
                    minHeight: "100px",
                    padding: "0.75rem 0.875rem",
                    resize: "vertical",
                  }}
                />
              </div>
            </div>
          </section>
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
                <FolderKanban size={15} />
                Créer le projet
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: "0.375rem",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "var(--color-foreground)",
};

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
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "0.5rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface-raised)",
  color: "var(--color-foreground-muted)",
  cursor: "pointer",
};

const secondaryButtonStyle = {
  height: "36px",
  padding: "0 0.875rem",
  borderRadius: "0.625rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface-raised)",
  color: "var(--color-foreground)",
  fontSize: "0.8125rem",
  fontWeight: 600,
  cursor: "pointer",
};

const primaryButtonStyle = {
  height: "36px",
  padding: "0 0.875rem",
  borderRadius: "0.625rem",
  border: "1px solid rgba(93, 184, 58, 0.25)",
  background: "rgba(93, 184, 58, 0.1)",
  color: "#5DB83A",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  fontSize: "0.8125rem",
  fontWeight: 600,
  cursor: "pointer",
};
