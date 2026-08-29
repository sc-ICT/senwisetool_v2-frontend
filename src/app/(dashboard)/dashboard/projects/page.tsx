"use client";

import { ProjectCreateDialog } from "@/components/form-builder/project-create-dialog";
import { Header } from "@/components/layout/header";
import { ApiError } from "@/lib/api";
import { projectService } from "@/services/project.service";
import type { Project } from "@/types/project";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Archive,
  FolderKanban,
  Loader2,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function ProjectsPage() {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");

  const [includeArchived, setIncludeArchived] = useState(false);

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const router = useRouter();

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["projects", includeArchived],

    queryFn: async () => {
      const response = await projectService.list(includeArchived);

      return response.data;
    },
  });

  const projects = data?.items ?? [];

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();

    if (!query) {
      return projects;
    }

    return projects.filter(
      (project) =>
        project.name.toLocaleLowerCase().includes(query) ||
        project.code.toLocaleLowerCase().includes(query) ||
        project.project_type.toLocaleLowerCase().includes(query),
    );
  }, [projects, searchQuery]);

  const createMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      description: string | null;
      projectType: string;
    }) => {
      return projectService.create({
        name: data.name,
        description: data.description,
        project_type: data.projectType,
      });
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["projects"],
      });

      setIsCreateOpen(false);

      toast.success("Projet créé avec succès.");
    },

    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de créer le projet.";

      toast.error(message);
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (projectId: number) => {
      return projectService.archive(projectId);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["projects"],
      });

      setOpenMenuId(null);

      toast.success("Projet archivé avec succès.");
    },

    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible d'archiver le projet.";

      toast.error(message);
    },
  });

  const handleArchive = (project: Project) => {
    setOpenMenuId(null);

    const confirmed = window.confirm(
      `Voulez-vous vraiment archiver « ${project.name} » ?`,
    );

    if (!confirmed) {
      return;
    }

    archiveMutation.mutate(project.id);
  };

  return (
    <>
      <Header
        title="Projets"
        description="Préparez et gérez vos projets de collecte."
        actions={
          <>
            <button
              type="button"
              onClick={() => {
                setIsCreateOpen(true);
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
              Nouveau projet
            </button>

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
        <div
          style={{
            border: "1px solid var(--color-border)",
            borderRadius: "1rem",
            background: "var(--color-surface)",
          }}
        >
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
                placeholder="Rechercher un projet..."
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

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                flexShrink: 0,
                fontSize: "0.75rem",
                color: "var(--color-foreground-muted)",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={includeArchived}
                onChange={(event) => {
                  setIncludeArchived(event.target.checked);
                }}
              />
              Afficher les archivés
            </label>
          </div>

          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState
              error={error}
              onRetry={() => {
                void refetch();
              }}
            />
          ) : filteredProjects.length === 0 ? (
            <EmptyState
              hasSearch={Boolean(searchQuery.trim())}
              onCreate={() => {
                setIsCreateOpen(true);
              }}
            />
          ) : (
            <div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "minmax(280px, 1fr) 200px 130px 110px 48px",
                  gap: "1rem",
                  alignItems: "center",
                  padding: "0.75rem 1.25rem",
                  borderBottom: "1px solid var(--color-border)",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "var(--color-foreground-muted)",
                }}
              >
                <div>Projet</div>
                <div>Type</div>
                <div>Statut</div>
                <div>Créateur</div>
                <div />
              </div>

              {filteredProjects.map((project) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  menuOpen={openMenuId === project.id}
                  onOpen={() => {
                    router.push(`/dashboard/projects/${project.id}`);
                  }}
                  onToggleMenu={() => {
                    setOpenMenuId((current) =>
                      current === project.id ? null : project.id,
                    );
                  }}
                  onArchive={() => {
                    handleArchive(project);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {isCreateOpen && (
        <ProjectCreateDialog
          isPending={createMutation.isPending}
          onClose={() => {
            if (!createMutation.isPending) {
              setIsCreateOpen(false);
            }
          }}
          onSubmit={(data) => {
            createMutation.mutate(data);
          }}
        />
      )}
    </>
  );
}

function ProjectRow({
  project,
  menuOpen,
  onToggleMenu,
  onArchive,
  onOpen,
}: {
  project: Project;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onArchive: () => void;
  onOpen: () => void;
}) {
  return (
    <div
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "minmax(280px, 1fr) 200px 130px 110px 48px",
        gap: "1rem",
        alignItems: "center",
        padding: "0.875rem 1.25rem",
        borderBottom: "1px solid var(--color-border)",
        transition: "background 0.15s ease",
        cursor: "pointer",
      }}
      onClick={onOpen}
      onMouseEnter={(event) => {
        event.currentTarget.style.background = "var(--color-surface-raised)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.background = "transparent";
      }}
    >
      <div
        style={{
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <div
          style={{
            width: "38px",
            height: "38px",
            flexShrink: 0,
            borderRadius: "0.625rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(93, 184, 58, 0.08)",
            border: "1px solid rgba(93, 184, 58, 0.16)",
          }}
        >
          <FolderKanban size={17} color="#5DB83A" />
        </div>

        <div
          style={{
            minWidth: 0,
          }}
        >
          <div
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--color-foreground)",
            }}
          >
            {project.name}
          </div>

          <div
            style={{
              marginTop: "0.125rem",
              fontSize: "0.6875rem",
              color: "var(--color-foreground-muted)",
            }}
          >
            {project.code}
          </div>
        </div>
      </div>

      <div
        style={{
          fontSize: "0.75rem",
          color: "var(--color-foreground-muted)",
        }}
      >
        {project.project_type}
      </div>

      <div>
        <StatusBadge status={project.status} />
      </div>

      <div
        style={{
          fontSize: "0.75rem",
          color: "var(--color-foreground-muted)",
        }}
      >
        {project.created_by}
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
          aria-label={`Actions pour ${project.name}`}
        >
          <MoreVertical size={17} />
        </button>

        {menuOpen && <ProjectContextMenu onArchive={onArchive} />}
      </div>
    </div>
  );
}

function ProjectContextMenu({ onArchive }: { onArchive: () => void }) {
  return (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 0.375rem)",
        right: 0,
        zIndex: 100,
        minWidth: "190px",
        padding: "0.375rem",
        border: "1px solid var(--color-border)",
        borderRadius: "0.75rem",
        background: "var(--color-surface)",
        boxShadow: "0 12px 32px rgba(0, 0, 0, 0.14)",
      }}
    >
      <MenuButton icon={Archive} label="Archiver" onClick={onArchive} />
    </div>
  );
}

function MenuButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Archive;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        height: "36px",
        border: "0",
        borderRadius: "0.5rem",
        background: "transparent",
        color: "var(--color-foreground)",
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
}

function StatusBadge({ status }: { status: Project["status"] }) {
  const label =
    status === "DRAFT"
      ? "Brouillon"
      : status === "PUBLISHED"
        ? "Publié"
        : "Archivé";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: "24px",
        padding: "0 0.5rem",
        borderRadius: "999px",
        background:
          status === "DRAFT"
            ? "rgba(148, 163, 184, 0.1)"
            : status === "PUBLISHED"
              ? "rgba(93, 184, 58, 0.1)"
              : "rgba(148, 163, 184, 0.1)",
        color:
          status === "PUBLISHED" ? "#5DB83A" : "var(--color-foreground-muted)",
        fontSize: "0.6875rem",
        fontWeight: 600,
      }}
    >
      {label}
    </span>
  );
}

function LoadingState() {
  return (
    <div
      style={{
        minHeight: "320px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--color-foreground-muted)",
      }}
    >
      <Loader2 size={22} className="animate-spin" />
    </div>
  );
}

function ErrorState({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}) {
  return (
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
      <div
        style={{
          fontSize: "0.9375rem",
          fontWeight: 600,
        }}
      >
        Impossible de charger les projets
      </div>

      <div
        style={{
          fontSize: "0.8125rem",
          color: "var(--color-foreground-muted)",
        }}
      >
        {error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Une erreur est survenue."}
      </div>

      <button
        type="button"
        onClick={onRetry}
        style={{
          height: "36px",
          padding: "0 0.875rem",
          borderRadius: "0.625rem",
          border: "1px solid var(--color-border)",
          background: "var(--color-surface-raised)",
          color: "var(--color-foreground)",
          fontSize: "0.8125rem",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Réessayer
      </button>
    </div>
  );
}

function EmptyState({
  hasSearch,
  onCreate,
}: {
  hasSearch: boolean;
  onCreate: () => void;
}) {
  return (
    <div
      style={{
        minHeight: "320px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.625rem",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "0.875rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-surface-raised)",
          border: "1px solid var(--color-border)",
        }}
      >
        <FolderKanban size={22} color="#5DB83A" />
      </div>

      <div
        style={{
          fontSize: "0.9375rem",
          fontWeight: 600,
        }}
      >
        {hasSearch ? "Aucun résultat" : "Aucun projet"}
      </div>

      <div
        style={{
          fontSize: "0.8125rem",
          color: "var(--color-foreground-muted)",
          maxWidth: "460px",
        }}
      >
        {hasSearch
          ? "Aucun projet ne correspond à votre recherche."
          : "Créez votre premier projet pour commencer à construire votre collecte."}
      </div>

      {!hasSearch && (
        <button
          type="button"
          onClick={onCreate}
          style={{
            marginTop: "0.25rem",
            height: "36px",
            padding: "0 0.875rem",
            borderRadius: "0.625rem",
            border: "1px solid rgba(93, 184, 58, 0.25)",
            background: "rgba(93, 184, 58, 0.1)",
            color: "#5DB83A",
            fontSize: "0.75rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Créer un projet
        </button>
      )}
    </div>
  );
}
