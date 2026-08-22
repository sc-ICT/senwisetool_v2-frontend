import type { FileNode } from "@/types/file-system";
import {
  Download,
  File,
  FilePen,
  FolderOpen,
  FolderPen,
  Move,
  Trash2,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { MenuItem } from "./menu-item";

export const FileContextMenu = ({
  item,
  onOpen,
  onRename,
  onMove,
  onExport,
  onClose,
  onDelete,
}: {
  item: FileNode;
  onOpen: () => void;
  onRename: () => void;
  onMove: () => void;
  onExport: () => void;
  onDelete: () => void;
  onClose: () => void;
}) => {
  const isFolder = item.type === "FOLDER";

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (menuRef.current && !menuRef.current.contains(target)) {
        onClose();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      onClick={(event) => {
        event.stopPropagation();
      }}
      style={{
        position: "absolute",
        top: "calc(100% + 0.375rem)",
        right: 0,
        zIndex: 100,
        minWidth: "190px",
        maxHeight: "none",
        padding: "0.375rem",
        borderRadius: "0.75rem",
        border: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        boxShadow: "0 12px 32px rgba(0, 0, 0, 0.14)",
      }}
    >
      <MenuItem
        icon={isFolder ? FolderOpen : File}
        label={isFolder ? "Ouvrir" : "Ouvrir"}
        onClick={onOpen}
      />

      <MenuItem
        icon={isFolder ? FolderPen : FilePen}
        label="Renommer"
        onClick={onRename}
      />

      <MenuItem icon={Download} label="Exporter" onClick={onExport} />

      <MenuItem icon={Move} label="Déplacer" onClick={onMove} />

      <div
        style={{
          height: "1px",
          background: "var(--color-border)",
          margin: "0.375rem 0",
        }}
      />
      <MenuItem icon={Trash2} label="Supprimer" danger onClick={onDelete} />
    </div>
  );
};
