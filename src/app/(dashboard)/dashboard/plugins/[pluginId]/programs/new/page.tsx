"use client";

import { useParams, useRouter } from "next/navigation";

import { Header } from "@/components/layout/header";
import { PluginWorkspaceNav } from "@/components/plugins/plugin-workspace-nav";
import { ProgramEditor } from "@/components/plugins/program/program-editor";

export default function NewPluginProgramPage() {
  const params = useParams();
  const router = useRouter();

  const pluginId = Number(params.pluginId);

  return (
    <>
      <Header
        title="Nouveau programme"
        description="Définissez la structure, les permissions et la temporalité du programme."
      />

      <div className="flex-1 overflow-auto p-6">
        <PluginWorkspaceNav pluginId={pluginId} />

        <div className="mx-auto max-w-7xl">
          <ProgramEditor
            pluginId={pluginId}
            program={null}
            onCancel={() =>
              router.push(`/dashboard/plugins/${pluginId}/programs`)
            }
          />
        </div>
      </div>
    </>
  );
}
