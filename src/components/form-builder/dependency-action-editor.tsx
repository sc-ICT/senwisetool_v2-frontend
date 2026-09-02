import { useMemo } from "react";

import type {
  DependencyAction,
  DependencyActionType,
  DependencyTargetType,
} from "@/services/form-question-dependency.service";

interface DependencyActionQuestion {
  id: number;
  question_name: string;
  question_type?: string;
}

interface DependencyActionSection {
  id: number;
  name: string;
}

interface DependencyActionEditorProps {
  action: DependencyAction;
  questions: DependencyActionQuestion[];
  sections: DependencyActionSection[];
  disabled?: boolean;
  onChange: (action: DependencyAction) => void;
  onRemove: () => void;
}

const ACTIONS: Array<{
  value: DependencyActionType;
  label: string;
  description: string;
}> = [
  {
    value: "SHOW",
    label: "Afficher",
    description: "Affiche la cible.",
  },
  {
    value: "HIDE",
    label: "Masquer",
    description: "Masque la cible.",
  },
  {
    value: "ENABLE",
    label: "Activer",
    description: "Rend la cible disponible.",
  },
  {
    value: "DISABLE",
    label: "Désactiver",
    description: "Désactive la cible.",
  },
  {
    value: "REQUIRE",
    label: "Rendre obligatoire",
    description: "Rend la question obligatoire.",
  },
  {
    value: "OPTIONAL",
    label: "Rendre optionnelle",
    description: "Rend la question optionnelle.",
  },
  {
    value: "READONLY",
    label: "Lecture seule",
    description: "Empêche la modification.",
  },
  {
    value: "EDITABLE",
    label: "Rendre modifiable",
    description: "Autorise la modification.",
  },
  {
    value: "SET_VALUE",
    label: "Définir une valeur",
    description: "Définit automatiquement une valeur.",
  },
  {
    value: "COPY_VALUE",
    label: "Copier une valeur",
    description: "Copie la valeur d'une autre question.",
  },
  {
    value: "FILTER_OPTIONS",
    label: "Filtrer les options",
    description: "Filtre dynamiquement les options.",
  },
  {
    value: "CLEAR_VALUE",
    label: "Effacer la valeur",
    description: "Efface la valeur actuelle.",
  },
  {
    value: "REPEAT_SECTION",
    label: "Répéter une section",
    description: "Répète une section selon une source.",
  },
];

const SECTION_ACTIONS = new Set<DependencyActionType>(["REPEAT_SECTION"]);

