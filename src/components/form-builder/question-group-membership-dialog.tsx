"use client";

import { Check, Folder, Loader2, Save, X } from "lucide-react";
import { useState } from "react";

export interface GroupMembershipItem {
  id: number;
  name: string;
  selected: boolean;
}

interface QuestionGroupMembershipDialogProps {
  questionName: string;
  groups: GroupMembershipItem[];
  isPending: boolean;
  onClose: () => void;
  onSubmit: (selectedGroupIds: number[], previousGroupIds: number[]) => void;
}

export function QuestionGroupMembershipDialog({
  questionName,
  groups,
  isPending,
  onClose,
  onSubmit,
}: QuestionGroupMembershipDialogProps) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(
    () =>
      new Set(
        groups.filter((group) => group.selected).map((group) => group.id),
      ),
  );

  const toggle = (groupId: number) => {
    setSelectedIds((current) => {
      const next = new Set(current);

      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }

      return next;
    });
  };

  const previousGroupIds = groups
    .filter((group) => group.selected)
    .map((group) => group.id);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 155,
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
        aria-labelledby="group-membership-title"
        style={{
          width: "100%",
          maxWidth: "500px",
          maxHeight: "min(620px, 85vh)",
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
          <div style={{ minWidth: 0 }}>
            <div
              id="group-membership-title"
              style={{
                fontSize: "0.9375rem",
                fontWeight: 700,
                color: "var(--color-foreground)",
              }}
            >
              Organiser dans les groupes
            </div>

            <div
              style={{
                marginTop: "0.25rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontSize: "0.75rem",
                color: "var(--color-foreground-muted)",
              }}
            >
              {questionName}
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
            padding: "0.75rem",
          }}
        >
          {groups.length === 0 ? (
            <div
              style={{
                minHeight: "180px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                color: "var(--color-foreground-muted)",
                fontSize: "0.8125rem",
              }}
            >
              Aucun groupe disponible.
              <br />
              Créez d&#39;abord un groupe.
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.375rem",
              }}
            >
              {groups.map((group) => {
                const selected = selectedIds.has(group.id);

                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => toggle(group.id)}
                    disabled={isPending}
                    style={{
                      width: "100%",
                      minHeight: "46px",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.625rem",
                      padding: "0 0.75rem",
                      border: "1px solid var(--color-border)",
                      borderRadius: "0.625rem",
                      background: selected
                        ? "rgba(93, 184, 58, 0.08)"
                        : "transparent",
                      color: "var(--color-foreground)",
                      cursor: isPending ? "not-allowed" : "pointer",
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
                        background: selected
                          ? "#5DB83A"
                          : "var(--color-surface-raised)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {selected && <Check size={13} />}
                    </div>

                    <Folder size={16} color="#0EA5E9" />

                    <span
                      style={{
                        flex: 1,
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontSize: "0.8125rem",
                        fontWeight: selected ? 600 : 500,
                      }}
                    >
                      {group.name}
                    </span>
                  </button>
                );
              })}
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
            onClick={() => onSubmit(Array.from(selectedIds), previousGroupIds)}
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
