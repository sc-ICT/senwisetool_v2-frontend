"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FilePlus2,
  FolderKanban,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { Header } from "@/components/layout/header";
import { PluginWorkspaceNav } from "@/components/plugins/plugin-workspace-nav";
import { ApiError } from "@/lib/api";
import { pluginProjectService } from "@/services/plugin-project.service";

export default function PluginProjectTemplatesPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const pluginId = Number(params.pluginId);

  const { data, isLoading, error } = useQuery({
    queryKey: ["plugin-project-templates", pluginId],
    queryFn: async () => {
      const response = await pluginProjectService.list(pluginId);

      return response.data;
    },
    enabled: Number.isInteger(pluginId) && pluginId > 0,
  });

  const deleteMutation = useMutation({
    mutationFn: async (templateId: number) => {
      return pluginProjectService.delete(pluginId, templateId);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["plugin-project-templates", pluginId],
      });

      toast.success("Modèle de projet supprimé.");
    },

    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de supprimer le modèle.";

      toast.error(message);
    },
  });

  const templates = data?.items ?? [];

  const handleDelete = (templateId: number, name: string) => {
    const confirmed = window.confirm(
      `Supprimer le modèle de projet « ${name} » ?`,
    );

    if (!confirmed) {
      return;
    }

    deleteMutation.mutate(templateId);
  };

  return (
    <>
      <Header
        title="Modèles de projets"
        description="Définissez les structures de projets disponibles dans ce plugin."
      />

      <div className="flex-1 overflow-auto p-6">
        <PluginWorkspaceNav pluginId={pluginId} />

        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Modèles de projets
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Un modèle définit la structure et les règles utilisées lors de
                la création d’un projet.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/dashboard/plugins/${pluginId}/projects/templates/new`,
                )
              }
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Plus size={16} />
              Nouveau modèle
            </button>
          </div>

          {isLoading && (
            <div className="flex min-h-[320px] items-center justify-center">
              <Loader2
                size={24}
                className="animate-spin text-muted-foreground"
              />
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5 text-sm text-destructive">
              {error instanceof Error
                ? error.message
                : "Impossible de charger les modèles de projets."}
            </div>
          )}

          {!isLoading && !error && templates.length === 0 && (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/10 px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <FolderKanban size={26} className="text-primary" />
              </div>

              <h2 className="mt-5 text-lg font-semibold">
                Aucun modèle de projet
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Commencez par créer un modèle qui définira la structure des
                projets utilisables dans ce plugin.
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/dashboard/plugins/${pluginId}/projects/templates/new`,
                  )
                }
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                <FilePlus2 size={16} />
                Créer un modèle
              </button>
            </div>
          )}

          {!isLoading && !error && templates.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <FolderKanban size={19} />
                      </div>

                      <div className="min-w-0">
                        <h2 className="truncate font-semibold">
                          {template.name}
                        </h2>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {template.project_type}
                        </p>
                      </div>
                    </div>

                    <span
                      className={[
                        "rounded-full px-2 py-1 text-[11px] font-medium",
                        template.is_active
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-muted text-muted-foreground",
                      ].join(" ")}
                    >
                      {template.is_active ? "Actif" : "Inactif"}
                    </span>
                  </div>

                  <p className="mt-4 line-clamp-3 min-h-[60px] text-sm leading-5 text-muted-foreground">
                    {template.description ||
                      "Aucune description pour ce modèle."}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                    <span className="text-xs text-muted-foreground">
                      Clé : {template.key}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title="Modifier"
                        onClick={() =>
                          router.push(
                            `/dashboard/plugins/${pluginId}/projects/templates/${template.id}`,
                          )
                        }
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        type="button"
                        title="Supprimer"
                        disabled={deleteMutation.isPending}
                        onClick={() => handleDelete(template.id, template.name)}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                      >
                        {deleteMutation.isPending &&
                        deleteMutation.variables === template.id ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
