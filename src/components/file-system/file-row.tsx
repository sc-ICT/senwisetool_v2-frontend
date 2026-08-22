"use client";

import type { FileNode } from "@/types/file-system";

import { File, Folder, MoreVertical } from "lucide-react";

import { FileContextMenu } from "./file-context-menu";
import { InlineNameEditor } from "./inline-name-editor";

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

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
  }).format(date);
}

export const FileRow = ({
  item,
  onOpenFolder,
  menuOpen,
  onToggleMenu,
  onMove,
  onExport,
  onDelete,
  editing,
  onStartRename,
  onSaveRename,
  onCancelRename,
  renamePending,
  selected,
  onToggleSelection,
}: {
  item: FileNode;
  selected: boolean;
  onToggleSelection: () => void;
  onOpenFolder: (folder: FileNode) => void;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onMove: () => void;
  onExport: () => void;
  onDelete: () => void;
  editing: boolean;
  onStartRename: () => void;
  onSaveRename: (value: string) => void;
  onCancelRename: () => void;
  renamePending: boolean;
}) => {
  const isFolder = item.type === "FOLDER";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "32px minmax(280px, 1fr) 180px 140px 42px",
        alignItems: "center",
        gap: "1rem",
        padding: "0.875rem 1.25rem",
        borderBottom: "1px solid var(--color-border)",
        transition: "background 0.15s ease",
        cursor: isFolder ? "pointer" : "default",
        background: selected ? "rgba(93, 184, 58, 0.06)" : "transparent",
      }}
      onDoubleClick={(event) => {
        if (!isFolder) {
          return;
        }

        const target = event.target;

        if (
          target instanceof HTMLElement &&
          target.closest('[data-file-name="true"]')
        ) {
          return;
        }

        onOpenFolder(item);
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.background = "var(--color-surface-raised)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.background = "transparent";
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleSelection();
          }}
          aria-label={
            selected
              ? `Désélectionner ${item.name}`
              : `Sélectionner ${item.name}`
          }
          style={{
            width: "18px",
            height: "18px",
            borderRadius: "0.3rem",
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
          }}
        >
          {selected ? "✓" : ""}
        </button>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          minWidth: 0,
        }}
      >
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "0.625rem",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: isFolder
              ? "rgb(14 165 233 / 0.1)"
              : "rgb(148 163 184 / 0.08)",
            border: isFolder
              ? "1px solid rgb(14 165 233 / 0.2)"
              : "1px solid var(--color-border)",
          }}
        >
          {isFolder ? (
            <Folder size={18} color="#0EA5E9" />
          ) : (
            <File size={18} color="var(--color-foreground-muted)" />
          )}
        </div>

        <div
          style={{
            minWidth: 0,
          }}
        >
          <div
            style={{
              minWidth: 0,
              flex: 1,
            }}
            onDoubleClick={(event) => {
              event.stopPropagation();

              if (!editing) {
                onStartRename();
              }
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
                data-file-name="true"
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--color-foreground)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  cursor: "text",
                  minWidth: 0,
                  flex: 1,
                }}
                onDoubleClick={(event) => {
                  event.stopPropagation();

                  if (!editing) {
                    onStartRename();
                  }
                }}
              >
                {item.name}
              </div>
            )}

            {!editing && (
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-foreground-muted)",
                  marginTop: "0.125rem",
                }}
              >
                {isFolder
                  ? "Dossier"
                  : item.extension
                    ? item.extension.toUpperCase()
                    : "Fichier"}
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          fontSize: "0.75rem",
          color: "var(--color-foreground-muted)",
        }}
      >
        {isFolder ? "—" : formatFileSize(item.size)}
      </div>

      <div
        style={{
          fontSize: "0.75rem",
          color: "var(--color-foreground-muted)",
        }}
      >
        {formatDate(item.updated_at)}
      </div>
      <div
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleMenu();
          }}
          style={{
            width: "34px",
            height: "34px",
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
          aria-label={`Actions pour ${item.name}`}
        >
          <MoreVertical size={17} />
        </button>

        {menuOpen && (
          <FileContextMenu
            item={item}
            onOpen={() => {
              if (item.type === "FOLDER") {
                onOpenFolder(item);
              }

              onToggleMenu();
            }}
            onRename={() => {
              onToggleMenu();
              onStartRename();
            }}
            onMove={onMove}
            onExport={onExport}
            onClose={onToggleMenu}
            onDelete={onDelete}
          />
        )}
      </div>
    </div>
  );
};
