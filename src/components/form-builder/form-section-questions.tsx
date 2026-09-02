"use client";

import { GitBranch, Loader2, Plus, Settings, Trash2 } from "lucide-react";

import type { FormQuestion } from "@/types/form-question";
import { useState } from "react";

interface FormSectionQuestionsProps {
  questions: FormQuestion[];
  isLoading: boolean;
  deletingQuestionId: number | null;
  reordering: boolean;
  availableQuestionCount: number;
  onAdd: () => void;
  onDelete: (question: FormQuestion) => void;
  onReorder: (draggedId: number, targetId: number) => void;
  onConfigure: (question: FormQuestion) => void;
  onDependencies: (question: FormQuestion) => void;
}

export function FormSectionQuestions({
  questions,
  isLoading,
  deletingQuestionId,
  reordering,
  availableQuestionCount,
  onAdd,
  onDelete,
  onReorder,
  onConfigure,
  onDependencies,
}: FormSectionQuestionsProps) {
  const [draggedQuestionId, setDraggedQuestionId] = useState<number | null>(
    null,
  );

  const [dragOverQuestionId, setDragOverQuestionId] = useState<number | null>(
    null,
  );

  const noQuestionsAvailable = availableQuestionCount === 0;

  return (
    <div
      style={{
        marginTop: "0.875rem",
        paddingTop: "0.875rem",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          marginBottom: "0.625rem",
        }}
      >
        <div
          style={{
            fontSize: "0.6875rem",
            fontWeight: 700,
            color: "var(--color-foreground-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          Questions{" "}
          <span
            style={{
              fontWeight: 500,
              opacity: 0.7,
            }}
          >
            ({questions.length})
          </span>
          {reordering && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                marginLeft: "0.5rem",
                fontSize: "0.625rem",
                color: "#5DB83A",
                fontWeight: 600,
              }}
            >
              <Loader2 size={12} className="animate-spin" />
              Réorganisation...
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onAdd}
          disabled={noQuestionsAvailable}
          style={{
            height: "30px",
            padding: "0 0.625rem",
            borderRadius: "0.5rem",
            border: "1px solid rgba(93, 184, 58, 0.25)",
            background: "rgba(93, 184, 58, 0.08)",
            color: "#5DB83A",
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            fontSize: "0.6875rem",
            fontWeight: 600,
            opacity: noQuestionsAvailable ? 0.45 : 1,
            cursor: noQuestionsAvailable ? "not-allowed" : "pointer",
          }}
        >
          <Plus size={13} />
          {noQuestionsAvailable
            ? "Toutes les questions ont déjà été ajoutées"
            : "Ajouter"}
        </button>
      </div>

      {isLoading ? (
        <div
          style={{
            height: "72px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Loader2 size={18} className="animate-spin" />
        </div>
      ) : questions.length === 0 ? (
        <button
          type="button"
          disabled={noQuestionsAvailable}
          onClick={onAdd}
          style={{
            width: "100%",
            minHeight: "72px",
            border: noQuestionsAvailable
              ? "1px solid var(--color-border)"
              : "1px dashed var(--color-border)",
            borderRadius: "0.625rem",
            background: "transparent",
            color: "var(--color-foreground-muted)",
            fontSize: "0.75rem",
            cursor: noQuestionsAvailable ? "not-allowed" : "pointer",
            opacity: noQuestionsAvailable ? 0.7 : 1,
          }}
        >
          {noQuestionsAvailable ? (
            <>Toutes les questions disponibles sont déjà dans cette section.</>
          ) : (
            <>
              Aucune question dans cette section.
              <span
                style={{
                  display: "block",
                  marginTop: "0.2rem",
                  color: "#5DB83A",
                  fontWeight: 600,
                }}
              >
                Ajouter une question
              </span>
            </>
          )}
        </button>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.375rem",
          }}
        >
          {questions.map((question) => (
            <FormQuestionRow
              key={question.id}
              question={question}
              isDeleting={deletingQuestionId === question.id}
              dragged={draggedQuestionId === question.id}
              dragOver={dragOverQuestionId === question.id}
              reordering={reordering}
              onDragStart={() => {
                setDraggedQuestionId(question.id);
              }}
              onDragEnd={() => {
                setDraggedQuestionId(null);
                setDragOverQuestionId(null);
              }}
              onDragOver={() => {
                if (draggedQuestionId !== question.id) {
                  setDragOverQuestionId(question.id);
                }
              }}
              onDrop={() => {
                if (draggedQuestionId === null) {
                  return;
                }

                onReorder(draggedQuestionId, question.id);

                setDraggedQuestionId(null);
                setDragOverQuestionId(null);
              }}
              onDelete={() => onDelete(question)}
              onConfigure={() => {
                onConfigure(question);
              }}
              onDependencies={() => {
                onDependencies(question);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FormQuestionRow({
  question,
  dragged,
  dragOver,
  reordering,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  isDeleting,
  onDelete,
  onConfigure,
  onDependencies,
}: {
  question: FormQuestion;

  dragged: boolean;
  dragOver: boolean;
  reordering: boolean;

  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: () => void;
  onDrop: () => void;

  isDeleting: boolean;
  onDelete: () => void;
  onConfigure: () => void;
  onDependencies: () => void;
}) {
  return (
    <div
      draggable={!isDeleting && !reordering}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";

        onDragStart();
      }}
      onDragOver={(event) => {
        event.preventDefault();

        event.dataTransfer.dropEffect = "move";

        onDragOver();
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDrop();
      }}
      onDragEnd={onDragEnd}
      style={{
        minHeight: "52px",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.5rem 0.625rem",
        borderRadius: "0.625rem",
        opacity: dragged ? 0.45 : 1,

        border: dragOver
          ? "1px solid rgba(93, 184, 58, 0.45)"
          : "1px solid var(--color-border)",

        background: dragOver
          ? "rgba(93, 184, 58, 0.06)"
          : "var(--color-surface)",
      }}
    >
      <div
        style={{
          width: "26px",
          height: "26px",
          flexShrink: 0,
          borderRadius: "0.4rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-surface-raised)",
          color: "var(--color-foreground-muted)",
          fontSize: "0.625rem",
          fontWeight: 700,
        }}
      >
        {question.position + 1}
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
            color: "var(--color-foreground)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {question.question_name}
        </div>

        <div
          style={{
            marginTop: "0.125rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.625rem",
            color: "var(--color-foreground-muted)",
          }}
        >
          <span>{question.question_code}</span>

          <span>•</span>

          <span>{question.question_type}</span>

          <span>•</span>

          <span>v{question.version_number}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onDependencies();
        }}
        style={menuButtonStyle}
        title="Dépendances"
      >
        <GitBranch size={14} />
      </button>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onConfigure();
        }}
        style={menuButtonStyle}
        title="Configurer"
      >
        <Settings size={14} />
      </button>

      <button
        type="button"
        disabled={isDeleting}
        onClick={onDelete}
        aria-label={`Retirer ${question.question_name}`}
        style={{
          width: "30px",
          height: "30px",
          flexShrink: 0,
          borderRadius: "0.5rem",
          border: "1px solid transparent",
          background: "transparent",
          color: "#EF4444",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: isDeleting ? "not-allowed" : "pointer",
          opacity: isDeleting ? 0.5 : 1,
        }}
      >
        {isDeleting ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Trash2 size={14} />
        )}
      </button>
    </div>
  );
}

const menuButtonStyle = {
  height: "30px",
  padding: "0 0.5rem",
  borderRadius: "0.5rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface-raised)",
  color: "var(--color-foreground-muted)",
  display: "flex",
  alignItems: "center",
  gap: "0.35rem",
  fontSize: "0.6875rem",
  fontWeight: 600,
  cursor: "pointer",
};
