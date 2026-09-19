"use client";

import { Header } from "@/components/layout/header";
import { PluginSettingsEditor } from "@/components/plugins/plugin-settings-editor";
import { PluginWorkspaceNav } from "@/components/plugins/plugin-workspace-nav";
import { pluginService } from "@/services/plugin.service";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function PluginSettingsPage() {
  const params = useParams();

  const pluginId = Number(params.pluginId);

  const pluginQuery = useQuery({
    queryKey: ["plugin", pluginId],

    queryFn: async () => {
      const response = await pluginService.get(pluginId);

      return response.data;
    },

    enabled: Number.isInteger(pluginId),
  });

  if (pluginQuery.isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center">
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

        <div className="p-6">
          <Link
            href="/dashboard/plugins"
            className="inline-flex items-center gap-2 text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Retour aux plugins
          </Link>
        </div>
      </>
    );
  }

  const plugin = pluginQuery.data;

  return (
    <>
      <Header
        title="Paramètres"
        description={`Configuration globale de ${plugin.name}.`}
      />

      <div className="flex-1 overflow-auto p-6">
        <PluginWorkspaceNav pluginId={pluginId} />

        <PluginSettingsEditor
          key={`${plugin.id}-${plugin.updated_at}`}
          plugin={plugin}
        />
      </div>
    </>
  );
}
