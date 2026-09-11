"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api";
import { pluginService } from "@/services/plugin.service";
import type { Plugin } from "@/types/plugin";

interface DeletePluginDialogProps {
  plugin: Plugin | null;
  open: boolean;
  onClose: () => void;
}

export function DeletePluginDialog({
  plugin,
  open,
  onClose,
}: DeletePluginDialogProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!plugin) {
        throw new Error("Aucun plugin sélectionné.");
      }

      return pluginService.delete(plugin.id);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["plugins"],
      });

      toast.success("Plugin supprimé avec succès.");

      onClose();
    },

    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
        return;
      }

      toast.error("Une erreur est survenue lors de la suppression du plugin.");
    },
  });

  if (!open || !plugin) {
    return null;
  }

  const handleClose = () => {
    if (deleteMutation.isPending) {
      return;
    }

    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-plugin-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "rgba(0, 0, 0, 0.62)",
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
          overflow: "hidden",
          border: "1px solid var(--color-border)",
          borderRadius: "1rem",
          background: "var(--color-surface)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.32)",
        }}
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "1rem",
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--color-border)",
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
                width: "40px",
                height: "40px",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "0.625rem",
                background: "rgba(244, 63, 94, 0.08)",
                border: "1px solid rgba(244, 63, 94, 0.15)",
                color: "#F43F5E",
              }}
            >
              <AlertTriangle size={18} />
            </div>

            <div>
              <h2
                id="delete-plugin-title"
                style={{
                  margin: 0,
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "var(--color-foreground)",
                }}
              >
                Supprimer le plugin
              </h2>

              <p
                style={{
                  margin: "0.25rem 0 0",
                  fontSize: "0.6875rem",
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
              width: "34px",
              height: "34px",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid transparent",
              borderRadius: "0.5rem",
              background: "transparent",
              color: "var(--color-foreground-muted)",
              cursor: deleteMutation.isPending ? "not-allowed" : "pointer",
              opacity: deleteMutation.isPending ? 0.5 : 1,
            }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              padding: "0.875rem",
              border: "1px solid var(--color-border)",
              borderRadius: "0.75rem",
              background: "var(--color-surface-raised)",
              color: "var(--color-foreground)",
              fontSize: "0.8125rem",
              lineHeight: 1.5,
            }}
          >
            Voulez-vous vraiment supprimer <strong>{plugin.name}</strong> ?
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "0.625rem",
            padding: "1rem 1.5rem",
            borderTop: "1px solid var(--color-border)",
            background: "var(--color-surface-raised)",
          }}
        >
          <button
            type="button"
            onClick={handleClose}
            disabled={deleteMutation.isPending}
            style={{
              height: "36px",
              padding: "0 0.875rem",
              borderRadius: "0.625rem",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
              color: "var(--color-foreground-muted)",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: deleteMutation.isPending ? "not-allowed" : "pointer",
              opacity: deleteMutation.isPending ? 0.5 : 1,
            }}
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={() => {
              deleteMutation.mutate();
            }}
            disabled={deleteMutation.isPending}
            style={{
              height: "36px",
              padding: "0 0.875rem",
              borderRadius: "0.625rem",
              border: "1px solid rgba(244, 63, 94, 0.2)",
              background: "rgba(244, 63, 94, 0.1)",
              color: "#F43F5E",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: deleteMutation.isPending ? "not-allowed" : "pointer",
              opacity: deleteMutation.isPending ? 0.6 : 1,
            }}
          >
            {deleteMutation.isPending ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Trash2 size={15} />
            )}

            {deleteMutation.isPending ? "Suppression..." : "Supprimer"}
          </button>
        </div>
      </div>
    </div>
  );
}
