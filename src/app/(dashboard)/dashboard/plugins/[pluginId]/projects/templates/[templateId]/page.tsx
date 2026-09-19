"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Header } from "@/components/layout/header";
import { PluginWorkspaceNav } from "@/components/plugins/plugin-workspace-nav";
import { ProjectTemplateEditor } from "@/components/plugins/project-template/project-template-editor";
import { pluginProjectService } from "@/services/plugin-project.service";

export default function PluginProjectTemplatePage() {
  const params = useParams();
  const router = useRouter();

  const pluginId = Number(params.pluginId);
  const templateId = Number(params.templateId);

  const isNew = params.templateId === "new";

  const { data, isLoading, error } = useQuery({
    queryKey: ["plugin-project-template", pluginId, templateId],

    queryFn: async () => {
      const response = await pluginProjectService.get(pluginId, templateId);

      return response.data;
    },

    enabled:
      !isNew &&
      Number.isInteger(pluginId) &&
      pluginId > 0 &&
      Number.isInteger(templateId) &&
      templateId > 0,
  });

  return (
    <>
      <Header
        title={isNew ? "Nouveau modèle de projet" : "Modèle de projet"}
        description={
          isNew
            ? "Construisez la structure d’un nouveau modèle de projet."
            : "Configurez la structure et les règles du modèle."
        }
      />

      <div className="flex-1 overflow-auto p-6">
        <PluginWorkspaceNav pluginId={pluginId} />

        <div className="mx-auto max-w-7xl">
          <button
            type="button"
            onClick={() =>
              router.push(`/dashboard/plugins/${pluginId}/projects/templates`)
            }
            className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={16} />
            Retour aux modèles
          </button>

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
                : "Impossible de charger le modèle."}
            </div>
          )}

          {!isLoading && !error && (
            <ProjectTemplateEditor
              pluginId={pluginId}
              template={isNew ? null : (data ?? null)}
            />
          )}
        </div>
      </div>
    </>
  );
}
