"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Archive,
  CheckCircle2,
  Edit3,
  FileCode2,
  FileEdit,
  History,
  Loader2,
  MoreVertical,
  Package,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Header } from "@/components/layout/header";
import { PluginDialog } from "@/components/plugins/plugin-dialog";
import { ApiError } from "@/lib/api";
import { pluginService } from "@/services/plugin.service";
import type { Plugin, PluginStatus } from "@/types/plugin";

import { PluginVersionHistoryDialog } from "@/components/plugins/plugin-version-history-dialog";
import { useRouter } from "next/navigation";
import { DeletePluginDialog } from "./delete-plugin-dialog";
import { PluginLifecycleDialog } from "./plugin-lifecycle-dialog";

const STATUS_LABELS: Record<PluginStatus, string> = {
  DRAFT: "Brouillon",
  PUBLISHED: "Publié",
  UNPUBLISHED: "Dépublié",
  ARCHIVED: "Archivé",
};

function getStatusColor(status: PluginStatus): string {
  switch (status) {
    case "PUBLISHED":
      return "#5DB83A";

    case "DRAFT":
      return "#A78BFA";

    case "UNPUBLISHED":
      return "#F59E0B";

    case "ARCHIVED":
      return "#94A3B8";

    default:
      return "var(--color-foreground-muted)";
  }
}

function getStatusBackground(status: PluginStatus): string {
  switch (status) {
    case "PUBLISHED":
      return "rgba(93, 184, 58, 0.1)";

    case "DRAFT":
      return "rgba(167, 139, 250, 0.1)";

    case "UNPUBLISHED":
      return "rgba(245, 158, 11, 0.1)";

    case "ARCHIVED":
      return "rgba(148, 163, 184, 0.1)";

    default:
      return "var(--color-surface-raised)";
  }
}

