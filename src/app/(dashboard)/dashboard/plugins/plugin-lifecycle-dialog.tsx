"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Archive,
  CheckCircle2,
  FileEdit,
  Loader2,
  Send,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api";
import { pluginService } from "@/services/plugin.service";
import type { Plugin, PluginStatus } from "@/types/plugin";

type LifecycleAction = "publish" | "unpublish" | "draft" | "archive";

interface PluginLifecycleDialogProps {
  plugin: Plugin | null;
  action: LifecycleAction | null;
  open: boolean;
  onClose: () => void;
}

interface LifecycleConfig {
  title: string;
  description: string;
  confirmation: string;
  confirmLabel: string;
  pendingLabel: string;
  icon: typeof Send;
  color: string;
  background: string;
  borderColor: string;
}

const ACTION_CONFIG: Record<LifecycleAction, LifecycleConfig> = {
  publish: {
    title: "Publier le plugin",
    description: "Le plugin deviendra disponible dans la marketplace.",
    confirmation:
      "La configuration actuelle sera enregistrée comme un snapshot immuable de cette version. Toute modification future nécessitera une nouvelle version.",
    confirmLabel: "Publier",
    pendingLabel: "Publication...",
    icon: Send,
    color: "#5DB83A",
    background: "rgba(93, 184, 58, 0.1)",
    borderColor: "rgba(93, 184, 58, 0.25)",
  },

  unpublish: {
    title: "Dépublier le plugin",
    description: "Le plugin sera retiré de la marketplace.",
    confirmation:
      "La version actuellement publiée restera conservée, mais le plugin ne sera plus disponible publiquement.",
    confirmLabel: "Dépublier",
    pendingLabel: "Dépublication...",
    icon: XCircle,
    color: "#F59E0B",
    background: "rgba(245, 158, 11, 0.1)",
    borderColor: "rgba(245, 158, 11, 0.25)",
  },

  draft: {
    title: "Remettre en brouillon",
    description:
      "Le plugin repassera en mode brouillon avec une nouvelle version de travail.",
    confirmation:
      "La version publiée actuelle sera conservée dans l'historique. Une nouvelle version brouillon sera créée pour vos prochaines modifications.",
    confirmLabel: "Créer le brouillon",
    pendingLabel: "Création...",
    icon: FileEdit,
    color: "#A78BFA",
    background: "rgba(167, 139, 250, 0.1)",
    borderColor: "rgba(167, 139, 250, 0.25)",
  },

  archive: {
    title: "Archiver le plugin",
    description: "Le plugin sera retiré du catalogue actif.",
    confirmation:
      "Le plugin ne pourra plus être publié tant qu'il n'aura pas été remis en brouillon.",
    confirmLabel: "Archiver",
    pendingLabel: "Archivage...",
    icon: Archive,
    color: "#94A3B8",
    background: "rgba(148, 163, 184, 0.1)",
    borderColor: "rgba(148, 163, 184, 0.25)",
  },
};

function getSuccessMessage(action: LifecycleAction): string {
  switch (action) {
    case "publish":
      return "Plugin publié avec succès.";

    case "unpublish":
      return "Plugin dépublié avec succès.";

    case "draft":
      return "Plugin remis en brouillon avec succès.";

    case "archive":
      return "Plugin archivé avec succès.";
  }
}

