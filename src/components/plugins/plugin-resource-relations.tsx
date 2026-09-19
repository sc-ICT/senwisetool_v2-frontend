"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Link2, Loader2, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api";
import { pluginResourceService } from "@/services/plugin-resource.service";
import type {
  PluginResource,
  PluginResourceRelationCreate,
} from "@/types/plugin-resource";

interface Props {
  resource: PluginResource;
  resources: PluginResource[];
  editable: boolean;
}

export function PluginResourceRelations({
  resource,
  resources,
  editable,
}: Props) {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);

  const [sourceFieldKey, setSourceFieldKey] = useState("");

  const [targetResourceId, setTargetResourceId] = useState<number | "">("");

  const [targetFieldKey, setTargetFieldKey] = useState("");

  const relationsQuery = useQuery({
    queryKey: ["plugin-resource-relations", resource.id],

    queryFn: async () => {
      const response = await pluginResourceService.listRelations(resource.id);

      return response.data ?? [];
    },

    enabled: Number.isInteger(resource.id),
  });

  const createMutation = useMutation({
    mutationFn: (payload: PluginResourceRelationCreate) =>
      pluginResourceService.createRelation(resource.id, payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["plugin-resource-relations", resource.id],
      });

      toast.success("Relation créée avec succès.");

      setOpen(false);
      setSourceFieldKey("");
      setTargetResourceId("");
      setTargetFieldKey("");
    },

    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
        return;
      }

      toast.error("Impossible de créer la relation.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ relationId }: { relationId: number }) =>
      pluginResourceService.deleteRelation(resource.id, relationId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["plugin-resource-relations", resource.id],
      });

      toast.success("Relation supprimée.");
    },

    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
        return;
      }

      toast.error("Impossible de supprimer la relation.");
    },
  });

  const targetResource =
    typeof targetResourceId === "number"
      ? resources.find((item) => item.id === targetResourceId)
      : null;

  const sourceFields = resource.fields.filter((field) => field.is_active);

  const targetFields =
    targetResource?.fields.filter((field) => field.is_active) ?? [];

  const resetForm = () => {
    setOpen(false);
    setSourceFieldKey("");
    setTargetResourceId("");
    setTargetFieldKey("");
  };

  const submit = () => {
    if (!sourceFieldKey) {
      toast.error("Sélectionnez le champ source.");
      return;
    }

    if (typeof targetResourceId !== "number") {
      toast.error("Sélectionnez la ressource cible.");
      return;
    }

    if (!targetFieldKey) {
      toast.error("Sélectionnez le champ cible.");
      return;
    }

    createMutation.mutate({
      source_field_key: sourceFieldKey,
      target_resource_id: targetResourceId,
      target_field_key: targetFieldKey,
    });
  };

  return (
    <div className="mb-6 rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-5">
        <div>
          <div className="flex items-center gap-2">
            <Link2 size={18} className="text-primary" />

            <h2 className="text-base font-semibold text-foreground">
              Relations
            </h2>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Reliez cette ressource à d&#39;autres ressources du plugin.
          </p>
        </div>

        {editable && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted"
          >
            <Plus size={15} />
            Ajouter
          </button>
        )}
      </div>

      {relationsQuery.isLoading ? (
        <div className="flex min-h-[120px] items-center justify-center">
          <Loader2 size={20} className="animate-spin text-primary" />
        </div>
      ) : relationsQuery.data?.length ? (
        <div className="divide-y divide-border">
          {relationsQuery.data.map((relation) => {
            const sourceIsCurrent = relation.source_resource_id === resource.id;

            return (
              <div
                key={relation.id}
                className="flex items-center justify-between gap-4 px-6 py-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <code className="rounded-lg bg-muted px-2 py-1 text-xs">
                    {sourceIsCurrent
                      ? `${relation.source_resource_name}.${relation.source_field_key}`
                      : `${relation.target_resource_name}.${relation.target_field_key}`}
                  </code>

                  <ArrowRight
                    size={15}
                    className="shrink-0 text-muted-foreground"
                  />

                  <code className="rounded-lg bg-muted px-2 py-1 text-xs">
                    {sourceIsCurrent
                      ? `${relation.target_resource_name}.${relation.target_field_key}`
                      : `${relation.source_resource_name}.${relation.source_field_key}`}
                  </code>
                </div>

                {editable && (
                  <button
                    type="button"
                    onClick={() => {
                      const confirmed = window.confirm(
                        "Supprimer cette relation ?",
                      );

                      if (!confirmed) {
                        return;
                      }

                      deleteMutation.mutate({
                        relationId: relation.id,
                      });
                    }}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    title="Supprimer"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="px-6 py-10 text-center">
          <Link2 size={26} className="mx-auto text-muted-foreground" />

          <p className="mt-3 text-sm font-medium text-foreground">
            Aucune relation
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Cette ressource n&#39;est liée à aucune autre ressource.
          </p>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Nouvelle relation
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  Définissez le champ qui référence une autre ressource.
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Champ source
                </label>

                <select
                  value={sourceFieldKey}
                  onChange={(event) => setSourceFieldKey(event.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-background-secondary px-3 text-sm text-foreground outline-none focus:border-primary"
                >
                  <option value="">Sélectionner un champ</option>

                  {sourceFields.map((field) => (
                    <option key={field.id} value={field.key}>
                      {field.label} ({field.key})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Ressource cible
                </label>

                <select
                  value={targetResourceId}
                  onChange={(event) => {
                    const value = event.target.value;

                    setTargetResourceId(value ? Number(value) : "");

                    setTargetFieldKey("");
                  }}
                  className="h-10 w-full rounded-xl border border-border bg-background-secondary px-3 text-sm text-foreground outline-none focus:border-primary"
                >
                  <option value="">Sélectionner une ressource</option>

                  {resources
                    .filter((item) => item.id !== resource.id)
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </div>

              {targetResource && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Champ cible
                  </label>

                  <select
                    value={targetFieldKey}
                    onChange={(event) => setTargetFieldKey(event.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-background-secondary px-3 text-sm text-foreground outline-none focus:border-primary"
                  >
                    <option value="">Sélectionner un champ</option>

                    {targetFields.map((field) => (
                      <option key={field.id} value={field.key}>
                        {field.label} ({field.key})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
                Exemple : <strong>plantation.code_planteur</strong> →{" "}
                <strong>planteur.code</strong>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
              <button
                type="button"
                onClick={resetForm}
                disabled={createMutation.isPending}
                className="inline-flex h-10 items-center rounded-xl border border-border px-4 text-sm font-medium text-foreground hover:bg-muted"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={submit}
                disabled={createMutation.isPending}
                style={{
                  background: "var(--color-surface-raised)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-foreground)",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.75rem",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  cursor: "pointer",
                  transition: "background 0.2s, border-color 0.2s",
                }}
              >
                {createMutation.isPending ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Plus size={18} />
                )}
                Créer la relation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
