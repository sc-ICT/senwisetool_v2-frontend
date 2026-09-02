"use client";

/* eslint-disable @next/next/no-img-element */

import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";
import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Folder,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

/* -------------------------------------------------------------------------- */
/* Navigation types                                                           */
/* -------------------------------------------------------------------------- */

type NavChild = {
  href: string;
  label: string;
};

type NavLink = {
  type: "link";
  href: string;
  icon: LucideIcon;
  label: string;
  exact?: boolean;
};

type NavGroup = {
  type: "group";
  label: string;
  icon: LucideIcon;
  children: NavChild[];
};

type NavItem = NavLink | NavGroup;

/* -------------------------------------------------------------------------- */
/* Navigation                                                                 */
/* -------------------------------------------------------------------------- */

const NAV: NavItem[] = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    exact: true,
    type: "link",
  },
  {
    href: "/dashboard/files",
    icon: Folder,
    label: "Fichiers",
    exact: false,
    type: "link",
  },
  {
    href: "/dashboard/question-bank",
    icon: FolderKanban,
    label: "Banque de questions",
    exact: false,
    type: "link",
  },
  {
    href: "/dashboard/projects",
    icon: FolderKanban,
    label: "Projets",
    exact: false,
    type: "link",
  },
  {
    href: "/dashboard/agents",
    icon: Users,
    label: "Agents",
    exact: false,
    type: "link",
  },
  // {
  //   label: "Formulaires",
  //   icon: FileText,
  //   type: "group",
  //   children: [
  //     {
  //       href: "/dashboard/forms",
  //       label: "Formulaires",
  //     },
  //     {
  //       href: "/dashboard/",
  //       label: "",
  //     },
  //   ],
  // },
];

const ICON_GREEN = "#5DB83A";

