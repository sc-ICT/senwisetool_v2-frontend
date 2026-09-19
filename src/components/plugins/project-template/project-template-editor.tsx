"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  Database,
  FileText,
  Loader2,
  Save,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api";
import { pluginProjectService } from "@/services/plugin-project.service";
import type {
  PluginProjectTemplate,
  PluginProjectTemplateCreate,
  PluginProjectTemplateUpdate,
} from "@/types/plugin-project";

import { ProjectTemplateConfiguration } from "./project-template-configuration";
import { ProjectTemplateForms } from "./project-template-forms";
import { ProjectTemplateGeneral } from "./project-template-general";
import { ProjectTemplateMetrics } from "./project-template-metrics";
import { ProjectTemplatePermissions } from "./project-template-permissions";
import { ProjectTemplateResources } from "./project-template-resources";
import { ProjectTemplateRules } from "./project-template-rules";

type SectionKey =
  | "general"
  | "configuration"
  | "permissions"
  | "resources"
  | "rules"
  | "metrics"
  | "forms";

interface Props {
  pluginId: number;
  template: PluginProjectTemplate | null;
  onCancel?: () => void;
}

const navigation: Array<{
  key: SectionKey;
  label: string;
  description: string;
  icon: typeof Settings2;
}> = [
  {
    key: "general",
    label: "Général",
    description: "Identité du modèle",
    icon: Settings2,
  },
  {
    key: "configuration",
    label: "Configuration",
    description: "Comportement du projet",
    icon: SlidersHorizontal,
  },
  {
    key: "permissions",
    label: "Permissions",
    description: "Personnalisation utilisateur",
    icon: ShieldCheck,
  },
  {
    key: "resources",
    label: "Ressources",
    description: "Données utilisables",
    icon: Database,
  },
  {
    key: "rules",
    label: "Règles",
    description: "Contraintes métier",
    icon: ShieldCheck,
  },
  {
    key: "metrics",
    label: "Statistiques",
    description: "Indicateurs calculés",
    icon: BarChart3,
  },
  {
    key: "forms",
    label: "Formulaires",
    description: "Formulaires du projet",
    icon: FileText,
  },
];

function createDefaultForm(): PluginProjectTemplateCreate {
  return {
    key: "",
    name: "",
    description: null,
    project_type: "",

    // null = projet indépendant
    program_id: null,

    icon: null,
    position: 0,
    allow_user_use: true,
    allow_user_customization: false,
    configuration: {},
    rules: [],
    resource_bindings: [],
    metrics: [],
  };
}

