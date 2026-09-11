"use client";

import { pluginResourceService } from "@/services/plugin-resource.service";
import type { PluginResourceCreate } from "@/types/plugin-resource";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  ArrowLeft,
  Database,
  FileCode2,
  Loader2,
  Plus,
  Settings,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { ApiError } from "@/lib/api";

import { Header } from "@/components/layout/header";
import { PluginResourceDialog } from "@/components/plugins/plugin-resource-dialog";
import { pluginService } from "@/services/plugin.service";
import { toast } from "sonner";

export default function PluginConfigurationPage() {
  const params = useParams();

  const router = useRouter();

  const queryClient = useQueryClient();

  const pluginId = Number(params.pluginId);

  const [isCreateResourceOpen, setIsCreateResourceOpen] = useState(false);

  const pluginQuery = useQuery({
    queryKey: ["plugin", pluginId],

    queryFn: async () => {
      const response = await pluginService.get(pluginId);

      return response.data;
    },

    enabled: Number.isInteger(pluginId),
  });

  const resourcesQuery = useQuery({
    queryKey: ["plugin-resources", pluginId],

    queryFn: async () => {
      const response = await pluginResourceService.list(pluginId);

      return response.data;
    },

    enabled: Number.isInteger(pluginId),
  });

  const createResourceMutation = useMutation({
    mutationFn: (payload: PluginResourceCreate) =>
      pluginResourceService.create(pluginId, payload),

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: ["plugin-resources", pluginId],
      });

      toast.success("Ressource créée avec succès.");

      setIsCreateResourceOpen(false);

      if (response.data) {
        router.push(
          `/dashboard/plugins/${pluginId}/resources/${response.data.id}`,
        );
      }
    },

    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
        return;
      }

      toast.error("Impossible de créer la ressource.");
    },
  });

  const deleteResourceMutation = useMutation({
    mutationFn: (resourceId: number) =>
      pluginResourceService.delete(resourceId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["plugin-resources", pluginId],
      });

      toast.success("Ressource supprimée avec succès.");
    },

    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
        return;
      }

      toast.error("Impossible de supprimer la ressource.");
    },
  });

  if (pluginQuery.isLoading || resourcesQuery.isLoading) {
    return (
      <div
        style={{
          minHeight: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  if (pluginQuery.isError || !pluginQuery.data) {
    return (
      <>
        <Header
          title="Plugin introuvable"
          description="Impossible de récupérer les informations du plugin."
        />

        <div
          style={{
            padding: "1.5rem",
          }}
        >
          <Link
            href="/dashboard/plugins"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              textDecoration: "none",
              color: "var(--color-foreground)",
            }}
          >
            <ArrowLeft size={16} />
            Retour aux plugins
          </Link>
        </div>
      </>
    );
  }

  const plugin = pluginQuery.data;

  const resources = resourcesQuery.data?.items ?? [];

  const globalResources = resources.filter(
    (resource) => resource.scope === "GLOBAL",
  );

  const userResources = resources.filter(
    (resource) => resource.scope === "USER",
  );

  const isDraft = plugin.status === "DRAFT";

  return (
    <>
      <Header
        title={plugin.name}
        description={
          plugin.short_description ||
          plugin.description ||
          "Configuration du plugin."
        }
        actions={
          <Link
            href="/dashboard/plugins"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              height: "36px",
              padding: "0 0.875rem",
              borderRadius: "0.625rem",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface-raised)",
              color: "var(--color-foreground)",
              textDecoration: "none",
              fontSize: "0.8125rem",
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} />
            Retour
          </Link>
        }
      />

      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "1.5rem",
        }}
      >
        {!isDraft && (
          <div
            style={{
              marginBottom: "1.5rem",
              padding: "0.875rem 1rem",
              borderRadius: "0.75rem",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface-raised)",
              fontSize: "0.8125rem",
              color: "var(--color-foreground-muted)",
            }}
          >
            Ce plugin n&#39;est pas en brouillon. La configuration est
            actuellement en lecture seule.
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              padding: "1rem",
              borderRadius: "0.875rem",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface-raised)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                marginBottom: "0.5rem",
              }}
            >
              <Database size={18} />

              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-foreground-muted)",
                }}
              >
                Ressources
              </span>
            </div>

            <strong
              style={{
                fontSize: "1.5rem",
              }}
            >
              {resources.length}
            </strong>
          </div>

          <div
            style={{
              padding: "1rem",
              borderRadius: "0.875rem",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface-raised)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                marginBottom: "0.5rem",
              }}
            >
              <FileCode2 size={18} />

              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-foreground-muted)",
                }}
              >
                Ressources globales
              </span>
            </div>

            <strong
              style={{
                fontSize: "1.5rem",
              }}
            >
              {globalResources.length}
            </strong>
          </div>

          <div
            style={{
              padding: "1rem",
              borderRadius: "0.875rem",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface-raised)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                marginBottom: "0.5rem",
              }}
            >
              <Settings size={18} />

              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-foreground-muted)",
                }}
              >
                Ressources utilisateur
              </span>
            </div>

            <strong
              style={{
                fontSize: "1.5rem",
              }}
            >
              {userResources.length}
            </strong>
          </div>
        </div>

        <section
          style={{
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "1rem",
                  fontWeight: 700,
                }}
              >
                Ressources globales
              </h2>

              <p
                style={{
                  margin: "0.25rem 0 0",
                  fontSize: "0.8125rem",
                  color: "var(--color-foreground-muted)",
                }}
              >
                Données communes gérées par l&#39;administrateur.
              </p>
            </div>

            <button
              type="button"
              disabled={!isDraft}
              onClick={() => setIsCreateResourceOpen(true)}
              style={{
                background: "var(--color-surface-raised)",
                border: "1px solid var(--color-border)",
                color: "var(--color-foreground)",
                padding: "0.5rem 1rem",
                borderRadius: "0.75rem",
                fontSize: "0.8125rem",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
                transition: "background 0.2s, border-color 0.2s",
              }}
            >
              <Plus size={18} />
              Ajouter une ressource
            </button>
          </div>

          {globalResources.length === 0 ? (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                borderRadius: "0.875rem",
                border: "1px dashed var(--color-border)",
                color: "var(--color-foreground-muted)",
                fontSize: "0.8125rem",
              }}
            >
              Aucune ressource globale configurée.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "1rem",
              }}
            >
              {globalResources.map((resource) => (
                <div
                  key={resource.id}
                  onClick={() =>
                    router.push(
                      `/dashboard/plugins/${plugin.id}/resources/${resource.id}`,
                    )
                  }
                  style={{
                    padding: "1rem",
                    borderRadius: "0.875rem",
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface-raised)",
                  }}
                >
                  <strong>{resource.name}</strong>

                  <p
                    style={{
                      margin: "0.5rem 0",
                      fontSize: "0.8125rem",
                      color: "var(--color-foreground-muted)",
                    }}
                  >
                    {resource.description || "Aucune description."}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "1rem",
                      marginTop: "0.75rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--color-foreground-muted)",
                      }}
                    >
                      {resource.fields.length} champ
                      {resource.fields.length > 1 ? "s" : ""}
                    </span>

                    <button
                      type="button"
                      disabled={!isDraft || deleteResourceMutation.isPending}
                      onClick={(event) => {
                        event.stopPropagation();

                        const confirmed = window.confirm(
                          `Voulez-vous supprimer la ressource « ${resource.name} » ?`,
                        );

                        if (!confirmed) {
                          return;
                        }

                        deleteResourceMutation.mutate(resource.id);
                      }}
                      title="Supprimer la ressource"
                      aria-label={`Supprimer la ressource ${resource.name}`}
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                    >
                      {deleteResourceMutation.isPending ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Trash2 size={15} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div
            style={{
              marginBottom: "1rem",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "1rem",
                fontWeight: 700,
              }}
            >
              Ressources utilisateur
            </h2>

            <p
              style={{
                margin: "0.25rem 0 0",
                fontSize: "0.8125rem",
                color: "var(--color-foreground-muted)",
              }}
            >
              Données propres à chaque utilisateur du plugin.
            </p>
          </div>

          {userResources.length === 0 ? (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                borderRadius: "0.875rem",
                border: "1px dashed var(--color-border)",
                color: "var(--color-foreground-muted)",
                fontSize: "0.8125rem",
              }}
            >
              Aucune ressource utilisateur configurée.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "1rem",
              }}
            >
              {userResources.map((resource) => (
                <div
                  key={resource.id}
                  style={{
                    padding: "1rem",
                    borderRadius: "0.875rem",
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface-raised)",
                  }}
                >
                  <strong>{resource.name}</strong>

                  <p
                    style={{
                      margin: "0.5rem 0",
                      fontSize: "0.8125rem",
                      color: "var(--color-foreground-muted)",
                    }}
                  >
                    {resource.description || "Aucune description."}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "1rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--color-foreground-muted)",
                      }}
                    >
                      {resource.fields.length} champ
                      {resource.fields.length > 1 ? "s" : ""}
                    </span>

                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                      }}
                    >
                      {resource.allow_user_schema_override
                        ? "Personnalisation autorisée"
                        : "Configuration admin"}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={!isDraft || deleteResourceMutation.isPending}
                    onClick={() => {
                      const confirmed = window.confirm(
                        `Voulez-vous supprimer la ressource « ${resource.name} » ?`,
                      );

                      if (!confirmed) {
                        return;
                      }

                      deleteResourceMutation.mutate(resource.id);
                    }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <PluginResourceDialog
        open={isCreateResourceOpen}
        pending={createResourceMutation.isPending}
        onClose={() => setIsCreateResourceOpen(false)}
        onSubmit={(payload) => createResourceMutation.mutate(payload)}
      />
    </>
  );
}
