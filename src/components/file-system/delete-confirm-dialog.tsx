"use client";

import { AlertTriangle, File, Folder, Loader2, Trash2, X } from "lucide-react";

import type { FileNode } from "@/types/file-system";

interface DeleteConfirmDialogProps {
  node: FileNode;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({
  node,
  isPending,
  onCancel,
  onConfirm,
}: DeleteConfirmDialogProps) {
  const isFolder = node.type === "FOLDER";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 130,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        background: "rgba(0, 0, 0, 0.35)",
        backdropFilter: "blur(4px)",
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPending) {
          onCancel();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        style={{
          width: "100%",
          maxWidth: "420px",
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
            alignItems: "flex-start",
            justifyContent: "space-between",
            padding: "1rem 1.125rem",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
            }}
          >
            <div
              style={{
                width: "38px",
                height: "38px",
                flexShrink: 0,
                borderRadius: "0.625rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(239, 68, 68, 0.1)",
                color: "#EF4444",
                border: "1px solid rgba(239, 68, 68, 0.18)",
              }}
            >
              <AlertTriangle size={18} />
            </div>

            <div>
              <div
                id="delete-dialog-title"
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: 700,
                  color: "var(--color-foreground)",
                }}
              >
                Supprimer {isFolder ? "le dossier" : "le fichier"}
              </div>

              <div
                style={{
                  marginTop: "0.25rem",
                  fontSize: "0.75rem",
                  color: "var(--color-foreground-muted)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "300px",
                }}
              >
                « {node.name} »
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
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
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>

        <div
          style={{
            padding: "1.25rem",
          }}
        >
          {isFolder ? (
            <div
              style={{
                display: "flex",
                gap: "0.625rem",
                alignItems: "flex-start",
              }}
            >
              <Folder
                size={16}
                style={{
                  marginTop: "2px",
                  flexShrink: 0,
                }}
              />

              <div
                style={{
                  fontSize: "0.8125rem",
                  lineHeight: 1.5,
                  color: "var(--color-foreground-muted)",
                }}
              >
                Ce dossier ainsi que tous ses fichiers et sous-dossiers seront
                supprimés définitivement.
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                gap: "0.625rem",
                alignItems: "flex-start",
              }}
            >
              <File
                size={16}
                style={{
                  marginTop: "2px",
                  flexShrink: 0,
                }}
              />

              <div
                style={{
                  fontSize: "0.8125rem",
                  lineHeight: 1.5,
                  color: "var(--color-foreground-muted)",
                }}
              >
                Ce fichier sera définitivement supprimé de votre espace.
              </div>
            </div>
          )}

          <div
            style={{
              marginTop: "1rem",
              padding: "0.75rem",
              borderRadius: "0.625rem",
              background: "rgba(239, 68, 68, 0.06)",
              border: "1px solid rgba(239, 68, 68, 0.12)",
              fontSize: "0.75rem",
              lineHeight: 1.45,
              color: "#B91C1C",
            }}
          >
            Cette action est irréversible.
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
            onClick={onCancel}
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
              cursor: isPending ? "not-allowed" : "pointer",
            }}
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            style={{
              height: "38px",
              padding: "0 0.875rem",
              borderRadius: "0.625rem",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              background: "rgba(239, 68, 68, 0.1)",
              color: "#DC2626",
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
                Suppression...
              </>
            ) : (
              <>
                <Trash2 size={15} />
                Supprimer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
