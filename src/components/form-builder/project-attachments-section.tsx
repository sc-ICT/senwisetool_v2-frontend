"use client";

import {
  File,
  FileArchive,
  FileAudio,
  FileImage,
  FileText,
  FileVideo,
  Loader2,
  Paperclip,
  Trash2,
  Upload,
} from "lucide-react";
import { useCallback, useState } from "react";

import { projectService } from "@/services/project.service";
import type { FileNode } from "@/types/file-system";

interface ProjectAttachmentsSectionProps {
  projectId: number;
  enabled: boolean;
  disabled?: boolean;
  onBeforeUpload?: () => Promise<boolean>;
}

function formatFileSize(size: number | null | undefined): string {
  if (!size || size <= 0) {
    return "Taille inconnue";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];

  let value = size;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function getFileIcon(file: FileNode) {
  const mimeType = file.mime_type?.toLowerCase() ?? "";
  const extension = file.extension?.toLowerCase() ?? "";

  if (mimeType.startsWith("image/")) {
    return <FileImage size={18} />;
  }

  if (mimeType.startsWith("video/")) {
    return <FileVideo size={18} />;
  }

  if (mimeType.startsWith("audio/")) {
    return <FileAudio size={18} />;
  }

  if (
    mimeType.includes("pdf") ||
    mimeType.includes("text") ||
    ["txt", "csv", "md"].includes(extension)
  ) {
    return <FileText size={18} />;
  }

  if (
    mimeType.includes("zip") ||
    mimeType.includes("archive") ||
    ["zip", "rar", "7z", "tar", "gz"].includes(extension)
  ) {
    return <FileArchive size={18} />;
  }

  return <File size={18} />;
}

export function ProjectAttachmentsSection({
  projectId,
  enabled,
  disabled = false,
  onBeforeUpload,
}: ProjectAttachmentsSectionProps) {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingFileName, setUploadingFileName] = useState<string | null>(
    null,
  );
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadFiles = useCallback(async () => {
    if (!enabled || isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await projectService.listFiles(projectId);

      setFiles(response.data?.items ?? []);
      setHasLoaded(true);
    } catch (err) {
      console.error("Erreur lors du chargement des fichiers du projet", err);

      setError("Impossible de charger les fichiers attachés à ce projet.");
    } finally {
      setIsLoading(false);
    }
  }, [enabled, isLoading, projectId]);

  const handleOpen = async () => {
    if (!enabled || disabled || isLoading) {
      return;
    }

    if (!hasLoaded) {
      await loadFiles();
    }
  };

  const handleSelectFile = async () => {
    if (disabled || !enabled || uploadingFileName) {
      return;
    }

    if (!hasLoaded) {
      await loadFiles();
    }

    const input = document.createElement("input");

    input.type = "file";

    input.onchange = (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];

      if (!file) {
        return;
      }

      void handleUpload(file);
    };

    input.click();
  };

  const handleUpload = async (file: File) => {
    if (disabled || !enabled) {
      return;
    }

    if (onBeforeUpload) {
      const canUpload = await onBeforeUpload();

      if (!canUpload) {
        return;
      }
    }

    setUploadingFileName(file.name);
    setError(null);

    try {
      const response = await projectService.uploadFile(projectId, file);

      const uploadedFile = response.data;

      if (uploadedFile) {
        setFiles((currentFiles) => [...currentFiles, uploadedFile]);
        setHasLoaded(true);
      } else {
        setHasLoaded(false);
        await loadFiles();
      }
    } catch (err) {
      console.error("Erreur lors de l'upload du fichier", err);

      setError(`Impossible d'ajouter le fichier « ${file.name} ».`);
    } finally {
      setUploadingFileName(null);
    }
  };

  const handleDelete = async (file: FileNode) => {
    if (disabled || deletingFileId !== null) {
      return;
    }

    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer « ${file.name} » ?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingFileId(file.id);
    setError(null);

    try {
      await projectService.deleteFile(projectId, file.id);

      setFiles((currentFiles) =>
        currentFiles.filter((currentFile) => currentFile.id !== file.id),
      );
    } catch (err) {
      console.error("Erreur lors de la suppression du fichier", err);

      setError(`Impossible de supprimer le fichier « ${file.name} ».`);
    } finally {
      setDeletingFileId(null);
    }
  };

  if (!enabled) {
    return null;
  }

  return (
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
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Paperclip size={16} />

          <div>
            <div
              style={{
                fontSize: "0.8125rem",
                fontWeight: 600,
              }}
            >
              Fichiers du projet
            </div>

            <div
              style={{
                marginTop: "0.125rem",
                fontSize: "0.75rem",
                color: "var(--color-foreground-muted)",
              }}
            >
              Les fichiers sont conservés dans le dossier du projet.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void handleSelectFile()}
          disabled={disabled || uploadingFileName !== null}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.375rem",
            padding: "0.45rem 0.7rem",
            border: "1px solid var(--color-border)",
            borderRadius: "0.375rem",
            background: "var(--color-background)",
            color: "var(--color-foreground)",
            cursor:
              disabled || uploadingFileName !== null ? "default" : "pointer",
            opacity: disabled || uploadingFileName !== null ? 0.6 : 1,
            fontSize: "0.75rem",
            fontWeight: 500,
          }}
        >
          {uploadingFileName ? (
            <>
              <Loader2
                size={14}
                style={{
                  animation: "spin 1s linear infinite",
                }}
              />
              Ajout...
            </>
          ) : (
            <>
              <Upload size={14} />
              Ajouter un fichier
            </>
          )}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            padding: "0.625rem 0.75rem",
            borderRadius: "0.375rem",
            background: "var(--color-destructive-muted)",
            color: "var(--color-destructive)",
            fontSize: "0.75rem",
            lineHeight: 1.4,
          }}
        >
          {error}
        </div>
      )}

      {!hasLoaded && !isLoading ? (
        <button
          type="button"
          onClick={() => void handleOpen()}
          disabled={disabled}
          style={{
            padding: "1rem",
            border: "1px dashed var(--color-border)",
            borderRadius: "0.5rem",
            background: "transparent",
            color: "var(--color-foreground-muted)",
            cursor: disabled ? "default" : "pointer",
            fontSize: "0.75rem",
          }}
        >
          Cliquer pour charger les fichiers du projet
        </button>
      ) : isLoading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            padding: "1.25rem",
            color: "var(--color-foreground-muted)",
            fontSize: "0.75rem",
          }}
        >
          <Loader2
            size={16}
            style={{
              animation: "spin 1s linear infinite",
            }}
          />
          Chargement des fichiers...
        </div>
      ) : files.length === 0 ? (
        <div
          style={{
            padding: "1rem",
            border: "1px dashed var(--color-border)",
            borderRadius: "0.5rem",
            textAlign: "center",
            fontSize: "0.75rem",
            color: "var(--color-foreground-muted)",
          }}
        >
          Aucun fichier attaché à ce projet.
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          {files.map((file) => (
            <div
              key={file.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.625rem 0.75rem",
                border: "1px solid var(--color-border)",
                borderRadius: "0.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  width: "2rem",
                  height: "2rem",
                  borderRadius: "0.375rem",
                  background: "var(--color-muted)",
                }}
              >
                {getFileIcon(file)}
              </div>

              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                  }}
                  title={file.name}
                >
                  {file.name}
                </div>

                <div
                  style={{
                    marginTop: "0.125rem",
                    fontSize: "0.6875rem",
                    color: "var(--color-foreground-muted)",
                  }}
                >
                  {formatFileSize(file.size)}
                </div>
              </div>

              <button
                type="button"
                onClick={() => void handleDelete(file)}
                disabled={disabled || deletingFileId === file.id}
                title="Supprimer"
                aria-label={`Supprimer ${file.name}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "2rem",
                  height: "2rem",
                  border: "none",
                  borderRadius: "0.375rem",
                  background: "transparent",
                  color: "var(--color-destructive)",
                  cursor:
                    disabled || deletingFileId === file.id
                      ? "default"
                      : "pointer",
                  opacity: disabled || deletingFileId === file.id ? 0.5 : 1,
                }}
              >
                {deletingFileId === file.id ? (
                  <Loader2
                    size={15}
                    style={{
                      animation: "spin 1s linear infinite",
                    }}
                  />
                ) : (
                  <Trash2 size={15} />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
