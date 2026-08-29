"use client";

import {
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { ChangeEvent, useRef, useState } from "react";

import { ApiError } from "@/lib/api";
import { formImportService } from "@/services/form-import.service";
import type { FormImportResult } from "@/types/form-import";

interface FormImportDialogProps {
  projectId: number;

  onClose: () => void;

  onImported: () => void;
}

export function FormImportDialog({
  projectId,
  onClose,
  onImported,
}: FormImportDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);

  const [isValidating, setIsValidating] = useState(false);

  const [isExecuting, setIsExecuting] = useState(false);

  const [result, setResult] = useState<FormImportResult | null>(null);

  const [error, setError] = useState<string | null>(null);

  const isPending = isValidating || isExecuting;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    setError(null);
    setResult(null);

    const filename = selectedFile.name.toLowerCase();

    if (!filename.endsWith(".xlsx") && !filename.endsWith(".xlsm")) {
      setError("Le fichier doit être un classeur Excel (.xlsx ou .xlsm).");

      return;
    }

    setFile(selectedFile);
  };

  const validate = async () => {
    if (!file) {
      setError("Veuillez sélectionner un fichier Excel.");

      return;
    }

    setIsValidating(true);
    setError(null);
    setResult(null);

    try {
      const response = await formImportService.validate(projectId, file);

      if (!response.data) {
        throw new Error(
          "Le serveur n'a retourné aucun résultat de validation.",
        );
      }

      setResult(response.data);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de valider le fichier.";

      setError(message);
    } finally {
      setIsValidating(false);
    }
  };

  const execute = async () => {
    if (!file) {
      return;
    }

    setIsExecuting(true);
    setError(null);

    try {
      const response = await formImportService.execute(projectId, file);

      if (!response.data) {
        throw new Error("Le serveur n'a retourné aucun résultat d'import.");
      }

      setResult(response.data);

      onImported();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible d'importer le formulaire.";

      setError(message);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        background: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(4px)",
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPending) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-import-title"
        style={{
          width: "100%",
          maxWidth: "620px",
          maxHeight: "calc(100vh - 3rem)",
          display: "flex",
          flexDirection: "column",
          borderRadius: "1rem",
          border: "1px solid var(--color-border)",
          background: "var(--color-surface)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
          overflow: "hidden",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1rem 1.125rem",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <div
              style={{
                width: "38px",
                height: "38px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "0.625rem",
                background: "rgba(93, 184, 58, 0.1)",
                color: "#5DB83A",
              }}
            >
              <FileSpreadsheet size={19} />
            </div>

            <div>
              <div
                id="form-import-title"
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: 700,
                }}
              >
                Importer un formulaire
              </div>

              <div
                style={{
                  marginTop: "0.2rem",
                  fontSize: "0.6875rem",
                  color: "var(--color-foreground-muted)",
                }}
              >
                Importez la structure complète depuis un fichier Excel.
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            aria-label="Fermer"
            style={{
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "0.5rem",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface-raised)",
              color: "var(--color-foreground-muted)",
              cursor: isPending ? "not-allowed" : "pointer",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* BODY */}

        <div
          style={{
            padding: "1.25rem",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {/* Sélection */}

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xlsm"
              hidden
              onChange={handleFileChange}
              disabled={isPending}
              onClick={(event) => {
                event.currentTarget.value = "";
              }}
            />

            <button
              type="button"
              onClick={() => {
                fileInputRef.current?.click();
              }}
              disabled={isPending}
              style={{
                width: "100%",
                minHeight: "110px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                borderRadius: "0.75rem",
                border: "1px dashed var(--color-border)",
                background: "var(--color-surface-raised)",
                color: "var(--color-foreground)",
                cursor: isPending ? "not-allowed" : "pointer",
              }}
            >
              <Upload size={22} color="#5DB83A" />

              <span
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                }}
              >
                {file ? "Changer de fichier" : "Sélectionner un fichier Excel"}
              </span>

              <span
                style={{
                  fontSize: "0.6875rem",
                  color: "var(--color-foreground-muted)",
                }}
              >
                .xlsx ou .xlsm
              </span>
            </button>

            {file && (
              <div
                style={{
                  marginTop: "0.625rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.625rem 0.75rem",
                  borderRadius: "0.5rem",
                  background: "var(--color-surface-raised)",
                  border: "1px solid var(--color-border)",
                  fontSize: "0.75rem",
                }}
              >
                <FileSpreadsheet size={15} color="#5DB83A" />

                <span
                  style={{
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {file.name}
                </span>

                <span
                  style={{
                    color: "var(--color-foreground-muted)",
                  }}
                >
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            )}
          </div>

          {/* Erreur technique */}

          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.625rem",
                padding: "0.75rem",
                borderRadius: "0.625rem",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                background: "rgba(239, 68, 68, 0.06)",
                color: "#EF4444",
                fontSize: "0.75rem",
              }}
            >
              <AlertCircle
                size={16}
                style={{
                  flexShrink: 0,
                  marginTop: "1px",
                }}
              />

              <span>{error}</span>
            </div>
          )}

          {/* Validation en cours */}

          {isValidating && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "1rem",
                color: "var(--color-foreground-muted)",
                fontSize: "0.75rem",
              }}
            >
              <Loader2 size={16} className="animate-spin" />
              Analyse et validation du fichier...
            </div>
          )}

          {/* Résultat */}

          {result && !isValidating && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                }}
              >
                {result.success ? (
                  <CheckCircle2 size={17} color="#5DB83A" />
                ) : (
                  <AlertCircle size={17} color="#EF4444" />
                )}

                {result.message}
              </div>

              {/* Statistiques */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "0.5rem",
                }}
              >
                <SummaryCard label="Feuilles" value={result.sheets} />

                <SummaryCard label="Questions" value={result.questions} />

                <SummaryCard label="Sections" value={result.sections} />

                <SummaryCard label="Groupes" value={result.groups} />

                <SummaryCard label="Dépendances" value={result.dependencies} />
              </div>

              {/* Erreurs Excel */}

              {result.issues.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "#EF4444",
                    }}
                  >
                    Erreurs à corriger
                  </div>

                  <div
                    style={{
                      maxHeight: "220px",
                      overflowY: "auto",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.375rem",
                    }}
                  >
                    {result.issues.map((issue, index) => (
                      <div
                        key={`${issue.sheet}-${issue.column}-${issue.row}-${index}`}
                        style={{
                          padding: "0.625rem 0.75rem",
                          borderRadius: "0.5rem",
                          background: "rgba(239, 68, 68, 0.05)",
                          border: "1px solid rgba(239, 68, 68, 0.15)",
                          fontSize: "0.6875rem",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 700,
                            color: "#EF4444",
                          }}
                        >
                          {issue.sheet ?? "Fichier"}
                          {issue.column ? ` · Colonne ${issue.column}` : ""}
                          {issue.row ? ` · Ligne ${issue.row}` : ""}
                        </div>

                        <div
                          style={{
                            marginTop: "0.2rem",
                            color: "var(--color-foreground)",
                          }}
                        >
                          {issue.message}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Résultat après import */}

              {result.success &&
                result.created_questions + result.reused_questions > 0 && (
                  <div
                    style={{
                      padding: "0.75rem",
                      borderRadius: "0.625rem",
                      background: "var(--color-surface-raised)",
                      border: "1px solid var(--color-border)",
                      fontSize: "0.75rem",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        marginBottom: "0.4rem",
                      }}
                    >
                      Résultat
                    </div>

                    <div>
                      Questions : <strong>{result.created_questions}</strong>{" "}
                      créées, <strong>{result.reused_questions}</strong>{" "}
                      réutilisées.
                    </div>

                    <div>
                      Sections : <strong>{result.created_sections}</strong>{" "}
                      créées, <strong>{result.reused_sections}</strong>{" "}
                      réutilisées.
                    </div>

                    <div>
                      Groupes : <strong>{result.created_groups}</strong> créés,{" "}
                      <strong>{result.reused_groups}</strong> réutilisés.
                    </div>

                    <div>
                      Dépendances :{" "}
                      <strong>{result.created_dependencies}</strong> créées,{" "}
                      <strong>{result.reused_dependencies}</strong> réutilisées.
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>

        {/* FOOTER */}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.5rem",
            padding: "0.875rem 1.125rem",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            style={secondaryButtonStyle}
          >
            Fermer
          </button>

          {!result?.success && (
            <button
              type="button"
              onClick={validate}
              disabled={!file || isPending}
              style={{
                ...primaryButtonStyle,
                opacity: !file || isPending ? 0.5 : 1,
              }}
            >
              {isValidating ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Validation...
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  Valider le fichier
                </>
              )}
            </button>
          )}

          {result?.success &&
            result.created_questions + result.reused_questions > 0 && (
              <button
                type="button"
                onClick={execute}
                disabled={isPending}
                style={{
                  ...primaryButtonStyle,
                  opacity: isPending ? 0.5 : 1,
                }}
              >
                {isExecuting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Importation...
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    Confirmer l&#39;import
                  </>
                )}
              </button>
            )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        padding: "0.625rem",
        borderRadius: "0.5rem",
        background: "var(--color-surface-raised)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div
        style={{
          fontSize: "0.625rem",
          color: "var(--color-foreground-muted)",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: "0.2rem",
          fontSize: "0.875rem",
          fontWeight: 700,
        }}
      >
        {value}
      </div>
    </div>
  );
}

const secondaryButtonStyle = {
  height: "36px",
  padding: "0 0.75rem",
  borderRadius: "0.5rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface-raised)",
  color: "var(--color-foreground)",
  display: "flex",
  alignItems: "center",
  gap: "0.375rem",
  fontSize: "0.75rem",
  fontWeight: 600,
  cursor: "pointer",
};

const primaryButtonStyle = {
  height: "36px",
  padding: "0 0.75rem",
  borderRadius: "0.5rem",
  border: "1px solid rgba(93, 184, 58, 0.3)",
  background: "rgba(93, 184, 58, 0.12)",
  color: "#5DB83A",
  display: "flex",
  alignItems: "center",
  gap: "0.375rem",
  fontSize: "0.75rem",
  fontWeight: 600,
  cursor: "pointer",
};
