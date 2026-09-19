"use client";

import { useQuery } from "@tanstack/react-query";
import { FileText, Loader2, Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { pluginFormTemplateService } from "@/services/plugin-form-template.service";

interface Props {
  pluginId: number;
  templateId: number | null;
}

export function ProjectTemplateForms({ pluginId, templateId }: Props) {
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ["plugin-form-templates", pluginId, templateId],

    queryFn: async () => {
      const response = await pluginFormTemplateService.list(
        pluginId,
        templateId!,
      );

      return response.data;
    },

    enabled:
      templateId !== null && Number.isInteger(templateId) && templateId > 0,
  });

  if (templateId === null) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center">
        <FileText size={24} className="mx-auto text-muted-foreground" />

        <p className="mt-3 text-sm font-medium">
          Enregistrez d’abord le modèle
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          Les formulaires pourront être ajoutés après la création du modèle de
          projet.
        </p>
      </div>
    );
  }

  const forms = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold">Formulaires du projet</h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Définissez les formulaires qui pourront composer les projets issus
            de ce modèle.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            router.push(
              `/dashboard/plugins/${pluginId}/projects/templates/${templateId}/forms/new`,
            )
          }
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
        >
          <Plus size={15} />
          Ajouter
        </button>
      </div>

      {isLoading && (
        <div className="flex min-h-[200px] items-center justify-center">
          <Loader2 size={22} className="animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          {error instanceof Error
            ? error.message
            : "Impossible de charger les formulaires."}
        </div>
      )}

      {!isLoading && !error && forms.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Aucun modèle de formulaire.
        </div>
      )}

      {!isLoading && !error && forms.length > 0 && (
        <div className="space-y-2">
          {forms.map((form: typeof data.items[number]) => (
            <div
              key={form.id}
              className="flex items-center justify-between rounded-xl border border-border p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText size={17} />
                </div>

                <div>
                  <div className="text-sm font-medium">{form.name}</div>

                  <div className="mt-1 text-xs text-muted-foreground">
                    {form.form_type}
                    {form.required ? " · obligatoire" : " · facultatif"}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/dashboard/plugins/${pluginId}/projects/templates/${templateId}/forms/${form.id}`,
                  )
                }
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Pencil size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
