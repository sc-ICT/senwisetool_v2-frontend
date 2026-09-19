"use client";

import { useAuthStore } from "@/stores/auth.store";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useSyncExternalStore } from "react";

interface HeaderProps {
  title: React.ReactNode;
  description?: string;
  backTo?: string;
  actions?: React.ReactNode;
}

// Aucun changement possible après le montage initial, donc on ne s'abonne à
// rien : on renvoie juste une fonction de désabonnement no-op.
function subscribe() {
  return () => {};
}

/**
 * `true` uniquement côté client, après hydratation ; `false` côté serveur
 * et lors du tout premier rendu client (donc identiques → pas de mismatch).
 * Recommandé par React pour ce cas précis plutôt qu'un `useState` +
 * `useEffect(() => setMounted(true), [])`, qui déclenche un rendu en
 * cascade évitable (voir warning "Calling setState synchronously within
 * an effect").
 */
function useHasMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true, // snapshot côté client
    () => false, // snapshot côté serveur
  );
}

export function Header({ title, description, backTo, actions }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { user } = useAuthStore();
  const mounted = useHasMounted();

  return (
    <header
      style={{
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1.5rem",
        borderBottom: "1px solid var(--color-border)",
        backgroundColor: "var(--color-surface)",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.625rem",
          paddingLeft: "0.625rem 0",
        }}
      >
        {backTo && (
          <Link
            href={backTo}
            className="inline-flex h-8 items-center gap-2 rounded-xl border border-border bg-card px-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            <ArrowLeft size={20} />
          </Link>
        )}
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.125rem",
              fontWeight: 600,
              color: "var(--color-foreground)",
              lineHeight: 1.2,
            }}
          >
            {title}
          </h1>
          {description && (
            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--color-foreground-muted)",
              }}
            >
              {description}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        {actions}

        {/* Toggle thème */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "0.625rem",
            border: "1px solid var(--color-border)",
            background: "var(--color-surface-raised)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--color-foreground-muted)",
            transition: "border-color 0.15s, color 0.15s",
          }}
        >
          {mounted ? (
            theme === "dark" ? (
              <Sun size={15} />
            ) : (
              <Moon size={15} />
            )
          ) : (
            // Placeholder neutre : identique au rendu serveur (aucun mismatch),
            // remplacé par la vraie icône juste après le montage.
            <div style={{ width: 15, height: 15 }} />
          )}
        </button>

        {/* Avatar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            paddingLeft: "0.625rem",
            borderLeft: "1px solid var(--color-border)",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "0.625rem",
              background: "linear-gradient(135deg, #5DB83A, #0EA5E9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                color: "#fff",
                fontSize: "0.8125rem",
                fontWeight: 700,
              }}
            >
              {user?.name?.charAt(0).toUpperCase() ?? "A"}
            </span>
          </div>
          <div style={{ display: "none" }} className="md:block">
            <p
              style={{
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "var(--color-foreground)",
                lineHeight: 1.2,
              }}
            >
              {user?.name ?? "Admin"}
            </p>
            <p
              style={{
                fontSize: "0.7rem",
                color: "var(--color-foreground-muted)",
                lineHeight: 1.2,
              }}
            >
              {user?.role}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
