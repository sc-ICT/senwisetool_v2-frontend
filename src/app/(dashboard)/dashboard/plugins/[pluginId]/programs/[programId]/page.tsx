"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Header } from "@/components/layout/header";
import { PluginWorkspaceNav } from "@/components/plugins/plugin-workspace-nav";
import { ProgramEditor } from "@/components/plugins/program/program-editor";
import { pluginProgramService } from "@/services/plugin-program.service";

export default function PluginProgramPage() {
  const params = useParams();
  const router = useRouter();

  const pluginId = Number(params.pluginId);

  const programId = Number(params.programId);

  const { data, isLoading, error } = useQuery({
    queryKey: ["plugin-program", pluginId, programId],

    queryFn: async () => {
      const response = await pluginProgramService.get(pluginId, programId);

      return response.data;
    },

    enabled:
      Number.isInteger(pluginId) &&
      pluginId > 0 &&
      Number.isInteger(programId) &&
      programId > 0,
  });

  return (
    <>
      <Header
        title={data?.name ?? "Programme"}
        description="Configurez le programme et son calendrier."
      />

      <div className="flex-1 overflow-auto p-6">
        <PluginWorkspaceNav pluginId={pluginId} />

        <div className="mx-auto max-w-7xl">
          <button
            type="button"
            onClick={() =>
              router.push(`/dashboard/plugins/${pluginId}/programs`)
            }
            className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={16} />
            Retour aux programmes
          </button>

          {isLoading && (
            <div className="flex min-h-[360px] items-center justify-center">
              <Loader2
                size={25}
                className="animate-spin text-muted-foreground"
              />
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5 text-sm text-destructive">
              {error instanceof Error
                ? error.message
                : "Impossible de charger le programme."}
            </div>
          )}

          {!isLoading && !error && data && (
            <ProgramEditor pluginId={pluginId} program={data} />
          )}
        </div>
      </div>
    </>
  );
}
