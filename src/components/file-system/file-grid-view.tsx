"use client";

import type { FileNode } from "@/types/file-system";
import { File, Folder, MoreVertical } from "lucide-react";

import { FileContextMenu } from "./file-context-menu";
import { InlineNameEditor } from "./inline-name-editor";

interface FileGridViewProps {
  items: FileNode[];

  openMenuId: number | null;
  editingNodeId: number | null;

  selectedNodeIds: Set<number>;

  onOpenFolder: (folder: FileNode) => void;

  onToggleMenu: (nodeId: number) => void;

  onMove: (node: FileNode) => void;

  onExport: (node: FileNode) => void;

  onDelete: (node: FileNode) => void;

  onStartRename: (nodeId: number) => void;

  onSaveRename: (nodeId: number, value: string) => void;

  onCancelRename: () => void;

  renamePendingNodeId: number | null;

  onToggleSelection: (nodeId: number) => void;
}

export function FileGridView({
  items,
  openMenuId,
  editingNodeId,
  selectedNodeIds,
  onOpenFolder,
  onToggleMenu,
  onMove,
  onExport,
  onDelete,
  onStartRename,
  onSaveRename,
  onCancelRename,
  renamePendingNodeId,
  onToggleSelection,
}: FileGridViewProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: "0.875rem",
        padding: "1rem",
      }}
    >
      {items.map((item) => (
        <FileGridCard
          key={item.id}
          item={item}
          selected={selectedNodeIds.has(item.id)}
          menuOpen={openMenuId === item.id}
          editing={editingNodeId === item.id}
          renamePending={renamePendingNodeId === item.id}
          onToggleSelection={() => onToggleSelection(item.id)}
          onOpenFolder={() => onOpenFolder(item)}
          onToggleMenu={() => onToggleMenu(item.id)}
          onMove={() => onMove(item)}
          onExport={() => onExport(item)}
          onDelete={() => onDelete(item)}
          onStartRename={() => onStartRename(item.id)}
          onSaveRename={(value) => onSaveRename(item.id, value)}
          onCancelRename={onCancelRename}
        />
      ))}
    </div>
  );
}

interface FileGridCardProps {
  item: FileNode;
  selected: boolean;
  menuOpen: boolean;
  editing: boolean;
  renamePending: boolean;

  onToggleSelection: () => void;
  onOpenFolder: () => void;
  onToggleMenu: () => void;
  onMove: () => void;
  onExport: () => void;
  onDelete: () => void;
  onStartRename: () => void;
  onSaveRename: (value: string) => void;
  onCancelRename: () => void;
}

function FileGridCard({
  item,
  selected,
  menuOpen,
  editing,
  renamePending,
  onToggleSelection,
  onOpenFolder,
  onToggleMenu,
  onMove,
  onExport,
  onDelete,
  onStartRename,
  onSaveRename,
  onCancelRename,
}: FileGridCardProps) {
  const isFolder = item.type === "FOLDER";

  return (
    <div
      style={{
        position: "relative",
        minHeight: "180px",
        padding: "0.875rem",
        borderRadius: "0.875rem",
        border: selected
          ? "1px solid rgba(93, 184, 58, 0.35)"
          : "1px solid var(--color-border)",
        background: selected
          ? "rgba(93, 184, 58, 0.06)"
          : "var(--color-surface)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.75rem",
        textAlign: "center",
        transition: "background 0.15s ease, transform 0.15s ease",
      }}
      onMouseEnter={(event) => {
        if (!selected) {
          event.currentTarget.style.background = "var(--color-surface-raised)";
        }

        event.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.background = selected
          ? "rgba(93, 184, 58, 0.06)"
          : "var(--color-surface)";

        event.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* ===================================================== */}
      {/* Sélection                                             */}
      {/* ===================================================== */}

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();

          onToggleSelection();
        }}
        aria-label={
          selected ? `Désélectionner ${item.name}` : `Sélectionner ${item.name}`
        }
        style={{
          position: "absolute",
          top: "0.625rem",
          left: "0.625rem",
          width: "20px",
          height: "20px",
          padding: 0,
          borderRadius: "0.35rem",
          border: selected
            ? "1px solid #5DB83A"
            : "1px solid var(--color-border)",
          background: selected ? "#5DB83A" : "var(--color-surface)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontSize: "0.625rem",
          fontWeight: 700,
          zIndex: 5,
        }}
      >
        {selected ? "✓" : ""}
      </button>

      {/* ===================================================== */}
      {/* Menu                                                  */}
      {/* ===================================================== */}

      <div
        style={{
          position: "absolute",
          top: "0.5rem",
          right: "0.5rem",
          zIndex: 10,
        }}
      >
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();

            onToggleMenu();
          }}
          aria-label={`Actions pour ${item.name}`}
          style={{
            width: "32px",
            height: "32px",
            padding: 0,
            borderRadius: "0.5rem",
            border: "1px solid transparent",
            background: menuOpen
              ? "var(--color-surface-raised)"
              : "transparent",
            color: "var(--color-foreground-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <MoreVertical size={17} />
        </button>

        {menuOpen && (
          <FileContextMenu
            item={item}
            onOpen={() => {
              onToggleMenu();

              if (isFolder) {
                onOpenFolder();
              }
            }}
            onRename={() => {
              onToggleMenu();
              onStartRename();
            }}
            onMove={() => {
              onMove();
            }}
            onExport={() => {
              onExport();
            }}
            onDelete={() => {
              onDelete();
            }}
            onClose={() => {
              onToggleMenu();
            }}
          />
        )}
      </div>

      {/* ===================================================== */}
      {/* Icône                                                 */}
      {/* ===================================================== */}

      <div
        onDoubleClick={(event) => {
          event.stopPropagation();

          if (isFolder) {
            onOpenFolder();
          } else {
            onStartRename();
          }
        }}
        style={{
          width: "58px",
          height: "58px",
          borderRadius: "0.875rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isFolder
            ? "rgba(14, 165, 233, 0.1)"
            : "rgba(148, 163, 184, 0.08)",
          color: isFolder ? "#0EA5E9" : "var(--color-foreground-muted)",
          cursor: "default",
        }}
      >
        {isFolder ? <Folder size={26} /> : <File size={26} />}
      </div>

      {/* ===================================================== */}
      {/* Nom / édition inline                                  */}
      {/* ===================================================== */}

      <div
        style={{
          width: "100%",
          minWidth: 0,
        }}
        onDoubleClick={(event) => {
          event.stopPropagation();

          onStartRename();
        }}
      >
        {editing ? (
          <InlineNameEditor
            value={item.name}
            saving={renamePending}
            onSave={onSaveRename}
            onCancel={onCancelRename}
          />
        ) : (
          <div
            style={{
              width: "100%",
              minWidth: 0,
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "var(--color-foreground)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              cursor: "text",
            }}
          >
            {item.name}
          </div>
        )}

        {!editing && (
          <>
            <div
              style={{
                marginTop: "0.25rem",
                fontSize: "0.6875rem",
                color: "var(--color-foreground-muted)",
              }}
            >
              {isFolder
                ? "Dossier"
                : item.extension
                  ? item.extension.toUpperCase()
                  : "Fichier"}
            </div>

            {!isFolder && (
              <div
                style={{
                  marginTop: "0.15rem",
                  fontSize: "0.6875rem",
                  color: "var(--color-foreground-muted)",
                }}
              >
                {formatFileSize(item.size)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function formatFileSize(size: number | null): string {
  if (size === null) {
    return "—";
  }

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
