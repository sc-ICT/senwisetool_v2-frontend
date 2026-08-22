"use client";

import type { QuestionType } from "@/types/question-bank";
import { Check, Loader2, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

interface QuestionVersionDialogProps {
  currentVersion: {
    label: string;
    help_text: string | null;
    question_type: QuestionType;
    base_config: Record<string, unknown>;
    options: {
      value: string;
      label: string;
    }[];
  };
  isPending: boolean;
  onClose: () => void;
  onSubmit: (data: {
    label: string;
    help_text: string | null;
    question_type: QuestionType;
    base_config: Record<string, unknown>;
    options: {
      value: string;
      label: string;
    }[];
  }) => void;
}

const questionTypes: {
  value: QuestionType;
  label: string;
}[] = [
  { value: "TEXT", label: "Texte court" },
  { value: "LONG_TEXT", label: "Texte long" },
  { value: "INTEGER", label: "Nombre entier" },
  { value: "DECIMAL", label: "Nombre décimal" },
  { value: "PERCENTAGE", label: "Pourcentage" },
  { value: "CURRENCY", label: "Monnaie" },
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
  { value: "DATE", label: "Date" },
  { value: "TIME", label: "Heure" },
  {
    value: "DATETIME",
    label: "Date et heure",
  },
  { value: "PHOTO", label: "Photo" },
  { value: "POINT", label: "Point GPS" },
];

function isChoiceType(type: QuestionType) {
  return (
    type === "SINGLE_CHOICE" ||
    type === "MULTIPLE_CHOICE" ||
    type === "DROPDOWN" ||
    type === "AUTOCOMPLETE"
  );
}

export function QuestionVersionDialog({
  currentVersion,
  isPending,
  onClose,
  onSubmit,
}: QuestionVersionDialogProps) {
  const [label, setLabel] = useState(currentVersion.label);

  const [helpText, setHelpText] = useState(currentVersion.help_text ?? "");

  const [questionType, setQuestionType] = useState<QuestionType>(
    currentVersion.question_type,
  );

  const [baseConfig, setBaseConfig] = useState<Record<string, unknown>>(
    currentVersion.base_config ?? {},
  );

  const [options, setOptions] = useState(
    currentVersion.options.map((option) => ({
      value: option.value,
      label: option.label,
    })),
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

  const removeOption = (index: number) => {
    setOptions((current) =>
      current.filter((_, optionIndex) => optionIndex !== index),
    );
  };

  const handleSubmit = () => {
    const normalizedLabel = label.trim();

    if (!normalizedLabel) {
      return;
    }

    if (isChoiceType(questionType)) {
      const invalidOption = options.some(
        (option) => !option.value.trim() || !option.label.trim(),
      );

      if (options.length === 0 || invalidOption) {
        return;
      }
    }

    onSubmit({
      label: normalizedLabel,
      help_text: helpText.trim() ? helpText.trim() : null,
      question_type: questionType,
      base_config: baseConfig,
      options: options.map((option) => ({
        value: option.value.trim(),
        label: option.label.trim(),
      })),
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
              style={{
                fontSize: "0.9375rem",
                fontWeight: 700,
                color: "var(--color-foreground)",
              }}
            >
              Nouvelle version
            </div>

            <div
              style={{
                marginTop: "0.25rem",
                fontSize: "0.75rem",
                color: "var(--color-foreground-muted)",
              }}
            >
              L&#39;ancienne version reste inchangée.
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
          <Field label="Libellé" required>
            <input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              disabled={isPending}
              style={inputStyle}
            />
          </Field>

          <div
            style={{
              marginTop: "1rem",
            }}
          >
            <Field label="Type">
              <select
                value={questionType}
                onChange={(event) => {
                  const nextType = event.target.value as QuestionType;

                  setQuestionType(nextType);

                  setBaseConfig({});

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
          </div>

          <div
            style={{
              marginTop: "1rem",
            }}
          >
            <Field label="Texte d'aide">
              <textarea
                value={helpText}
                onChange={(event) => setHelpText(event.target.value)}
                rows={3}
                disabled={isPending}
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
              marginTop: "1.25rem",
              paddingTop: "1rem",
              borderTop: "1px solid var(--color-border)",
            }}
          >
            <div
              style={{
                fontSize: "0.8125rem",
                fontWeight: 700,
                marginBottom: "0.75rem",
              }}
            >
              Configuration
            </div>

            <ConfigFields
              questionType={questionType}
              config={baseConfig}
              disabled={isPending}
              onChange={(key, value) => {
                setBaseConfig((current) => ({
                  ...current,
                  [key]: value,
                }));
              }}
            />
          </div>

          {isChoiceType(questionType) && (
            <div
              style={{
                marginTop: "1.25rem",
                paddingTop: "1rem",
                borderTop: "1px solid var(--color-border)",
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
                    fontSize: "0.8125rem",
                    fontWeight: 700,
                  }}
                >
                  Options
                </div>

                <button
                  type="button"
                  onClick={addOption}
                  disabled={isPending}
                  style={{
                    ...secondaryButtonStyle,
                    color: "#5DB83A",
                  }}
                >
                  <Plus size={14} />
                  Ajouter
                </button>
              </div>

              {options.map((option, index) => (
                <div
                  key={index}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 36px",
                    gap: "0.5rem",
                    marginBottom: "0.5rem",
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
                    style={deleteButtonStyle}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
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
            disabled={isPending}
            style={{
              ...primaryButtonStyle,
              opacity: isPending ? 0.6 : 1,
            }}
          >
            {isPending ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Création...
              </>
            ) : (
              <>
                <Check size={15} />
                Créer la version
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfigFields({
  questionType,
  config,
  disabled,
  onChange,
}: {
  questionType: QuestionType;
  config: Record<string, unknown>;
  disabled: boolean;
  onChange: (key: string, value: unknown) => void;
}) {
  if (questionType === "INTEGER") {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "0.75rem",
        }}
      >
        <ConfigInput
          label="Unité"
          value={typeof config.unit === "string" ? config.unit : ""}
          disabled={disabled}
          onChange={(value) => onChange("unit", value)}
        />

        <ConfigNumberInput
          label="Minimum"
          value={typeof config.min === "number" ? config.min : ""}
          disabled={disabled}
          onChange={(value) => onChange("min", value)}
        />

        <ConfigNumberInput
          label="Maximum"
          value={typeof config.max === "number" ? config.max : ""}
          disabled={disabled}
          onChange={(value) => onChange("max", value)}
        />
      </div>
    );
  }

  if (
    questionType === "DECIMAL" ||
    questionType === "PERCENTAGE" ||
    questionType === "CURRENCY"
  ) {
    return (
      <ConfigInput
        label="Unité"
        value={typeof config.unit === "string" ? config.unit : ""}
        disabled={disabled}
        onChange={(value) => onChange("unit", value)}
      />
    );
  }

  if (questionType === "TEXT" || questionType === "LONG_TEXT") {
    return (
      <ConfigInput
        label="Placeholder"
        value={typeof config.placeholder === "string" ? config.placeholder : ""}
        disabled={disabled}
        onChange={(value) => onChange("placeholder", value)}
      />
    );
  }

  if (questionType === "POINT") {
    return (
      <ConfigNumberInput
        label="Précision souhaitée (m)"
        value={typeof config.accuracy === "number" ? config.accuracy : ""}
        disabled={disabled}
        onChange={(value) => onChange("accuracy", value)}
      />
    );
  }

  return (
    <div
      style={{
        padding: "0.75rem 0.875rem",
        borderRadius: "0.625rem",
        background: "var(--color-surface-raised)",
        border: "1px solid var(--color-border)",
        color: "var(--color-foreground-muted)",
        fontSize: "0.75rem",
      }}
    >
      Aucun paramètre spécifique supplémentaire pour ce type.
    </div>
  );
}

function ConfigInput({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <input
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        style={inputStyle}
      />
    </Field>
  );
}

function ConfigNumberInput({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: number | "";
  disabled: boolean;
  onChange: (value: number | "") => void;
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        value={value}
        disabled={disabled}
        onChange={(event) => {
          const raw = event.target.value;

          onChange(raw === "" ? "" : Number(raw));
        }}
        style={inputStyle}
      />
    </Field>
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

const deleteButtonStyle = {
  width: "36px",
  minHeight: "40px",
  borderRadius: "0.5rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface-raised)",
  color: "#EF4444",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};
