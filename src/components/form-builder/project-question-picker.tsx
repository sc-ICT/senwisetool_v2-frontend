"use client";

import { Check, Loader2, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import { questionBankService } from "@/services/question-bank.service";
import type { QuestionDefinition } from "@/types/question-bank";

import { questionGroupService } from "@/services/question-group.service";
import { useQuery } from "@tanstack/react-query";

interface ProjectQuestionPickerProps {
  isPending: boolean;

  existingQuestionIds: number[];

  onClose: () => void;

  onSubmit: (
    questions: Array<{
      questionDefinitionId: number;
      questionVersionId: number;
    }>,
  ) => void;
}

export function ProjectQuestionPicker({
  isPending,
  existingQuestionIds,
  onClose,
  onSubmit,
}: ProjectQuestionPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<number>>(
    new Set(),
  );

  const [waitingOnSubmission, setWaitingOnSubmission] =
    useState<boolean>(false);

  const {
    data: questionsData,
    isLoading: questionsLoading,
    error: questionsError,
  } = useQuery({
    queryKey: ["question-bank-picker"],
    queryFn: async () => {
      const response = await questionBankService.list(false);

      return response.data;
    },
  });

  const {
    data: groupsData,
    isLoading: groupsLoading,
    error: groupsError,
  } = useQuery({
    queryKey: ["question-groups-picker"],
    queryFn: async () => {
      const response = await questionGroupService.list(false);

      return response.data;
    },
  });

  const questions = useMemo(() => questionsData?.items ?? [], [questionsData]);

  const groups = useMemo(() => groupsData?.items ?? [], [groupsData]);

  const existingIds = useMemo(
    () => new Set(existingQuestionIds),
    [existingQuestionIds],
  );

  const loading = questionsLoading || groupsLoading;

  const loadingError = questionsError ?? groupsError;

  const filteredQuestions = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();

    let result = questions.filter((question) => !existingIds.has(question.id));

    if (selectedGroupId !== null) {
      const group = groups.find((item) => item.id === selectedGroupId);

      if (group) {
        const questionIds = new Set(group.question_ids);

        result = result.filter((question) => questionIds.has(question.id));
      }
    }

    if (!query) {
      return result;
    }

    return result.filter(
      (question) =>
        question.name.toLocaleLowerCase().includes(query) ||
        question.code.toLocaleLowerCase().includes(query),
    );
  }, [questions, groups, searchQuery, selectedGroupId, existingIds]);

  const toggleQuestion = (questionId: number) => {
    setSelectedQuestionIds((current) => {
      const next = new Set(current);

      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }

      return next;
    });
  };

  const selectVisible = () => {
    setSelectedQuestionIds((current) => {
      const next = new Set(current);

      filteredQuestions.forEach((question) => {
        next.add(question.id);
      });

      return next;
    });
  };

  const deselectVisible = () => {
    setSelectedQuestionIds((current) => {
      const next = new Set(current);

      filteredQuestions.forEach((question) => {
        next.delete(question.id);
      });

      return next;
    });
  };

  const allVisibleSelected =
    filteredQuestions.length > 0 &&
    filteredQuestions.every((question) => selectedQuestionIds.has(question.id));

  const submit = async () => {
    setWaitingOnSubmission(true);

    const selectedQuestions = questions.filter((question) =>
      selectedQuestionIds.has(question.id),
    );

    const resolvedQuestions = [];

    try {
      for (const question of selectedQuestions) {
        const response = await questionBankService.get(question.id);

        const detail = response.data;

        if (!detail) {
          throw new Error(
            `La question « ${question.name} » n'a pas de détail disponible.`,
          );
        }

        const currentVersion = detail.versions.at(-1);

        if (!currentVersion) {
          throw new Error(
            `La question « ${question.name} » ne possède aucune version.`,
          );
        }

        resolvedQuestions.push({
          questionDefinitionId: question.id,
          questionVersionId: currentVersion.id,
        });
      }

      setWaitingOnSubmission(false);
      onSubmit(resolvedQuestions);
    } catch (error) {
      // Le parent affichera éventuellement
      // une notification plus détaillée.
      console.error(error);
    } finally {
      setWaitingOnSubmission(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
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
          maxWidth: "820px",
          maxHeight: "min(760px, 88vh)",
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
              Ajouter des questions
            </div>

            <div
              style={{
                marginTop: "0.25rem",
                fontSize: "0.75rem",
                color: "var(--color-foreground-muted)",
              }}
            >
              Sélectionnez les questions à ajouter à cette section.
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
            padding: "0.875rem 1.125rem",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div
            style={{
              position: "relative",
            }}
          >
            <Search
              size={15}
              style={{
                position: "absolute",
                left: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-foreground-muted)",
                pointerEvents: "none",
              }}
            />

            <input
              type="search"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
              }}
              disabled={isPending}
              placeholder="Rechercher une question..."
              style={searchInputStyle}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            padding: "0.75rem 1.125rem",
            borderBottom: "1px solid var(--color-border)",
            overflowX: "auto",
          }}
        >
          <FilterButton
            label="Toutes"
            count={questions.length}
            active={selectedGroupId === null}
            onClick={() => {
              setSelectedGroupId(null);
            }}
          />

          {groups.map((group) => (
            <FilterButton
              key={group.id}
              label={group.name}
              count={group.question_ids.length}
              active={selectedGroupId === group.id}
              onClick={() => {
                setSelectedGroupId(group.id);
              }}
            />
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
            padding: "0.625rem 1.125rem",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              fontSize: "0.6875rem",
              color: "var(--color-foreground-muted)",
            }}
          >
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={() => {
                if (allVisibleSelected) {
                  deselectVisible();
                } else {
                  selectVisible();
                }
              }}
              disabled={isPending || filteredQuestions.length === 0}
            />
            Tout sélectionner
          </label>

          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#5DB83A",
            }}
          >
            {selectedQuestionIds.size} sélectionnée
            {selectedQuestionIds.size > 1 ? "s" : ""}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            padding: "0.75rem 1.125rem",
          }}
        >
          {loading ? (
            <LoadingState />
          ) : loadingError ? (
            <div
              style={{
                minHeight: "240px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1.5rem",
                textAlign: "center",
                fontSize: "0.8125rem",
                color: "#EF4444",
              }}
            >
              {loadingError instanceof Error
                ? loadingError.message
                : "Impossible de charger les questions."}
            </div>
          ) : filteredQuestions.length === 0 ? (
            <EmptyState />
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.375rem",
              }}
            >
              {filteredQuestions.map((question) => (
                <QuestionPickerRow
                  key={question.id}
                  question={question}
                  selected={selectedQuestionIds.has(question.id)}
                  disabled={isPending}
                  onToggle={() => toggleQuestion(question.id)}
                />
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
            onClick={submit}
            disabled={isPending || selectedQuestionIds.size === 0}
            style={{
              ...primaryButtonStyle,
              opacity: isPending || selectedQuestionIds.size === 0 ? 0.55 : 1,
            }}
          >
            {isPending || waitingOnSubmission ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Ajout...
              </>
            ) : (
              <>
                <Check size={15} />
                Ajouter {selectedQuestionIds.size}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function QuestionPickerRow({
  question,
  selected,
  disabled,
  onToggle,
}: {
  question: QuestionDefinition;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      style={{
        width: "100%",
        minHeight: "56px",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.625rem 0.75rem",
        border: selected
          ? "1px solid rgba(93, 184, 58, 0.35)"
          : "1px solid var(--color-border)",
        borderRadius: "0.625rem",
        background: selected
          ? "rgba(93, 184, 58, 0.07)"
          : "var(--color-surface)",
        color: "var(--color-foreground)",
        cursor: disabled ? "not-allowed" : "pointer",
        textAlign: "left",
      }}
    >
      <div
        style={{
          width: "20px",
          height: "20px",
          flexShrink: 0,
          borderRadius: "0.375rem",
          border: selected
            ? "1px solid #5DB83A"
            : "1px solid var(--color-border)",
          background: selected ? "#5DB83A" : "var(--color-surface-raised)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {selected && <Check size={13} />}
      </div>

      <div
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontSize: "0.8125rem",
            fontWeight: 600,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {question.name}
        </div>

        <div
          style={{
            marginTop: "0.15rem",
            fontSize: "0.625rem",
            color: "var(--color-foreground-muted)",
          }}
        >
          {question.code}
        </div>
      </div>

      <div
        style={{
          flexShrink: 0,
          fontSize: "0.625rem",
          padding: "0.25rem 0.4rem",
          borderRadius: "999px",
          background: "var(--color-surface-raised)",
          color: "var(--color-foreground-muted)",
        }}
      >
        {question.question_type ?? "—"}
      </div>
    </button>
  );
}

function FilterButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flexShrink: 0,
        height: "32px",
        padding: "0 0.625rem",
        borderRadius: "999px",
        border: active
          ? "1px solid rgba(93, 184, 58, 0.3)"
          : "1px solid var(--color-border)",
        background: active
          ? "rgba(93, 184, 58, 0.08)"
          : "var(--color-surface-raised)",
        color: active ? "#5DB83A" : "var(--color-foreground-muted)",
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        fontSize: "0.6875rem",
        fontWeight: active ? 600 : 500,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {label}

      <span
        style={{
          opacity: 0.7,
        }}
      >
        {count}
      </span>
    </button>
  );
}

function LoadingState() {
  return (
    <div
      style={{
        minHeight: "240px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--color-foreground-muted)",
      }}
    >
      <Loader2 size={22} className="animate-spin" />
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        minHeight: "240px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        textAlign: "center",
        fontSize: "0.8125rem",
        color: "var(--color-foreground-muted)",
      }}
    >
      Aucune question ne correspond aux filtres actuels.
    </div>
  );
}

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

const searchInputStyle = {
  width: "100%",
  height: "40px",
  padding: "0 0.75rem 0 2.25rem",
  borderRadius: "0.625rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface-raised)",
  color: "var(--color-foreground)",
  outline: "none",
  fontSize: "0.8125rem",
  boxSizing: "border-box" as const,
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
