"use client";

import type { FileNode } from "@/types/file-system";
import { FileRow } from "./file-row";

interface FileListViewProps {
  items: FileNode[];
  openMenuId: number | null;
  editingNodeId: number | null;

  onOpenFolder: (folder: FileNode) => void;

  onToggleMenu: (nodeId: number) => void;

  onMove: (node: FileNode) => void;

  onExport: (node: FileNode) => void;

  onDelete: (node: FileNode) => void;

  onStartRename: (nodeId: number) => void;

  onSaveRename: (nodeId: number, value: string) => void;

  onCancelRename: () => void;

  renamePendingNodeId: number | null;

  selectedNodeIds: Set<number>;

  onToggleSelection: (nodeId: number) => void;
}

export function FileListView({
  items,
  selectedNodeIds,
  onToggleSelection,
  openMenuId,
  editingNodeId,
  onOpenFolder,
  onToggleMenu,
  onMove,
  onExport,
  onDelete,
  onStartRename,
  onSaveRename,
  onCancelRename,
  renamePendingNodeId,
}: FileListViewProps) {
  return (
    <div>
      {items.map((item) => (
        <FileRow
          key={item.id}
          item={item}
          selected={selectedNodeIds.has(item.id)}
          onToggleSelection={() => onToggleSelection(item.id)}
          onOpenFolder={onOpenFolder}
          menuOpen={openMenuId === item.id}
          onToggleMenu={() => onToggleMenu(item.id)}
          onMove={() => onMove(item)}
          onExport={() => onExport(item)}
          onDelete={() => onDelete(item)}
          editing={editingNodeId === item.id}
          onStartRename={() => onStartRename(item.id)}
          onSaveRename={(value) => onSaveRename(item.id, value)}
          onCancelRename={onCancelRename}
          renamePending={renamePendingNodeId === item.id}
        />
      ))}
    </div>
  );
}