export function PluginLifecycleDialog({
  plugin,
  action,
  open,
  onClose,
}: PluginLifecycleDialogProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!plugin) {
        throw new Error("Aucun plugin sélectionné.");
      }

      if (!action) {
        throw new Error("Aucune action sélectionnée.");
      }

      switch (action) {
        case "publish":
          return pluginService.publish(plugin.id);

        case "unpublish":
          return pluginService.unpublish(plugin.id);

        case "draft":
          return pluginService.moveToDraft(plugin.id);

        case "archive":
          return pluginService.archive(plugin.id);
      }
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["plugins"],
      });

      toast.success(getSuccessMessage(action as LifecycleAction));

      onClose();
    },

    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
        return;
      }

      toast.error("Une erreur est survenue lors de l'opération.");
    },
  });

  if (!open || !plugin || !action) {
    return null;
  }

  const config = ACTION_CONFIG[action];
  const Icon = config.icon;

  const handleClose = () => {
    if (mutation.isPending) {
      return;
    }

    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="plugin-lifecycle-title"
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
          maxWidth: "480px",
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
                background: config.background,
                border: `1px solid ${config.borderColor}`,
                color: config.color,
              }}
            >
              <Icon size={18} />
            </div>

            <div>
              <h2
                id="plugin-lifecycle-title"
                style={{
                  margin: 0,
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "var(--color-foreground)",
                }}
              >
                {config.title}
              </h2>

              <p
                style={{
                  margin: "0.25rem 0 0",
                  fontSize: "0.6875rem",
                  color: "var(--color-foreground-muted)",
                }}
              >
                {config.description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={mutation.isPending}
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
              cursor: mutation.isPending ? "not-allowed" : "pointer",
              opacity: mutation.isPending ? 0.5 : 1,
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
              padding: "1rem",
              border: "1px solid var(--color-border)",
              borderRadius: "0.75rem",
              background: "var(--color-surface-raised)",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "0.8125rem",
                lineHeight: 1.5,
                color: "var(--color-foreground)",
              }}
            >
              Voulez-vous effectuer cette action sur{" "}
              <strong>{plugin.name}</strong> ?
            </p>

            <p
              style={{
                margin: "0.625rem 0 0",
                fontSize: "0.75rem",
                lineHeight: 1.5,
                color: "var(--color-foreground-muted)",
              }}
            >
              {config.confirmation}
            </p>
          </div>

          {/* État actuel */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "1rem",
              padding: "0.75rem 0.875rem",
              border: "1px solid var(--color-border)",
              borderRadius: "0.625rem",
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--color-foreground-muted)",
              }}
            >
              État actuel
            </span>

            <StatusBadge status={plugin.status} />
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
            disabled={mutation.isPending}
            style={{
              height: "36px",
              padding: "0 0.875rem",
              borderRadius: "0.625rem",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
              color: "var(--color-foreground-muted)",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: mutation.isPending ? "not-allowed" : "pointer",
              opacity: mutation.isPending ? 0.5 : 1,
            }}
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={() => {
              mutation.mutate();
            }}
            disabled={mutation.isPending}
            style={{
              height: "36px",
              padding: "0 0.875rem",
              borderRadius: "0.625rem",
              border: `1px solid ${config.borderColor}`,
              background: config.background,
              color: config.color,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: mutation.isPending ? "not-allowed" : "pointer",
              opacity: mutation.isPending ? 0.6 : 1,
            }}
          >
            {mutation.isPending ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Icon size={15} />
            )}

            {mutation.isPending ? config.pendingLabel : config.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: PluginStatus }) {
  const config: Record<
    PluginStatus,
    {
      label: string;
      color: string;
      background: string;
    }
  > = {
    DRAFT: {
      label: "Brouillon",
      color: "#A78BFA",
      background: "rgba(167, 139, 250, 0.1)",
    },
    PUBLISHED: {
      label: "Publié",
      color: "#5DB83A",
      background: "rgba(93, 184, 58, 0.1)",
    },
    UNPUBLISHED: {
      label: "Dépublié",
      color: "#F59E0B",
      background: "rgba(245, 158, 11, 0.1)",
    },
    ARCHIVED: {
      label: "Archivé",
      color: "#94A3B8",
      background: "rgba(148, 163, 184, 0.1)",
    },
  };

  const current = config[status];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.375rem",
        padding: "0.25rem 0.5rem",
        borderRadius: "999px",
        background: current.background,
        color: current.color,
        fontSize: "0.6875rem",
        fontWeight: 600,
      }}
    >
      {status === "PUBLISHED" ? (
        <CheckCircle2 size={12} />
      ) : status === "DRAFT" ? (
        <FileEdit size={12} />
      ) : status === "UNPUBLISHED" ? (
        <XCircle size={12} />
      ) : (
        <Archive size={12} />
      )}

      {current.label}
    </span>
  );
}
