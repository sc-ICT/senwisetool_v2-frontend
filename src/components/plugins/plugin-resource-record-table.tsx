"use client";

import {
  Eye,
  FileSpreadsheet,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api";
import { pluginResourceService } from "@/services/plugin-resource.service";
import type {
  PluginResourceRecord,
  PluginResourceSchemaField,
} from "@/types/plugin-resource";
import { useQuery } from "@tanstack/react-query";
import { PluginResourceExcelImport } from "./plugin-resource-excel-import";

interface Props {
  resourceId: number;
  records: PluginResourceRecord[];
  fields: PluginResourceSchemaField[];
  disabled?: boolean;
  isLoading?: boolean;
  onChanged?: () => void;
  onAdd?: () => void;
  onEdit?: (record: PluginResourceRecord) => void;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "—";
  }

  if (Array.isArray(value)) {
    return value.map(String).join(", ");
  }

  if (typeof value === "boolean") {
    return value ? "Oui" : "Non";
  }

  return String(value);
}

export function PluginResourceRecordTable({
  resourceId,
  records,
  fields,
  disabled = false,
  isLoading = false,
  onChanged,
  onAdd,
  onEdit,
}: Props) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isExcelImportOpen, setIsExcelImportOpen] = useState(false);

  const activeFields = fields
    .filter((field) => field.is_active)
    .sort((a, b) => a.position - b.position);

  const recordsQuery = useQuery({
    queryKey: ["plugin-resource-records", resourceId],

    queryFn: async () => {
      const response = await pluginResourceService.listRecords(resourceId);

      return response.data;
    },

    enabled: Number.isInteger(resourceId),
  });

  const handleDelete = async (record: PluginResourceRecord) => {
    if (disabled || deletingId !== null) {
      return;
    }

    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer cette donnée ?",
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(record.id);

    try {
      await pluginResourceService.deleteRecord(resourceId, record.id);

      toast.success("Donnée supprimée avec succès.");

      onChanged?.();
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Impossible de supprimer la donnée.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleImported = async () => {
    await recordsQuery.refetch();

    onChanged?.();

    setIsExcelImportOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[220px] items-center justify-center">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            <h2 className="text-base font-semibold text-foreground">Données</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {records.length} donnée
              {records.length > 1 ? "s" : ""} enregistrée
              {records.length > 1 ? "s" : ""}.
            </p>
          </div>

          {!disabled && (onAdd || Number.isInteger(resourceId)) && (
            <div className="flex items-center gap-2">
              {onAdd && (
                <button
                  type="button"
                  onClick={onAdd}
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
                  <Plus size={16} />
                  Ajouter
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsExcelImportOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-raised px-4 py-2 text-[0.8125rem] font-semibold text-foreground transition hover:bg-muted"
              >
                <FileSpreadsheet size={16} />
                Importer Excel
              </button>
            </div>
          )}
        </div>

        {records.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <Eye size={28} className="mx-auto text-muted-foreground" />

            <p className="mt-3 text-sm font-medium text-foreground">
              Aucune donnée
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Cette ressource ne contient encore aucune donnée.
            </p>

            {!disabled && (
              <div className="mt-5 flex items-center justify-center gap-3">
                {onAdd && (
                  <button
                    type="button"
                    onClick={onAdd}
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    <Plus size={15} />
                    Ajouter la première donnée
                  </button>
                )}
                <span>ou</span>
                <button
                  type="button"
                  onClick={() => setIsExcelImportOpen(true)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  <FileSpreadsheet size={15} />
                  Importer un fichier Excel
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  {activeFields.map((field) => (
                    <th
                      key={field.key}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      {field.label}
                    </th>
                  ))}

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {records.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-border last:border-0 hover:bg-muted/10"
                  >
                    {activeFields.map((field) => (
                      <td
                        key={field.key}
                        className="max-w-[260px] px-4 py-3 text-sm text-foreground"
                      >
                        <div className="truncate">
                          {formatValue(record.data[field.key])}
                        </div>
                      </td>
                    ))}

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {onEdit && !disabled && (
                          <button
                            type="button"
                            onClick={() => onEdit(record)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                            title="Modifier"
                          >
                            <Pencil size={16} />
                          </button>
                        )}

                        {!disabled && (
                          <button
                            type="button"
                            onClick={() => handleDelete(record)}
                            disabled={deletingId === record.id}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                            title="Supprimer"
                          >
                            {deletingId === record.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isExcelImportOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsExcelImportOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="excel-import-title"
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-6 py-4">
              <div>
                <h2
                  id="excel-import-title"
                  className="text-base font-semibold text-foreground"
                >
                  Importer des données
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Importez plusieurs données à partir d&#39;un fichier Excel.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsExcelImportOpen(false)}
                disabled={false}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                title="Fermer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              <PluginResourceExcelImport
                resourceId={resourceId}
                onImported={handleImported}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
