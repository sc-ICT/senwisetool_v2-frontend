"use client";

import { Header } from "@/components/layout/header";
import { PluginResourceDialog } from "@/components/plugins/plugin-resource-dialog";
import { PluginResourceWorkbookImport } from "@/components/plugins/plugin-resource-workbook-import";
import { PluginWorkspaceNav } from "@/components/plugins/plugin-workspace-nav";
import { ApiError } from "@/lib/api";
import { pluginResourceService } from "@/services/plugin-resource.service";
import { pluginService } from "@/services/plugin.service";
import type {
  PluginResourceCreate,
  PluginResourceSection,
} from "@/types/plugin-resource";
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
import { toast } from "sonner";

export default function PluginResourcesPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const pluginId = Number(params.pluginId);

  const [isCreateResourceOpen, setIsCreateResourceOpen] = useState(false);
  const [resourceIsDeletingId, setResourceIsDeletingId] = useState<
    number | null
  >(null);

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
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Impossible de créer la ressource.",
      );
    },
  });

  const deleteResourceMutation = useMutation({
    mutationFn: (resourceId: number) => {
      setResourceIsDeletingId(resourceId);

      return pluginResourceService.delete(resourceId);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["plugin-resources", pluginId],
      });

      toast.success("Ressource supprimée avec succès.");
      setResourceIsDeletingId(null);
    },

    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Impossible de supprimer la ressource.",
      );
      setResourceIsDeletingId(null);
    },
  });

  if (pluginQuery.isLoading || resourcesQuery.isLoading) {
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
          "Configuration des ressources du plugin."
        }
        actions={
          <>
            <div className="flex flex-wrap items-center gap-2">
              <PluginResourceWorkbookImport
                pluginId={pluginId}
                disabled={!isDraft}
              />
            </div>

            <button
              type="button"
              onClick={() => setIsCreateResourceOpen(true)}
              disabled={createResourceMutation.isPending || !isDraft}
              style={{
                height: "36px",
                padding: "0 0.875rem",
                borderRadius: "0.625rem",
                border: "1px solid rgba(93, 184, 58, 0.25)",
                background: "rgba(93, 184, 58, 0.1)",
                color: "#5DB83A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                fontSize: "0.8125rem",
                fontWeight: 600,
                cursor: createResourceMutation.isPending
                  ? "not-allowed"
                  : "pointer",
                opacity: createResourceMutation.isPending ? 0.6 : 1,
              }}
            >
              <Plus size={16} />
              Nouvelle ressource
            </button>
          </>
        }
        backTo="/dashboard/plugins"
      />

      <div className="flex-1 overflow-auto p-6">
        <PluginWorkspaceNav pluginId={pluginId} />

        {!isDraft && (
          <div className="mb-6 rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            Ce plugin n&#39;est pas en brouillon. La configuration est
            actuellement en lecture seule.
          </div>
        )}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Ressources</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Configurez les ressources, leurs schemas, relations et données de
              votre plugin.
            </p>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <SummaryCard
            icon={<Database size={18} />}
            label="Ressources"
            value={resources.length}
          />

          <SummaryCard
            icon={<FileCode2 size={18} />}
            label="Ressources globales"
            value={globalResources.length}
          />

          <SummaryCard
            icon={<Settings size={18} />}
            label="Ressources utilisateur"
            value={userResources.length}
          />
        </div>

        <ResourceSection
          title="Ressources globales"
          description="Données communes gérées par l'administrateur."
          resources={globalResources}
          pluginId={pluginId}
          isDraft={isDraft}
          resourceIsDeletingId={resourceIsDeletingId}
          onDelete={(id) => deleteResourceMutation.mutate(id)}
        />

        <ResourceSection
          title="Ressources utilisateur"
          description="Données pouvant être propres aux utilisateurs."
          resources={userResources}
          pluginId={pluginId}
          isDraft={isDraft}
          resourceIsDeletingId={resourceIsDeletingId}
          onDelete={(id) => deleteResourceMutation.mutate(id)}
        />

        <PluginResourceDialog
          open={isCreateResourceOpen}
          onClose={() => setIsCreateResourceOpen(false)}
          onSubmit={(payload) => createResourceMutation.mutate(payload)}
          pending={createResourceMutation.isPending}
        />
      </div>
    </>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>

      <strong className="text-2xl">{value}</strong>
    </div>
  );
}

function ResourceSection({
  title,
  description,
  pluginId,
  resources,
  isDraft,
  resourceIsDeletingId,
  onDelete,
}: {
  title: string;
  description: string;
  pluginId: number;
  resources: Array<PluginResourceSection>;
  isDraft: boolean;
  resourceIsDeletingId: number | null;
  onDelete: (resourceId: number) => void;
}) {
  const handleDelete = (resource: PluginResourceSection) => {
    if (
      !window.confirm(
        `Voulez-vous vraiment supprimer la ressource ${resource.name} ?`,
      )
    ) {
      return;
    }

    onDelete(resource.id);
  };

  return (
    <section className="mb-8">
      <div className="mb-4">
        <h3 className="text-base font-semibold">{title}</h3>

        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      {resources.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Aucune ressource.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="truncate font-semibold">{resource.name}</h4>

                  <code className="mt-1 block text-xs text-muted-foreground">
                    {resource.key}
                  </code>
                </div>

                {isDraft && (
                  <button
                    type="button"
                    onClick={() => handleDelete(resource)}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    {resourceIsDeletingId === resource.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                )}
              </div>

              <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                {resource.description || "Aucune description."}
              </p>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {resource.fields.length} champ(s)
                </span>

                <Link
                  href={`/dashboard/plugins/${pluginId}/resources/${resource.id}`}
                  className="text-xs font-semibold text-primary"
                >
                  Ouvrir →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
