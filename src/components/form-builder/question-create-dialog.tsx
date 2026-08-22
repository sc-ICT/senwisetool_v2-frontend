"use client";

import type { QuestionType } from "@/types/question-bank";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";

export interface QuestionCreateFormData {
  code: string;
  name: string;
  description: string;
  label: string;
  helpText: string;
  questionType: QuestionType;
  options: {
    value: string;
    label: string;
  }[];
}

interface QuestionCreateDialogProps {
  isPending: boolean;
  onClose: () => void;
  onSubmit: (data: QuestionCreateFormData) => void;
}

const questionTypes: {
  value: QuestionType;
  label: string;
}[] = [
  {
    value: "TEXT",
    label: "Texte court",
  },
  {
    value: "LONG_TEXT",
    label: "Texte long",
  },
  {
    value: "EMAIL",
    label: "E-mail",
  },
  {
    value: "PHONE",
    label: "Téléphone",
  },
  {
    value: "INTEGER",
    label: "Nombre entier",
  },
  {
    value: "DECIMAL",
    label: "Nombre décimal",
  },
  {
    value: "PERCENTAGE",
    label: "Pourcentage",
  },
  {
    value: "CURRENCY",
    label: "Monnaie",
  },
  {
    value: "SINGLE_CHOICE",
    label: "Choix unique",
  },
  {
    value: "MULTIPLE_CHOICE",
    label: "Choix multiple",
  },
  {
    value: "DROPDOWN",
    label: "Liste déroulante",
  },
  {
    value: "AUTOCOMPLETE",
    label: "Recherche",
  },
  {
    value: "DATE",
    label: "Date",
  },
  {
    value: "TIME",
    label: "Heure",
  },
  {
    value: "DATETIME",
    label: "Date et heure",
  },
  {
    value: "PHOTO",
    label: "Photo",
  },
  {
    value: "VIDEO",
    label: "Vidéo",
  },
  {
    value: "AUDIO",
    label: "Audio",
  },
  {
    value: "FILE",
    label: "Fichier",
  },
  {
    value: "SIGNATURE",
    label: "Signature",
  },
  {
    value: "POINT",
    label: "Point GPS",
  },
  {
    value: "LINE",
    label: "Ligne",
  },
  {
    value: "POLYGON",
    label: "Polygone",
  },
  {
    value: "ENTITY_SELECT",
    label: "Sélection d'entité",
  },
  {
    value: "ENTITY_SEARCH",
    label: "Recherche d'entité",
  },
  {
    value: "CALCULATION",
    label: "Calcul",
  },
];

function isChoiceType(type: QuestionType): boolean {
  return (
    type === "SINGLE_CHOICE" ||
    type === "MULTIPLE_CHOICE" ||
    type === "DROPDOWN" ||
    type === "AUTOCOMPLETE"
  );
}

