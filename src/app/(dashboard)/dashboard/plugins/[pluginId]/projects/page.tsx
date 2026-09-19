"use client";

import { FileStack, FolderKanban, Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Header } from "@/components/layout/header";
import { PluginWorkspaceNav } from "@/components/plugins/plugin-workspace-nav";

export default function PluginProjectsPage() {
  const params = useParams();
  const router = useRouter();

  const pluginId = Number(params.pluginId);

  return (
    <>
      <Header
        title="Projets"
        description="Gérez les modèles et les projets associés au plugin."
      />

      <div className="flex-1 overflow-auto p-6">
        <PluginWorkspaceNav pluginId={pluginId} />

        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-xl font-semibold">Gestion des projets</h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Les modèles définissent les structures disponibles. Les projets
              sont ensuite créés à partir de ces modèles.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <button
              type="button"
              onClick={() =>
                router.push(`/dashboard/plugins/${pluginId}/projects/templates`)
              }
              className="group rounded-2xl border border-border bg-card p-6 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileStack size={23} />
              </div>

              <h2 className="mt-5 text-base font-semibold">
                Modèles de projets
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Définissez les types de projets, leurs paramètres, ressources,
                règles, statistiques et formulaires.
              </p>

              <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary">
                Configurer les modèles
              </span>
            </button>

            <button
              type="button"
              onClick={() => router.push(`/dashboard/projects`)}
              className="group rounded-2xl border border-border bg-card p-6 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FolderKanban size={23} />
              </div>

              <h2 className="mt-5 text-base font-semibold">Projets</h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Consultez et exploitez les projets déjà créés à partir des
                modèles du plugin.
              </p>

              <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary">
                Voir les projets
              </span>
            </button>
          </div>

          <div className="mt-8 rounded-2xl border border-dashed border-border p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Plus size={18} />
              </div>

              <div>
                <h3 className="text-sm font-semibold">
                  Principe de fonctionnement
                </h3>

                <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
                  L’administrateur construit d’abord les modèles. Les
                  utilisateurs autorisés pourront ensuite créer leurs projets à
                  partir de ces modèles, selon les capacités configurées par le
                  plugin.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
