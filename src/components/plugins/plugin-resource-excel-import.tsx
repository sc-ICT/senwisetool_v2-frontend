"use client";

import {
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api";
import { pluginResourceService } from "@/services/plugin-resource.service";
import type { PluginResourceImportError } from "@/types/plugin-resource";

interface Props {
  resourceId: number;
  disabled?: boolean;
  onImported?: () => void;
}

export function PluginResourceExcelImport({
  resourceId,
  disabled = false,
  onImported,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);

  const [isPending, setIsPending] = useState(false);

  const [errors, setErrors] = useState<PluginResourceImportError[]>([]);

  const [result, setResult] = useState<{
    imported: number;
    rejected: number;
  } | null>(null);

  const selectFile = () => {
    if (disabled || isPending) {
      return;
    }

    inputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;

    setErrors([]);
    setResult(null);

    if (!selected) {
      setFile(null);
      return;
    }

    if (!selected.name.toLowerCase().endsWith(".xlsx")) {
      toast.error("Veuillez sélectionner un fichier Excel .xlsx.");

      event.target.value = "";
      setFile(null);

      return;
    }

    setFile(selected);
  };

  const handleImport = async () => {
    if (disabled || isPending || !file) {
      return;
    }

    setIsPending(true);
    setErrors([]);
    setResult(null);

    try {
      const response = await pluginResourceService.importExcel(
        resourceId,
        file,
      );

      const data = response.data ?? {
        imported: 0,
        rejected: 0,
      };

      setResult({
        imported: data.imported ?? 0,
        rejected: data.rejected ?? 0,
      });

      toast.success(`${data.imported ?? 0} donnée(s) importée(s) avec succès.`);

      setFile(null);

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      onImported?.();
    } catch (error) {
      if (error instanceof ApiError) {
        const apiData = error.data as
          | {
              data?: {
                imported?: number;
                rejected?: number;
                errors?: PluginResourceImportError[];
              };
            }
          | undefined;

        const importData = apiData?.data;

        if (importData?.errors && Array.isArray(importData.errors)) {
          setErrors(importData.errors);

          setResult({
            imported: importData.imported ?? 0,
            rejected: importData.rejected ?? 0,
          });

          toast.error(
            "Le fichier contient des erreurs. Aucune donnée n'a été importée.",
          );

          return;
        }

        toast.error(error.message);

        return;
      }

      toast.error("Impossible d'importer le fichier Excel.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-6 py-5">
        <div className="flex items-center gap-3">
          <FileSpreadsheet size={19} className="text-primary" />

          <div>
            <h2 className="text-base font-semibold text-foreground">
              Import Excel
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Importez plusieurs données en respectant exactement le schéma.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled || isPending}
        />

        <button
          type="button"
          onClick={selectFile}
          disabled={disabled || isPending}
          className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/10 px-6 py-10 text-center transition hover:border-primary/40 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Upload size={28} className="text-primary" />

          <span className="mt-3 text-sm font-semibold text-foreground">
            {file ? file.name : "Sélectionner un fichier Excel"}
          </span>

          <span className="mt-1 text-xs text-muted-foreground">
            Format accepté : .xlsx
          </span>
        </button>

        {file && (
          <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/20 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {file.name}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>

            <button
              type="button"
              onClick={handleImport}
              disabled={disabled || isPending}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-medium text-white gradient-brand glow-primary disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Upload size={16} />
              )}
              Importer
            </button>
          </div>
        )}

        {result && (
          <div className="mt-5 rounded-xl border border-border bg-muted/20 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={18}
                className="mt-0.5 shrink-0 text-success"
              />

              <div>
                <p className="text-sm font-semibold text-foreground">
                  Résultat de l&#39;import
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Importées : <strong>{result.imported}</strong>
                  {" · "}
                  Rejetées : <strong>{result.rejected}</strong>
                </p>
              </div>
            </div>
          </div>
        )}

        {errors.length > 0 && (
          <div className="mt-5 rounded-xl border border-destructive/20 bg-destructive/5">
            <div className="flex items-start gap-3 border-b border-destructive/10 px-4 py-4">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0 text-destructive"
              />

              <div>
                <p className="text-sm font-semibold text-foreground">
                  Erreurs de validation
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Aucune ligne n&#39;a été importée.
                </p>
              </div>
            </div>

            <div className="max-h-[360px] overflow-auto p-4">
              <div className="space-y-2">
                {errors.map((error, index) => (
                  <div
                    key={`${error.row}-${error.field}-${index}`}
                    className="rounded-lg border border-border bg-card px-3 py-3"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-semibold text-foreground">
                        Ligne {error.row}
                      </span>

                      {error.column && (
                        <code className="rounded bg-muted px-1.5 py-0.5">
                          {error.column}
                        </code>
                      )}

                      {error.field && (
                        <code className="rounded bg-muted px-1.5 py-0.5">
                          {error.field}
                        </code>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {error.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