/* -------------------------------------------------------------------------- */
/* Sidebar                                                                    */
/* -------------------------------------------------------------------------- */

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Formulaires: true,
  });

  const pathname = usePathname();
  const router = useRouter();
  const { user, clearUser } = useAuthStore();

  /* ------------------------------------------------------------------------ */
  /* Actions                                                                  */
  /* ------------------------------------------------------------------------ */

  const handleLogout = async () => {
    try {
      await authService.logout();
      clearUser();
      router.push("/login");
    } catch {
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const toggleGroup = (label: string) => {
    setOpenGroups((current) => ({
      ...current,
      [label]: !current[label],
    }));
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 224 }}
      transition={{
        duration: 0.25,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: "var(--color-surface)",
        borderRight: "1px solid var(--color-border)",
        flexShrink: 0,
        overflow: "hidden",
        zIndex: 10,
      }}
    >
      {/* ------------------------------------------------------------------ */}
      {/* Logo                                                               */}
      {/* ------------------------------------------------------------------ */}

      <div
        style={{
          height: "60px",
          display: "flex",
          alignItems: "center",
          padding: collapsed ? "0 18px" : "0 20px",
          borderBottom: "1px solid var(--color-border)",
          flexShrink: 0,
          gap: "0.75rem",
        }}
      >
        <img
          src="/logo.png"
          alt="SWT"
          width={28}
          height={28}
          style={{
            borderRadius: "8px",
            flexShrink: 0,
            objectFit: "contain",
          }}
        />

        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.18 }}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1rem",
                fontWeight: 600,
                color: "var(--color-foreground)",
                whiteSpace: "nowrap",
              }}
            >
              SenWiseTool
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Navigation                                                         */}
      {/* ------------------------------------------------------------------ */}

      <nav
        style={{
          flex: 1,
          padding: "0.75rem 0.625rem",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          overflowY: "auto",
        }}
      >
        {NAV.map((item) => {
          /* ================================================================ */
          /* GROUP                                                            */
          /* ================================================================ */

          if (item.type === "group") {
            const groupOpen = openGroups[item.label] ?? false;

            const groupActive = item.children.some((child) =>
              pathname.startsWith(child.href),
            );

            return (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                {/* Groupe principal */}
                <button
                  type="button"
                  onClick={() => {
                    if (collapsed) {
                      setCollapsed(false);

                      setOpenGroups((current) => ({
                        ...current,
                        [item.label]: true,
                      }));

                      return;
                    }

                    toggleGroup(item.label);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: collapsed ? "0.625rem" : "0.625rem 0.875rem",
                    borderRadius: "0.75rem",
                    position: "relative",
                    border: groupActive
                      ? "1px solid rgb(93 184 58 / 0.2)"
                      : "1px solid transparent",
                    background: groupActive
                      ? "linear-gradient(135deg, rgb(93 184 58 / 0.15), rgb(14 165 233 / 0.1))"
                      : "transparent",
                    color: groupActive
                      ? ICON_GREEN
                      : "var(--color-foreground-muted)",
                    cursor: "pointer",
                    justifyContent: collapsed ? "center" : "flex-start",
                    transition: "background 0.15s, color 0.15s",
                  }}
                  title={collapsed ? item.label : undefined}
                >
                  {groupActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      style={{
                        position: "absolute",
                        left: 0,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "3px",
                        height: "60%",
                        borderRadius: "0 3px 3px 0",
                        background:
                          "linear-gradient(to bottom, #5DB83A, #0EA5E9)",
                      }}
                      transition={{
                        duration: 0.2,
                      }}
                    />
                  )}

                  <item.icon
                    size={17}
                    style={{
                      flexShrink: 0,
                    }}
                    color={groupActive ? ICON_GREEN : undefined}
                  />

                  <AnimatePresence>
                    {!collapsed && (
                      <>
                        <motion.span
                          initial={{
                            opacity: 0,
                          }}
                          animate={{
                            opacity: 1,
                          }}
                          exit={{
                            opacity: 0,
                          }}
                          transition={{
                            duration: 0.15,
                          }}
                          style={{
                            flex: 1,
                            textAlign: "left",
                            fontSize: "0.875rem",
                            fontWeight: groupActive ? 600 : 400,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.label}
                        </motion.span>

                        <motion.span
                          animate={{
                            rotate: groupOpen ? 180 : 0,
                          }}
                          transition={{
                            duration: 0.18,
                          }}
                          style={{
                            display: "flex",
                          }}
                        >
                          <ChevronDown size={15} />
                        </motion.span>
                      </>
                    )}
                  </AnimatePresence>
                </button>

                {/* Sous-menu */}
                <AnimatePresence initial={false}>
                  {!collapsed && groupOpen && (
                    <motion.div
                      initial={{
                        height: 0,
                        opacity: 0,
                      }}
                      animate={{
                        height: "auto",
                        opacity: 1,
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                      }}
                      transition={{
                        duration: 0.18,
                        ease: "easeOut",
                      }}
                      style={{
                        overflow: "hidden",
                        paddingLeft: "0.75rem",
                      }}
                    >
                      {item.children.map((child) => {
                        const active = pathname.startsWith(child.href);

                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              minHeight: "34px",
                              padding: "0 0.75rem",
                              marginTop: "2px",
                              borderRadius: "0.625rem",
                              textDecoration: "none",
                              background: active
                                ? "rgb(93 184 58 / 0.08)"
                                : "transparent",
                              color: active
                                ? ICON_GREEN
                                : "var(--color-foreground-muted)",
                              fontSize: "0.8125rem",
                              fontWeight: active ? 600 : 400,
                              transition: "background 0.15s, color 0.15s",
                            }}
                          >
                            <span
                              style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                marginRight: "0.625rem",
                                flexShrink: 0,
                                background: active
                                  ? ICON_GREEN
                                  : "var(--color-border)",
                              }}
                            />

                            {child.label}
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          /* ================================================================ */
          /* LINK                                                             */
          /* ================================================================ */

          const active = isActive(item.href, item.exact);

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: collapsed ? "0.625rem" : "0.625rem 0.875rem",
                borderRadius: "0.75rem",
                textDecoration: "none",
                position: "relative",
                transition: "background 0.15s, color 0.15s",
                justifyContent: collapsed ? "center" : "flex-start",
                background: active
                  ? "linear-gradient(135deg, rgb(93 184 58 / 0.15), rgb(14 165 233 / 0.1))"
                  : "transparent",
                border: active
                  ? "1px solid rgb(93 184 58 / 0.2)"
                  : "1px solid transparent",
                color: active ? ICON_GREEN : "var(--color-foreground-muted)",
              }}
              title={collapsed ? item.label : undefined}
            >
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "3px",
                    height: "60%",
                    borderRadius: "0 3px 3px 0",
                    background: "linear-gradient(to bottom, #5DB83A, #0EA5E9)",
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                />
              )}

              <item.icon
                size={17}
                style={{
                  flexShrink: 0,
                }}
                color={active ? ICON_GREEN : undefined}
              />

              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    transition={{
                      duration: 0.15,
                    }}
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: active ? 600 : 400,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* ------------------------------------------------------------------ */}
      {/* Footer                                                             */}
      {/* ------------------------------------------------------------------ */}

      <div
        style={{
          padding: "0.75rem 0.625rem",
          borderTop: "1px solid var(--color-border)",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
      >
        {!collapsed && user && (
          <div
            style={{
              padding: "0.625rem 0.875rem",
              borderRadius: "0.75rem",
              background: "var(--color-surface-raised)",
              marginBottom: "4px",
            }}
          >
            <p
              style={{
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "var(--color-foreground)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.name}
            </p>

            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--color-foreground-muted)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.email}
            </p>
          </div>
        )}

        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: collapsed ? "0.625rem" : "0.625rem 0.875rem",
            borderRadius: "0.75rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--color-foreground-muted)",
            fontSize: "0.875rem",
            width: "100%",
            justifyContent: collapsed ? "center" : "flex-start",
            transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgb(244 63 94 / 0.1)";
            e.currentTarget.style.color = "#F43F5E";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "none";
            e.currentTarget.style.color = "var(--color-foreground-muted)";
          }}
        >
          <LogOut size={17} style={{ flexShrink: 0 }} />

          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Déconnexion
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Bouton collapse                                                    */}
      {/* ------------------------------------------------------------------ */}

      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: "absolute",
          right: "-12px",
          top: "72px",
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          background: "var(--color-surface-raised)",
          border: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "var(--color-foreground-muted)",
          zIndex: 20,
          transition: "background 0.15s, color 0.15s",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.aside>
  );
}
