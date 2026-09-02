"use client";

import { CreateAgentDialog } from "@/components/agents/create-agent-dialog";
import { DeleteAgentDialog } from "@/components/agents/delete-agent-dialog";
import { EditAgentDialog } from "@/components/agents/edit-agent-dialog";
import { Header } from "@/components/layout/header";
import { ApiError } from "@/lib/api";
import { agentService } from "@/services/agent.service";
import type { Agent, AgentRole, AgentStatus } from "@/types/agent";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  Edit3,
  Loader2,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
  Users,
  UserX,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const ROLE_LABELS: Record<AgentRole, string> = {
  COLLECTOR: "Collecteur",
  INSPECTOR: "Inspecteur",
};

const STATUS_LABELS: Record<AgentStatus, string> = {
  ACTIVE: "Actif",
  SUSPENDED: "Suspendu",
  DEACTIVATED: "Désactivé",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getStatusColor(status: AgentStatus): string {
  switch (status) {
    case "ACTIVE":
      return "#5DB83A";

    case "SUSPENDED":
      return "#F59E0B";

    case "DEACTIVATED":
      return "#F43F5E";

    default:
      return "var(--color-foreground-muted)";
  }
}

export default function AgentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<AgentRole | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<AgentStatus | "ALL">("ALL");

  const queryClient = useQueryClient();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  const [deletingAgent, setDeletingAgent] = useState<Agent | null>(null);

  const [openMenuAgentId, setOpenMenuAgentId] = useState<number | null>(null);

  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    right: number;
  } | null>(null);

  const [selectedAgentIds, setSelectedAgentIds] = useState<number[]>([]);

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["agents"],

    queryFn: async () => {
      const response = await agentService.list();

      return response.data;
    },
  });

  const agents = data?.items ?? [];

  const filteredAgents = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();

    return agents.filter((agent) => {
      const matchesSearch =
        !query || agent.full_name.toLocaleLowerCase().includes(query);

      const matchesRole = roleFilter === "ALL" || agent.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" || agent.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [agents, searchQuery, roleFilter, statusFilter]);

  const allFilteredAgentsSelected =
    filteredAgents.length > 0 &&
    filteredAgents.every((agent) => selectedAgentIds.includes(agent.id));

  const someFilteredAgentsSelected = filteredAgents.some((agent) =>
    selectedAgentIds.includes(agent.id),
  );

  const toggleAgentSelection = (agentId: number) => {
    setSelectedAgentIds((currentIds) => {
      if (currentIds.includes(agentId)) {
        return currentIds.filter((id) => id !== agentId);
      }

      return [...currentIds, agentId];
    });
  };

  const toggleSelectAll = () => {
    if (allFilteredAgentsSelected) {
      setSelectedAgentIds((currentIds) =>
        currentIds.filter(
          (id) => !filteredAgents.some((agent) => agent.id === id),
        ),
      );

      return;
    }

    setSelectedAgentIds((currentIds) => {
      const ids = new Set(currentIds);

      filteredAgents.forEach((agent) => {
        ids.add(agent.id);
      });

      return Array.from(ids);
    });
  };

  const statusMutation = useMutation({
    mutationFn: ({
      agentId,
      status,
    }: {
      agentId: number;
      status: AgentStatus;
    }) =>
      agentService.update(agentId, {
        status,
      }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["agents"],
      });

      setOpenMenuAgentId(null);

      toast.success("Statut de l'agent mis à jour.");
    },

    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
        return;
      }

      toast.error("Impossible de modifier le statut de l'agent.");
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: () =>
      agentService.deleteMany({
        agent_ids: selectedAgentIds,
      }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["agents"],
      });

      const deletedCount = selectedAgentIds.length;

      setSelectedAgentIds([]);
      setOpenMenuAgentId(null);

      toast.success(
        `${deletedCount} agent${
          deletedCount > 1 ? "s" : ""
        } supprimé${deletedCount > 1 ? "s" : ""} avec succès.`,
      );
    },

    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
        return;
      }

      toast.error("Une erreur est survenue lors de la suppression des agents.");
    },
  });

  const handleStatusChange = (agent: Agent, status: AgentStatus) => {
    if (statusMutation.isPending) {
      return;
    }

    if (agent.status === status) {
      return;
    }

    statusMutation.mutate({
      agentId: agent.id,
      status,
    });
  };

  const handleBulkDelete = () => {
    if (bulkDeleteMutation.isPending || selectedAgentIds.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer ${selectedAgentIds.length} agent${
        selectedAgentIds.length > 1 ? "s" : ""
      } ? Cette action est irréversible.`,
    );

    if (!confirmed) {
      return;
    }

    bulkDeleteMutation.mutate();
  };

  const getStatusActionLabel = (status: AgentStatus): string => {
    switch (status) {
      case "ACTIVE":
        return "Suspendre";

      case "SUSPENDED":
        return "Réactiver";

      case "DEACTIVATED":
        return "Réactiver";

      default:
        return "Modifier le statut";
    }
  };

  const getNextStatus = (status: AgentStatus): AgentStatus => {
    switch (status) {
      case "ACTIVE":
        return "SUSPENDED";

      case "SUSPENDED":
        return "ACTIVE";

      case "DEACTIVATED":
        return "ACTIVE";

      default:
        return "ACTIVE";
    }
  };

  return (
    <>
      <Header
        title="Agents"
        description="Gérez les agents qui interviennent sur le terrain."
        actions={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
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
                border: "none",
                background: "var(--color-primary)",
                color: "white",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Plus size={16} />
              Ajouter un agent
            </button>
          </div>
        }
      />

      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "1.5rem",
        }}
      >
        {/* -------------------------------------------------------------- */}
        {/* Statistiques                                                   */}
        {/* -------------------------------------------------------------- */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "0.875rem",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              border: "1px solid var(--color-border)",
              borderRadius: "1rem",
              background: "var(--color-surface)",
              padding: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "0.625rem",
                  background: "rgba(167, 139, 250, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Users size={17} color="#A78BFA" />
              </div>

              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.7rem",
                    color: "var(--color-foreground-muted)",
                  }}
                >
                  Total
                </p>

                <p
                  style={{
                    margin: "0.125rem 0 0",
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    color: "var(--color-foreground)",
                  }}
                >
                  {data?.count ?? 0}
                </p>
              </div>
            </div>
          </div>

          <div
            style={{
              border: "1px solid var(--color-border)",
              borderRadius: "1rem",
              background: "var(--color-surface)",
              padding: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "0.625rem",
                  background: "rgba(93, 184, 58, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <UserRound size={17} color="#5DB83A" />
              </div>

              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.7rem",
                    color: "var(--color-foreground-muted)",
                  }}
                >
                  Actifs
                </p>

                <p
                  style={{
                    margin: "0.125rem 0 0",
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    color: "var(--color-foreground)",
                  }}
                >
                  {agents.filter((agent) => agent.status === "ACTIVE").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------- */}
        {/* Conteneur principal                                            */}
        {/* -------------------------------------------------------------- */}

        <div
          style={{
            border: "1px solid var(--color-border)",
            borderRadius: "1rem",
            background: "var(--color-surface)",
            overflow: "hidden",
          }}
        >
          {/* ------------------------------------------------------------ */}
          {/* Filtres                                                       */}
          {/* ------------------------------------------------------------ */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "1rem 1.25rem",
              borderBottom: "1px solid var(--color-border)",
              flexWrap: "wrap",
            }}
          >
            {/* Recherche */}

            <div
              style={{
                position: "relative",
                flex: 1,
                minWidth: "220px",
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
                placeholder="Rechercher un agent..."
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

            {/* Filtre rôle */}

            <select
              value={roleFilter}
              onChange={(event) => {
                setRoleFilter(event.target.value as AgentRole | "ALL");
              }}
              style={{
                height: "40px",
                minWidth: "150px",
                padding: "0 0.75rem",
                borderRadius: "0.625rem",
                border: "1px solid var(--color-border)",
                background: "var(--color-surface-raised)",
                color: "var(--color-foreground)",
                outline: "none",
                fontSize: "0.8125rem",
              }}
            >
              <option value="ALL">Tous les rôles</option>

              <option value="COLLECTOR">Collecteurs</option>

              <option value="INSPECTOR">Inspecteurs</option>
            </select>

            {selectedAgentIds.length > 0 && (
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={bulkDeleteMutation.isPending}
                style={{
                  height: "40px",
                  padding: "0 0.875rem",
                  borderRadius: "0.625rem",
                  border: "1px solid rgba(244, 63, 94, 0.25)",
                  background: "rgba(244, 63, 94, 0.08)",
                  color: "#F43F5E",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  cursor: bulkDeleteMutation.isPending
                    ? "not-allowed"
                    : "pointer",
                  opacity: bulkDeleteMutation.isPending ? 0.6 : 1,
                }}
              >
                {bulkDeleteMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}

                {bulkDeleteMutation.isPending
                  ? "Suppression..."
                  : `Supprimer la sélection (${selectedAgentIds.length})`}
              </button>
            )}

            {/* Filtre statut */}

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as AgentStatus | "ALL");
              }}
              style={{
                height: "40px",
                minWidth: "150px",
                padding: "0 0.75rem",
                borderRadius: "0.625rem",
                border: "1px solid var(--color-border)",
                background: "var(--color-surface-raised)",
                color: "var(--color-foreground)",
                outline: "none",
                fontSize: "0.8125rem",
              }}
            >
              <option value="ALL">Tous les statuts</option>

              <option value="ACTIVE">Actifs</option>

              <option value="SUSPENDED">Suspendus</option>

              <option value="DEACTIVATED">Désactivés</option>
            </select>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* Chargement                                                     */}
          {/* ------------------------------------------------------------ */}

          {isLoading ? (
            <div
              style={{
                minHeight: "320px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Loader2 size={24} className="animate-spin" />
            </div>
          ) : error ? (
            /* ---------------------------------------------------------- */
            /* Erreur                                                     */
            /* ---------------------------------------------------------- */

            <div
              style={{
                minHeight: "320px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
                padding: "2rem",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "0.875rem",
                  color: "var(--color-foreground-muted)",
                }}
              >
                {error instanceof ApiError
                  ? error.message
                  : "Impossible de récupérer les agents."}
              </p>

              <button
                type="button"
                onClick={() => {
                  void refetch();
                }}
                style={{
                  height: "34px",
                  padding: "0 0.75rem",
                  borderRadius: "0.625rem",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface-raised)",
                  color: "var(--color-foreground)",
                  cursor: "pointer",
                  fontSize: "0.8125rem",
                }}
              >
                Réessayer
              </button>
            </div>
          ) : filteredAgents.length === 0 ? (
            /* ---------------------------------------------------------- */
            /* Aucun résultat                                              */
            /* ---------------------------------------------------------- */

            <div
              style={{
                minHeight: "320px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
                padding: "2rem",
                textAlign: "center",
              }}
            >
              <Users
                size={32}
                style={{
                  color: "var(--color-foreground-muted)",
                }}
              />

              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "var(--color-foreground)",
                  }}
                >
                  {searchQuery.trim() ||
                  roleFilter !== "ALL" ||
                  statusFilter !== "ALL"
                    ? "Aucun agent trouvé"
                    : "Aucun agent enregistré"}
                </p>

                <p
                  style={{
                    margin: "0.375rem 0 0",
                    fontSize: "0.75rem",
                    color: "var(--color-foreground-muted)",
                  }}
                >
                  {searchQuery.trim() ||
                  roleFilter !== "ALL" ||
                  statusFilter !== "ALL"
                    ? "Essayez de modifier vos critères de recherche."
                    : "Les agents que vous créerez apparaîtront ici."}
                </p>
              </div>
            </div>
          ) : (
            /* ---------------------------------------------------------- */
            /* Tableau                                                     */
            /* ---------------------------------------------------------- */

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
                    <th
                      style={{
                        width: "48px",
                        padding: "0.75rem 0.75rem 0.75rem 1.25rem",
                        borderBottom: "1px solid var(--color-border)",
                        textAlign: "center",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={allFilteredAgentsSelected}
                        ref={(element) => {
                          if (element) {
                            element.indeterminate =
                              !allFilteredAgentsSelected &&
                              someFilteredAgentsSelected;
                          }
                        }}
                        onChange={toggleSelectAll}
                        aria-label="Sélectionner tous les agents affichés"
                        style={{
                          width: "16px",
                          height: "16px",
                          cursor: "pointer",
                        }}
                      />
                    </th>

                    <th
                      style={{
                        padding: "0.75rem 1.25rem",
                        textAlign: "left",
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                        color: "var(--color-foreground-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        borderBottom: "1px solid var(--color-border)",
                      }}
                    >
                      Agent
                    </th>
                    <th
                      style={{
                        padding: "0.75rem 1.25rem",
                        textAlign: "left",
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                        color: "var(--color-foreground-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        borderBottom: "1px solid var(--color-border)",
                      }}
                    >
                      Agent
                    </th>

                    <th
                      style={{
                        padding: "0.75rem 1.25rem",
                        textAlign: "left",
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                        color: "var(--color-foreground-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        borderBottom: "1px solid var(--color-border)",
                      }}
                    >
                      Rôle
                    </th>

                    <th
                      style={{
                        padding: "0.75rem 1.25rem",
                        textAlign: "left",
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                        color: "var(--color-foreground-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        borderBottom: "1px solid var(--color-border)",
                      }}
                    >
                      Statut
                    </th>

                    <th
                      style={{
                        padding: "0.75rem 1.25rem",
                        textAlign: "left",
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                        color: "var(--color-foreground-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        borderBottom: "1px solid var(--color-border)",
                      }}
                    >
                      Créé le
                    </th>
                    <th style={{ width: "56px" }} />
                  </tr>
                </thead>

                <tbody>
                  {filteredAgents.map((agent: Agent) => (
                    <tr
                      key={agent.id}
                      style={{
                        borderBottom: "1px solid var(--color-border)",
                        background: selectedAgentIds.includes(agent.id)
                          ? "rgba(93, 184, 58, 0.04)"
                          : "transparent",
                      }}
                    >
                      {/* Sélection */}

                      <td
                        style={{
                          width: "48px",
                          padding: "0.875rem 0.75rem 0.875rem 1.25rem",
                          textAlign: "center",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedAgentIds.includes(agent.id)}
                          onChange={() => {
                            toggleAgentSelection(agent.id);
                          }}
                          aria-label={`Sélectionner ${agent.full_name}`}
                          style={{
                            width: "16px",
                            height: "16px",
                            cursor: "pointer",
                          }}
                        />
                      </td>

                      {/* Agent */}

                      <td
                        style={{
                          padding: "0.875rem 1.25rem",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                          }}
                        >
                          <div
                            style={{
                              width: "34px",
                              height: "34px",
                              borderRadius: "50%",
                              background: "rgba(93, 184, 58, 0.10)",
                              border: "1px solid rgba(93, 184, 58, 0.20)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              fontSize: "0.6875rem",
                              fontWeight: 700,
                              color: "#5DB83A",
                            }}
                          >
                            {getInitials(agent.full_name)}
                          </div>

                          <div
                            style={{
                              minWidth: 0,
                            }}
                          >
                            <p
                              style={{
                                margin: 0,
                                fontSize: "0.8125rem",
                                fontWeight: 600,
                                color: "var(--color-foreground)",
                              }}
                            >
                              {agent.full_name}
                            </p>

                            <p
                              style={{
                                margin: "0.125rem 0 0",
                                fontSize: "0.6875rem",
                                color: "var(--color-foreground-muted)",
                              }}
                            >
                              Agent #{agent.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Rôle */}

                      <td
                        style={{
                          padding: "0.875rem 1.25rem",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "0.3rem 0.55rem",
                            borderRadius: "0.5rem",
                            background: "var(--color-surface-raised)",
                            border: "1px solid var(--color-border)",
                            fontSize: "0.6875rem",
                            fontWeight: 600,
                            color: "var(--color-foreground)",
                          }}
                        >
                          {ROLE_LABELS[agent.role]}
                        </span>
                      </td>

                      {/* Statut */}

                      <td
                        style={{
                          padding: "0.875rem 1.25rem",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            color: getStatusColor(agent.status),
                          }}
                        >
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background: getStatusColor(agent.status),
                              flexShrink: 0,
                            }}
                          />

                          {STATUS_LABELS[agent.status]}
                        </span>
                      </td>

                      {/* Date */}

                      <td
                        style={{
                          padding: "0.875rem 1.25rem",
                          fontSize: "0.75rem",
                          color: "var(--color-foreground-muted)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatDate(agent.created_at)}
                      </td>

                      <td
                        style={{
                          position: "relative",
                          textAlign: "right",
                        }}
                      >
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();

                            if (openMenuAgentId === agent.id) {
                              setOpenMenuAgentId(null);
                              setMenuPosition(null);
                              return;
                            }

                            const rect =
                              event.currentTarget.getBoundingClientRect();

                            setMenuPosition({
                              top: rect.bottom + 6,
                              right: window.innerWidth - rect.right,
                            });

                            setOpenMenuAgentId(agent.id);
                          }}
                          disabled={statusMutation.isPending}
                          aria-label={`Actions pour ${agent.full_name}`}
                          style={{
                            width: "34px",
                            height: "34px",
                            borderRadius: "0.5rem",
                            border: "1px solid var(--color-border)",
                            background: "var(--color-surface-raised)",
                            color: "var(--color-foreground-muted)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            marginLeft: "auto",
                          }}
                        >
                          <MoreVertical size={17} />
                        </button>

                        {openMenuAgentId === agent.id && menuPosition && (
                          <div
                            onClick={(event) => {
                              event.stopPropagation();
                            }}
                            style={{
                              position: "fixed",
                              top: menuPosition.top,
                              right: menuPosition.right,
                              zIndex: 10001,
                              width: "190px",
                              padding: "0.35rem",
                              borderRadius: "0.75rem",
                              border: "1px solid var(--color-border)",
                              background: "var(--color-surface)",
                              boxShadow: "0 12px 30px rgba(0, 0, 0, 0.12)",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAgent(agent);
                                setOpenMenuAgentId(null);
                                setMenuPosition(null);
                              }}
                              style={{
                                width: "100%",
                                height: "36px",
                                border: "none",
                                borderRadius: "0.5rem",
                                background: "transparent",
                                color: "var(--color-foreground)",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.6rem",
                                padding: "0 0.65rem",
                                cursor: "pointer",
                                fontSize: "0.82rem",
                                textAlign: "left",
                              }}
                            >
                              <Edit3 size={15} />
                              Modifier
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuAgentId(null);
                                setMenuPosition(null);

                                handleStatusChange(
                                  agent,
                                  getNextStatus(agent.status),
                                );
                              }}
                              disabled={statusMutation.isPending}
                              style={{
                                width: "100%",
                                height: "36px",
                                border: "none",
                                borderRadius: "0.5rem",
                                background: "transparent",
                                color: "var(--color-foreground)",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.6rem",
                                padding: "0 0.65rem",
                                cursor: statusMutation.isPending
                                  ? "not-allowed"
                                  : "pointer",
                                fontSize: "0.82rem",
                                textAlign: "left",
                                opacity: statusMutation.isPending ? 0.5 : 1,
                              }}
                            >
                              {agent.status === "ACTIVE" ? (
                                <UserX size={15} />
                              ) : (
                                <Check size={15} />
                              )}

                              {getStatusActionLabel(agent.status)}
                            </button>

                            {agent.status !== "DEACTIVATED" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuAgentId(null);
                                  setMenuPosition(null);

                                  handleStatusChange(agent, "DEACTIVATED");
                                }}
                                disabled={statusMutation.isPending}
                                style={{
                                  width: "100%",
                                  height: "36px",
                                  border: "none",
                                  borderRadius: "0.5rem",
                                  background: "transparent",
                                  color: "var(--color-foreground)",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.6rem",
                                  padding: "0 0.65rem",
                                  cursor: statusMutation.isPending
                                    ? "not-allowed"
                                    : "pointer",
                                  fontSize: "0.82rem",
                                  textAlign: "left",
                                  opacity: statusMutation.isPending ? 0.5 : 1,
                                }}
                              >
                                <UserX size={15} />
                                Désactiver
                              </button>
                            )}

                            <div
                              style={{
                                height: "1px",
                                margin: "0.35rem 0",
                                background: "var(--color-border)",
                              }}
                            />

                            <button
                              type="button"
                              onClick={() => {
                                setDeletingAgent(agent);
                                setOpenMenuAgentId(null);
                              }}
                              style={{
                                width: "100%",
                                height: "36px",
                                border: "none",
                                borderRadius: "0.5rem",
                                background: "transparent",
                                color: "#F43F5E",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.6rem",
                                padding: "0 0.65rem",
                                cursor: "pointer",
                                fontSize: "0.82rem",
                                textAlign: "left",
                              }}
                            >
                              <Trash2 size={15} />
                              Supprimer
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {openMenuAgentId !== null && (
            <div
              onClick={() => {
                setOpenMenuAgentId(null);
                setMenuPosition(null);
              }}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 10000,
                background: "transparent",
              }}
            />
          )}

          {/* ------------------------------------------------------------ */}
          {/* Résultat filtre                                               */}
          {/* ------------------------------------------------------------ */}

          {!isLoading && !error && filteredAgents.length > 0 && (
            <div
              style={{
                padding: "0.75rem 1.25rem",
                borderTop: "1px solid var(--color-border)",
                fontSize: "0.6875rem",
                color: "var(--color-foreground-muted)",
              }}
            >
              {filteredAgents.length} agent
              {filteredAgents.length > 1 ? "s" : ""} affiché
              {filteredAgents.length > 1 ? "s" : ""}
              {filteredAgents.length !== agents.length &&
                ` sur ${agents.length}`}
            </div>
          )}
        </div>
      </div>

      {isCreateDialogOpen && (
        <CreateAgentDialog
          onClose={() => {
            setIsCreateDialogOpen(false);
          }}
        />
      )}

      {editingAgent && (
        <EditAgentDialog
          agent={editingAgent}
          onClose={() => {
            setEditingAgent(null);
          }}
        />
      )}

      <DeleteAgentDialog
        agent={deletingAgent}
        open={deletingAgent !== null}
        onClose={() => {
          setDeletingAgent(null);
        }}
      />
    </>
  );
}
