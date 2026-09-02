"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit3, Loader2, Plus, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";

import { ApiError } from "@/lib/api";

import type { FormQuestion } from "@/types/form-question";

import {
  FormQuestionDependencyCreate,
  formQuestionDependencyService,
  type DependencyAction,
  type DependencyComparisonSourceType,
  type DependencyComparisonValue,
  type DependencyCondition,
  type DependencyConditionGroup,
  type DependencyConditionOperator,
  type DependencyLogicalOperator,
  type FormQuestionDependency,
} from "@/services/form-question-dependency.service";
import { toast } from "sonner";
import { DependencyActionEditor } from "./dependency-action-editor";

interface FormQuestionDependencyDialogProps {
  formId: number;
  sectionId: number;
  targetQuestion: FormQuestion;
  allQuestions: FormQuestion[];
  sections: Array<{
    id: number;
    name: string;
  }>;
  isPending: boolean;
  onClose: () => void;
  onChanged: () => void;
}

const conditionOperators: Array<{
  value: DependencyConditionOperator;
  label: string;
}> = [
  {
    value: "EQUALS",
    label: "Est égal à",
  },
  {
    value: "NOT_EQUALS",
    label: "Est différent de",
  },
  {
    value: "IN",
    label: "Est parmi",
  },
  {
    value: "NOT_IN",
    label: "N'est pas parmi",
  },
  {
    value: "GREATER_THAN",
    label: "Est supérieur à",
  },
  {
    value: "GREATER_THAN_OR_EQUALS",
    label: "Est supérieur ou égal à",
  },
  {
    value: "LESS_THAN",
    label: "Est inférieur à",
  },
  {
    value: "LESS_THAN_OR_EQUALS",
    label: "Est inférieur ou égal à",
  },
  {
    value: "CONTAINS",
    label: "Contient",
  },
  {
    value: "NOT_CONTAINS",
    label: "Ne contient pas",
  },
  {
    value: "IS_EMPTY",
    label: "Est vide",
  },
  {
    value: "IS_NOT_EMPTY",
    label: "N'est pas vide",
  },
];

const choiceTypes = new Set([
  "SINGLE_CHOICE",
  "MULTIPLE_CHOICE",
  "DROPDOWN",
  "AUTOCOMPLETE",
  "LIKERT_SCALE",
]);

const getAvailableConditionOperators = (
  questionType: string | null,
): Array<{
  value: DependencyConditionOperator;
  label: string;
}> => {
  if (!questionType) {
    return [];
  }

  if (choiceTypes.has(questionType)) {
    return conditionOperators.filter((operator) =>
      [
        "EQUALS",
        "NOT_EQUALS",
        "IN",
        "NOT_IN",
        "IS_EMPTY",
        "IS_NOT_EMPTY",
      ].includes(operator.value),
    );
  }

  if (
    questionType === "INTEGER" ||
    questionType === "DECIMAL" ||
    questionType === "PERCENTAGE" ||
    questionType === "CURRENCY" ||
    questionType === "DATE" ||
    questionType === "DATETIME"
  ) {
    return conditionOperators.filter((operator) =>
      [
        "EQUALS",
        "NOT_EQUALS",
        "GREATER_THAN",
        "GREATER_THAN_OR_EQUALS",
        "LESS_THAN",
        "LESS_THAN_OR_EQUALS",
        "IS_EMPTY",
        "IS_NOT_EMPTY",
      ].includes(operator.value),
    );
  }

  return conditionOperators.filter((operator) =>
    [
      "EQUALS",
      "NOT_EQUALS",
      "CONTAINS",
      "NOT_CONTAINS",
      "IS_EMPTY",
      "IS_NOT_EMPTY",
    ].includes(operator.value),
  );
};

