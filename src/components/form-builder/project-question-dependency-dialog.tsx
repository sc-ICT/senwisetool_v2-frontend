"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";

import { ApiError } from "@/lib/api";

import type { ProjectQuestion } from "@/types/project-question";

import {
  projectQuestionDependencyService,
  type ProjectQuestionDependency,
  type ProjectQuestionDependencyOperator,
} from "@/services/project-question-dependency.service";

interface ProjectQuestionDependencyDialogProps {
  projectId: number;
  sectionId: number;
  targetQuestion: ProjectQuestion;
  allQuestions: ProjectQuestion[];
  isPending: boolean;
  onClose: () => void;
  onChanged: () => void;
}

const operators: Array<{
  value: ProjectQuestionDependencyOperator;
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
];

const choiceTypes = new Set([
  "SINGLE_CHOICE",
  "MULTIPLE_CHOICE",
  "DROPDOWN",
  "AUTOCOMPLETE",
  "LIKERT_SCALE",
]);

export function ProjectQuestionDependencyDialog({
  projectId,
  sectionId,
  targetQuestion,
  allQuestions,
  isPending,
  onClose,
  onChanged,
}: ProjectQuestionDependencyDialogProps) {
  const queryClient = useQueryClient();

  const [sourceQuestionId, setSourceQuestionId] = useState<number | null>(null);

  const [operator, setOperator] =
    useState<ProjectQuestionDependencyOperator>("EQUALS");

  const [value, setValue] = useState("");

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const dependenciesQuery = useQuery({
    queryKey: [
      "project-question-dependencies",
      projectId,
      sectionId,
      targetQuestion.id,
    ],

    queryFn: async () => {
      const response = await projectQuestionDependencyService.list(
        projectId,
        sectionId,
        targetQuestion.id,
      );

      return response.data ?? [];
    },

    enabled: projectId > 0 && sectionId > 0 && targetQuestion.id > 0,
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

  const createMutation = useMutation({
    mutationFn: async () => {
      if (sourceQuestionId === null || !value.trim()) {
        throw new Error("Veuillez renseigner la question source et la valeur.");
      }

      return projectQuestionDependencyService.create(
        projectId,
        sectionId,
        targetQuestion.id,
        {
          source_question_id: sourceQuestionId,
          operator,
          value: value.trim(),
        },
      );
    },

    onSuccess: async () => {
      setSourceQuestionId(null);
      setOperator("EQUALS");
      setValue("");

      await queryClient.invalidateQueries({
        queryKey: [
          "project-question-dependencies",
          projectId,
          sectionId,
          targetQuestion.id,
        ],
      });

      onChanged();
    },

    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible d'ajouter la dépendance.";

      // Le composant parent utilise déjà
      // son système de notification.
      // On évite donc ici de dupliquer
      // toute une logique d'erreur.
      console.error("Erreur ajout dépendance:", message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (dependencyId: number) => {
      return projectQuestionDependencyService.delete(
        projectId,
        sectionId,
        targetQuestion.id,
        dependencyId,
      );
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          "project-question-dependencies",
          projectId,
          sectionId,
          targetQuestion.id,
        ],
      });

      onChanged();
    },

    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de supprimer la dépendance.";

      console.error("Erreur suppression dépendance:", message);
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
              }}
            >
              Ajouter une dépendance
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <label>
                <span style={labelStyle}>Question source</span>

                <select
                  value={sourceQuestionId ?? ""}
                  disabled={isPending || isSaving}
                  onChange={(event) => {
                    const id = event.target.value;

                    setSourceQuestionId(id ? Number(id) : null);

                    setValue("");
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

              <label>
                <span style={labelStyle}>Condition</span>

                <select
                  value={operator}
                  disabled={isPending || isSaving}
                  onChange={(event) => {
                    setOperator(
                      event.target.value as ProjectQuestionDependencyOperator,
                    );
                  }}
                  style={inputStyle}
                >
                  {operators.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span style={labelStyle}>Valeur</span>

                {sourceIsChoice && selectedSourceQuestion ? (
                  <select
                    value={value}
                    disabled={isPending || isSaving}
                    onChange={(event) => {
                      setValue(event.target.value);
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
                    type="text"
                    value={value}
                    disabled={isPending || isSaving}
                    onChange={(event) => {
                      setValue(event.target.value);
                    }}
                    placeholder="Valeur attendue"
                    style={inputStyle}
                  />
                )}
              </label>

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
                    !value.trim()
                  }
                  style={{
                    ...primaryButtonStyle,
                    opacity:
                      isPending ||
                      isSaving ||
                      sourceQuestionId === null ||
                      !value.trim()
                        ? 0.5
                        : 1,
                  }}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Ajout...
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      Ajouter
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
                {dependencies.map((dependency: ProjectQuestionDependency) => {
                  const source = allQuestions.find(
                    (question) => question.id === dependency.source_question_id,
                  );

                  return (
                    <div
                      key={dependency.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.625rem",
                        padding: "0.625rem 0.75rem",
                        border: "1px solid var(--color-border)",
                        borderRadius: "0.625rem",
                        background: "var(--color-surface)",
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          minWidth: 0,
                          fontSize: "0.6875rem",
                        }}
                      >
                        <strong>
                          {source?.question_name ?? "Question inconnue"}
                        </strong>

                        <span
                          style={{
                            margin: "0 0.35rem",
                            color: "var(--color-foreground-muted)",
                          }}
                        >
                          →
                        </span>

                        <span>{dependency.operator}</span>

                        <span
                          style={{
                            margin: "0 0.35rem",
                            color: "var(--color-foreground-muted)",
                          }}
                        >
                          →
                        </span>

                        <span>{dependency.value}</span>
                      </div>

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
