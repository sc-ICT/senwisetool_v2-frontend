"use client";

import { ApiError } from "@/lib/api";
import { pluginResourceService } from "@/services/plugin-resource.service";
import type { PluginResourceWorkbookImportResponse } from "@/types/plugin-resource";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface PluginResourceWorkbookImportProps {
  pluginId: number;
  disabled?: boolean;
  onImported?: () => void;
}

export function PluginResourceWorkbookImport({
  pluginId,
  disabled = false,
  onImported,
}: PluginResourceWorkbookImportProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] =
    useState<PluginResourceWorkbookImportResponse | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!file) {
        throw new Error("Sélectionnez un fichier Excel.");
      }

      return pluginResourceService.importWorkbook(pluginId, file);
    },

    onSuccess: async (response) => {
      setResult(response.data ?? null);

      await queryClient.invalidateQueries({
        queryKey: ["plugin-resources", pluginId],
      });

      toast.success("Import du workbook terminé avec succès.");

      onImported?.();
      setOpen(false);
    },

    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
        return;
      }

      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible d'importer le fichier.",
      );
    },
  });

  const selectFile = () => {
    if (disabled || mutation.isPending) {
      return;
    }

    inputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;

    if (!selected) {
      setFile(null);
      return;
    }

    if (!selected.name.toLowerCase().endsWith(".xlsx")) {
      toast.error("Le fichier doit être au format .xlsx.");

      setFile(null);

      event.target.value = "";

      return;
    }

    setFile(selected);

    setResult(null);
  };

  const close = () => {
    if (mutation.isPending) {
      return;
    }

    setOpen(false);
    setFile(null);
    setResult(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const importFile = () => {
    if (!file || mutation.isPending) {
      return;
    }

    mutation.mutate();
  };

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FileSpreadsheet size={16} />
        Importer Excel
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-background shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="text-base font-semibold">
                  Importer les ressources
                </h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  Un seul fichier Excel peut contenir plusieurs ressources et
                  plusieurs feuilles.
                </p>
              </div>

              <button
                type="button"
                disabled={mutation.isPending}
                onClick={close}
                className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx"
                className="hidden"
                onChange={handleFileChange}
              />

              <button
                type="button"
                onClick={selectFile}
                disabled={mutation.isPending}
                className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border px-6 py-10 text-center transition hover:border-primary/50 hover:bg-muted/20 disabled:opacity-50"
              >
                <Upload size={30} className="text-primary" />

                <span className="mt-3 text-sm font-semibold">
                  {file ? file.name : "Sélectionner le fichier Excel"}
                </span>

                <span className="mt-1 text-xs text-muted-foreground">
                  .xlsx uniquement
                </span>
              </button>

              {file && (
                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet size={20} className="text-primary" />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {file.name}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {result && (
                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      size={18}
                      className="mt-0.5 shrink-0 text-green-600"
                    />

                    <div className="space-y-1 text-sm">
                      <p className="font-semibold">Import terminé</p>

                      <p className="text-muted-foreground">
                        {result.sheets} feuille(s)
                      </p>

                      <p className="text-muted-foreground">
                        {result.resources_created} ressource(s) créée(s),{" "}
                        {result.resources_updated} mise(s) à jour
                      </p>

                      <p className="text-muted-foreground">
                        {result.relations_created} relation(s) créée(s)
                      </p>

                      <p className="text-muted-foreground">
                        {result.records_imported} donnée(s) importée(s)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {mutation.isError && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle
                      size={18}
                      className="mt-0.5 shrink-0 text-destructive"
                    />

                    <p className="text-sm text-destructive">
                      {mutation.error instanceof Error
                        ? mutation.error.message
                        : "Erreur lors de l'import."}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
              <button
                type="button"
                disabled={mutation.isPending}
                onClick={close}
                className="rounded-xl border border-border px-4 py-2 text-sm font-semibold disabled:opacity-50"
              >
                Fermer
              </button>

              <button
                type="button"
                disabled={!file || mutation.isPending}
                onClick={importFile}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
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
                  cursor: mutation.isPending ? "not-allowed" : "pointer",
                  opacity: mutation.isPending ? 0.6 : 1,
                }}
              >
                {mutation.isPending && (
                  <Loader2 size={16} className="animate-spin" />
                )}

                {mutation.isPending ? "Importation..." : "Importer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
