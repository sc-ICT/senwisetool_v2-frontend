"use client";

import { useMutation } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock3,
  FileCode2,
  Hash,
  Loader2,
  ShieldCheck,
  ShieldX,
  X,
} from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api";
import { pluginService } from "@/services/plugin.service";
import type {
  Plugin,
  PluginVersion,
  PluginVersionStatus,
} from "@/types/plugin";

interface PluginVersionHistoryDialogProps {
  open: boolean;
  plugin: Plugin | null;
  onClose: () => void;
}

const VERSION_STATUS_CONFIG: Record<
  PluginVersionStatus,
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
    label: "Publiée",
    color: "#5DB83A",
    background: "rgba(93, 184, 58, 0.1)",
  },

  DEPRECATED: {
    label: "Dépréciée",
    color: "#94A3B8",
    background: "rgba(148, 163, 184, 0.1)",
  },
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function sortVersions(versions: PluginVersion[]): PluginVersion[] {
  return [...versions].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export function PluginVersionHistoryDialog({
  open,
  plugin,
  onClose,
}: PluginVersionHistoryDialogProps) {
  const versions = useMemo(() => {
    if (!plugin) {
      return [];
    }

    return sortVersions(plugin.versions);
  }, [plugin]);

  const integrityMutation = useMutation({
    mutationFn: async (version: PluginVersion) => {
      if (!plugin) {
        throw new Error("Plugin introuvable.");
      }

      return pluginService.verifyVersionIntegrity(plugin.id, version.id);
    },

    onSuccess: (response) => {
      if (response.data && response.data.valid) {
        toast.success(
          `L'intégrité de la version ${response.data.version} est valide.`,
        );
      } else if (response.data) {
        toast.error(
          `L'intégrité de la version ${response.data.version} est invalide.`,
        );
      }
    },

    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
        return;
      }

      toast.error("Impossible de vérifier l'intégrité de la version.");
    },
  });

  if (!open || !plugin) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="plugin-version-history-title"
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
          onClose();
        }
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "720px",
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
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
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "0.625rem",
                background: "rgba(93, 184, 58, 0.08)",
                border: "1px solid rgba(93, 184, 58, 0.15)",
                color: "#5DB83A",
              }}
            >
              <Clock3 size={18} />
            </div>

            <div>
              <h2
                id="plugin-version-history-title"
                style={{
                  margin: 0,
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "var(--color-foreground)",
                }}
              >
                Historique des versions
              </h2>

              <p
                style={{
                  margin: "0.25rem 0 0",
                  fontSize: "0.75rem",
                  color: "var(--color-foreground-muted)",
                }}
              >
                {plugin.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={integrityMutation.isPending}
            aria-label="Fermer"
            style={{
              width: "34px",
              height: "34px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: 0,
              borderRadius: "0.5rem",
              background: "transparent",
              color: "var(--color-foreground-muted)",
              cursor: "pointer",
            }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Versions */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            padding: "1rem 1.5rem 1.5rem",
          }}
        >
          {versions.length === 0 ? (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                color: "var(--color-foreground-muted)",
              }}
            >
              Aucune version disponible.
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {versions.map((version) => {
                const status = VERSION_STATUS_CONFIG[version.status];

                const isPublished = version.status === "PUBLISHED";

                const isDraft = version.status === "DRAFT";

                return (
                  <div
                    key={version.id}
                    style={{
                      padding: "1rem",
                      border: "1px solid var(--color-border)",
                      borderRadius: "0.75rem",
                      background: "var(--color-surface-raised)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
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
                            width: "36px",
                            height: "36px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "0.5rem",
                            background: "var(--color-surface)",
                            color: "var(--color-foreground-muted)",
                          }}
                        >
                          <FileCode2 size={16} />
                        </div>

                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "0.875rem",
                                fontWeight: 700,
                                color: "var(--color-foreground)",
                              }}
                            >
                              v{version.version}
                            </span>

                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                padding: "0.2rem 0.5rem",
                                borderRadius: "999px",
                                background: status.background,
                                color: status.color,
                                fontSize: "0.625rem",
                                fontWeight: 600,
                              }}
                            >
                              {status.label}
                            </span>
                          </div>

                          <div
                            style={{
                              marginTop: "0.25rem",
                              fontSize: "0.6875rem",
                              color: "var(--color-foreground-muted)",
                            }}
                          >
                            Créée le {formatDate(version.created_at)}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        {isPublished ? (
                          <CheckCircle2 size={15} color="#5DB83A" />
                        ) : isDraft ? (
                          <Clock3 size={15} color="#A78BFA" />
                        ) : null}
                      </div>
                    </div>

                    {version.release_notes ? (
                      <div
                        style={{
                          marginTop: "0.875rem",
                          paddingTop: "0.875rem",
                          borderTop: "1px solid var(--color-border)",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.75rem",
                            lineHeight: 1.5,
                            color: "var(--color-foreground-muted)",
                          }}
                        >
                          {version.release_notes}
                        </p>
                      </div>
                    ) : null}

                    <div
                      style={{
                        marginTop: "0.875rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "1rem",
                      }}
                    >
                      <div
                        style={{
                          minWidth: 0,
                          display: "flex",
                          alignItems: "center",
                          gap: "0.375rem",
                          color: "var(--color-foreground-muted)",
                        }}
                      >
                        <Hash size={13} />

                        <span
                          style={{
                            minWidth: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.625rem",
                          }}
                        >
                          {version.definition_hash ?? "Aucun hash disponible"}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          integrityMutation.mutate(version);
                        }}
                        disabled={
                          integrityMutation.isPending ||
                          !version.definition_hash
                        }
                        style={{
                          flexShrink: 0,
                          height: "32px",
                          padding: "0 0.75rem",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.375rem",
                          border: "1px solid var(--color-border)",
                          borderRadius: "0.5rem",
                          background: "var(--color-surface)",
                          color: "var(--color-foreground)",
                          fontSize: "0.6875rem",
                          fontWeight: 600,
                          cursor:
                            integrityMutation.isPending ||
                            !version.definition_hash
                              ? "not-allowed"
                              : "pointer",
                          opacity:
                            integrityMutation.isPending ||
                            !version.definition_hash
                              ? 0.5
                              : 1,
                        }}
                      >
                        {integrityMutation.isPending ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : version.definition_hash ? (
                          <ShieldCheck size={13} />
                        ) : (
                          <ShieldX size={13} />
                        )}
                        Vérifier
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
