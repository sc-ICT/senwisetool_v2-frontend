"use client";

import { useParams, useRouter } from "next/navigation";

import { Header } from "@/components/layout/header";
import { PluginWorkspaceNav } from "@/components/plugins/plugin-workspace-nav";
import { ProjectTemplateEditor } from "@/components/plugins/project-template/project-template-editor";

export default function NewPluginProjectTemplatePage() {
  const params = useParams();
  const router = useRouter();

  const pluginId = Number(params.pluginId);

  return (
    <>
      <Header
        title="Nouveau modèle de projet"
        description="Construisez la structure d’un nouveau modèle de projet."
      />

      <div className="flex-1 overflow-auto p-6">
        <PluginWorkspaceNav pluginId={pluginId} />

        <div className="mx-auto max-w-7xl">
          <ProjectTemplateEditor
            pluginId={pluginId}
            template={null}
            onCancel={() =>
              router.push(`/dashboard/plugins/${pluginId}/projects/templates`)
            }
          />
        </div>
      </div>
    </>
  );
}
