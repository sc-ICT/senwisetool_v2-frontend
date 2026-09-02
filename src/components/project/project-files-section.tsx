"use client";

import { FileImportDialog } from "@/components/file-system/file-import-dialog";
import { ApiError } from "@/lib/api";
import { fileSystemService } from "@/services/file-system.service";
import type { FileNode } from "@/types/file-system";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { File, Folder, Loader2, RefreshCw, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ProjectFilesSectionProps {
  projectFolderId: number | null;
}

export function ProjectFilesSection({
  projectFolderId,
}: ProjectFilesSectionProps) {
  const queryClient = useQueryClient();

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null);

  /* ---------------------------------------------------------------------- */
  /* Fichiers du projet                                                     */
  /* ---------------------------------------------------------------------- */

  const {
    data: filesData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["project-files", projectFolderId],

    queryFn: async () => {
      if (projectFolderId === null) {
        return {
          items: [],
          count: 0,
        };
      }

      const response = await fileSystemService.listChildren(projectFolderId);

      return response.data;
    },

    enabled: projectFolderId !== null,
  });

  const items = filesData?.items ?? [];

  /* ---------------------------------------------------------------------- */
  /* Import de fichiers                                                     */
  /* ---------------------------------------------------------------------- */

  const importMutation = useMutation({
    mutationFn: async ({
      files,
      relativePaths,
    }: {
      files: File[];
      relativePaths: string[];
    }) => {
      if (projectFolderId === null) {
        throw new Error("Le dossier du projet est introuvable.");
      }

      return fileSystemService.import(files, relativePaths, projectFolderId);
    },

    onSuccess: async (response) => {
      const importedCount = response.data?.length ?? 0;

      await queryClient.invalidateQueries({
        queryKey: ["project-files", projectFolderId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["files", projectFolderId],
      });

      setIsImportOpen(false);

      toast.success(
        importedCount === 1
          ? "Fichier importé avec succès."
          : `${importedCount} fichiers importés avec succès.`,
      );
    },

    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible d'importer les fichiers.";

      toast.error(message);
    },
  });

  /* ---------------------------------------------------------------------- */
  /* Import ZIP                                                              */
  /* ---------------------------------------------------------------------- */

  const importZipMutation = useMutation({
    mutationFn: async (file: globalThis.File) => {
      if (projectFolderId === null) {
        throw new Error("Le dossier du projet est introuvable.");
      }

      return fileSystemService.importZip(file, projectFolderId);
    },

    onSuccess: async (response) => {
      const importedCount = response.data?.length ?? 0;

      await queryClient.invalidateQueries({
        queryKey: ["project-files", projectFolderId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["files", projectFolderId],
      });

      setIsImportOpen(false);

      toast.success(
        importedCount === 1
          ? "Archive importée avec succès."
          : `${importedCount} éléments importés avec succès.`,
      );
    },

    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible d'importer l'archive.";

      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (fileId: number) => {
      return fileSystemService.delete(fileId);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["project-files", projectFolderId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["files", projectFolderId],
      });

      toast.success("Fichier supprimé avec succès.");
    },

    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de supprimer le fichier.";

      toast.error(message);
    },

    onSettled: () => {
      setDeletingFileId(null);
    },
  });

  const handleDelete = (file: FileNode) => {
    if (file.type !== "FILE") {
      return;
    }

    if (deletingFileId !== null) {
      return;
    }

    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer « ${file.name} » ?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingFileId(file.id);
    deleteMutation.mutate(file.id);
  };

  /* ---------------------------------------------------------------------- */
  /* État : dossier du projet absent                                         */
  /* ---------------------------------------------------------------------- */

  if (projectFolderId === null) {
    return (
      <section
        style={{
          border: "1px solid var(--color-border)",
          borderRadius: "1rem",
          background: "var(--color-surface)",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            padding: "1rem 1.25rem",
            fontSize: "0.875rem",
            color: "var(--color-foreground-muted)",
          }}
        >
          Le dossier de fichiers de ce projet est indisponible.
        </div>
      </section>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Rendu                                                                   */
  /* ---------------------------------------------------------------------- */

  return (
    <>
      <section
        style={{
          border: "1px solid var(--color-border)",
          borderRadius: "0.3rem",
          background: "var(--color-surface)",
          marginBottom: "1.5rem",
          overflow: "hidden",
        }}
      >
        {/* En-tête -------------------------------------------------------- */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            padding: "1rem 1.25rem",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              minWidth: 0,
            }}
          >
            <Folder size={17} />

            <div>
              <div
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 700,
                }}
              >
                {items.length} élément
                {items.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <button
              type="button"
              onClick={() => {
                void refetch();
              }}
              disabled={isFetching}
              title="Actualiser"
              style={{
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "0.625rem",
                border: "1px solid var(--color-border)",
                background: "var(--color-surface-raised)",
                color: "var(--color-foreground-muted)",
                cursor: isFetching ? "not-allowed" : "pointer",
                opacity: isFetching ? 0.6 : 1,
              }}
            >
              {isFetching ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsImportOpen(true);
              }}
              disabled={importMutation.isPending || importZipMutation.isPending}
              style={{
                height: "36px",
                padding: "0 0.875rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                borderRadius: "0.625rem",
                border: "1px solid rgba(93, 184, 58, 0.25)",
                background: "rgba(93, 184, 58, 0.1)",
                color: "#5DB83A",
                fontSize: "0.8125rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Upload size={15} />
              Ajouter un fichier
            </button>
          </div>
        </div>

        {/* Contenu -------------------------------------------------------- */}

        {isLoading ? (
          <div
            style={{
              minHeight: "140px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Loader2 size={22} className="animate-spin" />
          </div>
        ) : error ? (
          <div
            style={{
              minHeight: "140px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              padding: "1.5rem",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "0.8125rem",
                color: "var(--color-foreground-muted)",
              }}
            >
              Impossible de charger les fichiers du projet.
            </div>

            <button
              type="button"
              onClick={() => {
                void refetch();
              }}
              style={{
                height: "34px",
                padding: "0 0.75rem",
                borderRadius: "0.625rem",
                border: "1px solid var(--color-border)",
                background: "var(--color-surface-raised)",
                color: "var(--color-foreground)",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Réessayer
            </button>
          </div>
        ) : items.length === 0 ? (
          <div
            style={{
              minHeight: "150px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              padding: "1.5rem",
              textAlign: "center",
            }}
          >
            <Folder
              size={30}
              style={{
                color: "var(--color-foreground-muted)",
              }}
            />

            <div>
              <div
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                }}
              >
                Aucun fichier
              </div>

              <div
                style={{
                  marginTop: "0.25rem",
                  fontSize: "0.7rem",
                  color: "var(--color-foreground-muted)",
                }}
              >
                Ajoutez les ressources nécessaires à ce projet.
              </div>
            </div>
          </div>
        ) : (
          <div>
            {items.map((item) => (
              <ProjectFileRow
                key={item.id}
                item={item}
                deleting={deletingFileId === item.id}
                disabled={
                  deleteMutation.isPending ||
                  importMutation.isPending ||
                  importZipMutation.isPending
                }
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Import                                                               */}
      {/* ------------------------------------------------------------------ */}

      {isImportOpen && (
        <FileImportDialog
          isPending={importMutation.isPending || importZipMutation.isPending}
          onClose={() => {
            if (!importMutation.isPending && !importZipMutation.isPending) {
              setIsImportOpen(false);
            }
          }}
          onFilesSelected={(files, relativePaths) => {
            importMutation.mutate({
              files,
              relativePaths,
            });
          }}
          onZipSelected={(file) => {
            importZipMutation.mutate(file);
          }}
        />
      )}
    </>
  );
}

/* ========================================================================== */
/* Ligne fichier                                                               */
/* ========================================================================== */

function ProjectFileRow({
  item,
  deleting,
  disabled,
  onDelete,
}: {
  item: FileNode;
  deleting: boolean;
  disabled: boolean;
  onDelete: (file: FileNode) => void;
}) {
  const isFolder = item.type === "FOLDER";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.875rem 1.25rem",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "0.625rem",
          background: isFolder
            ? "rgba(14, 165, 233, 0.1)"
            : "var(--color-surface-raised)",
          border: "1px solid var(--color-border)",
        }}
      >
        {isFolder ? <Folder size={17} /> : <File size={17} />}
      </div>

      <div
        style={{
          minWidth: 0,
          flex: 1,
        }}
      >
        <div
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: "var(--color-foreground)",
          }}
          title={item.name}
        >
          {item.name}
        </div>

        <div
          style={{
            marginTop: "0.2rem",
            fontSize: "0.6875rem",
            color: "var(--color-foreground-muted)",
          }}
        >
          {isFolder ? "Dossier" : item.mime_type || item.extension || "Fichier"}
        </div>
      </div>

      {!isFolder && item.size !== null && (
        <div
          style={{
            flexShrink: 0,
            fontSize: "0.6875rem",
            color: "var(--color-foreground-muted)",
          }}
        >
          {formatFileSize(item.size)}
        </div>
      )}

      {!isFolder && (
        <button
          type="button"
          onClick={() => {
            onDelete(item);
          }}
          disabled={disabled || deleting}
          title="Supprimer"
          aria-label={`Supprimer ${item.name}`}
          style={{
            width: "32px",
            height: "32px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            borderRadius: "0.375rem",
            background: "transparent",
            color: "var(--color-destructive)",
            cursor: disabled || deleting ? "not-allowed" : "pointer",
            opacity: disabled || deleting ? 0.5 : 1,
          }}
        >
          {deleting ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Trash2 size={15} />
          )}
        </button>
      )}
    </div>
  );
}

/* ========================================================================== */
/* Format taille                                                               */
/* ========================================================================== */

function formatFileSize(size: number): string {
  if (size < 1024) {
    return `${size} o`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} Ko`;
  }

  if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} Mo`;
  }

  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} Go`;
}
