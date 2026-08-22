"use client";

import { Download, Move, Trash2, X } from "lucide-react";

interface SelectionToolbarProps {
  count: number;
  onClear: () => void;
  onMove: () => void;
  onExport: () => void;
  onDelete: () => void;
  selectAllVisible: () => void;
  allVisibleSelected: boolean;
}

export function SelectionToolbar({
  count,
  onClear,
  onMove,
  onExport,
  onDelete,
  selectAllVisible,
  allVisibleSelected,
}: SelectionToolbarProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        minHeight: "42px",
        padding: "0.375rem 0.5rem",
        marginBottom: "0.75rem",
        borderRadius: "0.75rem",
        border: "1px solid rgba(93, 184, 58, 0.25)",
        background: "rgba(93, 184, 58, 0.06)",
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
            if (allVisibleSelected) {
              onClear();
            } else {
              selectAllVisible();
            }
          }}
          aria-label={
            allVisibleSelected ? "Tout désélectionner" : "Tout sélectionner"
          }
          style={{
            width: "18px",
            height: "18px",
            borderRadius: "0.3rem",
            border: allVisibleSelected
              ? "1px solid #5DB83A"
              : "1px solid var(--color-border)",
            background: allVisibleSelected ? "#5DB83A" : "var(--color-surface)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "0.625rem",
            fontWeight: 700,
          }}
        >
          {allVisibleSelected ? "✓" : ""}
        </button>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginRight: "auto",
          paddingLeft: "0.25rem",
          fontSize: "0.8125rem",
          fontWeight: 600,
          color: "var(--color-foreground)",
        }}
      >
        <span>
          {count} élément
          {count > 1 ? "s" : ""} sélectionné
          {count > 1 ? "s" : ""}
        </span>
      </div>

      <button type="button" onClick={onMove} style={actionButtonStyle}>
        <Move size={15} />
        Déplacer
      </button>

      <button type="button" onClick={onExport} style={actionButtonStyle}>
        <Download size={15} />
        Exporter
      </button>

      <button
        type="button"
        onClick={onDelete}
        style={{
          ...actionButtonStyle,
          color: "#DC2626",
        }}
      >
        <Trash2 size={15} />
        Supprimer
      </button>

      <button
        type="button"
        onClick={onClear}
        aria-label="Annuler la sélection"
        style={{
          ...iconButtonStyle,
          marginLeft: "0.125rem",
        }}
      >
        <X size={15} />
      </button>
    </div>
  );
}

const actionButtonStyle = {
  height: "32px",
  padding: "0 0.625rem",
  border: 0,
  borderRadius: "0.5rem",
  background: "var(--color-surface)",
  color: "var(--color-foreground)",
  display: "flex",
  alignItems: "center",
  gap: "0.375rem",
  fontSize: "0.75rem",
  fontWeight: 600,
  cursor: "pointer",
};

const iconButtonStyle = {
  width: "32px",
  height: "32px",
  border: 0,
  borderRadius: "0.5rem",
  background: "transparent",
  color: "var(--color-foreground-muted)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};
