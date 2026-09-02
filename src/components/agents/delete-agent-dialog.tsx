"use client";

import { ApiError } from "@/lib/api";
import { agentService } from "@/services/agent.service";
import type { Agent } from "@/types/agent";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import { toast } from "sonner";

interface DeleteAgentDialogProps {
  agent: Agent | null;
  open: boolean;
  onClose: () => void;
}

export function DeleteAgentDialog({
  agent,
  open,
  onClose,
}: DeleteAgentDialogProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!agent) {
        throw new Error("Aucun agent sélectionné.");
      }

      return agentService.delete(agent.id);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["agents"],
      });

      toast.success("Agent supprimé avec succès.");

      onClose();
    },

    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
        return;
      }

      toast.error("Une erreur est survenue lors de la suppression de l'agent.");
    },
  });

  if (!open || !agent) {
    return null;
  }

  const handleClose = () => {
    if (deleteMutation.isPending) {
      return;
    }

    onClose();
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-agent-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "rgba(0, 0, 0, 0.45)",
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          borderRadius: "1rem",
          border: "1px solid var(--color-border)",
          background: "var(--color-surface)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.18)",
          overflow: "hidden",
        }}
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      >
        <div
          style={{
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(244, 63, 94, 0.10)",
                  color: "#F43F5E",
                }}
              >
                <AlertTriangle size={20} />
              </div>

              <div>
                <h2
                  id="delete-agent-title"
                  style={{
                    margin: 0,
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    color: "var(--color-foreground)",
                  }}
                >
                  Supprimer l&#39;agent
                </h2>

                <p
                  style={{
                    margin: "0.2rem 0 0",
                    fontSize: "0.82rem",
                    color: "var(--color-foreground-muted)",
                  }}
                >
                  Cette action est irréversible.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              disabled={deleteMutation.isPending}
              aria-label="Fermer"
              style={{
                width: "32px",
                height: "32px",
                border: "none",
                background: "transparent",
                color: "var(--color-foreground-muted)",
                cursor: "pointer",
              }}
            >
              <X size={17} />
            </button>
          </div>

          <div
            style={{
              marginTop: "1.25rem",
              padding: "0.875rem",
              borderRadius: "0.625rem",
              background: "var(--color-surface-raised)",
              border: "1px solid var(--color-border)",
              fontSize: "0.85rem",
              color: "var(--color-foreground)",
            }}
          >
            Voulez-vous vraiment supprimer <strong>{agent.full_name}</strong> ?
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.75rem",
            padding: "1rem 1.5rem",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <button
            type="button"
            onClick={handleClose}
            disabled={deleteMutation.isPending}
            style={{
              height: "40px",
              padding: "0 1rem",
              borderRadius: "0.625rem",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface-raised)",
              color: "var(--color-foreground)",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            style={{
              height: "40px",
              padding: "0 1rem",
              borderRadius: "0.625rem",
              border: "none",
              background: "#F43F5E",
              color: "white",
              fontSize: "0.85rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: deleteMutation.isPending ? "not-allowed" : "pointer",
              opacity: deleteMutation.isPending ? 0.6 : 1,
            }}
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Supprimer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