export function QuestionCreateDialog({
  isPending,
  onClose,
  onSubmit,
}: QuestionCreateDialogProps) {
  const [code, setCode] = useState("");

  const [name, setName] = useState("");

  const [description, setDescription] = useState("");

  const [label, setLabel] = useState("");

  const [helpText, setHelpText] = useState("");

  const [questionType, setQuestionType] = useState<QuestionType>("TEXT");

  const [options, setOptions] = useState<
    {
      value: string;
      label: string;
    }[]
  >([]);

  const [localError, setLocalError] = useState<string | null>(null);

  const requiresOptions = useMemo(
    () => isChoiceType(questionType),
    [questionType],
  );

  const addOption = () => {
    setOptions((current) => [
      ...current,
      {
        value: "",
        label: "",
      },
    ]);
  };

  const removeOption = (index: number) => {
    setOptions((current) =>
      current.filter((_, optionIndex) => optionIndex !== index),
    );
  };

  const updateOption = (
    index: number,
    field: "value" | "label",
    value: string,
  ) => {
    setOptions((current) =>
      current.map((option, optionIndex) =>
        optionIndex === index
          ? {
              ...option,
              [field]: value,
            }
          : option,
      ),
    );
  };

  const handleSubmit = () => {
    setLocalError(null);

    const normalizedCode = code.trim().toUpperCase();

    const normalizedName = name.trim();

    const normalizedLabel = label.trim();

    if (!normalizedCode) {
      setLocalError("Le code de la question est obligatoire.");
      return;
    }

    if (!normalizedName) {
      setLocalError("Le nom de la question est obligatoire.");
      return;
    }

    if (!normalizedLabel) {
      setLocalError("Le libellé de la question est obligatoire.");
      return;
    }

    if (requiresOptions && options.length === 0) {
      setLocalError("Ajoutez au moins une option.");
      return;
    }

    if (requiresOptions) {
      const invalidOption = options.some(
        (option) => !option.value.trim() || !option.label.trim(),
      );

      if (invalidOption) {
        setLocalError(
          "Toutes les options doivent avoir une valeur et un libellé.",
        );
        return;
      }
    }

    onSubmit({
      code: normalizedCode,
      name: normalizedName,
      description: description.trim(),
      label: normalizedLabel,
      helpText: helpText.trim(),
      questionType,
      options,
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 120,
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
        aria-labelledby="question-create-title"
        style={{
          width: "100%",
          maxWidth: "720px",
          maxHeight: "min(760px, 90vh)",
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
              id="question-create-title"
              style={{
                fontSize: "0.9375rem",
                fontWeight: 700,
                color: "var(--color-foreground)",
              }}
            >
              Nouvelle question
            </div>

            <div
              style={{
                marginTop: "0.25rem",
                fontSize: "0.75rem",
                color: "var(--color-foreground-muted)",
              }}
            >
              Créez une question réutilisable dans votre banque.
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

        {/* Corps */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            padding: "1.25rem",
          }}
        >
          {localError && (
            <div
              style={{
                marginBottom: "1rem",
                padding: "0.75rem 0.875rem",
                borderRadius: "0.625rem",
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.18)",
                color: "#DC2626",
                fontSize: "0.75rem",
              }}
            >
              {localError}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <Field label="Code" required hint="Identifiant technique unique.">
              <input
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                maxLength={100}
                placeholder="Ex. AGE"
                disabled={isPending}
                style={inputStyle}
              />
            </Field>

            <Field label="Nom" required hint="Nom interne de la question.">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={255}
                placeholder="Ex. Âge du planteur"
                disabled={isPending}
                style={inputStyle}
              />
            </Field>

            <div
              style={{
                gridColumn: "1 / -1",
              }}
            >
              <Field
                label="Description"
                hint="Description interne facultative."
              >
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  placeholder="À quoi sert cette question ?"
                  disabled={isPending}
                  style={{
                    ...inputStyle,
                    height: "auto",
                    minHeight: "78px",
                    padding: "0.75rem 0.875rem",
                    resize: "vertical",
                  }}
                />
              </Field>
            </div>

            <div
              style={{
                gridColumn: "1 / -1",
                marginTop: "0.25rem",
              }}
            >
              <div
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  color: "var(--color-foreground)",
                  marginBottom: "0.75rem",
                }}
              >
                Première version
              </div>
            </div>

            <Field
              label="Libellé"
              required
              hint="Texte affiché sur le formulaire."
            >
              <input
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                maxLength={500}
                placeholder="Ex. Quel est l'âge du planteur ?"
                disabled={isPending}
                style={inputStyle}
              />
            </Field>

            <Field label="Type" required>
              <select
                value={questionType}
                onChange={(event) => {
                  const nextType = event.target.value as QuestionType;

                  setQuestionType(nextType);

                  if (!isChoiceType(nextType)) {
                    setOptions([]);
                  }
                }}
                disabled={isPending}
                style={inputStyle}
              >
                {questionTypes.map((type) => (
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
              <Field
                label="Texte d'aide"
                hint="Aide facultative affichée pendant la collecte."
              >
                <textarea
                  value={helpText}
                  onChange={(event) => setHelpText(event.target.value)}
                  rows={3}
                  placeholder="Ex. Saisissez l'âge en années révolues."
                  disabled={isPending}
                  style={{
                    ...inputStyle,
                    height: "auto",
                    minHeight: "78px",
                    padding: "0.75rem 0.875rem",
                    resize: "vertical",
                  }}
                />
              </Field>
            </div>
          </div>

          {requiresOptions && (
            <div
              style={{
                marginTop: "1.25rem",
                paddingTop: "1.125rem",
                borderTop: "1px solid var(--color-border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                  marginBottom: "0.75rem",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 700,
                      color: "var(--color-foreground)",
                    }}
                  >
                    Options
                  </div>

                  <div
                    style={{
                      marginTop: "0.2rem",
                      fontSize: "0.6875rem",
                      color: "var(--color-foreground-muted)",
                    }}
                  >
                    Les valeurs techniques resteront stables même si le libellé
                    change.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addOption}
                  disabled={isPending}
                  style={{
                    height: "34px",
                    padding: "0 0.625rem",
                    borderRadius: "0.5rem",
                    border: "1px solid rgba(93, 184, 58, 0.25)",
                    background: "rgba(93, 184, 58, 0.08)",
                    color: "#5DB83A",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <Plus size={14} />
                  Ajouter
                </button>
              </div>

              {options.length === 0 ? (
                <div
                  style={{
                    padding: "1rem",
                    borderRadius: "0.625rem",
                    border: "1px dashed var(--color-border)",
                    color: "var(--color-foreground-muted)",
                    textAlign: "center",
                    fontSize: "0.75rem",
                  }}
                >
                  Aucune option. Ajoutez-en au moins une.
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  {options.map((option, index) => (
                    <div
                      key={index}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 36px",
                        gap: "0.5rem",
                        alignItems: "center",
                      }}
                    >
                      <input
                        value={option.value}
                        onChange={(event) =>
                          updateOption(index, "value", event.target.value)
                        }
                        placeholder="Valeur"
                        disabled={isPending}
                        style={inputStyle}
                      />

                      <input
                        value={option.label}
                        onChange={(event) =>
                          updateOption(index, "label", event.target.value)
                        }
                        placeholder="Libellé"
                        disabled={isPending}
                        style={inputStyle}
                      />

                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        disabled={isPending}
                        aria-label={`Supprimer l'option ${index + 1}`}
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "0.5rem",
                          border: "1px solid var(--color-border)",
                          background: "var(--color-surface-raised)",
                          color: "#EF4444",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
            disabled={isPending}
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
            Annuler
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            style={{
              height: "38px",
              padding: "0 0.875rem",
              borderRadius: "0.625rem",
              border: "1px solid rgba(93, 184, 58, 0.3)",
              background: "rgba(93, 184, 58, 0.12)",
              color: "#5DB83A",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: isPending ? "not-allowed" : "pointer",
              opacity: isPending ? 0.6 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            {isPending ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Création...
              </>
            ) : (
              <>
                <Plus size={15} />
                Créer la question
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
  height: "40px",
  padding: "0 0.75rem",
  borderRadius: "0.625rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface-raised)",
  color: "var(--color-foreground)",
  outline: "none",
  fontSize: "0.8125rem",
  boxSizing: "border-box" as const,
};
