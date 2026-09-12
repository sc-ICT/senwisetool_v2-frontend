"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Database,
  FileSpreadsheet,
  Loader2,
  Lock,
  Pencil,
  Save,
  Settings2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Header } from "@/components/layout/header";
import { PluginResourceExcelImport } from "@/components/plugins/plugin-resource-excel-import";
import { PluginResourceRecordForm } from "@/components/plugins/plugin-resource-record-form";
import { PluginResourceRecordTable } from "@/components/plugins/plugin-resource-record-table";
import { PluginResourceSchemaBuilder } from "@/components/plugins/plugin-resource-schema-builder";
import { PluginResourceUserSchema } from "@/components/plugins/plugin-resource-user-schema";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ApiError } from "@/lib/api";
import { pluginResourceService } from "@/services/plugin-resource.service";
import { pluginService } from "@/services/plugin.service";
import type { PluginResourceScope } from "@/types/plugin";
import type {
  PluginResourceRecord,
  PluginResourceUpdate,
} from "@/types/plugin-resource";

interface ResourceFormState {
  name: string;
  description: string;
  scope: PluginResourceScope;
  allow_user_schema_override: boolean;
  position: string;
  icon: string;
  is_active: boolean;
}

function resourceToForm(resource: {
  name: string;
  description: string | null;
  scope: PluginResourceScope;
  allow_user_schema_override: boolean;
  position: number;
  icon: string | null;
  is_active: boolean;
}): ResourceFormState {
  return {
    name: resource.name,
    description: resource.description ?? "",
    scope: resource.scope,
    allow_user_schema_override: resource.allow_user_schema_override,
    position: String(resource.position),
    icon: resource.icon ?? "",
    is_active: resource.is_active,
  };
}