function getStatusIcon(status: PluginStatus) {
  switch (status) {
    case "PUBLISHED":
      return CheckCircle2;

    case "DRAFT":
      return FileEdit;

    case "UNPUBLISHED":
      return XCircle;

    case "ARCHIVED":
      return Archive;

    default:
      return FileCode2;
  }
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

type LifecycleAction = "publish" | "unpublish" | "draft" | "archive";

export default function PluginsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();

  const [statusFilter, setStatusFilter] = useState<PluginStatus | "ALL">("ALL");

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [editingPlugin, setEditingPlugin] = useState<Plugin | null>(null);

  const [versionHistoryPlugin, setVersionHistoryPlugin] =
    useState<Plugin | null>(null);

  const [deletingPlugin, setDeletingPlugin] = useState<Plugin | null>(null);

  const [lifecyclePlugin, setLifecyclePlugin] = useState<Plugin | null>(null);

  const [lifecycleAction, setLifecycleAction] =
    useState<LifecycleAction | null>(null);

  const [openMenuPluginId, setOpenMenuPluginId] = useState<number | null>(null);

  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    right: number;
  } | null>(null);

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["plugins"],

    queryFn: async () => {
      const response = await pluginService.list(true);

      return response.data;
    },
  });

  const plugins = data?.items ?? [];

  const filteredPlugins = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();

    return plugins.filter((plugin) => {
      const matchesSearch =
        !query ||
        plugin.name.toLocaleLowerCase().includes(query) ||
        plugin.code.toLocaleLowerCase().includes(query) ||
        plugin.description.toLocaleLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" || plugin.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [plugins, searchQuery, statusFilter]);

  const hasFilters = Boolean(searchQuery.trim()) || statusFilter !== "ALL";

  const publishedCount = plugins.filter(
    (plugin) => plugin.status === "PUBLISHED",
  ).length;

  const draftCount = plugins.filter(
    (plugin) => plugin.status === "DRAFT",
  ).length;

  const unpublishedCount = plugins.filter(
    (plugin) => plugin.status === "UNPUBLISHED",
  ).length;

  const archivedCount = plugins.filter(
    (plugin) => plugin.status === "ARCHIVED",
  ).length;

  const closeMenu = () => {
    setOpenMenuPluginId(null);
    setMenuPosition(null);
  };

  const openLifecycleDialog = (plugin: Plugin, action: LifecycleAction) => {
    closeMenu();

    setLifecyclePlugin(plugin);
    setLifecycleAction(action);
  };

  const closeLifecycleDialog = () => {
    setLifecyclePlugin(null);
    setLifecycleAction(null);
  };

  const handleEdit = (plugin: Plugin) => {
    closeMenu();

    if (plugin.status !== "DRAFT") {
      toast.info("Seuls les plugins en brouillon peuvent être modifiés.");

      return;
    }

    setEditingPlugin(plugin);
  };

  const handleDelete = (plugin: Plugin) => {
    closeMenu();

    if (plugin.status === "PUBLISHED") {
      toast.error("Un plugin publié doit être dépublié avant suppression.");

      return;
    }

    if (plugin.status === "ARCHIVED") {
      toast.error("Un plugin archivé ne peut pas être supprimé.");

      return;
    }

    setDeletingPlugin(plugin);
  };

  const handleMenuToggle = (
    event: React.MouseEvent<HTMLButtonElement>,
    plugin: Plugin,
  ) => {
    if (openMenuPluginId === plugin.id) {
      closeMenu();
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();

    setOpenMenuPluginId(plugin.id);

    setMenuPosition({
      top: rect.bottom + 6,
      right: window.innerWidth - rect.right,
    });
  };

  return (
    <>
      <Header
        title="Plugins"
        description="Créez et gérez les extensions de votre écosystème."
        actions={
          <>
            <button
              type="button"
              onClick={() => {
                void refetch();
              }}
              disabled={isFetching}
              title="Actualiser"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "0.625rem",
                border: "1px solid var(--color-border)",
                background: "var(--color-surface-raised)",
                color: "var(--color-foreground-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: isFetching ? "not-allowed" : "pointer",
                opacity: isFetching ? 0.6 : 1,
              }}
            >
              {isFetching ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsCreateDialogOpen(true);
              }}
              style={{
                height: "36px",
                padding: "0 0.875rem",
                borderRadius: "0.625rem",
                border: "1px solid rgba(93, 184, 58, 0.25)",
                background: "rgba(93, 184, 58, 0.1)",
                color: "#5DB83A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                fontSize: "0.8125rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Plus size={16} />
              Créer un plugin
            </button>
          </>
        }
      />

      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "1.5rem",
        }}
      >
        {/* =================================================================
            STATISTIQUES
        ================================================================= */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: "1rem",
            marginBottom: "1.25rem",
          }}
        >
          <PluginStatCard
            label="Total des plugins"
            value={data?.count ?? 0}
            description="Plugins enregistrés"
            icon={Package}
            iconBackground="rgba(93, 184, 58, 0.08)"
            iconColor="#5DB83A"
          />

          <PluginStatCard
            label="Plugins publiés"
            value={publishedCount}
            description="Disponibles dans la marketplace"
            icon={CheckCircle2}
            iconBackground="rgba(93, 184, 58, 0.08)"
            iconColor="#5DB83A"
          />

          <PluginStatCard
            label="Brouillons"
            value={draftCount}
            description="En cours de configuration"
            icon={FileEdit}
            iconBackground="rgba(167, 139, 250, 0.08)"
            iconColor="#A78BFA"
          />

          <PluginStatCard
            label="Dépubliés"
            value={unpublishedCount}
            description="Retirés temporairement"
            icon={XCircle}
            iconBackground="rgba(245, 158, 11, 0.08)"
            iconColor="#F59E0B"
          />

          <PluginStatCard
            label="Archivés"
            value={archivedCount}
            description="Plugins archivés"
            icon={Archive}
            iconBackground="rgba(148, 163, 184, 0.08)"
            iconColor="#94A3B8"
          />
        </div>

        {/* =================================================================
            CONTENEUR
        ================================================================= */}

        <div
          style={{
            overflow: "hidden",
            border: "1px solid var(--color-border)",
            borderRadius: "1rem",
            background: "var(--color-surface)",
          }}
        >
          {/* Barre de contrôle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "1rem 1.25rem",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <div
              style={{
                position: "relative",
                flex: 1,
                minWidth: 0,
              }}
            >
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--color-foreground-muted)",
                  pointerEvents: "none",
                }}
              />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                }}
                placeholder="Rechercher un plugin..."
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setSearchQuery("");

                    event.currentTarget.blur();
                  }
                }}
                style={{
                  width: "100%",
                  height: "40px",
                  padding: "0 0.875rem 0 2.375rem",
                  borderRadius: "0.625rem",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface-raised)",
                  color: "var(--color-foreground)",
                  outline: "none",
                  fontSize: "0.8125rem",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as PluginStatus | "ALL");
              }}
              style={{
                flexShrink: 0,
                height: "40px",
                minWidth: "180px",
                padding: "0 0.875rem",
                borderRadius: "0.625rem",
                border: "1px solid var(--color-border)",
                background: "var(--color-surface-raised)",
                color: "var(--color-foreground)",
                outline: "none",
                fontSize: "0.8125rem",
              }}
            >
              <option value="ALL">Tous les statuts</option>

              <option value="DRAFT">Brouillons</option>

              <option value="PUBLISHED">Publiés</option>

              <option value="UNPUBLISHED">Dépubliés</option>

              <option value="ARCHIVED">Archivés</option>
            </select>
          </div>

          {/* =================================================================
              TABLE
          ================================================================= */}

          {isLoading ? (
            <div
              style={{
                minHeight: "360px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-foreground-muted)",
              }}
            >
              <Loader2 size={24} className="animate-spin" />
            </div>
          ) : error ? (
            <div
              style={{
                minHeight: "360px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
                padding: "2rem",
                textAlign: "center",
              }}
            >
              <XCircle size={30} color="#F43F5E" />

              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "var(--color-foreground)",
                  }}
                >
                  Impossible de charger les plugins.
                </p>

                <p
                  style={{
                    margin: "0.375rem 0 0",
                    fontSize: "0.75rem",
                    color: "var(--color-foreground-muted)",
                  }}
                >
                  {error instanceof ApiError
                    ? error.message
                    : "Une erreur est survenue."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  void refetch();
                }}
                style={{
                  height: "36px",
                  padding: "0 0.875rem",
                  borderRadius: "0.625rem",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface-raised)",
                  color: "var(--color-foreground)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Réessayer
              </button>
            </div>
          ) : filteredPlugins.length === 0 ? (
            <div
              style={{
                minHeight: "360px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem",
                textAlign: "center",
              }}
            >
              <Package size={32} color="var(--color-foreground-muted)" />

              <p
                style={{
                  margin: "0.875rem 0 0",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--color-foreground)",
                }}
              >
                {hasFilters
                  ? "Aucun plugin ne correspond aux filtres."
                  : "Aucun plugin."}
              </p>

              {hasFilters ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("ALL");
                  }}
                  style={{
                    marginTop: "0.75rem",
                    height: "34px",
                    padding: "0 0.75rem",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface-raised)",
                    color: "var(--color-foreground)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Réinitialiser
                </button>
              ) : null}
            </div>
          ) : (
            <div
              style={{
                overflowX: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>Plugin</th>

                    <th style={tableHeaderStyle}>Statut</th>

                    <th style={tableHeaderStyle}>Version</th>

                    <th style={tableHeaderStyle}>Créé le</th>

                    <th
                      style={{
                        ...tableHeaderStyle,
                        width: "60px",
                        textAlign: "right",
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPlugins.map((plugin) => {
                    const StatusIcon = getStatusIcon(plugin.status);

                    const latestVersion = getDisplayVersion(plugin);

                    return (
                      <tr
                        key={plugin.id}
                        style={{
                          borderBottom: "1px solid var(--color-border)",
                        }}
                        onClick={() =>
                          router.push(`/dashboard/plugins/${plugin.id}`)
                        }
                      >
                        {/* Plugin */}
                        <td style={tableCellStyle}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.75rem",
                              minWidth: "280px",
                            }}
                          >
                            <div
                              style={{
                                width: "42px",
                                height: "42px",
                                flexShrink: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "0.625rem",
                                overflow: "hidden",
                                background: "var(--color-surface-raised)",
                                border: "1px solid var(--color-border)",
                              }}
                            >
                              {plugin.icon_url ? (
                                <img
                                  src={plugin.icon_url}
                                  alt=""
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <span
                                  style={{
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    color: "#5DB83A",
                                  }}
                                >
                                  {getInitials(plugin.name)}
                                </span>
                              )}
                            </div>

                            <div
                              style={{
                                minWidth: 0,
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "0.8125rem",
                                  fontWeight: 600,
                                  color: "var(--color-foreground)",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {plugin.name}
                              </div>

                              <div
                                style={{
                                  marginTop: "0.125rem",
                                  fontSize: "0.6875rem",
                                  color: "var(--color-foreground-muted)",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {plugin.code}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Statut */}
                        <td style={tableCellStyle}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.375rem",
                              padding: "0.3rem 0.55rem",
                              borderRadius: "999px",
                              background: getStatusBackground(plugin.status),
                              color: getStatusColor(plugin.status),
                              fontSize: "0.6875rem",
                              fontWeight: 600,
                            }}
                          >
                            <StatusIcon size={12} />

                            {STATUS_LABELS[plugin.status]}
                          </span>
                        </td>

                        {/* Version */}
                        <td style={tableCellStyle}>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.2rem",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                color: "var(--color-foreground)",
                              }}
                            >
                              v{latestVersion}
                            </span>

                            {plugin.status === "DRAFT" ? (
                              <span
                                style={{
                                  fontSize: "0.625rem",
                                  color: "#A78BFA",
                                  fontWeight: 600,
                                }}
                              >
                                Version en préparation
                              </span>
                            ) : plugin.status === "PUBLISHED" ? (
                              <span
                                style={{
                                  fontSize: "0.625rem",
                                  color: "#5DB83A",
                                  fontWeight: 600,
                                }}
                              >
                                Version publiée
                              </span>
                            ) : null}
                          </div>
                        </td>

                        {/* Date */}
                        <td style={tableCellStyle}>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--color-foreground-muted)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formatDate(plugin.created_at)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td
                          style={{
                            ...tableCellStyle,
                            textAlign: "right",
                          }}
                        >
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleMenuToggle(event, plugin);
                            }}
                            aria-label={`Actions pour ${plugin.name}`}
                            aria-expanded={openMenuPluginId === plugin.id}
                            style={{
                              width: "34px",
                              height: "34px",
                              borderRadius: "0.5rem",
                              border: "1px solid transparent",
                              background:
                                openMenuPluginId === plugin.id
                                  ? "var(--color-surface-raised)"
                                  : "transparent",
                              color: "var(--color-foreground-muted)",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                            }}
                          >
                            <MoreVertical size={17} />
                          </button>

                          {openMenuPluginId === plugin.id && menuPosition ? (
                            <>
                              <div
                                aria-hidden="true"
                                onMouseDown={(event) => {
                                  event.stopPropagation();
                                  closeMenu();
                                }}
                                style={{
                                  position: "fixed",
                                  inset: 0,
                                  zIndex: 1190,
                                  background: "transparent",
                                }}
                              />

                              <div
                                onClick={(event) => {
                                  event.stopPropagation();
                                }}
                                onMouseDown={(event) => {
                                  event.stopPropagation();
                                }}
                              >
                                <PluginContextMenu
                                  plugin={plugin}
                                  position={menuPosition}
                                  onEdit={handleEdit}
                                  onDelete={handleDelete}
                                  onLifecycle={openLifecycleDialog}
                                  onVersionHistory={(selectedPlugin) => {
                                    closeMenu();
                                    setVersionHistoryPlugin(selectedPlugin);
                                  }}
                                />
                              </div>
                            </>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================================
          CRÉATION
      ===================================================================== */}

      {isCreateDialogOpen ? (
        <PluginDialog
          open={true}
          plugin={null}
          onClose={() => {
            setIsCreateDialogOpen(false);
          }}
        />
      ) : null}

      {/* =====================================================================
          MODIFICATION
      ===================================================================== */}

      {editingPlugin ? (
        <PluginDialog
          open={true}
          plugin={editingPlugin}
          onClose={() => {
            setEditingPlugin(null);
          }}
        />
      ) : null}

      {/* =====================================================================
          SUPPRESSION
      ===================================================================== */}

      {deletingPlugin ? (
        <DeletePluginDialog
          open={true}
          plugin={deletingPlugin}
          onClose={() => {
            setDeletingPlugin(null);
          }}
        />
      ) : null}

      {/* =====================================================================
          LIFECYCLE
      ===================================================================== */}

      {lifecyclePlugin && lifecycleAction ? (
        <PluginLifecycleDialog
          open={true}
          plugin={lifecyclePlugin}
          action={lifecycleAction}
          onClose={closeLifecycleDialog}
        />
      ) : null}

      {versionHistoryPlugin ? (
        <PluginVersionHistoryDialog
          open={true}
          plugin={versionHistoryPlugin}
          onClose={() => {
            setVersionHistoryPlugin(null);
          }}
        />
      ) : null}
    </>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function getDisplayVersion(plugin: Plugin): string {
  const publishedVersion = plugin.versions.find(
    (version) => version.status === "PUBLISHED",
  );

  if (publishedVersion) {
    return publishedVersion.version;
  }

  const draftVersion = plugin.versions.find(
    (version) => version.status === "DRAFT",
  );

  if (draftVersion) {
    return draftVersion.version;
  }

  const latestVersion = [...plugin.versions].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )[0];

  return latestVersion?.version ?? "—";
}

// ============================================================================
// TABLE STYLES
// ============================================================================

const tableHeaderStyle: React.CSSProperties = {
  padding: "0.75rem 1.25rem",
  borderBottom: "1px solid var(--color-border)",
  textAlign: "left",
  fontSize: "0.6875rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  color: "var(--color-foreground-muted)",
  whiteSpace: "nowrap",
};

const tableCellStyle: React.CSSProperties = {
  padding: "0.875rem 1.25rem",
};

// ============================================================================
// STAT CARD
// ============================================================================

function PluginStatCard({
  label,
  value,
  description,
  icon: Icon,
  iconBackground,
  iconColor,
}: {
  label: string;
  value: number;
  description: string;
  icon: typeof Package;
  iconBackground: string;
  iconColor: string;
}) {
  return (
    <div
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: "1rem",
        background: "var(--color-surface)",
        padding: "1.25rem",
        transition: "background 0.15s ease, border-color 0.15s ease",
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.background = "var(--color-surface-raised)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.background = "var(--color-surface)";
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "0.75rem",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: "0.75rem",
              fontWeight: 500,
              color: "var(--color-foreground-muted)",
            }}
          >
            {label}
          </p>

          <p
            style={{
              margin: "0.5rem 0 0",
              fontSize: "1.5rem",
              lineHeight: 1.2,
              fontWeight: 700,
              color: "var(--color-foreground)",
            }}
          >
            {value}
          </p>

          <p
            style={{
              margin: "0.25rem 0 0",
              fontSize: "0.6875rem",
              color: "var(--color-foreground-muted)",
            }}
          >
            {description}
          </p>
        </div>

        <div
          style={{
            width: "40px",
            height: "40px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "0.625rem",
            background: iconBackground,
            color: iconColor,
          }}
        >
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CONTEXT MENU
// ============================================================================

function PluginContextMenu({
  plugin,
  position,
  onEdit,
  onDelete,
  onLifecycle,
  onVersionHistory,
}: {
  plugin: Plugin;
  position: {
    top: number;
    right: number;
  };
  onEdit: (plugin: Plugin) => void;
  onDelete: (plugin: Plugin) => void;
  onLifecycle: (plugin: Plugin, action: LifecycleAction) => void;
  onVersionHistory: (plugin: Plugin) => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        top: position.top,
        right: position.right,
        zIndex: 1200,
        width: "220px",
        padding: "0.375rem",
        border: "1px solid var(--color-border)",
        borderRadius: "0.75rem",
        background: "var(--color-surface)",
        boxShadow: "0 12px 32px rgba(0, 0, 0, 0.14)",
      }}
    >
      {/* ================================================================
          DRAFT
      ================================================================ */}

      {plugin.status === "DRAFT" ? (
        <>
          <PluginMenuButton
            icon={Edit3}
            label="Modifier"
            description="Modifier la configuration"
            onClick={() => {
              onEdit(plugin);
            }}
          />

          <PluginMenuButton
            icon={Send}
            label="Publier"
            description="Rendre disponible"
            onClick={() => {
              onLifecycle(plugin, "publish");
            }}
          />

          <PluginMenuDivider />

          <PluginMenuButton
            icon={Archive}
            label="Archiver"
            description="Retirer du catalogue actif"
            onClick={() => {
              onLifecycle(plugin, "archive");
            }}
          />

          <PluginMenuDivider />

          <PluginMenuButton
            icon={Trash2}
            label="Supprimer"
            description="Supprimer définitivement"
            destructive
            onClick={() => {
              onDelete(plugin);
            }}
          />
        </>
      ) : null}

      {/* ================================================================
          PUBLISHED
      ================================================================ */}

      {plugin.status === "PUBLISHED" ? (
        <PluginMenuButton
          icon={XCircle}
          label="Dépublier"
          description="Retirer de la marketplace"
          onClick={() => {
            onLifecycle(plugin, "unpublish");
          }}
        />
      ) : null}

      {/* ================================================================
          UNPUBLISHED
      ================================================================ */}

      {plugin.status === "UNPUBLISHED" ? (
        <>
          <PluginMenuButton
            icon={History}
            label="Versions"
            description="Voir l'historique des versions"
            onClick={() => {
              onVersionHistory(plugin);
            }}
          />

          <PluginMenuDivider />

          <PluginMenuButton
            icon={RotateCcw}
            label="Remettre en brouillon"
            description="Réactiver la configuration"
            onClick={() => {
              onLifecycle(plugin, "draft");
            }}
          />

          <PluginMenuButton
            icon={Archive}
            label="Archiver"
            description="Archiver le plugin"
            onClick={() => {
              onLifecycle(plugin, "archive");
            }}
          />

          <PluginMenuDivider />

          <PluginMenuButton
            icon={Trash2}
            label="Supprimer"
            description="Supprimer définitivement"
            destructive
            onClick={() => {
              onDelete(plugin);
            }}
          />
        </>
      ) : null}

      {/* ================================================================
          ARCHIVED
      ================================================================ */}

      {plugin.status === "ARCHIVED" ? (
        <PluginMenuButton
          icon={RotateCcw}
          label="Remettre en brouillon"
          description="Réactiver la configuration"
          onClick={() => {
            onLifecycle(plugin, "draft");
          }}
        />
      ) : null}
    </div>
  );
}