export function DependencyActionEditor({
  action,
  questions,
  sections,
  disabled = false,
  onChange,
  onRemove,
}: DependencyActionEditorProps) {
  const actionDefinition = useMemo(
    () => ACTIONS.find((item) => item.value === action.type),
    [action.type],
  );

  const updateAction = (changes: Partial<DependencyAction>) => {
    onChange({
      ...action,
      ...changes,
    });
  };

  const updateConfig = (key: string, value: unknown) => {
    onChange({
      ...action,
      config: {
        ...(action.config ?? {}),
        [key]: value,
      },
    });
  };

  const handleTypeChange = (type: DependencyActionType) => {
    const targetType: DependencyTargetType = SECTION_ACTIONS.has(type)
      ? "SECTION"
      : "QUESTION";

    onChange({
      ...action,
      type,
      target_type: targetType,
      target_id: 0,
      config: {},
    });
  };

  const targetItems =
    action.target_type === "SECTION"
      ? sections.map((section) => ({
          id: section.id,
          label: section.name,
        }))
      : questions.map((question) => ({
          id: question.id,
          label: question.question_name,
        }));

  return (
    <div
      style={{
        padding: "0.75rem",
        border: "1px solid var(--color-border)",
        borderRadius: "0.625rem",
        background: "var(--color-surface)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "0.75rem",
          marginBottom: "0.75rem",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "0.6875rem",
              fontWeight: 700,
            }}
          >
            Action
          </div>

          {actionDefinition && (
            <div
              style={{
                marginTop: "0.2rem",
                fontSize: "0.625rem",
                color: "var(--color-foreground-muted)",
              }}
            >
              {actionDefinition.description}
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={onRemove}
          style={{
            border: 0,
            background: "transparent",
            color: "#EF4444",
            cursor: disabled ? "not-allowed" : "pointer",
          }}
        >
          Supprimer
        </button>
      </div>

      {/* TYPE */}

      <label
        style={{
          display: "block",
          marginBottom: "0.75rem",
        }}
      >
        <span
          style={{
            display: "block",
            marginBottom: "0.35rem",
            fontSize: "0.625rem",
            fontWeight: 600,
          }}
        >
          Type d&#39;action
        </span>

        <select
          value={action.type}
          disabled={disabled}
          onChange={(event) =>
            handleTypeChange(event.target.value as DependencyActionType)
          }
          style={{
            width: "100%",
            minHeight: "36px",
            border: "1px solid var(--color-border)",
            borderRadius: "0.5rem",
            padding: "0 0.625rem",
            background: "var(--color-surface)",
            color: "var(--color-foreground)",
          }}
        >
          {ACTIONS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      {/* CIBLE */}

      <label
        style={{
          display: "block",
          marginBottom: "0.75rem",
        }}
      >
        <span
          style={{
            display: "block",
            marginBottom: "0.35rem",
            fontSize: "0.625rem",
            fontWeight: 600,
          }}
        >
          Cible
        </span>

        <select
          value={action.target_id > 0 ? action.target_id : ""}
          disabled={disabled}
          onChange={(event) =>
            updateAction({
              target_id: Number(event.target.value),
            })
          }
          style={{
            width: "100%",
            minHeight: "36px",
            border: "1px solid var(--color-border)",
            borderRadius: "0.5rem",
            padding: "0 0.625rem",
            background: "var(--color-surface)",
            color: "var(--color-foreground)",
          }}
        >
          <option value="">Sélectionner une cible</option>

          {targetItems.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      {/* SET VALUE */}

      {action.type === "SET_VALUE" && (
        <label
          style={{
            display: "block",
            marginBottom: "0.75rem",
          }}
        >
          <span
            style={{
              display: "block",
              marginBottom: "0.35rem",
              fontSize: "0.625rem",
              fontWeight: 600,
            }}
          >
            Valeur à définir
          </span>

          <input
            type="text"
            value={String(action.config?.value ?? "")}
            disabled={disabled}
            onChange={(event) => updateConfig("value", event.target.value)}
            style={{
              width: "100%",
              minHeight: "36px",
              border: "1px solid var(--color-border)",
              borderRadius: "0.5rem",
              padding: "0 0.625rem",
              background: "var(--color-surface)",
              color: "var(--color-foreground)",
            }}
          />
        </label>
      )}

      {/* COPY VALUE */}

      {action.type === "COPY_VALUE" && (
        <label
          style={{
            display: "block",
            marginBottom: "0.75rem",
          }}
        >
          <span
            style={{
              display: "block",
              marginBottom: "0.35rem",
              fontSize: "0.625rem",
              fontWeight: 600,
            }}
          >
            Question source de la copie
          </span>

          <select
            value={Number(action.config?.source_question_id ?? 0) || ""}
            disabled={disabled}
            onChange={(event) =>
              updateConfig("source_question_id", Number(event.target.value))
            }
            style={{
              width: "100%",
              minHeight: "36px",
              border: "1px solid var(--color-border)",
              borderRadius: "0.5rem",
              padding: "0 0.625rem",
              background: "var(--color-surface)",
              color: "var(--color-foreground)",
            }}
          >
            <option value="">Sélectionner une question</option>

            {questions.map((question) => (
              <option key={question.id} value={question.id}>
                {question.question_name}
              </option>
            ))}
          </select>
        </label>
      )}

      {/* FILTER OPTIONS */}

      {action.type === "FILTER_OPTIONS" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <label>
            <span
              style={{
                display: "block",
                marginBottom: "0.35rem",
                fontSize: "0.625rem",
                fontWeight: 600,
              }}
            >
              Champ de filtrage
            </span>

            <input
              type="text"
              value={String(action.config?.filter_field ?? "")}
              disabled={disabled}
              onChange={(event) =>
                updateConfig("filter_field", event.target.value)
              }
              placeholder="Ex. continent_id"
              style={{
                width: "100%",
                minHeight: "36px",
                border: "1px solid var(--color-border)",
                borderRadius: "0.5rem",
                padding: "0 0.625rem",
                background: "var(--color-surface)",
                color: "var(--color-foreground)",
              }}
            />
          </label>

          <label>
            <span
              style={{
                display: "block",
                marginBottom: "0.35rem",
                fontSize: "0.625rem",
                fontWeight: 600,
              }}
            >
              Valeur de filtrage
            </span>

            <input
              type="text"
              value={String(action.config?.filter_value ?? "")}
              disabled={disabled}
              onChange={(event) =>
                updateConfig("filter_value", event.target.value)
              }
              placeholder="Valeur ou référence"
              style={{
                width: "100%",
                minHeight: "36px",
                border: "1px solid var(--color-border)",
                borderRadius: "0.5rem",
                padding: "0 0.625rem",
                background: "var(--color-surface)",
                color: "var(--color-foreground)",
              }}
            />
          </label>
        </div>
      )}

      {/* REPEAT SECTION */}

      {action.type === "REPEAT_SECTION" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            padding: "0.75rem",
            border: "1px solid var(--color-border)",
            borderRadius: "0.5rem",
          }}
        >
          {/* SOURCE DU NOMBRE DE REPETITIONS */}

          <label>
            <span
              style={{
                display: "block",
                marginBottom: "0.35rem",
                fontSize: "0.625rem",
                fontWeight: 600,
              }}
            >
              Question source du nombre de répétitions
            </span>

            <select
              value={
                typeof action.config?.count_source === "object" &&
                action.config.count_source !== null &&
                "question_id" in action.config.count_source
                  ? String(action.config.count_source.question_id)
                  : ""
              }
              disabled={disabled}
              onChange={(event) =>
                updateConfig("count_source", {
                  source_type: "QUESTION",
                  question_id: Number(event.target.value),
                })
              }
              style={{
                width: "100%",
                minHeight: "36px",
                border: "1px solid var(--color-border)",
                borderRadius: "0.5rem",
                padding: "0 0.625rem",
                background: "var(--color-surface)",
                color: "var(--color-foreground)",
              }}
            >
              <option value="">Sélectionner une question numérique</option>

              {questions
                .filter((question) =>
                  ["INTEGER", "DECIMAL"].includes(question.question_type ?? ""),
                )
                .map((question) => (
                  <option key={question.id} value={question.id}>
                    {question.question_name}
                  </option>
                ))}
            </select>
          </label>

          {/* MINIMUM */}

          <label>
            <span
              style={{
                display: "block",
                marginBottom: "0.35rem",
                fontSize: "0.625rem",
                fontWeight: 600,
              }}
            >
              Minimum
            </span>

            <input
              type="number"
              min={0}
              value={Number(action.config?.minimum ?? 0)}
              disabled={disabled}
              onChange={(event) =>
                updateConfig("minimum", Number(event.target.value))
              }
              style={{
                width: "100%",
                minHeight: "36px",
                border: "1px solid var(--color-border)",
                borderRadius: "0.5rem",
                padding: "0 0.625rem",
                background: "var(--color-surface)",
                color: "var(--color-foreground)",
              }}
            />
          </label>

          {/* MAXIMUM */}

          <label>
            <span
              style={{
                display: "block",
                marginBottom: "0.35rem",
                fontSize: "0.625rem",
                fontWeight: 600,
              }}
            >
              Maximum
            </span>

            <input
              type="number"
              min={0}
              value={
                typeof action.config?.maximum === "number"
                  ? action.config.maximum
                  : ""
              }
              disabled={disabled}
              onChange={(event) => {
                const value = event.target.value;

                updateConfig("maximum", value === "" ? null : Number(value));
              }}
              placeholder="Aucune limite"
              style={{
                width: "100%",
                minHeight: "36px",
                border: "1px solid var(--color-border)",
                borderRadius: "0.5rem",
                padding: "0 0.625rem",
                background: "var(--color-surface)",
                color: "var(--color-foreground)",
              }}
            />
          </label>

          <div
            style={{
              fontSize: "0.625rem",
              color: "var(--color-foreground-muted)",
            }}
          >
            La section sera répétée autant de fois que l&#39;indique la question
            source, dans les limites minimum et maximum définies.
          </div>
        </div>
      )}
    </div>
  );
}
