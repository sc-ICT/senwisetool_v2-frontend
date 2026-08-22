"use client";

import { BatchDeleteDialog } from "@/components/file-system/batch-delete-dialog";
import { DeleteConfirmDialog } from "@/components/file-system/delete-confirm-dialog";
import { FileGridView } from "@/components/file-system/file-grid-view";
import { FileImportDialog } from "@/components/file-system/file-import-dialog";
import { FileListView } from "@/components/file-system/file-list-view";
import { FileMoveDialog } from "@/components/file-system/file-move-dialog";
import { SelectionToolbar } from "@/components/file-system/selection-toolbar";
import { Header } from "@/components/layout/header";
import { ApiError } from "@/lib/api";
import { fileSystemService } from "@/services/file-system.service";
import type { FileNode } from "@/types/file-system";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  FileUp,
  FolderOpen,
  HardDrive,
  LayoutGrid,
  List,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function FilesPage() {
  const [folderStack, setFolderStack] = useState<FileNode[]>([]);

  const [searchQuery, setSearchQuery] = useState("");

  const currentFolder = folderStack[folderStack.length - 1] ?? null;

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [editingNodeId, setEditingNodeId] = useState<number | null>(null);

  const [moveNode, setMoveNode] = useState<FileNode | null>(null);

  const [deleteNode, setDeleteNode] = useState<FileNode | null>(null);

  const [isImportOpen, setIsImportOpen] = useState(false);

  const [isBatchDeleteOpen, setIsBatchDeleteOpen] = useState(false);

  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<number>>(
    new Set(),
  );

  const queryClient = useQueryClient();

  type FileViewMode = "list" | "grid";

  type FileSortField = "name" | "type" | "size" | "updatedAt";
  type FileSortDirection = "asc" | "desc";

  const [viewMode, setViewMode] = useState<FileViewMode>(() => {
    if (typeof window === "undefined") {
      return "list";
    }

    const stored = window.localStorage.getItem("file-system-view-mode");

    return stored === "grid" ? "grid" : "list";
  });

  const [sortField, setSortField] = useState<FileSortField>("name");
  const [sortDirection, setSortDirection] = useState<FileSortDirection>("asc");

  const changeViewMode = (mode: FileViewMode) => {
    setViewMode(mode);

    window.localStorage.setItem("file-system-view-mode", mode);
  };

  const createFolderMutation = useMutation({
    mutationFn: async () => {
      const baseName = "Nouveau dossier";

      const existingNames = new Set(
        items
          .filter((item) => item.type === "FOLDER")
          .map((item) => item.name.trim().toLowerCase()),
      );

      let name = baseName;
      let counter = 2;

      while (existingNames.has(name.toLowerCase())) {
        name = `${baseName} ${counter}`;
        counter += 1;
      }

      const response = await fileSystemService.createFolder({
        name,
        parent_id: currentFolder?.id ?? null,
      });

      if (!response.data) {
        throw new Error("Le serveur n'a pas retourné le dossier créé.");
      }

      return response.data;
    },

    onSuccess: async (createdNode) => {
      await queryClient.invalidateQueries({
        queryKey: ["files", currentFolder?.id ?? "root"],
      });

      setEditingNodeId(createdNode.id);

      toast.success("Dossier créé.");
    },

    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de créer le dossier.";

      toast.error(message);
    },
  });

  const renameMutation = useMutation({
    mutationFn: async ({ nodeId, name }: { nodeId: number; name: string }) => {
      const trimmedName = name.trim();

      if (!trimmedName) {
        throw new Error("Le nom est obligatoire.");
      }

      return fileSystemService.rename(nodeId, {
        name: trimmedName,
      });
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["files", currentFolder?.id ?? "root"],
      });

      toast.success("Élément renommé avec succès.");
    },

    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de renommer l'élément.";

      toast.error(message);
    },
  });

  const exportMutation = useMutation({
    mutationFn: async (node: FileNode) => {
      const blob = await fileSystemService.export(node.id);

      return {
        blob,
        node,
      };
    },

    onSuccess: ({ blob, node }) => {
      const url = URL.createObjectURL(blob);

      const anchor = document.createElement("a");

      anchor.href = url;

      anchor.download = node.type === "FOLDER" ? `${node.name}.zip` : node.name;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(url);

      toast.success(
        node.type === "FOLDER"
          ? "Dossier exporté avec succès."
          : "Fichier exporté avec succès.",
      );
    },

    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible d'exporter l'élément.";

      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (node: FileNode) => {
      return fileSystemService.delete(node.id);
    },

    onSuccess: async (_, node) => {
      await queryClient.invalidateQueries({
        queryKey: ["files", currentFolder?.id ?? "root"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["files", "move-tree"],
      });

      toast.success(
        node.type === "FOLDER"
          ? "Dossier supprimé avec succès."
          : "Fichier supprimé avec succès.",
      );

      setDeleteNode(null);
      setOpenMenuId(null);
    },

    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de supprimer l'élément.";

      toast.error(message);
    },
  });

  const importMutation = useMutation({
    mutationFn: async ({
      files,
      relativePaths,
    }: {
      files: File[];
      relativePaths: string[];
    }) => {
      return fileSystemService.import(
        files,
        relativePaths,
        currentFolder?.id ?? null,
      );
    },

    onSuccess: async (response) => {
      const importedCount = response.data?.length ?? 0;

      await queryClient.invalidateQueries({
        queryKey: ["files", currentFolder?.id ?? "root"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["files", "move-tree"],
      });

      setIsImportOpen(false);

      toast.success(
        importedCount === 1
          ? "Élément importé avec succès."
          : `${importedCount} éléments importés avec succès.`,
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

  const importZipMutation = useMutation({
    mutationFn: async (file: File) => {
      return fileSystemService.importZip(file, currentFolder?.id ?? null);
    },

    onSuccess: async (response) => {
      const count = response.data?.length ?? 0;

      await queryClient.invalidateQueries({
        queryKey: ["files", currentFolder?.id ?? "root"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["files", "move-tree"],
      });

      setIsImportOpen(false);

      toast.success(
        count === 1
          ? "Archive importée avec succès."
          : `${count} éléments importés avec succès.`,
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

  const batchDeleteMutation = useMutation({
    mutationFn: async (nodeIds: number[]) => {
      return fileSystemService.batchDelete(nodeIds);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["files", currentFolder?.id ?? "root"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["files", "move-tree"],
      });

      clearSelection();

      setIsBatchDeleteOpen(false);

      toast.success("Éléments supprimés avec succès.");
    },

    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de supprimer les éléments.";

      toast.error(message);
    },
  });

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["files", currentFolder?.id ?? "root"],
    queryFn: async () => {
      const response = currentFolder
        ? await fileSystemService.listChildren(currentFolder.id)
        : await fileSystemService.listRoot();

      return response.data;
    },
  });

  const items = data?.items ?? [];

  const normalizedSearchQuery = searchQuery.trim().toLocaleLowerCase();

  const filteredItems =
    normalizedSearchQuery.length === 0
      ? items
      : items.filter((item) =>
          item.name.toLocaleLowerCase().includes(normalizedSearchQuery),
        );

  const sortedItems = [...filteredItems].sort((a, b) => {
    let comparison = 0;

    if (sortField === "name") {
      comparison = a.name.localeCompare(b.name, "fr", {
        sensitivity: "base",
        numeric: true,
      });
    }

    if (sortField === "type") {
      comparison = a.type.localeCompare(b.type);
    }

    if (sortField === "size") {
      comparison = (a.size ?? 0) - (b.size ?? 0);
    }

    if (sortField === "updatedAt") {
      comparison =
        new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  const openFolder = (folder: FileNode) => {
    setFolderStack((current) => [...current, folder]);
  };

  const goToFolder = (index: number) => {
    setFolderStack((current) => current.slice(0, index + 1));
  };

  const goToRoot = () => {
    setFolderStack([]);
  };

  const goBack = () => {
    setFolderStack((current) => {
      if (current.length === 0) {
        return current;
      }

      return current.slice(0, -1);
    });
  };

  const toggleSelection = (nodeId: number) => {
    setSelectedNodeIds((current) => {
      const next = new Set(current);

      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }

      return next;
    });
  };

  const clearSelection = () => {
    setSelectedNodeIds(new Set());
  };

  const selectAllVisible = () => {
    setSelectedNodeIds(new Set(sortedItems.map((item) => item.id)));
  };
  const allVisibleSelected =
    sortedItems.length > 0 &&
    sortedItems.every((item) => selectedNodeIds.has(item.id));

  if (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : "Impossible de charger les fichiers.";

    toast.error(message);
  }

  return (
    <>
      <Header
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {folderStack.length > 0 && (
              <button
                type="button"
                onClick={goBack}
                aria-label="Retour au dossier précédent"
                style={{
                  width: "32px",
                  height: "32px",
                  padding: 0,
                  border: "1px solid var(--color-border)",
                  borderRadius: "0.5rem",
                  background: "var(--color-surface-raised)",
                  color: "var(--color-foreground-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <ArrowLeft size={16} />
              </button>
            )}

            <span>Fichiers</span>
          </div>
        }
        description={
          currentFolder
            ? `Contenu de ${currentFolder.name}`
            : "Gérez vos dossiers et vos fichiers."
        }
        actions={
          <>
            <button
              type="button"
              onClick={() => {
                if (createFolderMutation.isPending) {
                  return;
                }

                createFolderMutation.mutate();
              }}
              disabled={createFolderMutation.isPending}
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
                cursor: createFolderMutation.isPending
                  ? "not-allowed"
                  : "pointer",
                opacity: createFolderMutation.isPending ? 0.6 : 1,
              }}
            >
              {createFolderMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Nouveau
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsImportOpen(true);
              }}
              style={{
                height: "36px",
                padding: "0 0.875rem",
                borderRadius: "0.625rem",
                border: "1px solid var(--color-border)",
                background: "var(--color-surface-raised)",
                color: "var(--color-foreground)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                fontSize: "0.8125rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <FileUp size={16} />
              Importer
            </button>
            <div
              style={{
                height: "36px",
                display: "flex",
                alignItems: "center",
                gap: "2px",
                padding: "2px",
                borderRadius: "0.625rem",
                border: "1px solid var(--color-border)",
                background: "var(--color-surface-raised)",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  changeViewMode("list");
                }}
                aria-label="Vue liste"
                aria-pressed={viewMode === "list"}
                style={{
                  width: "32px",
                  height: "30px",
                  border: 0,
                  borderRadius: "0.45rem",
                  background:
                    viewMode === "list"
                      ? "var(--color-surface)"
                      : "transparent",
                  color:
                    viewMode === "list"
                      ? "var(--color-foreground)"
                      : "var(--color-foreground-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <List size={16} />
              </button>

              <button
                type="button"
                onClick={() => {
                  changeViewMode("grid");
                }}
                aria-label="Vue grille"
                aria-pressed={viewMode === "grid"}
                style={{
                  width: "32px",
                  height: "30px",
                  border: 0,
                  borderRadius: "0.45rem",
                  background:
                    viewMode === "grid"
                      ? "var(--color-surface)"
                      : "transparent",
                  color:
                    viewMode === "grid"
                      ? "var(--color-foreground)"
                      : "var(--color-foreground-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <LayoutGrid size={16} />
              </button>
            </div>
            <button
              type="button"
              onClick={() => void refetch()}
              disabled={isFetching}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "0.625rem",
                border: "1px solid var(--color-border)",
                background: "var(--color-surface-raised)",
                color: "var(--color-foreground-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: isFetching ? "not-allowed" : "pointer",
                opacity: isFetching ? 0.6 : 1,
              }}
              title="Actualiser"
            >
              {isFetching ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
            </button>
          </>
        }
      />

      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "1.5rem",
        }}
      >
        <div
          style={{
            border: "1px solid var(--color-border)",
            borderRadius: "1rem",
            background: "var(--color-surface)",
            // overflow: "hidden",
          }}
        >
          {/* En-tête */}
          <div
            style={{
              padding: "1rem 1.25rem",
              borderBottom: "1px solid var(--color-border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1.25rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "0.625rem",
                  background: "rgb(93 184 58 / 0.1)",
                  border: "1px solid rgb(93 184 58 / 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <HardDrive size={17} color="#5DB83A" />
              </div>

              <div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "var(--color-foreground)",
                  }}
                >
                  {currentFolder?.name ?? "Mon espace"}
                </div>

                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-foreground-muted)",
                    marginTop: "2px",
                  }}
                >
                  {items.length} élément
                  {items.length > 1 ? "s" : ""}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "1rem",
                width: "50%",
              }}
            >
              <div
                style={{
                  position: "relative",
                  flex: 1,
                  // minWidth: 0,
                  width: "100%",
                }}
              >
                <Search
                  size={16}
                  style={{
                    position: "absolute",
                    left: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--color-foreground-muted)",
                    pointerEvents: "none",
                  }}
                />

                <input
                  type="search"
                  value={searchQuery}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      setSearchQuery("");
                      event.currentTarget.blur();
                    }
                  }}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                  }}
                  placeholder={
                    currentFolder
                      ? `Rechercher dans ${currentFolder.name}...`
                      : "Rechercher dans mon espace..."
                  }
                  style={{
                    width: "100%",
                    height: "40px",
                    padding: "0 0.875rem 0 2.375rem",
                    borderRadius: "0.625rem",
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface-raised)",
                    color: "var(--color-foreground)",
                    outline: "none",
                    fontSize: "0.8125rem",
                    boxSizing: "border-box",
                  }}
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                    }}
                    style={{
                      position: "absolute",
                      right: "0.375rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "30px",
                      height: "30px",
                      border: 0,
                      borderRadius: "0.5rem",
                      background: "transparent",
                      color: "var(--color-foreground-muted)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                    aria-label="Effacer la recherche"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {searchQuery && (
                <div
                  style={{
                    flexShrink: 0,
                    fontSize: "0.75rem",
                    color: "var(--color-foreground-muted)",
                  }}
                >
                  {filteredItems.length} résultat
                  {filteredItems.length > 1 ? "s" : ""}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-foreground-muted)",
                  }}
                >
                  Trier :
                </span>

                <select
                  value={`${sortField}:${sortDirection}`}
                  onChange={(event) => {
                    const [field, direction] = event.target.value.split(
                      ":",
                    ) as [FileSortField, FileSortDirection];

                    setSortField(field);
                    setSortDirection(direction);
                  }}
                  style={{
                    height: "36px",
                    padding: "0 0.625rem",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface-raised)",
                    color: "var(--color-foreground)",
                    fontSize: "0.75rem",
                    outline: "none",
                  }}
                >
                  <option value="name:asc">Nom ↑</option>

                  <option value="name:desc">Nom ↓</option>

                  <option value="type:asc">Type ↑</option>

                  <option value="type:desc">Type ↓</option>

                  <option value="size:asc">Taille ↑</option>

                  <option value="size:desc">Taille ↓</option>

                  <option value="updatedAt:asc">Modification ↑</option>

                  <option value="updatedAt:desc">Modification ↓</option>
                </select>
              </div>
            </div>
          </div>

          {/* Corps */}
          {isLoading ? (
            <div
              style={{
                minHeight: "280px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-foreground-muted)",
              }}
            >
              <Loader2 size={22} className="animate-spin" />
            </div>
          ) : error ? (
            <div
              style={{
                minHeight: "280px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
                padding: "2rem",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  color: "var(--color-foreground)",
                }}
              >
                Impossible de charger vos fichiers
              </div>

              <div
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--color-foreground-muted)",
                }}
              >
                {error instanceof ApiError
                  ? error.message
                  : "Une erreur est survenue."}
              </div>

              <button type="button" onClick={() => void refetch()}>
                Réessayer
              </button>
            </div>
          ) : items.length === 0 ? (
            <div
              style={{
                minHeight: "280px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
                textAlign: "center",
                padding: "2rem",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--color-surface-raised)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <FolderOpen size={24} color="#5DB83A" />
              </div>

              <div>
                <div
                  style={{
                    fontSize: "0.9375rem",
                    fontWeight: 600,
                    color: "var(--color-foreground)",
                  }}
                >
                  Votre espace est vide
                </div>

                <div
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--color-foreground-muted)",
                    marginTop: "0.375rem",
                  }}
                >
                  Vos fichiers et dossiers apparaîtront ici.
                </div>
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div
              style={{
                minHeight: "240px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "2rem",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "0.875rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--color-surface-raised)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <Search size={20} color="#5DB83A" />
              </div>

              <div
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--color-foreground)",
                }}
              >
                Aucun résultat
              </div>

              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-foreground-muted)",
                }}
              >
                Aucun élément ne correspond à « {searchQuery} ».
              </div>

              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                }}
                style={{
                  marginTop: "0.375rem",
                  border: 0,
                  background: "transparent",
                  color: "#5DB83A",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Effacer la recherche
              </button>
            </div>
          ) : (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                  marginBottom: "1rem",
                  marginLeft: "1.25rem",
                }}
              >
                <button
                  type="button"
                  onClick={goToRoot}
                  style={{
                    border: 0,
                    background: "transparent",
                    padding: 0,
                    fontSize: "0.8125rem",
                    fontWeight: folderStack.length === 0 ? 600 : 500,
                    color:
                      folderStack.length === 0
                        ? "var(--color-foreground)"
                        : "var(--color-foreground-muted)",
                    cursor: folderStack.length === 0 ? "default" : "pointer",
                  }}
                >
                  Mon espace
                </button>

                {folderStack.map((folder, index) => {
                  const isCurrent = index === folderStack.length - 1;

                  return (
                    <div
                      key={folder.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <span
                        style={{
                          color: "var(--color-foreground-muted)",
                          fontSize: "0.75rem",
                        }}
                      >
                        /
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          if (!isCurrent) {
                            goToFolder(index);
                          }
                        }}
                        style={{
                          border: 0,
                          background: "transparent",
                          padding: 0,
                          fontSize: "0.8125rem",
                          fontWeight: isCurrent ? 600 : 500,
                          color: isCurrent
                            ? "var(--color-foreground)"
                            : "var(--color-foreground-muted)",
                          cursor: isCurrent ? "default" : "pointer",
                          maxWidth: "220px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {folder.name}
                      </button>
                    </div>
                  );
                })}
              </div>

              {selectedNodeIds.size > 0 && (
                <SelectionToolbar
                  count={selectedNodeIds.size}
                  selectAllVisible={selectAllVisible}
                  allVisibleSelected={allVisibleSelected}
                  onClear={clearSelection}
                  onMove={() => {
                    toast.info(
                      "Le déplacement multiple arrive à l'étape suivante.",
                    );
                  }}
                  onExport={() => {
                    toast.info("L'export multiple arrive à l'étape suivante.");
                  }}
                  onDelete={() => {
                    if (
                      selectedNodeIds.size === 0 ||
                      batchDeleteMutation.isPending
                    ) {
                      return;
                    }

                    setIsBatchDeleteOpen(true);
                  }}
                />
              )}

              {viewMode === "list" ? (
                <FileListView
                  items={sortedItems}
                  selectedNodeIds={selectedNodeIds}
                  onToggleSelection={toggleSelection}
                  openMenuId={openMenuId}
                  editingNodeId={editingNodeId}
                  onOpenFolder={openFolder}
                  onToggleMenu={(nodeId) => {
                    setOpenMenuId((current) =>
                      current === nodeId ? null : nodeId,
                    );
                  }}
                  onMove={(node) => {
                    setMoveNode(node);
                    setOpenMenuId(null);
                  }}
                  onExport={(node) => {
                    if (!exportMutation.isPending) {
                      setOpenMenuId(null);
                      exportMutation.mutate(node);
                    }
                  }}
                  onDelete={(node) => {
                    setDeleteNode(node);
                    setOpenMenuId(null);
                  }}
                  onStartRename={(nodeId) => {
                    if (!renameMutation.isPending) {
                      setEditingNodeId(nodeId);
                      setOpenMenuId(null);
                    }
                  }}
                  onSaveRename={(nodeId, value) => {
                    renameMutation.mutate(
                      {
                        nodeId,
                        name: value,
                      },
                      {
                        onSuccess: () => {
                          setEditingNodeId(null);
                        },
                      },
                    );
                  }}
                  onCancelRename={() => {
                    setEditingNodeId(null);
                  }}
                  renamePendingNodeId={
                    renameMutation.isPending ? editingNodeId : null
                  }
                />
              ) : (
                <FileGridView
                  items={sortedItems}
                  openMenuId={openMenuId}
                  editingNodeId={editingNodeId}
                  selectedNodeIds={selectedNodeIds}
                  onOpenFolder={openFolder}
                  onToggleMenu={(nodeId) => {
                    setOpenMenuId((current) =>
                      current === nodeId ? null : nodeId,
                    );
                  }}
                  onMove={(node) => {
                    setMoveNode(node);
                    setOpenMenuId(null);
                  }}
                  onExport={(node) => {
                    if (exportMutation.isPending) {
                      return;
                    }

                    setOpenMenuId(null);
                    exportMutation.mutate(node);
                  }}
                  onDelete={(node) => {
                    setDeleteNode(node);
                    setOpenMenuId(null);
                  }}
                  onStartRename={(nodeId) => {
                    if (renameMutation.isPending) {
                      return;
                    }

                    setEditingNodeId(nodeId);
                    setOpenMenuId(null);
                  }}
                  onSaveRename={(nodeId, value) => {
                    renameMutation.mutate(
                      {
                        nodeId,
                        name: value,
                      },
                      {
                        onSuccess: () => {
                          setEditingNodeId(null);
                        },
                      },
                    );
                  }}
                  onCancelRename={() => {
                    setEditingNodeId(null);
                  }}
                  renamePendingNodeId={
                    renameMutation.isPending ? editingNodeId : null
                  }
                  onToggleSelection={toggleSelection}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {moveNode && (
        <FileMoveDialog
          node={moveNode}
          currentFolderId={currentFolder?.id ?? null}
          onClose={() => {
            setMoveNode(null);
          }}
        />
      )}

      {deleteNode && (
        <DeleteConfirmDialog
          node={deleteNode}
          isPending={deleteMutation.isPending}
          onCancel={() => {
            if (!deleteMutation.isPending) {
              setDeleteNode(null);
            }
          }}
          onConfirm={() => {
            deleteMutation.mutate(deleteNode);
          }}
        />
      )}

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

      {isBatchDeleteOpen && (
        <BatchDeleteDialog
          count={selectedNodeIds.size}
          isPending={batchDeleteMutation.isPending}
          onCancel={() => {
            if (!batchDeleteMutation.isPending) {
              setIsBatchDeleteOpen(false);
            }
          }}
          onConfirm={() => {
            batchDeleteMutation.mutate(Array.from(selectedNodeIds));
          }}
        />
      )}
    </>
  );
}
