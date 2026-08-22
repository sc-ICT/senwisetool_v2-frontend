/* eslint-disable react/no-unescaped-entities */
/**
 * SenWiseTool — Landing Page
 * src/app/page.tsx
 *
 * Connecté au design system : CSS variables de globals.css + next-themes.
 * Aucune couleur hardcodée pour les sections thémables.
 * Les sections "toujours sombres" (Hero, Mobile, Footer) gardent leur fond
 * de marque #060D12 intentionnellement, indépendamment du thème.
 */
"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// ─── Variables CSS du design system ──────────────────────────────────────────
// V.* → sections thémables (adaptent dark/light via globals.css)
// DARK.* → sections toujours sombres (fond de marque #060D12)
// ICON.* → couleurs d'accent pour icônes/illustrations uniquement

const V = {
  bg: "var(--color-background)",
  surface: "var(--color-surface)",
  raised: "var(--color-surface-raised)",
  overlay: "var(--color-surface-overlay)",
  fg: "var(--color-foreground)",
  fgMuted: "var(--color-foreground-muted)",
  fgSubtle: "var(--color-foreground-subtle)",
  border: "var(--color-border)",
  borderL: "var(--color-border-light)",
  green: "var(--color-brand-green)",
  blue: "var(--color-brand-blue)",
  font: "var(--font-sans)",
  display: "var(--font-display)",
} as const;

// Sections intentionnellement toujours sombres (fond de marque)
const DARK = {
  bg: "#060D12",
  bg2: "#0A1520",
  text: "rgba(255,255,255,0.92)",
  muted: "rgba(255,255,255,0.55)",
  dim: "rgba(255,255,255,0.30)",
  border: "rgba(255,255,255,0.08)",
} as const;

// Couleurs d'accentuation pour icônes et illustrations
const ICON = {
  purple: "#8B5CF6",
  blue: "#0EA5E9",
  amber: "#F59E0B",
  red: "#EF4444",
  teal: "#14B8A6",
  orange: "#F97316",
  green: "#5DB83A",
} as const;

// ─── Composant Icon ───────────────────────────────────────────────────────────