export function FormQuestionDependencyDialog({
  formId,
  sectionId,
  targetQuestion,
  allQuestions,
  sections,
  isPending,
  onClose,
  onChanged,
}: FormQuestionDependencyDialogProps) {
  const queryClient = useQueryClient();

  const [logicalOperator, setLogicalOperator] =
    useState<DependencyLogicalOperator>("AND");

  const [sourceQuestionId, setSourceQuestionId] = useState<number | null>(null);

  const [conditionOperator, setConditionOperator] =
    useState<DependencyConditionOperator>("EQUALS");

  const [comparisonSourceType, setComparisonSourceType] =
    useState<DependencyComparisonSourceType>("CONSTANT");

  const [comparisonValue, setComparisonValue] = useState<string>("");

  const [comparisonQuestionId, setComparisonQuestionId] = useState<
    number | null
  >(null);

  const [actionsIfTrue, setActionsIfTrue] = useState<DependencyAction[]>([]);

  const [actionsIfFalse, setActionsIfFalse] = useState<DependencyAction[]>([]);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [editingDependencyId, setEditingDependencyId] = useState<number | null>(
    null,
  );

  const dependenciesQuery = useQuery({
    queryKey: [
      "form-question-dependencies",
      formId,
      sectionId,
      targetQuestion.id,
    ],

    queryFn: async () => {
      const response = await formQuestionDependencyService.list(
        formId,
        sectionId,
        targetQuestion.id,
      );

      return response.data ?? [];
    },

    enabled: formId > 0 && sectionId > 0 && targetQuestion.id > 0,
  });

  const dependencies = dependenciesQuery.data ?? [];

  const availableSourceQuestions = useMemo(
    () => allQuestions.filter((question) => question.id !== targetQuestion.id),
    [allQuestions, targetQuestion.id],
  );

  const selectedSourceQuestion =
    availableSourceQuestions.find(
      (question) => question.id === sourceQuestionId,
    ) ?? null;

  const sourceIsChoice =
    selectedSourceQuestion !== null &&
    choiceTypes.has(selectedSourceQuestion.question_type);

  const availableConditionOperators = getAvailableConditionOperators(
    selectedSourceQuestion?.question_type ?? null,
  );

  const buildCondition = (): DependencyCondition | null => {
    if (sourceQuestionId === null) {
      return null;
    }

    const comparison: DependencyComparisonValue = {
      source_type: comparisonSourceType,
    };

    if (comparisonSourceType === "CONSTANT") {
      comparison.value = comparisonValue.trim();
    } else {
      comparison.question_id = comparisonQuestionId;
    }

    return {
      source_question_id: sourceQuestionId,
      operator: conditionOperator,
      comparison_value: comparison,
    };
  };

  const buildConditionGroup = (): DependencyConditionGroup | null => {
    const condition = buildCondition();

    if (condition === null) {
      return null;
    }

    return {
      operator: logicalOperator,
      conditions: [condition],
      groups: [],
    };
  };

  const validateAction = (action: DependencyAction): string | null => {
    if (!action.type) {
      return "Le type d'action est obligatoire.";
    }

    if (action.target_type !== "QUESTION" && action.target_type !== "SECTION") {
      return "Le type de cible est invalide.";
    }

    if (!Number.isInteger(action.target_id) || action.target_id <= 0) {
      return "Veuillez sélectionner une cible.";
    }

    if (action.type === "REPEAT_SECTION") {
      if (action.target_type !== "SECTION") {
        return "REPEAT_SECTION doit cibler une section.";
      }

      const countSource = action.config?.count_source;

      if (
        typeof countSource !== "object" ||
        countSource === null ||
        !("source_type" in countSource) ||
        countSource.source_type !== "QUESTION" ||
        !("question_id" in countSource) ||
        typeof countSource.question_id !== "number" ||
        countSource.question_id <= 0
      ) {
        return (
          "REPEAT_SECTION nécessite une question source " +
          "pour le nombre de répétitions."
        );
      }

      const minimum =
        typeof action.config?.minimum === "number" ? action.config.minimum : 0;

      const maximum =
        typeof action.config?.maximum === "number"
          ? action.config.maximum
          : null;

      if (minimum < 0) {
        return "Le minimum ne peut pas être négatif.";
      }

      if (maximum !== null && maximum < minimum) {
        return "Le maximum doit être supérieur ou égal " + "au minimum.";
      }
    }

    if (action.type === "COPY_VALUE") {
      const sourceQuestionId = action.config?.source_question_id;

      if (typeof sourceQuestionId !== "number" || sourceQuestionId <= 0) {
        return "COPY_VALUE nécessite une question source.";
      }
    }

    if (action.type === "SET_VALUE") {
      if (
        action.config?.value === undefined ||
        action.config?.value === null ||
        action.config?.value === ""
      ) {
        return "SET_VALUE nécessite une valeur.";
      }
    }

    if (action.type === "FILTER_OPTIONS") {
      if (
        typeof action.config?.filter_field !== "string" ||
        !action.config.filter_field.trim()
      ) {
        return "FILTER_OPTIONS nécessite un champ " + "de filtrage.";
      }

      if (
        action.config?.filter_value === undefined ||
        action.config?.filter_value === null ||
        action.config?.filter_value === ""
      ) {
        return "FILTER_OPTIONS nécessite une valeur " + "de filtrage.";
      }
    }

    return null;
  };

  const validateActions = (
    actions: DependencyAction[],
    label: string,
  ): string | null => {
    for (let index = 0; index < actions.length; index += 1) {
      const error = validateAction(actions[index]);

      if (error) {
        return `${label} — Action ${index + 1} : ${error}`;
      }
    }

    return null;
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const condition = buildConditionGroup();

      if (condition === null) {
        throw new Error("Veuillez sélectionner une question source.");
      }

      if (
        comparisonSourceType === "CONSTANT" &&
        !comparisonValue.trim() &&
        !["IS_EMPTY", "IS_NOT_EMPTY"].includes(conditionOperator)
      ) {
        throw new Error("Veuillez renseigner la valeur de comparaison.");
      }

      if (
        comparisonSourceType === "QUESTION" &&
        comparisonQuestionId === null
      ) {
        throw new Error("Veuillez sélectionner la question de comparaison.");
      }

      if (actionsIfTrue.length === 0 && actionsIfFalse.length === 0) {
        toast.error("La règle doit contenir au moins une action.");

        return;
      }

      const payload: FormQuestionDependencyCreate = {
        condition,
        actions_if_true: actionsIfTrue,
        actions_if_false: actionsIfFalse,
      };

      const trueActionsError = validateActions(
        actionsIfTrue,
        "Si la condition est vraie",
      );

      if (trueActionsError) {
        toast.error(trueActionsError);
        return;
      }

      const falseActionsError = validateActions(
        actionsIfFalse,
        "Si la condition est fausse",
      );

      if (falseActionsError) {
        toast.error(falseActionsError);
        return;
      }

      if (editingDependencyId !== null) {
        return formQuestionDependencyService.update(
          formId,
          sectionId,
          targetQuestion.id,
          editingDependencyId,
          payload,
        );
      }

      return formQuestionDependencyService.create(
        formId,
        sectionId,
        targetQuestion.id,
        payload,
      );
    },

    onSuccess: async () => {
      setEditingDependencyId(null);
      setLogicalOperator("AND");
      setSourceQuestionId(null);
      setConditionOperator("EQUALS");
      setComparisonSourceType("CONSTANT");
      setComparisonValue("");
      setComparisonQuestionId(null);
      setActionsIfTrue([]);
      setActionsIfFalse([]);

      await queryClient.invalidateQueries({
        queryKey: [
          "form-question-dependencies",
          formId,
          sectionId,
          targetQuestion.id,
        ],
      });

      toast.success("Dépendance mise à jour avec succès");

      onChanged();
    },

    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible d'ajouter la dépendance.";

      toast.error(message);

      // console.error("Erreur ajout dépendance:", message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (dependencyId: number) => {
      return formQuestionDependencyService.delete(
        formId,
        sectionId,
        targetQuestion.id,
        dependencyId,
      );
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          "form-question-dependencies",
          formId,
          sectionId,
          targetQuestion.id,
        ],
      });

      toast.success("Dépendance supprimée avec succès");

      onChanged();
    },

    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de supprimer la dépendance.";

      toast.error(message);

      // console.error("Erreur suppression dépendance:", message);
    },

    onSettled: () => {
      setDeletingId(null);
    },
  });

  const handleDelete = (dependencyId: number) => {
    if (createMutation.isPending || deleteMutation.isPending) {
      return;
    }

    setDeletingId(dependencyId);

    deleteMutation.mutate(dependencyId);
  };

  const isSaving = createMutation.isPending || deleteMutation.isPending;

  const isLoading = dependenciesQuery.isLoading;

  const getQuestionName = (questionId: number) => {
    return (
      allQuestions.find((question) => question.id === questionId)
        ?.question_name ?? `Question #${questionId}`
    );
  };

  const loadDependencyIntoForm = (dependency: FormQuestionDependency) => {
    const condition = dependency.condition?.conditions?.[0];

    if (!condition) {
      toast.error("Cette dépendance ne contient aucune condition.");
      return;
    }

    setEditingDependencyId(dependency.id);

    setLogicalOperator(dependency.condition?.operator ?? "AND");

    setSourceQuestionId(condition.source_question_id ?? null);

    setConditionOperator(condition.operator ?? "EQUALS");

    const comparison = condition.comparison_value;

    if (comparison?.source_type === "QUESTION") {
      setComparisonSourceType("QUESTION");

      setComparisonQuestionId(comparison.question_id ?? null);

      setComparisonValue("");
    } else {
      setComparisonSourceType("CONSTANT");

      setComparisonQuestionId(null);

      setComparisonValue(
        comparison?.value !== undefined && comparison?.value !== null
          ? String(comparison.value)
          : "",
      );
    }

    setActionsIfTrue(dependency.actions_if_true ?? []);

    setActionsIfFalse(dependency.actions_if_false ?? []);
  };

  const formatCondition = (condition: DependencyCondition): string => {
    const sourceName = getQuestionName(condition.source_question_id);

    let comparison = "";

    if (condition.comparison_value?.source_type === "QUESTION") {
      const questionId = condition.comparison_value.question_id;

      comparison =
        questionId !== null && questionId !== undefined
          ? getQuestionName(questionId)
          : "Question inconnue";
    } else {
      const value = condition.comparison_value?.value;

      comparison =
        value !== null && value !== undefined && String(value).trim() !== ""
          ? String(value)
          : "vide";
    }

    return `${sourceName} ${condition.operator} ${comparison}`;
  };

  const formatAction = (action: DependencyAction): string => {
    const actionLabels: Record<DependencyAction["type"], string> = {
      SHOW: "Afficher",
      HIDE: "Masquer",
      ENABLE: "Activer",
      DISABLE: "Désactiver",
      REQUIRE: "Rendre obligatoire",
      OPTIONAL: "Rendre facultatif",
      READONLY: "Rendre en lecture seule",
      EDITABLE: "Rendre modifiable",
      SET_VALUE: "Définir la valeur",
      COPY_VALUE: "Copier la valeur depuis",
      FILTER_OPTIONS: "Filtrer les options de",
      CLEAR_VALUE: "Effacer la valeur de",
      REPEAT_SECTION: "Répéter la section",
    };

    const actionLabel = actionLabels[action.type] ?? action.type;

    let targetLabel = "";

    if (action.target_type === "QUESTION") {
      targetLabel = getQuestionName(action.target_id);
    } else {
      const section = sections.find((item) => item.id === action.target_id);

      targetLabel = section?.name ?? `Section #${action.target_id}`;
    }

    if (action.type === "SET_VALUE") {
      const value = action.config?.value;

      return `${actionLabel} "${targetLabel}" → ${String(value ?? "")}`;
    }

    if (action.type === "COPY_VALUE") {
      const sourceQuestionId = action.config?.source_question_id;

      return `${actionLabel} "${getQuestionName(
        Number(sourceQuestionId),
      )}" vers "${targetLabel}"`;
    }

    if (action.type === "FILTER_OPTIONS") {
      const filterField = action.config?.filter_field;
      const filterValue = action.config?.filter_value;

      return `${actionLabel} "${targetLabel}" (${String(
        filterField ?? "",
      )} = ${String(filterValue ?? "")})`;
    }

    return `${actionLabel} "${targetLabel}"`;
  };

  // const sourceQuestion = allQuestions.find(
  //   (question) => question.id === sourceQuestionId,
  // );

  // const sourceQuestionType = sourceQuestion?.question_type ?? null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        background: "rgba(0, 0, 0, 0.35)",
        backdropFilter: "blur(4px)",
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPending && !isSaving) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          width: "100%",
          maxWidth: "620px",
          maxHeight: "min(760px, 88vh)",
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
              }}
            >
              Dépendances
            </div>

            <div
              style={{
                marginTop: "0.25rem",
                fontSize: "0.75rem",
                color: "var(--color-foreground-muted)",
              }}
            >
              {targetQuestion.question_name}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPending || isSaving}
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
              padding: "0.875rem",
              border: "1px solid var(--color-border)",
              borderRadius: "0.75rem",
              background: "var(--color-surface-raised)",
            }}
          >
            <div
              style={{
                marginBottom: "0.75rem",
                fontSize: "0.75rem",
                fontWeight: 700,
                position: "relative",
              }}
            >
              {editingDependencyId !== null
                ? "Modifier la règle de dépendance"
                : "Ajouter une règle de dépendance"}

              {editingDependencyId !== null && (
                <button
                  type="button"
                  disabled={isPending || isSaving}
                  onClick={() => {
                    setEditingDependencyId(null);
                    setLogicalOperator("AND");
                    setSourceQuestionId(null);
                    setConditionOperator("EQUALS");
                    setComparisonSourceType("CONSTANT");
                    setComparisonValue("");
                    setComparisonQuestionId(null);
                    setActionsIfTrue([]);
                    setActionsIfFalse([]);
                  }}
                  title="Annuler la modification"
                  style={{
                    padding: 0,
                    border: "none",
                    background: "transparent",
                    color: "var(--color-foreground-muted)",
                    fontSize: "0.6875rem",
                    cursor: isPending || isSaving ? "not-allowed" : "pointer",
                    position: "absolute",
                    right: 0,
                    fontWeight: "bold",
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.875rem",
              }}
            >
              {/* ===================================================== */}
              {/* LOGIQUE DES CONDITIONS                                */}
              {/* ===================================================== */}

              <label>
                <span style={labelStyle}>Logique des conditions</span>

                <select
                  value={logicalOperator}
                  disabled={isPending || isSaving}
                  onChange={(event) => {
                    setLogicalOperator(
                      event.target.value as DependencyLogicalOperator,
                    );
                  }}
                  style={inputStyle}
                >
                  <option value="AND">
                    Toutes les conditions doivent être vraies
                  </option>

                  <option value="OR">
                    Au moins une condition doit être vraie
                  </option>
                </select>
              </label>

              {/* ===================================================== */}
              {/* CONDITION                                             */}
              {/* ===================================================== */}

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
                    marginBottom: "0.75rem",
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                  }}
                >
                  Condition
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  {/* QUESTION SOURCE */}

                  <label>
                    <span style={labelStyle}>Question source</span>

                    <select
                      value={sourceQuestionId ?? ""}
                      disabled={isPending || isSaving}
                      onChange={(event) => {
                        const id = event.target.value;

                        setSourceQuestionId(id ? Number(id) : null);
                        setComparisonValue("");
                        setComparisonQuestionId(null);
                        setConditionOperator("EQUALS");
                      }}
                      style={inputStyle}
                    >
                      <option value="">Sélectionner une question</option>

                      {availableSourceQuestions.map((question) => (
                        <option key={question.id} value={question.id}>
                          {question.question_name}
                        </option>
                      ))}
                    </select>
                  </label>

                  {/* OPERATEUR */}

                  <label>
                    <span style={labelStyle}>Opérateur</span>

                    <select
                      value={conditionOperator}
                      disabled={isPending || isSaving}
                      onChange={(event) => {
                        setConditionOperator(
                          event.target.value as DependencyConditionOperator,
                        );
                      }}
                      style={inputStyle}
                    >
                      {availableConditionOperators.map((operator) => (
                        <option key={operator.value} value={operator.value}>
                          {operator.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  {/* TYPE DE COMPARAISON */}

                  {!["IS_EMPTY", "IS_NOT_EMPTY"].includes(
                    conditionOperator,
                  ) && (
                    <label>
                      <span style={labelStyle}>Comparer avec</span>

                      <select
                        value={comparisonSourceType}
                        disabled={isPending || isSaving}
                        onChange={(event) => {
                          setComparisonSourceType(
                            event.target
                              .value as DependencyComparisonSourceType,
                          );

                          setComparisonValue("");
                          setComparisonQuestionId(null);
                        }}
                        style={inputStyle}
                      >
                        <option value="CONSTANT">Une valeur</option>

                        <option value="QUESTION">Une autre question</option>
                      </select>
                    </label>
                  )}

                  {/* VALEUR CONSTANTE */}

                  {!["IS_EMPTY", "IS_NOT_EMPTY"].includes(conditionOperator) &&
                    comparisonSourceType === "CONSTANT" && (
                      <label>
                        <span style={labelStyle}>Valeur à vérifier</span>

                        {sourceIsChoice && selectedSourceQuestion ? (
                          <select
                            value={comparisonValue}
                            disabled={isPending || isSaving}
                            onChange={(event) => {
                              setComparisonValue(event.target.value);
                            }}
                            style={inputStyle}
                          >
                            <option value="">Sélectionner une valeur</option>

                            {selectedSourceQuestion.options.map((option) => (
                              <option key={option.id} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={
                              selectedSourceQuestion?.question_type ===
                                "INTEGER" ||
                              selectedSourceQuestion?.question_type ===
                                "DECIMAL" ||
                              selectedSourceQuestion?.question_type ===
                                "PERCENTAGE" ||
                              selectedSourceQuestion?.question_type ===
                                "CURRENCY"
                                ? "number"
                                : selectedSourceQuestion?.question_type ===
                                    "DATE"
                                  ? "date"
                                  : selectedSourceQuestion?.question_type ===
                                      "DATETIME"
                                    ? "datetime-local"
                                    : "text"
                            }
                            value={comparisonValue}
                            disabled={isPending || isSaving}
                            onChange={(event) => {
                              setComparisonValue(event.target.value);
                            }}
                            placeholder="Valeur attendue"
                            style={inputStyle}
                          />
                        )}
                      </label>
                    )}

                  {/* QUESTION DE COMPARAISON */}

                  {!["IS_EMPTY", "IS_NOT_EMPTY"].includes(conditionOperator) &&
                    comparisonSourceType === "QUESTION" && (
                      <label>
                        <span style={labelStyle}>Question de comparaison</span>

                        <select
                          value={comparisonQuestionId ?? ""}
                          disabled={isPending || isSaving}
                          onChange={(event) => {
                            const id = event.target.value;

                            setComparisonQuestionId(id ? Number(id) : null);
                          }}
                          style={inputStyle}
                        >
                          <option value="">Sélectionner une question</option>

                          {allQuestions
                            .filter(
                              (question) =>
                                question.id !== targetQuestion.id &&
                                question.id !== sourceQuestionId,
                            )
                            .map((question) => (
                              <option key={question.id} value={question.id}>
                                {question.question_name}
                              </option>
                            ))}
                        </select>
                      </label>
                    )}
                </div>
              </div>

              {/* ===================================================== */}
              {/* ACTION SI VRAI                                       */}
              {/* ===================================================== */}

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
                    marginBottom: "0.75rem",
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                  }}
                >
                  Si la condition est vraie
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  {actionsIfTrue.map((action, index) => (
                    <DependencyActionEditor
                      key={index}
                      action={action}
                      questions={allQuestions.map((question) => ({
                        id: question.id,
                        question_name: question.question_name,
                        question_type: question.question_type,
                      }))}
                      sections={sections}
                      disabled={isPending || isSaving}
                      onChange={(updatedAction) => {
                        setActionsIfTrue((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index ? updatedAction : item,
                          ),
                        );
                      }}
                      onRemove={() => {
                        setActionsIfTrue((current) =>
                          current.filter((_, itemIndex) => itemIndex !== index),
                        );
                      }}
                    />
                  ))}

                  <button
                    type="button"
                    disabled={isPending || isSaving}
                    onClick={() => {
                      setActionsIfTrue((current) => [
                        ...current,
                        {
                          type: "SHOW",
                          target_type: "QUESTION",
                          target_id: targetQuestion.id,
                          config: {},
                        },
                      ]);
                    }}
                    style={secondaryButtonStyle}
                  >
                    <Plus size={14} />
                    Ajouter une action
                  </button>
                </div>
              </div>

              {/* ===================================================== */}
              {/* ACTION SI FAUX                                       */}
              {/* ===================================================== */}

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
                    marginBottom: "0.75rem",
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                  }}
                >
                  Si la condition est fausse
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  {actionsIfFalse.map((action, index) => (
                    <DependencyActionEditor
                      key={index}
                      action={action}
                      questions={allQuestions.map((question) => ({
                        id: question.id,
                        question_name: question.question_name,
                        question_type: question.question_type,
                      }))}
                      sections={sections}
                      disabled={isPending || isSaving}
                      onChange={(updatedAction) => {
                        setActionsIfFalse((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index ? updatedAction : item,
                          ),
                        );
                      }}
                      onRemove={() => {
                        setActionsIfFalse((current) =>
                          current.filter((_, itemIndex) => itemIndex !== index),
                        );
                      }}
                    />
                  ))}

                  <button
                    type="button"
                    disabled={isPending || isSaving}
                    onClick={() => {
                      setActionsIfFalse((current) => [
                        ...current,
                        {
                          type: "HIDE",
                          target_type: "QUESTION",
                          target_id: targetQuestion.id,
                          config: {},
                        },
                      ]);
                    }}
                    style={secondaryButtonStyle}
                  >
                    <Plus size={14} />
                    Ajouter une action
                  </button>
                </div>
              </div>

              {/* ===================================================== */}
              {/* BOUTON ENREGISTRER                                   */}
              {/* ===================================================== */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  onClick={() => createMutation.mutate()}
                  disabled={
                    isPending ||
                    isSaving ||
                    sourceQuestionId === null ||
                    (comparisonSourceType === "CONSTANT" &&
                      !["IS_EMPTY", "IS_NOT_EMPTY"].includes(
                        conditionOperator,
                      ) &&
                      !comparisonValue.trim()) ||
                    (comparisonSourceType === "QUESTION" &&
                      comparisonQuestionId === null)
                  }
                  style={{
                    ...primaryButtonStyle,
                    opacity:
                      isPending ||
                      isSaving ||
                      sourceQuestionId === null ||
                      (comparisonSourceType === "CONSTANT" &&
                        !["IS_EMPTY", "IS_NOT_EMPTY"].includes(
                          conditionOperator,
                        ) &&
                        !comparisonValue.trim()) ||
                      (comparisonSourceType === "QUESTION" &&
                        comparisonQuestionId === null)
                        ? 0.5
                        : 1,
                  }}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      {editingDependencyId !== null
                        ? "Modifier la règle"
                        : "Enregistrer la règle"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: "1rem",
            }}
          >
            <div
              style={{
                marginBottom: "0.625rem",
                fontSize: "0.75rem",
                fontWeight: 700,
              }}
            >
              Dépendances existantes
            </div>

            {isLoading ? (
              <div
                style={{
                  minHeight: "100px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Loader2 size={20} className="animate-spin" />
              </div>
            ) : dependenciesQuery.isError ? (
              <div
                style={{
                  padding: "1rem",
                  border: "1px dashed var(--color-border)",
                  borderRadius: "0.625rem",
                  textAlign: "center",
                  fontSize: "0.75rem",
                  color: "#EF4444",
                }}
              >
                Impossible de charger les dépendances.
              </div>
            ) : dependencies.length === 0 ? (
              <div
                style={{
                  padding: "1rem",
                  border: "1px dashed var(--color-border)",
                  borderRadius: "0.625rem",
                  textAlign: "center",
                  fontSize: "0.75rem",
                  color: "var(--color-foreground-muted)",
                }}
              >
                Aucune dépendance configurée.
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.375rem",
                }}
              >
                {dependencies.map((dependency: FormQuestionDependency) => {
                  const conditions = dependency.condition?.conditions ?? [];

                  const nestedGroups = dependency.condition?.groups ?? [];

                  const allConditions = [
                    ...conditions,
                    ...nestedGroups.flatMap((group) => group.conditions ?? []),
                  ];

                  const conditionText =
                    allConditions.length > 0
                      ? allConditions
                          .map((condition) => formatCondition(condition))
                          .join(
                            dependency.condition.operator === "AND"
                              ? " ET "
                              : " OU ",
                          )
                      : "Aucune condition";

                  const trueActions = dependency.actions_if_true ?? [];

                  const falseActions = dependency.actions_if_false ?? [];

                  return (
                    <div
                      key={dependency.id}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.625rem",
                        padding: "0.75rem",
                        border: "1px solid var(--color-border)",
                        borderRadius: "0.625rem",
                        background: "var(--color-surface)",
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        {/* CONDITION */}

                        <div
                          style={{
                            fontSize: "0.6875rem",
                            fontWeight: 600,
                          }}
                        >
                          SI
                        </div>

                        <div
                          style={{
                            marginTop: "0.25rem",
                            fontSize: "0.6875rem",
                          }}
                        >
                          {conditionText}
                        </div>

                        {/* ACTIONS TRUE */}

                        <div
                          style={{
                            marginTop: "0.625rem",
                            fontSize: "0.625rem",
                            color: "var(--color-foreground-muted)",
                          }}
                        >
                          <strong>Si vrai :</strong>

                          {trueActions.length === 0 ? (
                            <span> aucune action</span>
                          ) : (
                            <div
                              style={{
                                marginTop: "0.25rem",
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.2rem",
                              }}
                            >
                              {trueActions.map((action, actionIndex) => (
                                <div key={actionIndex}>
                                  • {formatAction(action)}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* ACTIONS FALSE */}

                        <div
                          style={{
                            marginTop: "0.5rem",
                            fontSize: "0.625rem",
                            color: "var(--color-foreground-muted)",
                          }}
                        >
                          <strong>Si faux :</strong>

                          {falseActions.length === 0 ? (
                            <span> aucune action</span>
                          ) : (
                            <div
                              style={{
                                marginTop: "0.25rem",
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.2rem",
                              }}
                            >
                              {falseActions.map((action, actionIndex) => (
                                <div key={actionIndex}>
                                  • {formatAction(action)}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* MODIFICATION */}

                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => loadDependencyIntoForm(dependency)}
                        style={{
                          width: "30px",
                          height: "30px",
                          flexShrink: 0,
                          border: "1px solid transparent",
                          background: "transparent",
                          color: "var(--color-foreground-muted)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: isSaving ? "not-allowed" : "pointer",
                        }}
                      >
                        <Edit3 size={14} />
                      </button>

                      {/* SUPPRESSION */}

                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleDelete(dependency.id)}
                        style={{
                          width: "30px",
                          height: "30px",
                          flexShrink: 0,
                          border: "1px solid transparent",
                          background: "transparent",
                          color: "#EF4444",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: isSaving ? "not-allowed" : "pointer",
                        }}
                      >
                        {deletingId === dependency.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "0.875rem 1.125rem",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isPending || isSaving}
            style={secondaryButtonStyle}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: "0.375rem",
  fontSize: "0.6875rem",
  fontWeight: 600,
};

const inputStyle = {
  width: "100%",
  height: "38px",
  padding: "0 0.75rem",
  borderRadius: "0.5rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface)",
  color: "var(--color-foreground)",
  fontSize: "0.75rem",
  outline: "none",
  boxSizing: "border-box" as const,
};

const closeButtonStyle = {
  width: "32px",
  height: "32px",
  borderRadius: "0.5rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface-raised)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
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
  fontSize: "0.75rem",
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryButtonStyle = {
  height: "38px",
  padding: "0 0.875rem",
  borderRadius: "0.625rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface-raised)",
  color: "var(--color-foreground)",
  fontSize: "0.75rem",
  fontWeight: 600,
  cursor: "pointer",
};
