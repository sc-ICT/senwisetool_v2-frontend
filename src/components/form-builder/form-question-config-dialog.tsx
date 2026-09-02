"use client";

import { Loader2, Save, X } from "lucide-react";
import { useState } from "react";

import type {
  FormQuestion,
  FormQuestionConfig,
} from "@/types/form-question";

import { hasQuestionCapability } from "@/lib/form-builder/question-config";

interface FormQuestionConfigDialogProps {
  question: FormQuestion;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (config: FormQuestionConfig) => void;
}

export function FormQuestionConfigDialog({
  question,
  isPending,
  onClose,
  onSubmit,
}: FormQuestionConfigDialogProps) {
  const [config, setConfig] = useState<FormQuestionConfig>(
    createLocalConfig(question.config),
  );

  const questionType = question.question_type;

  const canRequired = hasQuestionCapability(questionType, "required");

  const canMinValue = hasQuestionCapability(questionType, "min_value");

  const canMaxValue = hasQuestionCapability(questionType, "max_value");

  const canMinLength = hasQuestionCapability(questionType, "min_length");

  const canMaxLength = hasQuestionCapability(questionType, "max_length");

  const canPlaceholder = hasQuestionCapability(questionType, "placeholder");

  const canHelpText = hasQuestionCapability(questionType, "help_text");

  const canReadonly = hasQuestionCapability(questionType, "readonly");

  const canDefaultValue = hasQuestionCapability(questionType, "default_value");

  const isChoiceQuestion = [
    "SINGLE_CHOICE",
    "MULTIPLE_CHOICE",
    "DROPDOWN",
    "AUTOCOMPLETE",
    "LIKERT_SCALE",
  ].includes(question.question_type);

  const isMultipleChoice = question.question_type === "MULTIPLE_CHOICE";

  const save = () => {
    onSubmit(
      sanitizeConfig(config, {
        canMinValue,
        canMaxValue,
        canMinLength,
        canMaxLength,
        canPlaceholder,
        canHelpText,
        canReadonly,
        canRequired,
        canDefaultValue,
      }),
    );
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 250,
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
          maxWidth: "560px",
          maxHeight: "min(720px, 88vh)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          borderRadius: "1rem",
          border: "1px solid var(--color-border)",
          background: "var(--color-surface)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.18)",
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
              Configurer la question
            </div>

            <div
              style={{
                marginTop: "0.25rem",
                fontSize: "0.75rem",
                color: "var(--color-foreground-muted)",
              }}
            >
              {question.question_name}
            </div>

            <div
              style={{
                marginTop: "0.15rem",
                fontSize: "0.625rem",
                color: "var(--color-foreground-muted)",
              }}
            >
              {question.question_code} · {question.question_type} · v
              {question.version_number}
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
            padding: "1rem 1.125rem",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {(canRequired ||
              canMinValue ||
              canMaxValue ||
              canMinLength ||
              canMaxLength) && (
              <ConfigSection
                title="Validation"
                description="Contraintes appliquées à la réponse dans ce formulaire."
              >
                {canRequired && (
                  <ToggleField
                    label="Question obligatoire"
                    checked={config.validation.required}
                    disabled={isPending}
                    onChange={(checked) => {
                      setConfig((current) => ({
                        ...current,
                        validation: {
                          ...current.validation,
                          required: checked,
                        },
                      }));
                    }}
                  />
                )}

                {(canMinValue || canMaxValue) && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "0.75rem",
                    }}
                  >
                    {canMinValue && (
                      <NumberField
                        label="Valeur minimale"
                        value={config.validation.min_value}
                        disabled={isPending}
                        onChange={(value) => {
                          setConfig((current) => ({
                            ...current,
                            validation: {
                              ...current.validation,
                              min_value: value,
                            },
                          }));
                        }}
                      />
                    )}

                    {canMaxValue && (
                      <NumberField
                        label="Valeur maximale"
                        value={config.validation.max_value}
                        disabled={isPending}
                        onChange={(value) => {
                          setConfig((current) => ({
                            ...current,
                            validation: {
                              ...current.validation,
                              max_value: value,
                            },
                          }));
                        }}
                      />
                    )}
                  </div>
                )}

                {(canMinLength || canMaxLength) && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "0.75rem",
                    }}
                  >
                    {canMinLength && (
                      <IntegerField
                        label="Longueur minimale"
                        value={config.validation.min_length}
                        disabled={isPending}
                        onChange={(value) => {
                          setConfig((current) => ({
                            ...current,
                            validation: {
                              ...current.validation,
                              min_length: value,
                            },
                          }));
                        }}
                      />
                    )}

                    {canMaxLength && (
                      <IntegerField
                        label="Longueur maximale"
                        value={config.validation.max_length}
                        disabled={isPending}
                        onChange={(value) => {
                          setConfig((current) => ({
                            ...current,
                            validation: {
                              ...current.validation,
                              max_length: value,
                            },
                          }));
                        }}
                      />
                    )}
                  </div>
                )}
              </ConfigSection>
            )}

            {isChoiceQuestion && (
              <ConfigSection
                title="Options"
                description="Options disponibles pour cette version de la question."
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.375rem",
                  }}
                >
                  {question.options.map((option) => (
                    <div
                      key={option.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.625rem",
                        minHeight: "38px",
                        padding: "0.5rem 0.625rem",
                        border: "1px solid var(--color-border)",
                        borderRadius: "0.5rem",
                        background: "var(--color-surface)",
                      }}
                    >
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "0.4rem",
                          background: "var(--color-surface-raised)",
                          fontSize: "0.625rem",
                          fontWeight: 700,
                          color: "var(--color-foreground-muted)",
                        }}
                      >
                        {option.position + 1}
                      </div>

                      <div
                        style={{
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                          }}
                        >
                          {option.label}
                        </div>

                        <div
                          style={{
                            marginTop: "0.1rem",
                            fontSize: "0.625rem",
                            color: "var(--color-foreground-muted)",
                          }}
                        >
                          {option.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ConfigSection>
            )}

            {canDefaultValue && (
              <div
                style={{
                  marginTop: "0.75rem",
                  paddingTop: "0.75rem",
                  borderTop: "1px solid var(--color-border)",
                }}
              >
                <div
                  style={{
                    marginBottom: "0.375rem",
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    color: "var(--color-foreground)",
                  }}
                >
                  Valeur par défaut
                </div>

                {isMultipleChoice ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.375rem",
                    }}
                  >
                    {question.options.map((option) => {
                      const currentValue = config.validation.default_value;

                      const selected =
                        Array.isArray(currentValue) &&
                        currentValue.includes(option.value);

                      return (
                        <label
                          key={option.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            minHeight: "34px",
                            padding: "0 0.5rem",
                            borderRadius: "0.45rem",
                            border: "1px solid var(--color-border)",
                            background: selected
                              ? "rgba(93, 184, 58, 0.06)"
                              : "var(--color-surface)",
                            cursor: isPending ? "not-allowed" : "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            disabled={isPending}
                            onChange={() => {
                              setConfig((current) => {
                                const values = Array.isArray(
                                  current.validation.default_value,
                                )
                                  ? [...current.validation.default_value]
                                  : [];

                                const next = selected
                                  ? values.filter(
                                      (value) => value !== option.value,
                                    )
                                  : [...values, option.value];

                                return {
                                  ...current,
                                  validation: {
                                    ...current.validation,
                                    default_value: next,
                                  },
                                };
                              });
                            }}
                          />

                          <span
                            style={{
                              fontSize: "0.75rem",
                            }}
                          >
                            {option.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <select
                    value={
                      typeof config.validation.default_value === "string"
                        ? config.validation.default_value
                        : ""
                    }
                    disabled={isPending}
                    onChange={(event) => {
                      setConfig((current) => ({
                        ...current,
                        validation: {
                          ...current.validation,
                          default_value: event.target.value || null,
                        },
                      }));
                    }}
                    style={{
                      ...inputStyle,
                      padding: "0 0.75rem",
                    }}
                  >
                    <option value="">Aucune valeur par défaut</option>

                    {question.options.map((option) => (
                      <option key={option.id} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {(canPlaceholder || canHelpText || canReadonly) && (
              <ConfigSection
                title="Affichage"
                description="Personnalisez le comportement de la question dans ce formulaire."
              >
                {canPlaceholder && (
                  <TextField
                    label="Placeholder"
                    value={config.display.placeholder ?? ""}
                    disabled={isPending}
                    onChange={(value) => {
                      setConfig((current) => ({
                        ...current,
                        display: {
                          ...current.display,
                          placeholder: value || null,
                        },
                      }));
                    }}
                  />
                )}

                {canHelpText && (
                  <TextAreaField
                    label="Texte d'aide"
                    value={config.display.help_text ?? ""}
                    disabled={isPending}
                    onChange={(value) => {
                      setConfig((current) => ({
                        ...current,
                        display: {
                          ...current.display,
                          help_text: value || null,
                        },
                      }));
                    }}
                  />
                )}

                {canReadonly && (
                  <ToggleField
                    label="Lecture seule"
                    checked={config.display.readonly}
                    disabled={isPending}
                    onChange={(checked) => {
                      setConfig((current) => ({
                        ...current,
                        display: {
                          ...current.display,
                          readonly: checked,
                        },
                      }));
                    }}
                  />
                )}
              </ConfigSection>
            )}

            {!canRequired &&
              !canMinValue &&
              !canMaxValue &&
              !canMinLength &&
              !canMaxLength &&
              !canPlaceholder &&
              !canHelpText &&
              !canReadonly && (
                <div
                  style={{
                    padding: "1rem",
                    borderRadius: "0.625rem",
                    border: "1px dashed var(--color-border)",
                    fontSize: "0.75rem",
                    color: "var(--color-foreground-muted)",
                    textAlign: "center",
                  }}
                >
                  Cette question n&#39;a pas encore de paramètres spécifiques
                  configurables dans le Formulaire.
                </div>
              )}
          </div>
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
            onClick={save}
            disabled={isPending}
            style={{
              ...primaryButtonStyle,
              opacity: isPending ? 0.6 : 1,
            }}
          >
            {isPending ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save size={15} />
                Enregistrer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfigSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        padding: "0.875rem",
        border: "1px solid var(--color-border)",
        borderRadius: "0.75rem",
        background: "var(--color-surface-raised)",
      }}
    >
      <div
        style={{
          marginBottom: "0.875rem",
        }}
      >
        <div
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "var(--color-foreground)",
          }}
        >
          {title}
        </div>

        <div
          style={{
            marginTop: "0.2rem",
            fontSize: "0.625rem",
            color: "var(--color-foreground-muted)",
          }}
        >
          {description}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        {children}
      </div>
    </section>
  );
}

function ToggleField({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "0.75rem",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <span
        style={{
          fontSize: "0.75rem",
          fontWeight: 500,
          color: "var(--color-foreground)",
        }}
      >
        {label}
      </span>

      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => {
          onChange(event.target.checked);
        }}
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: number | null;
  disabled: boolean;
  onChange: (value: number | null) => void;
}) {
  return (
    <label>
      <span style={labelStyle}>{label}</span>

      <input
        type="number"
        value={value ?? ""}
        disabled={disabled}
        onChange={(event) => {
          onChange(
            event.target.value === "" ? null : Number(event.target.value),
          );
        }}
        style={inputStyle}
      />
    </label>
  );
}

function IntegerField({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: number | null;
  disabled: boolean;
  onChange: (value: number | null) => void;
}) {
  return (
    <label>
      <span style={labelStyle}>{label}</span>

      <input
        type="number"
        min={0}
        step={1}
        value={value ?? ""}
        disabled={disabled}
        onChange={(event) => {
          onChange(
            event.target.value === "" ? null : Number(event.target.value),
          );
        }}
        style={inputStyle}
      />
    </label>
  );
}

function TextField({
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
    <label>
      <span style={labelStyle}>{label}</span>

      <input
        type="text"
        value={value}
        disabled={disabled}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        style={inputStyle}
      />
    </label>
  );
}

function TextAreaField({
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
    <label>
      <span style={labelStyle}>{label}</span>

      <textarea
        rows={3}
        value={value}
        disabled={disabled}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        style={{
          ...inputStyle,
          height: "auto",
          minHeight: "76px",
          padding: "0.7rem 0.75rem",
          resize: "vertical",
        }}
      />
    </label>
  );
}

function createLocalConfig(
  config: FormQuestionConfig,
): FormQuestionConfig {
  return {
    validation: {
      required: config.validation?.required ?? false,

      min_value: config.validation?.min_value ?? null,

      max_value: config.validation?.max_value ?? null,

      min_length: config.validation?.min_length ?? null,

      max_length: config.validation?.max_length ?? null,

      default_value: config.validation?.default_value ?? null,
    },

    display: {
      visible: config.display?.visible ?? true,

      readonly: config.display?.readonly ?? false,

      placeholder: config.display?.placeholder ?? null,

      help_text: config.display?.help_text ?? null,
    },
  };
}

function sanitizeConfig(
  config: FormQuestionConfig,
  capabilities: {
    canRequired: boolean;
    canMinValue: boolean;
    canMaxValue: boolean;
    canMinLength: boolean;
    canMaxLength: boolean;
    canPlaceholder: boolean;
    canHelpText: boolean;
    canReadonly: boolean;
    canDefaultValue: boolean;
  },
): FormQuestionConfig {
  return {
    validation: {
      required: capabilities.canRequired ? config.validation.required : false,

      min_value: capabilities.canMinValue ? config.validation.min_value : null,

      max_value: capabilities.canMaxValue ? config.validation.max_value : null,

      min_length: capabilities.canMinLength
        ? config.validation.min_length
        : null,

      max_length: capabilities.canMaxLength
        ? config.validation.max_length
        : null,

      default_value: capabilities.canDefaultValue
        ? config.validation.default_value
        : null,
    },

    display: {
      visible: config.display.visible,

      readonly: capabilities.canReadonly ? config.display.readonly : false,

      placeholder: capabilities.canPlaceholder
        ? config.display.placeholder
        : null,

      help_text: capabilities.canHelpText ? config.display.help_text : null,
    },
  };
}

const labelStyle = {
  display: "block",
  marginBottom: "0.375rem",
  fontSize: "0.6875rem",
  fontWeight: 600,
  color: "var(--color-foreground)",
};

const inputStyle = {
  width: "100%",
  height: "38px",
  padding: "0 0.75rem",
  borderRadius: "0.5rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface)",
  color: "var(--color-foreground)",
  outline: "none",
  fontSize: "0.75rem",
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
