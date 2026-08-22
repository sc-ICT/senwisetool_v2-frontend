"use client";

import { Archive, FileUp, FolderOpen, Loader2, X } from "lucide-react";
import { ChangeEvent, useRef, useState } from "react";

interface FileImportDialogProps {
  onClose: () => void;
  onFilesSelected: (files: File[], relativePaths: string[]) => void;
  onZipSelected: (file: File) => void;
  isPending: boolean;
}

export function FileImportDialog({
  onClose,
  onFilesSelected,
  isPending,
  onZipSelected,
}: FileImportDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const folderInputRef = useRef<HTMLInputElement>(null);

  const zipInputRef = useRef<HTMLInputElement>(null);

  const [selectionMode, setSelectionMode] = useState<"files" | "folder" | null>(
    null,
  );

  const handleFilesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) {
      return;
    }

    const relativePaths = files.map(
      (file) => file.webkitRelativePath || file.name,
    );

    onFilesSelected(files, relativePaths);
  };

  const handleFolderChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) {
      return;
    }

    const relativePaths = files.map(
      (file) => file.webkitRelativePath || file.name,
    );

    onFilesSelected(files, relativePaths);
  };

  const handleZipChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    onZipSelected(file);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 140,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        background: "rgba(0, 0, 0, 0.35)",
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
        aria-labelledby="import-dialog-title"
        style={{
          width: "100%",
          maxWidth: "460px",
          borderRadius: "1rem",
          border: "1px solid var(--color-border)",
          background: "var(--color-surface)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.18)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1rem 1.125rem",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div>
            <div
              id="import-dialog-title"
              style={{
                fontSize: "0.9375rem",
                fontWeight: 700,
                color: "var(--color-foreground)",
              }}
            >
              Importer
            </div>

            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--color-foreground-muted)",
                marginTop: "0.25rem",
              }}
            >
              Importer dans <strong>l&#39;emplacement actuel</strong>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "0.5rem",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface-raised)",
              color: "var(--color-foreground-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: isPending ? "not-allowed" : "pointer",
            }}
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>

        <div
          style={{
            padding: "1.25rem",
            display: "grid",
            gap: "0.75rem",
          }}
        >
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              setSelectionMode("files");

              fileInputRef.current?.click();
            }}
            style={{
              width: "100%",
              minHeight: "92px",
              display: "flex",
              alignItems: "center",
              gap: "0.875rem",
              padding: "0 1rem",
              borderRadius: "0.75rem",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface-raised)",
              color: "var(--color-foreground)",
              cursor: isPending ? "not-allowed" : "pointer",
              textAlign: "left",
              opacity: isPending ? 0.6 : 1,
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                flexShrink: 0,
                borderRadius: "0.625rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(93, 184, 58, 0.1)",
                color: "#5DB83A",
              }}
            >
              <FileUp size={19} />
            </div>

            <div>
              <div
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                }}
              >
                Importer des fichiers
              </div>

              <div
                style={{
                  marginTop: "0.2rem",
                  fontSize: "0.75rem",
                  color: "var(--color-foreground-muted)",
                }}
              >
                Un ou plusieurs fichiers
              </div>
            </div>
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              setSelectionMode("folder");

              folderInputRef.current?.click();
            }}
            style={{
              width: "100%",
              minHeight: "92px",
              display: "flex",
              alignItems: "center",
              gap: "0.875rem",
              padding: "0 1rem",
              borderRadius: "0.75rem",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface-raised)",
              color: "var(--color-foreground)",
              cursor: isPending ? "not-allowed" : "pointer",
              textAlign: "left",
              opacity: isPending ? 0.6 : 1,
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                flexShrink: 0,
                borderRadius: "0.625rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(14, 165, 233, 0.1)",
                color: "#0EA5E9",
              }}
            >
              <FolderOpen size={19} />
            </div>

            <div>
              <div
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                }}
              >
                Importer un dossier
              </div>

              <div
                style={{
                  marginTop: "0.2rem",
                  fontSize: "0.75rem",
                  color: "var(--color-foreground-muted)",
                }}
              >
                Conserver toute son arborescence
              </div>
            </div>
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              zipInputRef.current?.click();
            }}
            style={{
              width: "100%",
              minHeight: "92px",
              display: "flex",
              alignItems: "center",
              gap: "0.875rem",
              padding: "0 1rem",
              borderRadius: "0.75rem",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface-raised)",
              color: "var(--color-foreground)",
              cursor: "pointer",
              textAlign: "left",
              opacity: isPending ? 0.6 : 1,
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                flexShrink: 0,
                borderRadius: "0.625rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(168, 85, 247, 0.1)",
                color: "#A855F7",
              }}
            >
              <Archive size={19} />
            </div>

            <div>
              <div
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                }}
              >
                Importer une archive ZIP
              </div>

              <div
                style={{
                  marginTop: "0.2rem",
                  fontSize: "0.75rem",
                  color: "var(--color-foreground-muted)",
                }}
              >
                Restaurer un dossier exporté
              </div>
            </div>
          </button>

          {isPending && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "0.875rem",
                color: "var(--color-foreground-muted)",
                fontSize: "0.8125rem",
              }}
            >
              <Loader2 size={16} className="animate-spin" />
              Importation...
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={handleFilesChange}
            disabled={isPending}
            onClick={(event) => {
              event.currentTarget.value = "";
            }}
          />

          <input
            ref={folderInputRef}
            type="file"
            multiple
            hidden
            onChange={handleFolderChange}
            disabled={isPending}
            onClick={(event) => {
              event.currentTarget.value = "";
            }}
            {...({
              webkitdirectory: "",
              directory: "",
            } as React.InputHTMLAttributes<HTMLInputElement>)}
          />

          <input
            ref={zipInputRef}
            type="file"
            accept=".zip,application/zip"
            hidden
            onChange={handleZipChange}
            disabled={isPending}
            onClick={(event) => {
              event.currentTarget.value = "";
            }}
          />

          {selectionMode === "folder" && (
            <div
              style={{
                fontSize: "0.6875rem",
                color: "var(--color-foreground-muted)",
                textAlign: "center",
              }}
            >
              La sélection d&#39;un dossier dépend du support du navigateur.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