export function ProjectTemplateEditor({ pluginId, template, onCancel }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeSection, setActiveSection] = useState<SectionKey>("general");

  const [form, setForm] = useState<
    PluginProjectTemplateCreate | PluginProjectTemplate
  >(() => template ?? createDefaultForm());

  type EditableProjectTemplateField =
    | "key"
    | "name"
    | "description"
    | "project_type"
    | "program_id"
    | "icon"
    | "position"
    | "allow_user_use"
    | "allow_user_customization"
    | "configuration"
    | "rules"
    | "resource_bindings"
    | "metrics";

  const updateField = <K extends EditableProjectTemplateField>(
    field: K,
    value: (PluginProjectTemplateCreate | PluginProjectTemplate)[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const createMutation = useMutation({
    mutationFn: async () =>
      pluginProjectService.create(
        pluginId,
        form as PluginProjectTemplateCreate,
      ),

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: ["plugin-project-templates", pluginId],
      });

      if (response.data) {
        router.replace(
          `/dashboard/plugins/${pluginId}/projects/templates/${response.data.id}`,
        );
      }

      toast.success("Modèle de projet créé.");
    },

    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Impossible de créer le modèle.",
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () =>
      pluginProjectService.update(
        pluginId,
        template!.id,
        form as PluginProjectTemplateUpdate,
      ),

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: ["plugin-project-templates", pluginId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["plugin-project-template", pluginId, template!.id],
      });

      if (response.data) {
        setForm(response.data);
      }

      toast.success("Modèle de projet enregistré.");
    },

    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Impossible d’enregistrer le modèle.",
      );
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const save = () => {
    if (!String(form.name ?? "").trim()) {
      setActiveSection("general");

      toast.error("Le nom du modèle est obligatoire.");

      return;
    }

    if (!String(form.key ?? "").trim()) {
      setActiveSection("general");

      toast.error("La clé du modèle est obligatoire.");

      return;
    }

    if (!String(form.project_type ?? "").trim()) {
      setActiveSection("general");

      toast.error("Le type de projet est obligatoire.");

      return;
    }

    /*
     * Si program_id est défini, le backend vérifiera que
     * le programme appartient bien au plugin.
     */
    if (template) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const cancel = () => {
    if (onCancel) {
      onCancel();
      return;
    }

    router.push(`/dashboard/plugins/${pluginId}/projects/templates`);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="grid min-h-[720px] lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="border-b border-border bg-muted/10 lg:border-b-0 lg:border-r">
          <div className="p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Configuration
            </div>

            <div className="mt-1 text-sm font-medium">Modèle de projet</div>
          </div>

          <nav className="space-y-1 px-2 pb-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = item.key === activeSection;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveSection(item.key)}
                  className={[
                    "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  ].join(" ")}
                >
                  <Icon size={17} className="mt-0.5 shrink-0" />

                  <span className="min-w-0">
                    <span className="block text-sm font-medium">
                      {item.label}
                    </span>

                    <span className="mt-0.5 block text-[11px] leading-4 opacity-75">
                      {item.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0">
          <div className="border-b border-border px-5 py-4 lg:px-7">
            <h2 className="text-base font-semibold">
              {navigation.find((item) => item.key === activeSection)?.label}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {
                navigation.find((item) => item.key === activeSection)
                  ?.description
              }
            </p>
          </div>

          <div className="p-5 lg:p-7">
            {activeSection === "general" && (
              <ProjectTemplateGeneral value={form} onChange={updateField} />
            )}

            {activeSection === "configuration" && (
              <ProjectTemplateConfiguration
                pluginId={pluginId}
                value={form.configuration ?? {}}
                programId={form.program_id ?? null}
                onProgramChange={(programId) =>
                  updateField("program_id", programId)
                }
                onChange={(value) => updateField("configuration", value)}
              />
            )}

            {activeSection === "permissions" && (
              <ProjectTemplatePermissions
                allowUserUse={form.allow_user_use ?? true}
                allowUserCustomization={form.allow_user_customization ?? false}
                onChangeUse={(value) => updateField("allow_user_use", value)}
                onChangeCustomization={(value) =>
                  updateField("allow_user_customization", value)
                }
              />
            )}

            {activeSection === "resources" && (
              <ProjectTemplateResources
                pluginId={pluginId}
                value={form.resource_bindings ?? []}
                onChange={(value) => updateField("resource_bindings", value)}
              />
            )}

            {activeSection === "rules" && (
              <ProjectTemplateRules
                value={form.rules ?? []}
                onChange={(value) => updateField("rules", value)}
              />
            )}

            {activeSection === "metrics" && (
              <ProjectTemplateMetrics
                value={form.metrics ?? []}
                onChange={(value) => updateField("metrics", value)}
              />
            )}

            {activeSection === "forms" && (
              <ProjectTemplateForms
                pluginId={pluginId}
                templateId={template?.id ?? null}
              />
            )}
          </div>
        </main>
      </div>

      <div className="flex items-center justify-between border-t border-border bg-muted/5 px-5 py-4">
        <div className="text-xs text-muted-foreground">
          {template
            ? "Les modifications sont enregistrées sur le modèle."
            : "Le modèle sera créé en brouillon actif."}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={cancel}
            disabled={isPending}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={save}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save size={15} />
                Enregistrer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
