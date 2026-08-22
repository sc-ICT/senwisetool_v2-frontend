"use client";

import type {
  QuestionDefinitionDetail,
  QuestionType,
} from "@/types/question-bank";
import {
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  Loader2,
  Pencil,
  Plus,
  X,
} from "lucide-react";
import { useState } from "react";

interface QuestionDetailDialogProps {
  question: QuestionDefinitionDetail;
  isLoading?: boolean;
  isSaving?: boolean;
  onClose: () => void;
  onCreateVersion: () => void;
  onSave: (data: { name: string; description: string }) => Promise<void>;
}

function getQuestionTypeLabel(type: QuestionType): string {
  const labels: Record<QuestionType, string> = {
    TEXT: "Texte court",
    LONG_TEXT: "Texte long",
    EMAIL: "E-mail",
    PHONE: "Téléphone",
    URL: "URL",
    ADDRESS: "Adresse",
    INTEGER: "Nombre entier",
    DECIMAL: "Nombre décimal",
    PERCENTAGE: "Pourcentage",
    CURRENCY: "Monnaie",
    SINGLE_CHOICE: "Choix unique",
    MULTIPLE_CHOICE: "Choix multiple",
    DROPDOWN: "Liste déroulante",
    AUTOCOMPLETE: "Recherche",
    RATING: "Évaluation",
    LIKERT_SCALE: "Échelle",
    RANKING: "Classement",
    DATE: "Date",
    TIME: "Heure",
    DATETIME: "Date + heure",
    DURATION: "Durée",
    POINT: "Point GPS",
    LINE: "Ligne",
    POLYGON: "Polygone",
    AREA: "Zone",
    PHOTO: "Photo",
    VIDEO: "Vidéo",
    AUDIO: "Audio",
    FILE: "Fichier",
    SIGNATURE: "Signature",
    QR_CODE: "QR Code",
    BARCODE: "Code-barres",
    ENTITY_SELECT: "Sélection d'entité",
    ENTITY_SEARCH: "Recherche d'entité",
    CALCULATION: "Calcul",
    NOTE: "Note",
    CONSENT: "Consentement",
    HIDDEN: "Champ caché",
  };

  return labels[type];
}