function Icon({
  name,
  size = 20,
  color = "currentColor",
}: {
  name: string;
  size?: number;
  color?: string;
}) {
  const icons: Record<string, string> = {
    menu: `<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>`,
    x: `<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>`,
    check: `<polyline points="20 6 9 17 4 12"/>`,
    sun: `<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>`,
    moon: `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`,
    arrowR: `<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>`,
    file: `<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>`,
    phone: `<rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>`,
    settings: `<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>`,
    bar: `<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>`,
    map: `<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>`,
    zap: `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`,
    shield: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`,
    globe: `<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>`,
    layers: `<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>`,
    db: `<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>`,
    api: `<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>`,
    cpu: `<rect x="9" y="9" width="6" height="6"/><path d="M20 16h2v2h-2M20 10h2v2h-2M2 16h2v2H2M2 10h2v2H2M16 20v2h-2v-2M10 20v2H8v-2M16 2v2h-2V2M10 2v2H8V2"/><rect x="4" y="4" width="16" height="16" rx="2"/>`,
    users: `<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>`,
    play: `<circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>`,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: icons[name] ?? "" }}
      aria-hidden="true"
    />
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setMounted(true);
    });
  }, []);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const isDark = !mounted || resolvedTheme !== "light";
  const navBg = scrolled
    ? isDark
      ? "rgba(6,13,18,0.92)"
      : "rgba(255,255,255,0.92)"
    : "transparent";
  const navFg = isDark ? DARK.text : "var(--color-foreground)";
  const navMuted = isDark ? DARK.muted : "var(--color-foreground-muted)";
  const navBorder = scrolled
    ? isDark
      ? "1px solid rgba(255,255,255,0.07)"
      : "1px solid var(--color-border-light)"
    : "none";

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: navBg,
        borderBottom: navBorder,
        backdropFilter: scrolled ? "blur(16px)" : "none",
        transition: "background .2s, border-color .2s",
      }}
    >
      <div
        style={{
          maxWidth: 1232,
          margin: "0 auto",
          padding: "0 24px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
        >
          <Image
            src="/logo.png"
            alt="SenWiseTool"
            width={38}
            height={38}
            className="rounded-xl"
          />
          <span
            style={{
              color: navFg,
              fontFamily: V.font,
              fontWeight: 700,
              fontSize: "1rem",
              letterSpacing: "-0.02em",
            }}
          >
            SenWise<span style={{ color: ICON.green }}>Tool</span>
          </span>
        </Link>

        {/* Links */}
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {[
            "Produit",
            "Solutions",
            "Tarifs",
            "Documentation",
            "Partenaires",
          ].map((l) => (
            <a
              key={l}
              href="#"
              style={{
                color: navMuted,
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: 500,
                padding: "0.375rem 0.75rem",
                borderRadius: 4,
                transition: "color .15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = navFg)}
              onMouseLeave={(e) => (e.currentTarget.style.color = navMuted)}
            >
              {l}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Theme toggle — connecté à next-themes */}
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label="Changer de thème"
            style={{
              width: 34,
              height: 34,
              borderRadius: 4,
              border: `1px solid ${isDark ? "rgba(255,255,255,0.15)" : "var(--color-border-light)"}`,
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: navMuted,
              transition: "all .15s",
            }}
          >
            {mounted && (
              <Icon name={isDark ? "sun" : "moon"} size={15} color={navMuted} />
            )}
          </button>
          <a
            href="/login"
            style={{
              color: navMuted,
              textDecoration: "none",
              fontSize: "0.875rem",
              fontWeight: 500,
              padding: "0.375rem 0.75rem",
              borderRadius: 4,
            }}
          >
            Connexion
          </a>
          <a
            href="/register"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "0.5rem 1.125rem",
              background: ICON.green,
              color: "#fff",
              border: "none",
              borderRadius: 4,
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "none",
              transition: "background .15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#4aa32f")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = ICON.green)
            }
          >
            Essai gratuit
          </a>
        </div>
      </div>
    </nav>
  );
}

// ─── Dashboard Mockup (toujours en thème clair — c'est une capture produit) ──

function DashboardMockup() {
  // Ce composant simule une capture d'écran de l'app → toujours en clair
  const S = {
    bg: "#FFFFFF",
    surface: "#F4F4F5",
    border: "#E5E5E5",
    text: "#111111",
    muted: "#737373",
    subtle: "#A3A3A3",
  };
  const rows = [
    {
      agent: "Kamga A.",
      form: "Inspection cacao",
      status: "sync",
      answers: 24,
      time: "14:32",
    },
    {
      agent: "Mballa C.",
      form: "Audit plantation",
      status: "sync",
      answers: 31,
      time: "14:28",
    },
    {
      agent: "Tene M.",
      form: "Qualité eau",
      status: "pending",
      answers: 18,
      time: "14:21",
    },
    {
      agent: "Biya E.",
      form: "BTP ouvrage",
      status: "sync",
      answers: 42,
      time: "13:55",
    },
    {
      agent: "Ndongo P.",
      form: "Suivi culture",
      status: "sync",
      answers: 27,
      time: "13:48",
    },
  ];
  return (
    <div
      style={{
        background: S.bg,
        borderRadius: 8,
        border: `1px solid ${S.border}`,
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
        fontFamily: V.font,
      }}
    >
      {/* Window chrome */}
      <div
        style={{
          background: S.surface,
          padding: "10px 14px",
          borderBottom: `1px solid ${S.border}`,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", gap: 5 }}>
          {["#F87171", "#FBBF24", "#4ADE80"].map((c) => (
            <div
              key={c}
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: c,
              }}
            />
          ))}
        </div>
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              background: S.bg,
              borderRadius: 4,
              padding: "2px 12px",
              fontSize: "0.68rem",
              color: S.subtle,
              border: `1px solid ${S.border}`,
            }}
          >
            app.senwisatool.io/dashboard
          </div>
        </div>
      </div>

      <div style={{ display: "flex", height: 380 }}>
        {/* Sidebar */}
        <div
          style={{
            width: 180,
            borderRight: `1px solid ${S.border}`,
            background: S.surface,
            padding: "16px 0",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              padding: "0 12px 12px",
              fontSize: "0.62rem",
              color: S.subtle,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Navigation
          </div>
          {[
            { icon: "bar", label: "Tableau de bord", active: true },
            { icon: "file", label: "Formulaires", active: false },
            { icon: "db", label: "Données", active: false },
            { icon: "map", label: "Cartographie", active: false },
            { icon: "bar", label: "Analytics", active: false },
            { icon: "users", label: "Agents", active: false },
            { icon: "settings", label: "Paramètres", active: false },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 12px",
                background: item.active ? "#DCFCE7" : "transparent",
                borderLeft: item.active
                  ? `2px solid ${ICON.green}`
                  : "2px solid transparent",
                cursor: "pointer",
              }}
            >
              <Icon
                name={item.icon}
                size={13}
                color={item.active ? ICON.green : S.subtle}
              />
              <span
                style={{
                  fontSize: "0.72rem",
                  color: item.active ? ICON.green : S.muted,
                  fontWeight: item.active ? 600 : 400,
                }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Main */}
        <div style={{ flex: 1, padding: "16px", overflow: "hidden" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 8,
              marginBottom: 14,
            }}
          >
            {[
              {
                label: "Enquêtes aujourd'hui",
                value: "284",
                delta: "+12%",
                color: ICON.green,
              },
              {
                label: "Agents actifs",
                value: "43",
                delta: "+3",
                color: ICON.blue,
              },
              {
                label: "Taux de sync",
                value: "98%",
                delta: "↑",
                color: ICON.purple,
              },
              {
                label: "Médias uploadés",
                value: "1.2k",
                delta: "+89",
                color: ICON.amber,
              },
            ].map((k) => (
              <div
                key={k.label}
                style={{
                  padding: "10px 12px",
                  background: S.bg,
                  border: `1px solid ${S.border}`,
                  borderRadius: 6,
                }}
              >
                <p
                  style={{
                    fontSize: "0.6rem",
                    color: S.subtle,
                    marginBottom: 4,
                  }}
                >
                  {k.label}
                </p>
                <div
                  style={{ display: "flex", alignItems: "baseline", gap: 6 }}
                >
                  <span
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 700,
                      color: S.text,
                    }}
                  >
                    {k.value}
                  </span>
                  <span
                    style={{
                      fontSize: "0.6rem",
                      color: k.color,
                      fontWeight: 600,
                    }}
                  >
                    {k.delta}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              border: `1px solid ${S.border}`,
              borderRadius: 6,
              overflow: "hidden",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.7rem",
              }}
            >
              <thead>
                <tr style={{ background: S.surface }}>
                  {["Agent", "Formulaire", "Réponses", "Heure", "Statut"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          padding: "7px 10px",
                          textAlign: "left",
                          color: S.subtle,
                          fontWeight: 600,
                          fontSize: "0.62rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${S.border}` }}>
                    <td
                      style={{
                        padding: "7px 10px",
                        color: S.text,
                        fontWeight: 500,
                      }}
                    >
                      {r.agent}
                    </td>
                    <td style={{ padding: "7px 10px", color: S.muted }}>
                      {r.form}
                    </td>
                    <td style={{ padding: "7px 10px", color: S.muted }}>
                      {r.answers}
                    </td>
                    <td style={{ padding: "7px 10px", color: S.subtle }}>
                      {r.time}
                    </td>
                    <td style={{ padding: "7px 10px" }}>
                      <span
                        style={{
                          fontSize: "0.6rem",
                          padding: "2px 7px",
                          borderRadius: 3,
                          background:
                            r.status === "sync" ? "#DCFCE7" : "#FEF3C7",
                          color: r.status === "sync" ? ICON.green : "#92400E",
                          fontWeight: 600,
                        }}
                      >
                        {r.status === "sync" ? "Synchronisé" : "En attente"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Hero (section toujours sombre — fond de marque) ─────────────────────────

function Hero() {
  return (
    <section style={{ background: DARK.bg, paddingTop: 60 }}>
      <div
        style={{ maxWidth: 1232, margin: "0 auto", padding: "72px 24px 60px" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.1fr",
            gap: 56,
            alignItems: "center",
          }}
        >
          {/* Left */}
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 10px 4px 4px",
                background: "rgba(93,184,58,0.12)",
                border: "1px solid rgba(93,184,58,0.25)",
                borderRadius: 4,
                marginBottom: 24,
              }}
            >
              <span
                style={{
                  background: ICON.green,
                  color: "#fff",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  padding: "2px 7px",
                  borderRadius: 3,
                  letterSpacing: "0.04em",
                }}
              >
                NOUVEAU
              </span>
              <span
                style={{
                  fontSize: "0.8rem",
                  color: DARK.muted,
                  fontFamily: V.font,
                }}
              >
                Plugins EUDR 2024 disponibles
              </span>
            </div>

            <h1
              style={{
                fontFamily: V.font,
                fontSize: "clamp(2.25rem, 4.5vw, 3.25rem)",
                fontWeight: 700,
                lineHeight: 1.12,
                letterSpacing: "-0.025em",
                color: DARK.text,
                marginBottom: 20,
              }}
            >
              Collectez, traitez
              <br />
              et exploitez vos
              <br />
              <span style={{ color: ICON.green }}>données terrain.</span>
            </h1>

            <p
              style={{
                fontSize: "1.0625rem",
                lineHeight: 1.65,
                color: DARK.muted,
                fontFamily: V.font,
                marginBottom: 32,
                maxWidth: 480,
              }}
            >
              SenWiseTool unifie la préparation des enquêtes, la collecte mobile
              hors-ligne et l'exploitation avancée des données — avec des
              plugins métier adaptés à chaque secteur.
            </p>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 40,
              }}
            >
              <a
                href="/register"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "0.6875rem 1.5rem",
                  background: ICON.green,
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  textDecoration: "none",
                  fontFamily: V.font,
                  transition: "background .15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#4aa32f")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = ICON.green)
                }
              >
                Commencer gratuitement{" "}
                <Icon name="arrowR" size={16} color="#fff" />
              </a>
              <a
                href="/demo"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "0.6875rem 1.375rem",
                  background: "transparent",
                  color: DARK.muted,
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 4,
                  fontSize: "0.9375rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  textDecoration: "none",
                  fontFamily: V.font,
                  transition: "border-color .15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(255,255,255,0.45)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)")
                }
              >
                <Icon name="play" size={15} color={DARK.muted} /> Voir la démo
              </a>
            </div>

            <div style={{ display: "flex", gap: 32 }}>
              {[
                { v: "500+", l: "Organisations" },
                { v: "1M+", l: "Collectes/mois" },
                { v: "48", l: "Domaines métier" },
                { v: "99.9%", l: "Disponibilité" },
              ].map((s) => (
                <div key={s.l}>
                  <p
                    style={{
                      fontFamily: V.font,
                      fontWeight: 700,
                      fontSize: "1.25rem",
                      color: DARK.text,
                      lineHeight: 1,
                    }}
                  >
                    {s.v}
                  </p>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: DARK.dim,
                      marginTop: 3,
                      fontFamily: V.font,
                    }}
                  >
                    {s.l}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div>
            <DashboardMockup />
          </div>
        </div>
      </div>

      {/* Trust bar */}
      <div
        style={{ borderTop: `1px solid ${DARK.border}`, padding: "18px 24px" }}
      >
        <div
          style={{
            maxWidth: 1232,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: 32,
          }}
        >
          <span
            style={{
              fontSize: "0.72rem",
              color: DARK.dim,
              fontFamily: V.font,
              fontWeight: 500,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            Utilisé par
          </span>
          <div
            style={{
              display: "flex",
              gap: 36,
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            {[
              "FAO",
              "UNICEF",
              "GIZ",
              "Banque Mondiale",
              "USAID",
              "CGIAR",
              "PAM",
              "OMS",
            ].map((l) => (
              <span
                key={l}
                style={{
                  fontFamily: V.font,
                  fontWeight: 600,
                  fontSize: "0.8125rem",
                  color: DARK.dim,
                  whiteSpace: "nowrap",
                  letterSpacing: "0.02em",
                }}
              >
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Stages (thémable) ────────────────────────────────────────────────────────

function Stages() {
  const steps = [
    {
      n: "01",
      title: "Préparer",
      icon: "file",
      color: ICON.purple,
      desc: "Concevez vos formulaires avec le constructeur no-code. Logique conditionnelle, sections, validations métier, déploiement par agent ou groupe.",
      points: [
        "Constructeur drag & drop",
        "Logique conditionnelle",
        "Bibliothèque de questions",
        "Versionning & déploiement",
      ],
    },
    {
      n: "02",
      title: "Collecter",
      icon: "phone",
      color: ICON.green,
      desc: "L'application mobile iOS & Android fonctionne entièrement hors-ligne. GPS, photos, audio, signatures — sync automatique dès que le réseau revient.",
      points: [
        "Mode hors-ligne complet",
        "GPS haute précision",
        "Photos, vidéos, audio",
        "Surveillance anti-fraude",
      ],
    },
    {
      n: "03",
      title: "Traiter",
      icon: "cpu",
      color: ICON.blue,
      desc: "Validation automatique, détection d'anomalies, workflows multi-niveaux et enrichissement avec des référentiels métier ou des données géographiques.",
      points: [
        "Règles de validation",
        "Détection d'anomalies",
        "Workflows d'approbation",
        "Enrichissement géo",
      ],
    },
    {
      n: "04",
      title: "Exploiter",
      icon: "bar",
      color: ICON.amber,
      desc: "Tableaux de bord temps réel, rapports PDF professionnels, exports CSV/Excel/GeoJSON et API REST pour alimenter vos systèmes d'information.",
      points: [
        "Dashboards interactifs",
        "Rapports PDF & Word",
        "Export multi-formats",
        "API REST + Webhooks",
      ],
    },
  ];

  return (
    <section
      style={{
        background: V.surface,
        padding: "72px 24px",
        borderBottom: `1px solid ${V.borderL}`,
      }}
    >
      <div style={{ maxWidth: 1232, margin: "0 auto" }}>
        <div style={{ marginBottom: 48 }}>
          <p
            style={{
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: V.green,
              fontFamily: V.font,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 12,
            }}
          >
            Comment ça fonctionne
          </p>
          <h2
            style={{
              fontFamily: V.font,
              fontWeight: 700,
              fontSize: "clamp(1.625rem, 3vw, 2.25rem)",
              color: V.fg,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              maxWidth: 540,
            }}
          >
            Quatre étapes, un écosystème complet.
          </h2>
        </div>

        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              top: 28,
              left: 28,
              right: 28,
              height: 1,
              background: `linear-gradient(90deg, ${ICON.purple}, ${ICON.green}, ${ICON.blue}, ${ICON.amber})`,
              opacity: 0.2,
            }}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 24,
              position: "relative",
            }}
          >
            {steps.map((s, i) => (
              <div
                key={i}
                style={{
                  padding: "24px 20px",
                  background: V.surface,
                  border: `1px solid ${V.borderL}`,
                  borderRadius: 6,
                  transition: "box-shadow .2s, border-color .2s",
                }}
                onMouseEnter={(e) => {
                  const d = e.currentTarget as HTMLDivElement;
                  d.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
                  d.style.borderColor = s.color + "50";
                }}
                onMouseLeave={(e) => {
                  const d = e.currentTarget as HTMLDivElement;
                  d.style.boxShadow = "none";
                  d.style.borderColor = V.borderL;
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: s.color + "12",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon name={s.icon} size={20} color={s.color} />
                  </div>
                  <span
                    style={{
                      fontFamily: V.font,
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      color: V.fgSubtle,
                      letterSpacing: "0.06em",
                    }}
                  >
                    {s.n}
                  </span>
                </div>
                <h3
                  style={{
                    fontFamily: V.font,
                    fontWeight: 700,
                    fontSize: "1.0625rem",
                    color: V.fg,
                    marginBottom: 10,
                    letterSpacing: "-0.015em",
                  }}
                >
                  {s.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: V.fgMuted,
                    lineHeight: 1.6,
                    fontFamily: V.font,
                    marginBottom: 16,
                  }}
                >
                  {s.desc}
                </p>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  {s.points.map((pt, j) => (
                    <div
                      key={j}
                      style={{ display: "flex", alignItems: "center", gap: 7 }}
                    >
                      <div
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: s.color,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: "0.78rem",
                          color: V.fgMuted,
                          fontFamily: V.font,
                        }}
                      >
                        {pt}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Domain Plugins (thémable) ────────────────────────────────────────────────

const DOMAIN_COLORS: Record<string, string> = {
  cacao: "#D97706",
  hydro: "#0EA5E9",
  agri: "#16A34A",
  sante: "#EF4444",
  env: "#14B8A6",
  infra: "#8B5CF6",
  ong: "#F97316",
  rech: "#6366F1",
};

const DOMAINS = [
  {
    id: "cacao",
    name: "Cacao / EUDR",
    icon: "🍫",
    std: ["EUDR 2024", "ISO 34101", "Fairtrade"],
  },
  {
    id: "hydro",
    name: "Hydrologie",
    icon: "💧",
    std: ["ISO 5667", "WMO-No.8"],
  },
  {
    id: "agri",
    name: "Agriculture",
    icon: "🌾",
    std: ["GlobalGAP", "FAO GAEZ"],
  },
  {
    id: "sante",
    name: "Santé publique",
    icon: "⚕️",
    std: ["ICD-11", "DHIS2", "OMS"],
  },
  {
    id: "env",
    name: "Environnement",
    icon: "🌍",
    std: ["CBD", "IPCC", "VCS Verra"],
  },
  {
    id: "infra",
    name: "Infrastructure / BTP",
    icon: "🏗️",
    std: ["ISO 19650", "FIDIC"],
  },
  { id: "ong", name: "ONG & Humanitaire", icon: "🤝", std: ["Sphere", "IASC"] },
  {
    id: "rech",
    name: "Recherche & Sciences",
    icon: "🔬",
    std: ["ISO 8000", "FAIR Data"],
  },
];

const DOMAIN_DETAIL: Record<
  string,
  {
    desc: string;
    kpis: { l: string; v: string }[];
    fields: { l: string; v: string; note?: string }[];
  }
> = {
  cacao: {
    desc: "Traçabilité plantation-à-tablette, conformité EUDR, audit coopératives et certifications durables.",
    kpis: [
      { l: "Plantations", v: "12 450" },
      { l: "Hectares", v: "142 000" },
      { l: "Conformité EUDR", v: "98.2%" },
    ],
    fields: [
      { l: "ID Plantation", v: "PLT-CM-2024-0847" },
      { l: "Superficie", v: "12.4 ha" },
      { l: "Polygone GPS", v: "38 points · ±2m" },
      { l: "Statut EUDR", v: "✓ Conforme", note: "green" },
      { l: "Coopérative", v: "COOP-MOUNGO-07" },
      { l: "Certification", v: "Fairtrade + UTZ" },
    ],
  },
  hydro: {
    desc: "Mesures piézométriques, qualité physicochimique de l'eau, suivi des débits et cartographie bassins versants.",
    kpis: [
      { l: "Stations actives", v: "42" },
      { l: "Mesures/jour", v: "1 200" },
      { l: "Bassins versants", v: "15" },
    ],
    fields: [
      { l: "Station ID", v: "HYD-STA-0023" },
      { l: "Niveau piézo.", v: "−4.32 m / NGF" },
      { l: "Débit", v: "2.7 m³/s" },
      { l: "pH", v: "7.2 — Conforme", note: "green" },
      { l: "Turbidité", v: "1.8 NTU" },
      { l: "Coordonnées", v: "5.362°N, 10.141°E" },
    ],
  },
  agri: {
    desc: "Suivi cultures, analyse des sols, gestion des intrants et modèles prédictifs de rendement par parcelle.",
    kpis: [
      { l: "Parcelles suivies", v: "8 500" },
      { l: "Cultures", v: "32" },
      { l: "Régions", v: "12" },
    ],
    fields: [
      { l: "Parcelle ID", v: "AGR-BN-2024-1182" },
      { l: "Culture", v: "Maïs (Zea mays)" },
      { l: "Surface", v: "3.8 ha" },
      { l: "Stade phéno.", v: "V8 — Montaison" },
      { l: "Fertilisation N", v: "87 kg/ha +12%" },
      { l: "Rendement prévu", v: "4.2 t/ha", note: "amber" },
    ],
  },
  sante: {
    desc: "Surveillance épidémiologique, enquêtes nutritionnelles, registres vaccination et gestion formations sanitaires.",
    kpis: [
      { l: "Formations sanitaires", v: "240" },
      { l: "Patients/mois", v: "18 000" },
      { l: "Indicateurs OMS", v: "14" },
    ],
    fields: [
      { l: "Patient ID", v: "PAT-2024-0019234" },
      { l: "Âge / Genre", v: "34 ans — F" },
      { l: "Diagnostic", v: "J18.9 Pneumonie" },
      { l: "Vaccination", v: "DTC3 ✓  Polio ✓", note: "green" },
      { l: "Formation", v: "CSI NKOL-AFAMBA" },
      { l: "GPS", v: "3.914°N, 11.528°E" },
    ],
  },
  env: {
    desc: "Biodiversité, déforestation, bilan carbone, conformité environnementale et crédits carbone VCS.",
    kpis: [
      { l: "Ha surveillés", v: "1.2M" },
      { l: "Espèces indexées", v: "847" },
      { l: "tCO₂ évités", v: "62 000" },
    ],
    fields: [
      { l: "Site ID", v: "ENV-FOR-CM-0447" },
      { l: "Couv. forêt", v: "87.3% (−1.2%/an)", note: "amber" },
      { l: "Stock carbone", v: "148 tC/ha" },
      { l: "Esp. menacées", v: "3 espèces UICN", note: "red" },
      { l: "NDVI", v: "0.71 — Dense", note: "green" },
      { l: "Altitude moy.", v: "824 m NGF" },
    ],
  },
  infra: {
    desc: "Inspection ouvrages d'art, suivi chantier BTP, maintenance préventive et contrôle qualité terrain.",
    kpis: [
      { l: "Ouvrages inspectés", v: "380" },
      { l: "Rapports/mois", v: "1 200" },
      { l: "Traçabilité", v: "99.7%" },
    ],
    fields: [
      { l: "Ouvrage ID", v: "PONT-RN3-KM-147" },
      { l: "Type structure", v: "Pont béton armé" },
      { l: "État général", v: "B — Bon état", note: "green" },
      { l: "Dernière inspec.", v: "12/06/2024" },
      { l: "Fissuration", v: "Classe 1 — Min.", note: "amber" },
      { l: "GPS inspecteur", v: "3.847°N, 11.341°E" },
    ],
  },
  ong: {
    desc: "Gestion bénéficiaires, distribution d'aide, enregistrement populations vulnérables, reporting bailleurs.",
    kpis: [
      { l: "Bénéficiaires", v: "42 000" },
      { l: "Sites d'opération", v: "28" },
      { l: "Indicateurs Sphere", v: "22" },
    ],
    fields: [
      { l: "Bénéficiaire ID", v: "BEN-2024-084712" },
      { l: "Ménage", v: "7 personnes" },
      { l: "Vulnérabilité", v: "Niveau 3 — Élevé", note: "red" },
      { l: "Aide reçue", v: "Kit NFI + Vivres" },
      { l: "Site", v: "CAMP-NORD-12" },
      { l: "GPS", v: "7.122°N, 14.420°E" },
    ],
  },
  rech: {
    desc: "Protocoles d'échantillonnage scientifique, gestion cohortes, collecte structurée selon principes FAIR Data.",
    kpis: [
      { l: "Études actives", v: "18" },
      { l: "Participants", v: "3 200" },
      { l: "Jeux de données", v: "94" },
    ],
    fields: [
      { l: "Étude ID", v: "STD-2024-AGRO-004" },
      { l: "Participant", v: "P-00847" },
      { l: "Site", v: "Station IRAD Ekona" },
      { l: "Protocole", v: "ISO 8000 — T120" },
      { l: "Mesure 1", v: "124.7 µS/cm" },
      { l: "Conforme", v: "Oui — Tolérance ±5%", note: "green" },
    ],
  },
};

function noteColor(note?: string) {
  if (note === "green") return ICON.green;
  if (note === "amber") return ICON.amber;
  if (note === "red") return ICON.red;
  return V.fg;
}

function DomainPlugins() {
  const [active, setActive] = useState("cacao");
  const d = DOMAIN_DETAIL[active];
  const dm = DOMAINS.find((x) => x.id === active)!;
  const color = DOMAIN_COLORS[active];

  return (
    <section
      style={{
        background: V.raised,
        padding: "72px 24px",
        borderBottom: `1px solid ${V.borderL}`,
      }}
    >
      <div style={{ maxWidth: 1232, margin: "0 auto" }}>
        <div style={{ marginBottom: 40 }}>
          <p
            style={{
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: V.green,
              fontFamily: V.font,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 12,
            }}
          >
            Plugins métier
          </p>
          <h2
            style={{
              fontFamily: V.font,
              fontWeight: 700,
              fontSize: "clamp(1.625rem, 3vw, 2.25rem)",
              color: V.fg,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              maxWidth: 600,
            }}
          >
            Une plateforme commune,
            <br />
            une expertise par secteur.
          </h2>
          <p
            style={{
              fontSize: "1.0625rem",
              color: V.fgMuted,
              fontFamily: V.font,
              marginTop: 12,
              maxWidth: 540,
            }}
          >
            Chaque plugin intègre les standards, formulaires préconfigurés et la
            logique métier spécifique à son secteur.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "300px 1fr",
            gap: 24,
            alignItems: "start",
          }}
        >
          {/* Selector */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 8,
            }}
          >
            {DOMAINS.map((dm2) => (
              <button
                key={dm2.id}
                onClick={() => setActive(dm2.id)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "14px 16px",
                  textAlign: "left",
                  background: active === dm2.id ? V.surface : "transparent",
                  border:
                    active === dm2.id
                      ? `1px solid ${DOMAIN_COLORS[dm2.id]}40`
                      : `1px solid ${V.borderL}`,
                  borderRadius: 6,
                  cursor: "pointer",
                  transition: "all .15s",
                  fontFamily: V.font,
                  boxShadow:
                    active === dm2.id ? "0 2px 12px rgba(0,0,0,0.06)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (active !== dm2.id)
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      V.borderL;
                }}
                onMouseLeave={(e) => {
                  if (active !== dm2.id)
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      V.borderL;
                }}
              >
                <span
                  style={{
                    fontSize: "1.25rem",
                    lineHeight: 1,
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  {dm2.icon}
                </span>
                <div>
                  <p
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: active === dm2.id ? DOMAIN_COLORS[dm2.id] : V.fg,
                      margin: 0,
                    }}
                  >
                    {dm2.name}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: 4,
                      flexWrap: "wrap",
                      marginTop: 5,
                    }}
                  >
                    {dm2.std.slice(0, 2).map((s) => (
                      <span
                        key={s}
                        style={{
                          fontSize: "0.6rem",
                          padding: "1px 5px",
                          borderRadius: 3,
                          background: V.overlay,
                          color: V.fgMuted,
                          fontWeight: 500,
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
            <div
              style={{
                gridColumn: "1/-1",
                padding: "10px 14px",
                background: V.surface,
                border: `1px dashed ${V.borderL}`,
                borderRadius: 6,
                textAlign: "center",
              }}
            >
              <span
                style={{
                  fontSize: "0.78rem",
                  color: V.fgMuted,
                  fontFamily: V.font,
                }}
              >
                + 40 plugins disponibles —{" "}
              </span>
              <a
                href="#"
                style={{
                  fontSize: "0.78rem",
                  color: V.green,
                  fontFamily: V.font,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Voir le catalogue complet →
              </a>
            </div>
          </div>

          {/* Plugin detail */}
          <div
            style={{
              background: V.surface,
              border: `1px solid ${V.borderL}`,
              borderRadius: 6,
              overflow: "hidden",
              boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                padding: "18px 20px",
                borderBottom: `3px solid ${color}`,
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 8,
                  background: color + "12",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  flexShrink: 0,
                }}
              >
                {dm.icon}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h3
                    style={{
                      fontFamily: V.font,
                      fontWeight: 700,
                      fontSize: "0.9375rem",
                      color: V.fg,
                      margin: 0,
                    }}
                  >
                    {dm.name}
                  </h3>
                  <span
                    style={{
                      fontSize: "0.6rem",
                      padding: "2px 7px",
                      borderRadius: 3,
                      background: color + "12",
                      color,
                      fontWeight: 700,
                    }}
                  >
                    v2.4
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: V.fgMuted,
                    fontFamily: V.font,
                    margin: "4px 0 0",
                    lineHeight: 1.5,
                  }}
                >
                  {d.desc}
                </p>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${d.kpis.length}, 1fr)`,
                borderBottom: `1px solid ${V.borderL}`,
              }}
            >
              {d.kpis.map((k, i) => (
                <div
                  key={i}
                  style={{
                    padding: "12px 16px",
                    borderRight:
                      i < d.kpis.length - 1 ? `1px solid ${V.borderL}` : "none",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      fontFamily: V.font,
                      fontWeight: 700,
                      fontSize: "1.125rem",
                      color,
                      lineHeight: 1,
                    }}
                  >
                    {k.v}
                  </p>
                  <p
                    style={{
                      fontSize: "0.68rem",
                      color: V.fgSubtle,
                      marginTop: 3,
                      fontFamily: V.font,
                    }}
                  >
                    {k.l}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ padding: "14px 20px 18px" }}>
              <p
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  color: V.fgSubtle,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 10,
                  fontFamily: V.font,
                }}
              >
                Aperçu du formulaire terrain
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {d.fields.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "7px 10px",
                      background: V.raised,
                      borderRadius: 4,
                      border: `1px solid ${V.borderL}`,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: V.fgMuted,
                        width: 130,
                        flexShrink: 0,
                        fontFamily: V.font,
                      }}
                    >
                      {f.l}
                    </span>
                    <span
                      style={{
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        color: noteColor(f.note),
                        fontFamily: "var(--font-mono)",
                        flex: 1,
                      }}
                    >
                      {f.v}
                    </span>
                  </div>
                ))}
              </div>
              <div
                style={{
                  marginTop: 14,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: V.fgSubtle,
                    fontFamily: V.font,
                  }}
                >
                  {dm.std.join(" · ")}
                </span>
                <a
                  href={`/plugins/${active}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: V.green,
                    textDecoration: "none",
                    fontFamily: V.font,
                  }}
                >
                  Explorer ce plugin{" "}
                  <Icon name="arrowR" size={14} color={ICON.green} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Features (thémable) ──────────────────────────────────────────────────────

function Features() {
  const items = [
    {
      icon: "phone",
      color: ICON.green,
      title: "Application mobile native",
      desc: "iOS & Android. Collecte hors-ligne totale avec sync intelligente au retour du réseau. Interface optimisée pour le terrain.",
    },
    {
      icon: "map",
      color: ICON.blue,
      title: "GPS & Cartographie avancés",
      desc: "Filtrage Kalman, polygones, tracés. Précision effective < 3m. Export GeoJSON, KML, QGIS natif.",
    },
    {
      icon: "shield",
      color: ICON.red,
      title: "Surveillance anti-fraude",
      desc: "Monitoring temps réel des agents : position GPS périodique, photos de preuve, horodatage cryptographique infalsifiable.",
    },
    {
      icon: "zap",
      color: ICON.amber,
      title: "Sync robuste",
      desc: "Retry automatique, compression adaptative. Fonctionne sur 2G/EDGE dégradé. Aucune perte de données possible.",
    },
    {
      icon: "api",
      color: ICON.purple,
      title: "API ouverte",
      desc: "REST API documentée, webhooks, connecteurs PowerBI, Tableau, QGIS, DHIS2, Ona.io et KoboToolbox.",
    },
    {
      icon: "globe",
      color: ICON.teal,
      title: "Multi-langue",
      desc: "Interface en FR, EN, AR, SW. Multi-tenancy avec RBAC granulaire. Chaque organisation dans son espace cloisonné.",
    },
    {
      icon: "bar",
      color: ICON.amber,
      title: "Analytics & Rapports",
      desc: "Tableaux de bord temps réel, statistiques croisées, exports multi-formats, rapports PDF professionnels.",
    },
    {
      icon: "layers",
      color: ICON.green,
      title: "Constructeur no-code",
      desc: "Formulaires, sections, logique conditionnelle et règles métier sans une ligne de code. Interface intuitive et puissante.",
    },
    {
      icon: "db",
      color: ICON.blue,
      title: "Cloud & On-premise",
      desc: "SaaS hébergé sur infrastructure dédiée ou déploiement sur vos serveurs. Docker, Kubernetes, bare-metal.",
    },
  ];

  return (
    <section
      style={{
        background: V.surface,
        padding: "72px 24px",
        borderBottom: `1px solid ${V.borderL}`,
      }}
    >
      <div style={{ maxWidth: 1232, margin: "0 auto" }}>
        <div style={{ marginBottom: 48 }}>
          <p
            style={{
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: V.green,
              fontFamily: V.font,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 12,
            }}
          >
            Fonctionnalités
          </p>
          <h2
            style={{
              fontFamily: V.font,
              fontWeight: 700,
              fontSize: "clamp(1.625rem, 3vw, 2.25rem)",
              color: V.fg,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            Tout ce dont vous avez besoin, sans le superflu.
          </h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1px",
            background: V.borderL,
            border: `1px solid ${V.borderL}`,
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          {items.map((it, i) => (
            <div
              key={i}
              style={{
                padding: "24px",
                background: V.surface,
                transition: "background .15s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLDivElement).style.background =
                  V.raised)
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLDivElement).style.background =
                  V.surface)
              }
            >
              <div style={{ marginBottom: 14 }}>
                <Icon name={it.icon} size={22} color={it.color} />
              </div>
              <h3
                style={{
                  fontFamily: V.font,
                  fontWeight: 600,
                  fontSize: "0.9375rem",
                  color: V.fg,
                  marginBottom: 8,
                  letterSpacing: "-0.01em",
                }}
              >
                {it.title}
              </h3>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: V.fgMuted,
                  lineHeight: 1.6,
                  fontFamily: V.font,
                }}
              >
                {it.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Mobile Section (toujours sombre) ────────────────────────────────────────

function MobileSection() {
  return (
    <section style={{ background: DARK.bg2, padding: "72px 24px" }}>
      <div
        style={{
          maxWidth: 1232,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 60,
          alignItems: "center",
        }}
      >
        {/* Phone mockup */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            style={{
              width: 260,
              background: DARK.bg,
              borderRadius: 40,
              border: "2px solid #1E3448",
              padding: "16px 12px",
              boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
              position: "relative",
            }}
          >
            <div
              style={{
                width: 80,
                height: 24,
                background: DARK.bg,
                borderRadius: 12,
                margin: "0 auto 12px",
                border: "2px solid #1E3448",
              }}
            />
            <div
              style={{
                background: "#0A1520",
                borderRadius: 24,
                padding: 12,
                minHeight: 400,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 12,
                  fontSize: "0.6rem",
                  color: "rgba(255,255,255,0.4)",
                  fontFamily: V.font,
                }}
              >
                <span>09:41</span>
                <span>SenWiseTool</span>
                <span>● GPS</span>
              </div>
              <div
                style={{
                  background: "#152638",
                  borderRadius: 10,
                  padding: "10px 12px",
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 5,
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: ICON.green,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "0.58rem",
                      color: ICON.green,
                      fontWeight: 600,
                      fontFamily: V.font,
                    }}
                  >
                    EN COURS · Section 2/4
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    color: DARK.text,
                    fontFamily: V.font,
                    margin: 0,
                  }}
                >
                  Inspection cacao
                </p>
                <div
                  style={{
                    height: 2,
                    background: "#1E3448",
                    borderRadius: 1,
                    marginTop: 8,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: "50%",
                      background: ICON.green,
                      borderRadius: 1,
                    }}
                  />
                </div>
              </div>
              {[
                { l: "Superficie (ha)", v: "12.4" },
                { l: "Variété", v: "Forastero" },
              ].map((f, i) => (
                <div
                  key={i}
                  style={{
                    background: "#152638",
                    borderRadius: 8,
                    padding: "8px 10px",
                    marginBottom: 8,
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.58rem",
                      color: "rgba(255,255,255,0.4)",
                      marginBottom: 3,
                      fontFamily: V.font,
                    }}
                  >
                    {f.l}
                  </p>
                  <p
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: DARK.text,
                      fontFamily: V.font,
                      margin: 0,
                    }}
                  >
                    {f.v}
                  </p>
                </div>
              ))}
              <div
                style={{
                  background: "#152638",
                  borderRadius: 8,
                  padding: "8px 10px",
                  marginBottom: 8,
                }}
              >
                <p
                  style={{
                    fontSize: "0.58rem",
                    color: "rgba(255,255,255,0.4)",
                    marginBottom: 5,
                    fontFamily: V.font,
                  }}
                >
                  Polygone GPS
                </p>
                <div
                  style={{
                    background: "#0A1520",
                    borderRadius: 6,
                    height: 70,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "radial-gradient(circle at 50% 60%, rgba(93,184,58,0.15), transparent 60%)",
                    }}
                  />
                  <svg width="55" height="45" viewBox="0 0 55 45">
                    <polygon
                      points="27,4 50,17 44,41 10,41 4,17"
                      fill="rgba(93,184,58,0.15)"
                      stroke={ICON.green}
                      strokeWidth="1.5"
                    />
                    {[
                      [27, 4],
                      [50, 17],
                      [44, 41],
                      [10, 41],
                      [4, 17],
                    ].map(([x, y], i) => (
                      <circle key={i} cx={x} cy={y} r="3" fill={ICON.green} />
                    ))}
                  </svg>
                  <span
                    style={{
                      position: "absolute",
                      bottom: 4,
                      right: 6,
                      fontSize: "0.55rem",
                      color: ICON.green,
                      fontFamily: V.font,
                    }}
                  >
                    38 pts · ±2m
                  </span>
                </div>
              </div>
              <div
                style={{
                  background: "#152638",
                  borderRadius: 8,
                  padding: "8px 10px",
                }}
              >
                <p
                  style={{
                    fontSize: "0.58rem",
                    color: "rgba(255,255,255,0.4)",
                    marginBottom: 5,
                    fontFamily: V.font,
                  }}
                >
                  Photos parcelle
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 4,
                  }}
                >
                  {[ICON.green, ICON.blue, "#1E3448"].map((c, i) => (
                    <div
                      key={i}
                      style={{
                        aspectRatio: "1",
                        borderRadius: 6,
                        background: c === "#1E3448" ? c : c + "20",
                        border: `1px solid ${c === "#1E3448" ? "#2D4A62" : c + "40"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {i < 2 ? (
                        <Icon name="file" size={12} color={c} />
                      ) : (
                        <span style={{ fontSize: "1rem", color: "#3A5A72" }}>
                          +
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Text */}
        <div>
          <p
            style={{
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: ICON.green,
              fontFamily: V.font,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 16,
            }}
          >
            Application mobile
          </p>
          <h2
            style={{
              fontFamily: V.font,
              fontWeight: 700,
              fontSize: "clamp(1.625rem, 3vw, 2.25rem)",
              color: DARK.text,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              marginBottom: 20,
            }}
          >
            Conçue pour le terrain,
            <br />
            pas pour le bureau.
          </h2>
          <p
            style={{
              fontSize: "1rem",
              color: DARK.muted,
              lineHeight: 1.65,
              fontFamily: V.font,
              marginBottom: 32,
            }}
          >
            SenWiseTool mobile est pensé pour fonctionner dans des conditions
            réelles : réseau instable, soleil intense, urgence sur le terrain.
            Hors-ligne d'abord, synchronisation ensuite.
          </p>
          {[
            {
              icon: "zap",
              color: ICON.green,
              title: "Mode hors-ligne total",
              desc: "Toutes les données stockées localement. Sync automatique et silencieuse au retour du réseau.",
            },
            {
              icon: "map",
              color: ICON.blue,
              title: "GPS Kalman haute précision",
              desc: "Filtrage, moyennage pondéré, rejet des outliers. Précision effective < 3m sur terrain ouvert.",
            },
            {
              icon: "shield",
              color: ICON.red,
              title: "Surveillance discrète",
              desc: "Position, photos périodiques et horodatage cryptographique — sans perturber le travail de l'agent.",
            },
          ].map((f, i) => (
            <div key={i} style={{ display: "flex", gap: 14, marginBottom: 20 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: f.color + "15",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                <Icon name={f.icon} size={18} color={f.color} />
              </div>
              <div>
                <p
                  style={{
                    fontFamily: V.font,
                    fontWeight: 600,
                    fontSize: "0.9375rem",
                    color: DARK.text,
                    margin: "0 0 4px",
                  }}
                >
                  {f.title}
                </p>
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: DARK.muted,
                    fontFamily: V.font,
                    lineHeight: 1.55,
                    margin: 0,
                  }}
                >
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <a
              href="/mobile"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "0.625rem 1.25rem",
                background: ICON.green,
                color: "#fff",
                borderRadius: 4,
                fontSize: "0.875rem",
                fontWeight: 600,
                textDecoration: "none",
                fontFamily: V.font,
              }}
            >
              Télécharger l'app
            </a>
            <a
              href="/docs/mobile"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "0.625rem 1.25rem",
                background: "transparent",
                color: DARK.muted,
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 4,
                fontSize: "0.875rem",
                fontWeight: 500,
                textDecoration: "none",
                fontFamily: V.font,
              }}
            >
              Documentation →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Stats (thémable) ─────────────────────────────────────────────────────────

function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setActive(true);
      },
      { threshold: 0.5 },
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  function CountUp({ n, suffix = "" }: { n: number; suffix?: string }) {
    const [v, setV] = useState(0);
    useEffect(() => {
      if (!active) return;
      let raf: number;
      const start = Date.now(),
        dur = 1400;
      const tick = () => {
        const p = Math.min((Date.now() - start) / dur, 1);
        setV(Math.round(n * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, [active, n]);
    return (
      <>
        {v.toLocaleString("fr-FR")}
        {suffix}
      </>
    );
  }

  return (
    <div
      ref={ref}
      style={{
        background: V.raised,
        borderTop: `1px solid ${V.borderL}`,
        borderBottom: `1px solid ${V.borderL}`,
      }}
    >
      <div
        style={{
          maxWidth: 1232,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
        }}
      >
        {[
          { n: 500, s: "+", l: "Organisations actives", c: ICON.green },
          { n: 1200000, s: "+", l: "Collectes par mois", c: ICON.blue },
          { n: 48, s: "", l: "Domaines métier", c: ICON.purple },
          { n: 99, s: ".9%", l: "Disponibilité annuelle", c: ICON.amber },
        ].map((s, i, arr) => (
          <div
            key={i}
            style={{
              padding: "40px 24px",
              borderRight:
                i < arr.length - 1 ? `1px solid ${V.borderL}` : "none",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: V.font,
                fontWeight: 700,
                fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
                color: V.fg,
                lineHeight: 1,
                letterSpacing: "-0.04em",
              }}
            >
              <CountUp n={s.n} suffix={s.s} />
            </p>
            <p
              style={{
                fontSize: "0.8125rem",
                color: V.fgMuted,
                marginTop: 8,
                fontFamily: V.font,
              }}
            >
              {s.l}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Pricing (thémable, plan Pro toujours sombre) ─────────────────────────────

function Pricing() {
  const [annual, setAnnual] = useState(true);
  const plans = [
    {
      name: "Starter",
      price: { m: 49, a: 39 },
      highlight: false,
      desc: "Pour les petites équipes qui démarrent.",
      features: [
        "5 agents terrain",
        "3 formulaires actifs",
        "10 000 collectes/mois",
        "Export CSV & Excel",
        "Support email 48h",
      ],
    },
    {
      name: "Pro",
      price: { m: 149, a: 119 },
      highlight: true,
      desc: "Pour les organisations en croissance.",
      features: [
        "25 agents terrain",
        "Formulaires illimités",
        "100 000 collectes/mois",
        "1 plugin métier inclus",
        "GPS avancé & cartographie",
        "Surveillance agents",
        "API REST & webhooks",
        "Support prioritaire 4h",
      ],
    },
    {
      name: "Enterprise",
      price: null,
      highlight: false,
      desc: "Pour les déploiements à grande échelle.",
      features: [
        "Agents illimités",
        "Collectes illimitées",
        "Tous les plugins métier",
        "Déploiement on-premise",
        "SSO / SAML",
        "SLA 99.9%",
        "Account manager dédié",
        "Formation & onboarding",
      ],
    },
  ];

  return (
    <section
      id="pricing"
      style={{
        background: V.surface,
        padding: "72px 24px",
        borderBottom: `1px solid ${V.borderL}`,
      }}
    >
      <div style={{ maxWidth: 1232, margin: "0 auto" }}>
        <div
          style={{
            marginBottom: 40,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <p
              style={{
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: V.green,
                fontFamily: V.font,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 12,
              }}
            >
              Tarification
            </p>
            <h2
              style={{
                fontFamily: V.font,
                fontWeight: 700,
                fontSize: "clamp(1.625rem, 3vw, 2.25rem)",
                color: V.fg,
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              Simple et transparent.
            </h2>
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: V.raised,
              padding: 3,
              borderRadius: 6,
              border: `1px solid ${V.borderL}`,
            }}
          >
            {[
              { l: "Mensuel", v: false },
              { l: "Annuel (−20%)", v: true },
            ].map((b) => (
              <button
                key={b.l}
                onClick={() => setAnnual(b.v)}
                style={{
                  padding: "6px 16px",
                  borderRadius: 4,
                  border: "none",
                  background: annual === b.v ? V.surface : "transparent",
                  color: annual === b.v ? V.fg : V.fgMuted,
                  fontFamily: V.font,
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  transition: "all .15s",
                  boxShadow:
                    annual === b.v ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
              >
                {b.l}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
        >
          {plans.map((plan, i) => (
            <div
              key={i}
              style={{
                padding: "28px",
                borderRadius: 6,
                background: plan.highlight ? DARK.bg2 : V.surface,
                border: plan.highlight ? "none" : `1px solid ${V.borderL}`,
                position: "relative",
              }}
            >
              {plan.highlight && (
                <div
                  style={{
                    position: "absolute",
                    top: -1,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: ICON.green,
                    color: "#fff",
                    padding: "3px 14px",
                    borderRadius: "0 0 6px 6px",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    fontFamily: V.font,
                    letterSpacing: "0.04em",
                  }}
                >
                  PLUS POPULAIRE
                </div>
              )}
              <h3
                style={{
                  fontFamily: V.font,
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: plan.highlight ? DARK.text : V.fg,
                  marginBottom: 4,
                }}
              >
                {plan.name}
              </h3>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: plan.highlight ? DARK.muted : V.fgMuted,
                  fontFamily: V.font,
                  marginBottom: 20,
                }}
              >
                {plan.desc}
              </p>
              <div style={{ marginBottom: 24 }}>
                {plan.price ? (
                  <div
                    style={{ display: "flex", alignItems: "baseline", gap: 4 }}
                  >
                    <span
                      style={{
                        fontFamily: V.font,
                        fontWeight: 700,
                        fontSize: "2.25rem",
                        color: plan.highlight ? DARK.text : V.fg,
                        letterSpacing: "-0.04em",
                      }}
                    >
                      {annual ? plan.price.a : plan.price.m}€
                    </span>
                    <span
                      style={{
                        fontSize: "0.875rem",
                        color: plan.highlight ? DARK.dim : V.fgSubtle,
                        fontFamily: V.font,
                      }}
                    >
                      /mois
                    </span>
                  </div>
                ) : (
                  <p
                    style={{
                      fontFamily: V.font,
                      fontWeight: 700,
                      fontSize: "1.5rem",
                      color: V.fg,
                    }}
                  >
                    Sur devis
                  </p>
                )}
              </div>
              <a
                href={plan.price ? "/register" : "/contact"}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "0.625rem 1rem",
                  borderRadius: 4,
                  background: plan.highlight ? ICON.green : "transparent",
                  color: plan.highlight ? "#fff" : V.fg,
                  border: plan.highlight ? "none" : `1px solid ${V.borderL}`,
                  fontFamily: V.font,
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  textDecoration: "none",
                  marginBottom: 24,
                  transition: "all .15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background =
                    plan.highlight ? "#4aa32f" : V.raised;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background =
                    plan.highlight ? ICON.green : "transparent";
                }}
              >
                {plan.price ? "Commencer" : "Contacter l'équipe"}{" "}
                <Icon
                  name="arrowR"
                  size={14}
                  color={plan.highlight ? "#fff" : V.fg}
                />
              </a>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {plan.features.map((f, j) => (
                  <div
                    key={j}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                    }}
                  >
                    <div style={{ marginTop: 1, flexShrink: 0 }}>
                      <Icon name="check" size={15} color={ICON.green} />
                    </div>
                    <span
                      style={{
                        fontSize: "0.8125rem",
                        color: plan.highlight
                          ? "rgba(255,255,255,0.75)"
                          : V.fgMuted,
                        fontFamily: V.font,
                        lineHeight: 1.4,
                      }}
                    >
                      {f}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p
          style={{
            textAlign: "center",
            fontSize: "0.8125rem",
            color: V.fgSubtle,
            marginTop: 20,
            fontFamily: V.font,
          }}
        >
          14 jours d'essai gratuit · Aucune carte bancaire requise · Annulation
          à tout moment
        </p>
      </div>
    </section>
  );
}

// ─── Testimonials (thémable) ──────────────────────────────────────────────────

function Testimonials() {
  const items = [
    {
      q: "SenWiseTool a transformé nos audits EUDR. En 3 mois, nous avons cartographié 12 000 hectares de plantations avec une précision GPS inégalée par aucun autre outil du marché.",
      name: "Dr. Mariama Koné",
      role: "Directrice Qualité, CAMOCO",
      domain: "Cacao / EUDR",
    },
    {
      q: "Le plugin hydrologie respecte parfaitement nos protocoles ISO 5667. La collecte piézométrique hors-ligne en zone reculée était notre défi numéro un. SenWiseTool l'a résolu en une semaine.",
      name: "Jean-Baptiste Eboué",
      role: "Ingénieur Hydrologue, DGH Cameroun",
      domain: "Hydrologie",
    },
    {
      q: "La surveillance agents et l'horodatage cryptographique nous ont permis d'identifier des incohérences de saisie qui compromettaient la fiabilité de nos données épidémiologiques.",
      name: "Pr. Amina Tahir",
      role: "Épidémiologiste, Ministère de la Santé",
      domain: "Santé publique",
    },
  ];

  return (
    <section
      style={{
        background: V.raised,
        padding: "72px 24px",
        borderBottom: `1px solid ${V.borderL}`,
      }}
    >
      <div style={{ maxWidth: 1232, margin: "0 auto" }}>
        <div style={{ marginBottom: 40 }}>
          <p
            style={{
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: V.green,
              fontFamily: V.font,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 12,
            }}
          >
            Témoignages
          </p>
          <h2
            style={{
              fontFamily: V.font,
              fontWeight: 700,
              fontSize: "clamp(1.625rem, 3vw, 2.25rem)",
              color: V.fg,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            Des professionnels de terrain. Des résultats concrets.
          </h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
        >
          {items.map((t, i) => (
            <div
              key={i}
              style={{
                padding: "24px",
                background: V.surface,
                border: `1px solid ${V.borderL}`,
                borderRadius: 6,
                display: "flex",
                flexDirection: "column",
                gap: 20,
                transition: "box-shadow .2s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 4px 20px rgba(0,0,0,0.07)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLDivElement).style.boxShadow = "none")
              }
            >
              <div style={{ display: "flex", gap: 2 }}>
                {Array(5)
                  .fill(0)
                  .map((_, j) => (
                    <span
                      key={j}
                      style={{ color: ICON.amber, fontSize: "0.875rem" }}
                    >
                      ★
                    </span>
                  ))}
              </div>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: V.fgMuted,
                  lineHeight: 1.7,
                  fontFamily: V.font,
                  flex: 1,
                }}
              >
                "{t.q}"
              </p>
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: ICON.green + "15",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: V.font,
                      fontWeight: 700,
                      fontSize: "0.875rem",
                      color: ICON.green,
                      flexShrink: 0,
                    }}
                  >
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p
                      style={{
                        fontFamily: V.font,
                        fontWeight: 600,
                        fontSize: "0.8125rem",
                        color: V.fg,
                        margin: 0,
                      }}
                    >
                      {t.name}
                    </p>
                    <p
                      style={{
                        fontSize: "0.72rem",
                        color: V.fgSubtle,
                        fontFamily: V.font,
                        margin: "1px 0 0",
                      }}
                    >
                      {t.role}
                    </p>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "0.68rem",
                    padding: "3px 8px",
                    borderRadius: 3,
                    background: ICON.green + "12",
                    color: ICON.green,
                    fontWeight: 600,
                    fontFamily: V.font,
                  }}
                >
                  {t.domain}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA (toujours sombre) ────────────────────────────────────────────────────

function CTA() {
  return (
    <section style={{ background: DARK.bg2, padding: "72px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
        <h2
          style={{
            fontFamily: V.font,
            fontWeight: 700,
            fontSize: "clamp(1.875rem, 4vw, 2.75rem)",
            color: DARK.text,
            letterSpacing: "-0.025em",
            lineHeight: 1.15,
            marginBottom: 16,
          }}
        >
          Prêt à moderniser votre collecte terrain ?
        </h2>
        <p
          style={{
            fontSize: "1.0625rem",
            color: DARK.muted,
            fontFamily: V.font,
            lineHeight: 1.65,
            marginBottom: 32,
          }}
        >
          Rejoignez 500+ organisations qui font confiance à SenWiseTool. Premier
          formulaire opérationnel en moins de 5 minutes.
        </p>
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <a
            href="/register"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "0.75rem 1.75rem",
              background: ICON.green,
              color: "#fff",
              borderRadius: 4,
              fontSize: "0.9375rem",
              fontWeight: 600,
              textDecoration: "none",
              fontFamily: V.font,
              transition: "background .15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#4aa32f")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = ICON.green)
            }
          >
            Créer un compte gratuit{" "}
            <Icon name="arrowR" size={16} color="#fff" />
          </a>
          <a
            href="/contact"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "0.75rem 1.75rem",
              background: "transparent",
              color: DARK.muted,
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 4,
              fontSize: "0.9375rem",
              fontWeight: 500,
              textDecoration: "none",
              fontFamily: V.font,
            }}
          >
            Parler à un expert
          </a>
        </div>
        <p
          style={{
            fontSize: "0.78rem",
            color: DARK.dim,
            marginTop: 16,
            fontFamily: V.font,
          }}
        >
          14 jours d'essai complet · Aucune carte bancaire · Support inclus
        </p>
      </div>
    </section>
  );
}

// ─── Footer (toujours sombre) ─────────────────────────────────────────────────

function Footer() {
  const cols = [
    {
      t: "Produit",
      ls: [
        "Fonctionnalités",
        "Plugins métier",
        "Application mobile",
        "API & Intégrations",
        "Tarification",
        "Changelog",
      ],
    },
    {
      t: "Solutions",
      ls: [
        "Cacao / EUDR",
        "Hydrologie",
        "Agriculture",
        "Santé publique",
        "Environnement",
        "Infrastructure",
      ],
    },
    {
      t: "Ressources",
      ls: [
        "Documentation",
        "Blog",
        "Guides terrain",
        "Tutoriels vidéo",
        "Statut",
        "Communauté",
      ],
    },
    {
      t: "Entreprise",
      ls: [
        "À propos",
        "Carrières",
        "Partenaires",
        "Presse",
        "Mentions légales",
        "Confidentialité",
      ],
    },
  ];

  return (
    <footer style={{ background: DARK.bg, borderTop: "1px solid #152638" }}>
      <div
        style={{ maxWidth: 1232, margin: "0 auto", padding: "48px 24px 24px" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "220px 1fr 1fr 1fr 1fr",
            gap: 48,
            marginBottom: 48,
          }}
        >
          {/* Brand */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 14,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="6" fill={ICON.green} />
                <path d="M7 14L12 9L17 14L12 19Z" fill="white" />
                <path
                  d="M12 9L21 9L21 19L17 14Z"
                  fill="rgba(255,255,255,0.55)"
                />
              </svg>
              <span
                style={{
                  color: DARK.text,
                  fontFamily: V.font,
                  fontWeight: 700,
                  fontSize: "0.9375rem",
                }}
              >
                SenWise<span style={{ color: ICON.green }}>Tool</span>
              </span>
            </div>
            <p
              style={{
                fontSize: "0.78rem",
                color: DARK.dim,
                lineHeight: 1.65,
                fontFamily: V.font,
                marginBottom: 16,
                maxWidth: 200,
              }}
            >
              Collectez, traitez et exploitez vos données terrain — dans tous
              les secteurs.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              {["in", "X", "GH"].map((s) => (
                <a
                  key={s}
                  href="#"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 4,
                    border: "1px solid #1E3448",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: DARK.dim,
                    textDecoration: "none",
                    transition: "all .15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor =
                      "#2D4A62";
                    (e.currentTarget as HTMLAnchorElement).style.color =
                      DARK.muted;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor =
                      "#1E3448";
                    (e.currentTarget as HTMLAnchorElement).style.color =
                      DARK.dim;
                  }}
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {cols.map((col) => (
            <div key={col.t}>
              <p
                style={{
                  fontFamily: V.font,
                  fontWeight: 600,
                  fontSize: "0.8125rem",
                  color: DARK.muted,
                  marginBottom: 14,
                  letterSpacing: "0.02em",
                }}
              >
                {col.t}
              </p>
              {col.ls.map((l) => (
                <a
                  key={l}
                  href="#"
                  style={{
                    display: "block",
                    fontSize: "0.8125rem",
                    color: DARK.dim,
                    textDecoration: "none",
                    marginBottom: 8,
                    fontFamily: V.font,
                    transition: "color .15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = DARK.muted)
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.color = DARK.dim)}
                >
                  {l}
                </a>
              ))}
            </div>
          ))}
        </div>

        <div
          style={{
            paddingTop: 20,
            borderTop: "1px solid #152638",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <p
            style={{ fontSize: "0.75rem", color: DARK.dim, fontFamily: V.font }}
          >
            © 2024 SenWiseTool. Tous droits réservés.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                fontSize: "0.68rem",
                padding: "2px 8px",
                borderRadius: 3,
                background: "#152638",
                color: DARK.dim,
                fontFamily: V.font,
                border: "1px solid #1E3448",
              }}
            >
              v2.4.0
            </span>
            <span
              style={{
                fontSize: "0.68rem",
                padding: "2px 8px",
                borderRadius: 3,
                background: ICON.green + "15",
                color: ICON.green,
                fontFamily: V.font,
                fontWeight: 600,
              }}
            >
              ● Opérationnel
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <>
      {/* Pas de <style> global ici — globals.css gère body, couleurs et animations */}
      <Navbar />
      <main>
        <Hero />
        <Stages />
        <DomainPlugins />
        <Features />
        <MobileSection />
        <Stats />
        <Pricing />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