// ============================================================================
// MENU DIVIDER
// ============================================================================

function PluginMenuDivider() {
  return (
    <div
      style={{
        height: "1px",
        margin: "0.375rem 0",
        background: "var(--color-border)",
      }}
    />
  );
}

// ============================================================================
// MENU BUTTON
// ============================================================================

function PluginMenuButton({
  icon: Icon,
  label,
  description,
  destructive = false,
  onClick,
}: {
  icon: typeof Edit3;
  label: string;
  description: string;
  destructive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        minHeight: "52px",
        padding: "0.5rem 0.625rem",
        border: 0,
        borderRadius: "0.5rem",
        background: "transparent",
        color: destructive ? "#F43F5E" : "var(--color-foreground)",
        display: "flex",
        alignItems: "center",
        gap: "0.625rem",
        textAlign: "left",
        cursor: "pointer",
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.background = destructive
          ? "rgba(244, 63, 94, 0.08)"
          : "var(--color-surface-raised)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.background = "transparent";
      }}
    >
      <span
        style={{
          width: "32px",
          height: "32px",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "0.5rem",
          background: destructive
            ? "rgba(244, 63, 94, 0.08)"
            : "var(--color-surface-raised)",
          color: destructive ? "#F43F5E" : "var(--color-foreground-muted)",
        }}
      >
        <Icon size={15} />
      </span>

      <span
        style={{
          minWidth: 0,
        }}
      >
        <span
          style={{
            display: "block",
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: destructive ? "#F43F5E" : "var(--color-foreground)",
          }}
        >
          {label}
        </span>

        <span
          style={{
            display: "block",
            marginTop: "0.125rem",
            fontSize: "0.6875rem",
            color: destructive
              ? "rgba(244, 63, 94, 0.7)"
              : "var(--color-foreground-muted)",
          }}
        >
          {description}
        </span>
      </span>
    </button>
  );
}