export default function PluginResourcePage() {
  const params = useParams();
  const queryClient = useQueryClient();

  const pluginId = Number(params.pluginId);

  const resourceId = Number(params.resourceId);

  const [editingInfo, setEditingInfo] = useState(false);

  const [form, setForm] = useState<ResourceFormState | null>(null);

  const [showRecordForm, setShowRecordForm] = useState(false);

  const [editingRecord, setEditingRecord] =
    useState<PluginResourceRecord | null>(null);

  const pluginQuery = useQuery({
    queryKey: ["plugin", pluginId],

    queryFn: async () => {
      const response = await pluginService.get(pluginId);

      return response.data;
    },

    enabled: Number.isInteger(pluginId),
  });

  const resourceQuery = useQuery({
    queryKey: ["plugin-resource", resourceId],

    queryFn: async () => {
      const response = await pluginResourceService.get(resourceId);

      return response.data;
    },

    enabled: Number.isInteger(resourceId),
  });

  const effectiveSchemaQuery = useQuery({
    queryKey: ["plugin-resource-effective-schema", resourceId],

    queryFn: async () => {
      const response =
        await pluginResourceService.getEffectiveSchema(resourceId);

      return response.data;
    },

    enabled: Number.isInteger(resourceId),
  });

  const recordsQuery = useQuery({
    queryKey: ["plugin-resource-records", resourceId],

    queryFn: async () => {
      const response = await pluginResourceService.listRecords(resourceId);

      return response.data;
    },

    enabled: Number.isInteger(resourceId),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      resourceId,
      payload,
    }: {
      resourceId: number;
      payload: PluginResourceUpdate;
    }) => pluginResourceService.update(resourceId, payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["plugin-resource", resourceId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["plugin-resources", pluginId],
      });

      toast.success("Ressource modifiée avec succès.");

      setEditingInfo(false);
      setForm(null);
    },

    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
        return;
      }

      toast.error("Impossible de modifier la ressource.");
    },
  });

  if (pluginQuery.isLoading || resourceQuery.isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  const plugin = pluginQuery.data;

  const resource = resourceQuery.data;

  if (!plugin || !resource) {
    return (
      <>
        <Header
          title="Ressource introuvable"
          description="Cette ressource n'existe pas ou n'est plus disponible."
        />

        <div className="p-6">
          <Link
            href={`/dashboard/plugins/${pluginId}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary"
          >
            <ArrowLeft size={16} />
            Retour au plugin
          </Link>
        </div>
      </>
    );
  }

  const canEdit = plugin.status === "DRAFT";

  const effectiveSchema = effectiveSchemaQuery.data;

  const records = recordsQuery.data?.items ?? [];

  const openEditInfo = () => {
    setForm(resourceToForm(resource));

    setEditingInfo(true);
  };

  const cancelEditInfo = () => {
    setForm(null);
    setEditingInfo(false);
  };

  const updateForm = (
    field: keyof ResourceFormState,
    value: string | boolean,
  ) => {
    setForm((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        [field]: value,
      };
    });
  };

  const handleUpdate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canEdit || updateMutation.isPending || !form) {
      return;
    }

    if (form.name.trim().length < 2) {
      toast.error("Le nom doit contenir au moins 2 caractères.");
      return;
    }

    const position = Number(form.position);

    if (!Number.isInteger(position) || position < 0) {
      toast.error("La position doit être un entier positif.");
      return;
    }

    const payload: PluginResourceUpdate = {
      name: form.name.trim(),

      description: form.description.trim() || null,

      scope: form.scope,

      allow_user_schema_override:
        form.scope === "USER" ? form.allow_user_schema_override : false,

      position,

      icon: form.icon.trim() || null,

      is_active: form.is_active,
    };

    updateMutation.mutate({
      resourceId: resource.id,
      payload,
    });
  };

  const openAddRecord = () => {
    setEditingRecord(null);
    setShowRecordForm(true);
  };

  const openEditRecord = (record: PluginResourceRecord) => {
    setEditingRecord(record);
    setShowRecordForm(true);
  };

  const closeRecordForm = () => {
    setEditingRecord(null);
    setShowRecordForm(false);
  };

  const refreshRecords = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["plugin-resource-records", resourceId],
    });

    await queryClient.invalidateQueries({
      queryKey: ["plugin-resource-effective-schema", resourceId],
    });

    closeRecordForm();
  };

  const isSchemaLoading = effectiveSchemaQuery.isLoading || !effectiveSchema;

  return (
    <>
      <Header
        title={resource.name}
        description={
          resource.description || "Configuration et données de la ressource."
        }
        actions={
          <Link
            href={`/dashboard/plugins/${pluginId}`}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted"
          >
            <ArrowLeft size={16} />
            Retour au plugin
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        {!canEdit && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-warning/20 bg-warning/5 px-5 py-4">
            <Lock size={18} className="mt-0.5 shrink-0 text-warning" />

            <div>
              <p className="text-sm font-semibold text-foreground">
                Configuration en lecture seule
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Ce plugin n&#39;est pas en brouillon. La configuration
                structurelle de la ressource ne peut plus être modifiée.
              </p>
            </div>
          </div>
        )}

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <Database size={18} className="text-primary" />

              <div>
                <p className="text-xs text-muted-foreground">Clé</p>

                <code className="text-sm font-semibold text-foreground">
                  {resource.key}
                </code>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3">
              <Settings2 size={18} className="text-primary" />

              <div>
                <p className="text-xs text-muted-foreground">Portée</p>

                <div className="mt-1">
                  <Badge
                    variant={
                      resource.scope === "GLOBAL" ? "default" : "success"
                    }
                  >
                    {resource.scope === "GLOBAL" ? "Globale" : "Utilisateur"}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div>
              <p className="text-xs text-muted-foreground">Personnalisation</p>

              <div className="mt-2">
                {resource.scope === "USER" &&
                resource.allow_user_schema_override ? (
                  <Badge variant="success">Autorisée</Badge>
                ) : (
                  <Badge variant="outline">Désactivée</Badge>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div>
              <p className="text-xs text-muted-foreground">État</p>

              <div className="mt-2">
                {resource.is_active ? (
                  <Badge variant="success">Active</Badge>
                ) : (
                  <Badge variant="outline">Désactivée</Badge>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* ============================================================
         * INFORMATIONS
         * ========================================================== */}

        <Card className="mb-6">
          <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-5">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Informations
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Configuration générale de la ressource.
              </p>
            </div>

            {canEdit && !editingInfo && (
              <button
                type="button"
                onClick={openEditInfo}
                className="inline-flex h-9 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted"
              >
                <Pencil size={15} />
                Modifier
              </button>
            )}
          </div>

          {editingInfo && form ? (
            <form onSubmit={handleUpdate} className="p-6">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Nom
                  </label>

                  <input
                    value={form.name}
                    onChange={(event) => updateForm("name", event.target.value)}
                    disabled={updateMutation.isPending}
                    className="h-10 w-full rounded-xl border border-border bg-background-secondary px-3 text-sm text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Icône
                  </label>

                  <input
                    value={form.icon}
                    onChange={(event) => updateForm("icon", event.target.value)}
                    disabled={updateMutation.isPending}
                    placeholder="database"
                    className="h-10 w-full rounded-xl border border-border bg-background-secondary px-3 text-sm text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Description
                  </label>

                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      updateForm("description", event.target.value)
                    }
                    disabled={updateMutation.isPending}
                    rows={4}
                    className="w-full rounded-xl border border-border bg-background-secondary px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Portée
                  </label>

                  <select
                    value={form.scope}
                    onChange={(event) =>
                      updateForm(
                        "scope",
                        event.target.value as PluginResourceScope,
                      )
                    }
                    disabled={updateMutation.isPending}
                    className="h-10 w-full rounded-xl border border-border bg-background-secondary px-3 text-sm text-foreground outline-none focus:border-primary"
                  >
                    <option value="GLOBAL">Globale</option>

                    <option value="USER">Utilisateur</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Position
                  </label>

                  <input
                    type="number"
                    min={0}
                    value={form.position}
                    onChange={(event) =>
                      updateForm("position", event.target.value)
                    }
                    disabled={updateMutation.isPending}
                    className="h-10 w-full rounded-xl border border-border bg-background-secondary px-3 text-sm text-foreground outline-none focus:border-primary"
                  />
                </div>

                {form.scope === "USER" && (
                  <div className="rounded-xl border border-border bg-muted/20 px-4 py-4 md:col-span-2">
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={form.allow_user_schema_override}
                        onChange={(event) =>
                          updateForm(
                            "allow_user_schema_override",
                            event.target.checked,
                          )
                        }
                        disabled={updateMutation.isPending}
                        className="mt-0.5 h-4 w-4"
                      />

                      <span>
                        <span className="block text-sm font-medium text-foreground">
                          Autoriser la personnalisation du schéma par
                          utilisateur
                        </span>

                        <span className="mt-1 block text-xs text-muted-foreground">
                          Chaque utilisateur pourra adapter son propre schéma
                          sans modifier celui des autres.
                        </span>
                      </span>
                    </label>
                  </div>
                )}

                <div className="rounded-xl border border-border bg-muted/20 px-4 py-4 md:col-span-2">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(event) =>
                        updateForm("is_active", event.target.checked)
                      }
                      disabled={updateMutation.isPending}
                      className="h-4 w-4"
                    />

                    <span className="text-sm font-medium text-foreground">
                      Ressource active
                    </span>
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={cancelEditInfo}
                  disabled={updateMutation.isPending}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-medium text-foreground hover:bg-muted"
                >
                  <X size={16} />
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium text-white gradient-brand glow-primary disabled:opacity-50"
                >
                  {updateMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  Enregistrer
                </button>
              </div>
            </form>
          ) : (
            <div className="grid gap-5 p-6 md:grid-cols-2">
              <InfoItem label="Nom" value={resource.name} />

              <InfoItem label="Clé" value={resource.key} code />

              <InfoItem
                label="Description"
                value={resource.description || "Aucune description."}
              />

              <InfoItem label="Position" value={String(resource.position)} />
            </div>
          )}
        </Card>

        {/* ============================================================
         * SCHEMA ADMIN
         * ========================================================== */}

        <Card className="mb-6">
          <div className="px-6 py-5">
            <PluginResourceSchemaBuilder
              resource={resource}
              editable={canEdit}
            />
          </div>
        </Card>

        {/* ============================================================
         * USER OVERRIDE
         * ========================================================== */}

        {resource.scope === "USER" && resource.allow_user_schema_override && (
          <div className="mb-6">
            <PluginResourceUserSchema
              resourceId={resource.id}
              enabled={resource.allow_user_schema_override}
            />
          </div>
        )}

        {/* ============================================================
         * DATA
         * ========================================================== */}

        <div className="mb-6">
          <div className="mb-4 flex items-center gap-3">
            <Database size={19} className="text-primary" />

            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Gestion des données
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Enregistrez les données individuellement ou importez-les depuis
                Excel.
              </p>
            </div>
          </div>

          {isSchemaLoading ? (
            <Card className="flex min-h-[180px] items-center justify-center">
              <Loader2 size={24} className="animate-spin text-primary" />
            </Card>
          ) : (
            <>
              {showRecordForm && (
                <div className="mb-6">
                  <PluginResourceRecordForm
                    key={editingRecord?.id ?? "new"}
                    resourceId={resource.id}
                    fields={effectiveSchema.fields}
                    record={editingRecord}
                    onSaved={refreshRecords}
                    onCancel={closeRecordForm}
                  />
                </div>
              )}

              <div className="mb-6">
                <PluginResourceRecordTable
                  resourceId={resource.id}
                  records={records}
                  fields={effectiveSchema.fields}
                  isLoading={recordsQuery.isLoading}
                  onChanged={async () => {
                    await recordsQuery.refetch();
                  }}
                  onAdd={openAddRecord}
                  onEdit={openEditRecord}
                />
              </div>

              <PluginResourceExcelImport
                resourceId={resource.id}
                onImported={async () => {
                  await recordsQuery.refetch();
                }}
              />
            </>
          )}
        </div>

        {/* ============================================================
         * DATA RULES
         * ========================================================== */}

        <div className="mb-8 rounded-2xl border border-border bg-muted/10 px-5 py-4">
          <div className="flex items-start gap-3">
            <FileSpreadsheet
              size={18}
              className="mt-0.5 shrink-0 text-primary"
            />

            <div>
              <p className="text-sm font-semibold text-foreground">
                Règle d&#39;import
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Le fichier Excel doit utiliser les clés des champs comme
                en-têtes de colonnes. La validation finale est effectuée par le
                backend contre le schéma effectif de la ressource.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function InfoItem({
  label,
  value,
  code = false,
}: {
  label: string;
  value: string;
  code?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>

      {code ? (
        <code className="mt-1 block text-sm font-semibold text-foreground">
          {value}
        </code>
      ) : (
        <p className="mt-1 text-sm text-foreground">{value}</p>
      )}
    </div>
  );
}
