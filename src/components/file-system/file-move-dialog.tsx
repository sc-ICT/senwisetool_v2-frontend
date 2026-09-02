"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  Loader2,
  Move,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api";
import { fileSystemService } from "@/services/file-system.service";
import type { FileNode } from "@/types/file-system";

interface FileMoveDialogProps {
  node: FileNode;
  onClose: () => void;
  currentFolderId: number | null;
}

export function FileMoveDialog({ node, onClose }: FileMoveDialogProps) {
  const queryClient = useQueryClient();

  /*
   * Destination actuellement sélectionnée.
   *
   * Par défaut, on sélectionne le parent actuel
   * de l'élément que l'on déplace.
   */
  const [destinationId, setDestinationId] = useState<number | null>(
    node.parent_id,
  );

  /*
   * Récupération de tous les descendants
   * lorsque l'élément déplacé est un dossier.
   *
   * Nous en avons besoin pour empêcher :
   *
   *   Formulaire A
   *   └── Formulaire B
   *
   * de déplacer Formulaire A dans Formulaire B.
   */
  const { data: descendants = [], isLoading: descendantsLoading } = useQuery({
    queryKey: ["files", "move-excluded", node.id],

    queryFn: async () => {
      const response = await fileSystemService.getDescendants(node.id);

      return response.data;
    },

    enabled: node.type === "FOLDER",
  });

  /*
   * Ensemble des IDs qui ne peuvent pas
   * servir de destination.
   *
   * IMPORTANT :
   *
   * On utilise useMemo plutôt qu'un useEffect
   * + setState.
   *
   * C'est une donnée dérivée, donc aucun state
   * supplémentaire n'est nécessaire.
   */
  const excludedFolderIds = useMemo(() => {
    const excluded = new Set<number>();

    if (node.type !== "FOLDER") {
      return excluded;
    }

    // Le dossier lui-même est interdit.
    excluded.add(node.id);

    // Tous ses descendants sont interdits.
    for (const descendant of descendants ?? []) {
      if (descendant.type === "FOLDER") {
        excluded.add(descendant.id);
      }
    }

    return excluded;
  }, [node, descendants]);

  /*
   * Mutation de déplacement.
   */
  const moveMutation = useMutation({
    mutationFn: async () => {
      return fileSystemService.move(node.id, {
        parent_id: destinationId,
      });
    },

    onSuccess: async () => {
      const oldParentId = node.parent_id;

      /*
       * Ancien dossier :
       * l'élément doit disparaître.
       */
      await queryClient.invalidateQueries({
        queryKey: ["files", oldParentId ?? "root"],
      });

      /*
       * Nouveau dossier :
       * l'élément doit apparaître.
       */
      if (destinationId !== oldParentId) {
        await queryClient.invalidateQueries({
          queryKey: ["files", destinationId ?? "root"],
        });
      }

      /*
       * Le cache utilisé par l'arbre
       * de sélection peut également être
       * rafraîchi.
       */
      await queryClient.invalidateQueries({
        queryKey: ["files", "move-tree"],
      });

      toast.success("Élément déplacé avec succès.");

      onClose();
    },

    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de déplacer l'élément.";

      toast.error(message);
    },
  });

  /*
   * Liste de la racine.
   */
  const { data: rootData, isLoading: rootLoading } = useQuery({
    queryKey: ["files", "move-tree", "root"],

    queryFn: async () => {
      const response = await fileSystemService.listRoot();

      return response.data;
    },
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 120,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        background: "rgba(0, 0, 0, 0.35)",
        backdropFilter: "blur(4px)",
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="move-dialog-title"
        style={{
          width: "100%",
          maxWidth: "520px",
          maxHeight: "min(680px, 85vh)",
          display: "flex",
          flexDirection: "column",
          borderRadius: "1rem",
          border: "1px solid var(--color-border)",
          background: "var(--color-surface)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.18)",
          overflow: "hidden",
        }}
      >
        {/* ===================================================== */}
        {/* Header                                                */}
        {/* ===================================================== */}

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
              id="move-dialog-title"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.9375rem",
                fontWeight: 700,
                color: "var(--color-foreground)",
              }}
            >
              <Move size={16} />
              Déplacer
            </div>

            <div
              style={{
                marginTop: "0.25rem",
                fontSize: "0.75rem",
                color: "var(--color-foreground-muted)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "380px",
              }}
            >
              « {node.name} »
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={moveMutation.isPending}
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
              cursor: "pointer",
            }}
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>

        {/* ===================================================== */}
        {/* Destination actuelle                                 */}
        {/* ===================================================== */}

        <div
          style={{
            padding: "0.875rem 1rem",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--color-foreground-muted)",
            }}
          >
            Destination
          </div>

          <div
            style={{
              marginTop: "0.25rem",
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "var(--color-foreground)",
            }}
          >
            {destinationId === null ? "Mon espace" : "Dossier sélectionné"}
          </div>
        </div>

        {/* ===================================================== */}
        {/* Arbre                                                */}
        {/* ===================================================== */}

        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            padding: "0.5rem",
          }}
        >
          <DestinationRow
            label="Mon espace"
            selected={destinationId === null}
            onSelect={() => setDestinationId(null)}
            childCount={
              rootData?.items?.filter((item) => item.type === "FOLDER")
                .length ?? 0
            }
            disabled={false}
          />

          {rootLoading ? (
            <div
              style={{
                padding: "2rem",
                display: "flex",
                justifyContent: "center",
                color: "var(--color-foreground-muted)",
              }}
            >
              <Loader2 size={20} className="animate-spin" />
            </div>
          ) : (
            rootData?.items
              ?.filter((item) => item.type === "FOLDER")
              .map((folder) => (
                <MoveFolderTreeNode
                  key={folder.id}
                  folder={folder}
                  selectedId={destinationId}
                  onSelect={setDestinationId}
                  movingNode={node}
                  excludedFolderIds={excludedFolderIds}
                />
              ))
          )}
        </div>

        {/* ===================================================== */}
        {/* Footer                                                */}
        {/* ===================================================== */}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.625rem",
            padding: "0.875rem 1.125rem",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={moveMutation.isPending}
            style={{
              height: "38px",
              padding: "0 0.875rem",
              borderRadius: "0.625rem",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface-raised)",
              color: "var(--color-foreground)",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={() => moveMutation.mutate()}
            disabled={
              moveMutation.isPending ||
              destinationId === node.parent_id ||
              descendantsLoading
            }
            style={{
              height: "38px",
              padding: "0 0.875rem",
              borderRadius: "0.625rem",
              border: "1px solid rgba(93, 184, 58, 0.3)",
              background: "rgba(93, 184, 58, 0.12)",
              color: "#5DB83A",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor:
                moveMutation.isPending ||
                destinationId === node.parent_id ||
                descendantsLoading
                  ? "not-allowed"
                  : "pointer",
              opacity:
                moveMutation.isPending ||
                destinationId === node.parent_id ||
                descendantsLoading
                  ? 0.55
                  : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            {moveMutation.isPending ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Déplacement...
              </>
            ) : (
              <>
                <Move size={15} />
                Déplacer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function MoveFolderTreeNode({
  folder,
  selectedId,
  onSelect,
  movingNode,
  excludedFolderIds,
}: {
  folder: FileNode;
  selectedId: number | null;
  onSelect: (id: number) => void;
  movingNode: FileNode;
  excludedFolderIds: Set<number>;
}) {
  const [expanded, setExpanded] = useState(false);

  /*
   * Le dossier lui-même ou l'un de ses
   * descendants.
   */
  const isExcluded = excludedFolderIds.has(folder.id);

  /*
   * C'est précisément l'élément
   * actuellement déplacé.
   */
  const isMovingFolder =
    movingNode.type === "FOLDER" && movingNode.id === folder.id;

  /*
   * Un dossier peut être développé
   * même si sa destination est interdite.
   *
   * Cela permet notamment de voir
   * pourquoi ses descendants sont
   * également interdits.
   */
  const canExpand = !isMovingFolder;

  const { data, isLoading } = useQuery({
    queryKey: ["files", "move-tree", folder.id],

    queryFn: async () => {
      const response = await fileSystemService.listChildren(folder.id);

      return response.data;
    },

    enabled: expanded && !isMovingFolder,
  });

  const childFolders =
    data?.items?.filter((item) => item.type === "FOLDER") ?? [];

  return (
    <div>
      {/* ===================================================== */}
      {/* Ligne du dossier                                      */}
      {/* ===================================================== */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.25rem",
          paddingLeft: "0.25rem",
        }}
      >
        {/* --------------------------------------------------- */}
        {/* Chevron                                             */}
        {/* --------------------------------------------------- */}

        <button
          type="button"
          onClick={() => {
            if (canExpand) {
              setExpanded((current) => !current);
            }
          }}
          disabled={!canExpand}
          style={{
            width: "28px",
            height: "34px",
            border: 0,
            background: "transparent",
            color: "var(--color-foreground-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: canExpand ? "pointer" : "default",
            opacity: canExpand ? 1 : 0.35,
          }}
          aria-label={expanded ? "Réduire" : "Développer"}
        >
          {expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
        </button>

        {/* --------------------------------------------------- */}
        {/* Sélection                                           */}
        {/* --------------------------------------------------- */}

        <button
          type="button"
          onClick={() => {
            if (!isExcluded) {
              onSelect(folder.id);
            }
          }}
          disabled={isExcluded}
          style={{
            flex: 1,
            minWidth: 0,
            height: "36px",
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            padding: "0 0.625rem",
            border: 0,
            borderRadius: "0.5rem",
            background:
              selectedId === folder.id
                ? "rgba(93, 184, 58, 0.1)"
                : "transparent",
            color: isExcluded
              ? "var(--color-foreground-muted)"
              : "var(--color-foreground)",
            cursor: isExcluded ? "not-allowed" : "pointer",
            textAlign: "left",
            opacity: isExcluded ? 0.45 : 1,
          }}
        >
          <Folder size={16} />

          <span
            style={{
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: "0.8125rem",
              fontWeight: selectedId === folder.id ? 600 : 500,
            }}
          >
            {folder.name}
          </span>

          {isMovingFolder && (
            <span
              style={{
                fontSize: "0.6875rem",
                color: "var(--color-foreground-muted)",
              }}
            >
              actuel
            </span>
          )}

          {isLoading && expanded && (
            <Loader2 size={14} className="animate-spin" />
          )}

          {!isMovingFolder && isExcluded && (
            <span
              style={{
                fontSize: "0.6875rem",
                color: "var(--color-foreground-muted)",
              }}
            >
              inaccessible
            </span>
          )}
        </button>
      </div>

      {/* ===================================================== */}
      {/* Enfants                                              */}
      {/* ===================================================== */}

      {expanded && !isMovingFolder && childFolders.length > 0 && (
        <div
          style={{
            marginLeft: "1.25rem",
            paddingLeft: "0.25rem",
            borderLeft: "1px solid var(--color-border)",
          }}
        >
          {childFolders.map((child) => (
            <MoveFolderTreeNode
              key={child.id}
              folder={child}
              selectedId={selectedId}
              onSelect={onSelect}
              movingNode={movingNode}
              excludedFolderIds={excludedFolderIds}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DestinationRow({
  label,
  selected,
  onSelect,
  childCount,
  disabled,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
  childCount: number;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      style={{
        width: "100%",
        height: "38px",
        display: "flex",
        alignItems: "center",
        gap: "0.625rem",
        border: 0,
        borderRadius: "0.5rem",
        background: selected ? "rgba(93, 184, 58, 0.1)" : "transparent",
        color: "var(--color-foreground)",
        padding: "0 0.625rem",
        cursor: disabled ? "not-allowed" : "pointer",
        textAlign: "left",
        fontSize: "0.8125rem",
        fontWeight: selected ? 600 : 500,
      }}
    >
      <Folder size={16} />

      <span
        style={{
          flex: 1,
        }}
      >
        {label}
      </span>

      {childCount > 0 && (
        <span
          style={{
            fontSize: "0.6875rem",
            color: "var(--color-foreground-muted)",
          }}
        >
          {childCount}
        </span>
      )}
    </button>
  );
}
