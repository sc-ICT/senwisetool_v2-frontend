import { Pencil } from "lucide-react";

export const MenuItem = ({
  icon: Icon,
  label,
  onClick,
  danger = false,
}: {
  icon: typeof Pencil;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        height: "36px",
        border: 0,
        borderRadius: "0.5rem",
        background: "transparent",
        color: danger ? "#EF4444" : "var(--color-foreground)",
        display: "flex",
        alignItems: "center",
        gap: "0.625rem",
        padding: "0 0.625rem",
        fontSize: "0.8125rem",
        fontWeight: 500,
        cursor: "pointer",
        textAlign: "left",
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.background = "var(--color-surface-raised)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.background = "transparent";
      }}
    >
      <Icon size={15} />
      {label}
    </button>
  );
};