export function QuestionDetailDialog({
  question,
  isLoading = false,
  onClose,
  onSave,
  onCreateVersion,
  isSaving = false,
}: QuestionDetailDialogProps) {
  const [expandedVersionId, setExpandedVersionId] = useState<number | null>(
    question.versions.at(-1)?.id ?? null,
  );

  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState(question.name);

  const [description, setDescription] = useState(question.description ?? "");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 130,
        display: "flex",
        justifyContent: "flex-end",
        background: "rgba(0, 0, 0, 0.28)",
        backdropFilter: "blur(3px)",
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="question-detail-title"
        style={{
          width: "100%",
          maxWidth: "620px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "var(--color-surface)",
          borderLeft: "1px solid var(--color-border)",
          boxShadow: "-16px 0 50px rgba(0, 0, 0, 0.14)",
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
          <div
            style={{
              minWidth: 0,
            }}
          >
            <div
              id="question-detail-title"
              style={{
                fontSize: "0.9375rem",
                fontWeight: 700,
                color: "var(--color-foreground)",
              }}
            >
              Détail de la question
            </div>

            <div
              style={{
                marginTop: "0.25rem",
                fontSize: "0.75rem",
                color: "var(--color-foreground-muted)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {question.name}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            style={{
              width: "32px",
              height: "32px",
              flexShrink: 0,
              borderRadius: "0.5rem",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface-raised)",
              color: "var(--color-foreground-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
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
          {isLoading ? (
            <div
              style={{
                minHeight: "240px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Loader2 size={22} className="animate-spin" color="#5DB83A" />
            </div>
          ) : (
            <>
              {/* Informations */}
              <section>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "var(--color-foreground)",
                    }}
                  >
                    Informations
                  </div>

                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => {
                        setName(question.name);
                        setDescription(question.description ?? "");
                        setIsEditing(true);
                      }}
                      style={{
                        height: "32px",
                        padding: "0 0.625rem",
                        borderRadius: "0.5rem",
                        border: "1px solid var(--color-border)",
                        background: "var(--color-surface-raised)",
                        color: "var(--color-foreground)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.375rem",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <Pencil size={14} />
                      Modifier
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.875rem",
                    }}
                  >
                    <Field
                      label="Code"
                      hint="Le code est permanent et ne peut pas être modifié."
                    >
                      <input
                        value={question.code}
                        disabled
                        style={{
                          ...inputStyle,
                          opacity: 0.6,
                        }}
                      />
                    </Field>

                    <Field label="Nom" required>
                      <input
                        value={name}
                        onChange={(event) => {
                          setName(event.target.value);
                        }}
                        maxLength={255}
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
                        style={{
                          ...inputStyle,
                          height: "auto",
                          minHeight: "96px",
                          padding: "0.75rem 0.875rem",
                          resize: "vertical",
                        }}
                      />
                    </Field>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "0.5rem",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                        }}
                        style={secondaryButtonStyle}
                      >
                        <X size={14} />
                        Annuler
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          const normalizedName = name.trim();

                          if (!normalizedName) {
                            return;
                          }

                          await onSave({
                            name: normalizedName,
                            description,
                          });

                          setIsEditing(false);
                        }}
                        disabled={isSaving}
                        style={primaryButtonStyle}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Enregistrement...
                          </>
                        ) : (
                          <>
                            <Check size={14} />
                            Enregistrer
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "0.75rem",
                      }}
                    >
                      <InfoCard label="Code" value={question.code} />

                      <InfoCard
                        label="Statut"
                        value={
                          question.status === "ACTIVE" ? "Active" : "Archivée"
                        }
                      />

                      <InfoCard
                        label="Versions"
                        value={String(question.versions.length)}
                      />

                      <InfoCard
                        label="Créateur"
                        value={String(question.created_by)}
                      />
                    </div>

                    {question.description && (
                      <div
                        style={{
                          marginTop: "0.75rem",
                        }}
                      >
                        <InfoCard
                          label="Description"
                          value={question.description}
                        />
                      </div>
                    )}
                  </>
                )}
              </section>

              {/* Versions */}
              <section
                style={{
                  marginTop: "1.5rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "var(--color-foreground)",
                    }}
                  >
                    Versions
                  </div>

                  <span
                    style={{
                      fontSize: "0.6875rem",
                      color: "var(--color-foreground-muted)",
                    }}
                  >
                    {question.versions.length} version
                    {question.versions.length > 1 ? "s" : ""}
                  </span>
                </div>

                {question.versions.length === 0 ? (
                  <div
                    style={{
                      padding: "1rem",
                      border: "1px dashed var(--color-border)",
                      borderRadius: "0.625rem",
                      color: "var(--color-foreground-muted)",
                      fontSize: "0.75rem",
                      textAlign: "center",
                    }}
                  >
                    Aucune version disponible.
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    {question.versions
                      .slice()
                      .sort((a, b) => b.version - a.version)
                      .map((version) => {
                        const expanded = expandedVersionId === version.id;

                        return (
                          <div
                            key={version.id}
                            style={{
                              border: "1px solid var(--color-border)",
                              borderRadius: "0.75rem",
                              overflow: "hidden",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setExpandedVersionId(
                                  expanded ? null : version.id,
                                );
                              }}
                              style={{
                                width: "100%",
                                minHeight: "52px",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.625rem",
                                padding: "0.625rem 0.75rem",
                                border: 0,
                                background: "var(--color-surface-raised)",
                                color: "var(--color-foreground)",
                                cursor: "pointer",
                                textAlign: "left",
                              }}
                            >
                              {expanded ? (
                                <ChevronDown size={15} />
                              ) : (
                                <ChevronRight size={15} />
                              )}

                              <div
                                style={{
                                  width: "28px",
                                  height: "28px",
                                  flexShrink: 0,
                                  borderRadius: "0.5rem",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  background: "rgba(93, 184, 58, 0.1)",
                                  color: "#5DB83A",
                                }}
                              >
                                <FileText size={14} />
                              </div>

                              <div
                                style={{
                                  minWidth: 0,
                                  flex: 1,
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: "0.8125rem",
                                      fontWeight: 700,
                                    }}
                                  >
                                    v{version.version}
                                  </span>

                                  {version.version ===
                                    question.versions.at(-1)?.version && (
                                    <span
                                      style={{
                                        padding: "0.15rem 0.4rem",
                                        borderRadius: "999px",
                                        background: "rgba(93, 184, 58, 0.1)",
                                        color: "#5DB83A",
                                        fontSize: "0.625rem",
                                        fontWeight: 600,
                                      }}
                                    >
                                      Actuelle
                                    </span>
                                  )}
                                </div>

                                <div
                                  style={{
                                    marginTop: "0.125rem",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    fontSize: "0.6875rem",
                                    color: "var(--color-foreground-muted)",
                                  }}
                                >
                                  {version.label}
                                </div>
                              </div>

                              <span
                                style={{
                                  fontSize: "0.6875rem",
                                  color: "var(--color-foreground-muted)",
                                }}
                              >
                                {getQuestionTypeLabel(version.question_type)}
                              </span>
                            </button>

                            {expanded && <VersionContent version={version} />}
                          </div>
                        );
                      })}
                  </div>
                )}
              </section>
            </>
          )}
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
            style={{
              height: "38px",
              padding: "0 0.875rem",
              borderRadius: "0.625rem",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface-raised)",
              color: "var(--color-foreground)",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Fermer
          </button>

          <button
            type="button"
            onClick={() => {
              // Étape suivante.
            }}
            style={{
              height: "38px",
              padding: "0 0.875rem",
              borderRadius: "0.625rem",
              border: "1px solid rgba(93, 184, 58, 0.3)",
              background: "rgba(93, 184, 58, 0.12)",
              color: "#5DB83A",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Pencil size={15} />
            Modifier
          </button>

          <button
            type="button"
            onClick={onCreateVersion}
            style={{
              ...secondaryButtonStyle,
              color: "#5DB83A",
              height: "38px",
              padding: "0 0.875rem",
            }}
          >
            <Plus size={14} />
            Nouvelle version
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: "0.75rem",
        borderRadius: "0.625rem",
        border: "1px solid var(--color-border)",
        background: "var(--color-surface-raised)",
      }}
    >
      <div
        style={{
          fontSize: "0.625rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          color: "var(--color-foreground-muted)",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: "0.3rem",
          fontSize: "0.8125rem",
          color: "var(--color-foreground)",
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function VersionContent({
  version,
}: {
  version: QuestionDefinitionDetail["versions"][number];
}) {
  return (
    <div
      style={{
        padding: "0.875rem",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.75rem",
        }}
      >
        <InfoCard
          label="Type"
          value={getQuestionTypeLabel(version.question_type)}
        />

        <InfoCard label="Identifiant" value={String(version.id)} />
      </div>

      {version.help_text && (
        <div
          style={{
            marginTop: "0.75rem",
          }}
        >
          <InfoCard label="Texte d'aide" value={version.help_text} />
        </div>
      )}

      <div
        style={{
          marginTop: "0.75rem",
        }}
      >
        <InfoCard
          label="Configuration"
          value={
            Object.keys(version.base_config).length > 0
              ? JSON.stringify(version.base_config, null, 2)
              : "Aucune configuration spécifique."
          }
        />
      </div>

      {version.options.length > 0 && (
        <div
          style={{
            marginTop: "0.75rem",
          }}
        >
          <div
            style={{
              marginBottom: "0.5rem",
              fontSize: "0.6875rem",
              fontWeight: 700,
              color: "var(--color-foreground-muted)",
            }}
          >
            OPTIONS
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.375rem",
            }}
          >
            {version.options
              .slice()
              .sort((a, b) => a.position - b.position)
              .map((option) => (
                <div
                  key={option.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                    padding: "0.5rem 0.625rem",
                    borderRadius: "0.5rem",
                    background: "var(--color-surface-raised)",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      flexShrink: 0,
                      borderRadius: "50%",
                      background: "#5DB83A",
                    }}
                  />

                  <span
                    style={{
                      flex: 1,
                      minWidth: 0,
                      fontSize: "0.75rem",
                      color: "var(--color-foreground)",
                    }}
                  >
                    {option.label}
                  </span>

                  <code
                    style={{
                      fontSize: "0.625rem",
                      color: "var(--color-foreground-muted)",
                    }}
                  >
                    {option.value}
                  </code>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

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
  height: "36px",
  padding: "0 0.75rem",
  borderRadius: "0.5rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface-raised)",
  color: "var(--color-foreground)",
  display: "flex",
  alignItems: "center",
  gap: "0.375rem",
  fontSize: "0.75rem",
  fontWeight: 600,
  cursor: "pointer",
};

const primaryButtonStyle = {
  height: "36px",
  padding: "0 0.75rem",
  borderRadius: "0.5rem",
  border: "1px solid rgba(93, 184, 58, 0.3)",
  background: "rgba(93, 184, 58, 0.12)",
  color: "#5DB83A",
  display: "flex",
  alignItems: "center",
  gap: "0.375rem",
  fontSize: "0.75rem",
  fontWeight: 600,
  cursor: "pointer",
};
