"use client";

import { Header } from "@/components/layout/header";
import { ProjectCreateDialog } from "@/components/project/project-create-dialog";
import { ApiError } from "@/lib/api";
import { projectService } from "@/services/project.service";
import type { Project } from "@/types/project";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderKanban, Loader2, Plus, RefreshCw, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function ProjectsPage() {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");

  const [includeArchived, setIncludeArchived] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);

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
        description="Organisez vos formulaires et vos ressources par projet."
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
            <div
              style={{
                minHeight: "280px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Loader2 size={22} className="animate-spin" />
            </div>
          ) : error ? (
            <div
              style={{
                minHeight: "280px",
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
                Impossible de récupérer les projets.
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
                  cursor: "pointer",
                }}
              >
                Réessayer
              </button>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div
              style={{
                minHeight: "280px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
                padding: "2rem",
                textAlign: "center",
              }}
            >
              <FolderKanban
                size={30}
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
                  }}
                >
                  {searchQuery.trim() ? "Aucun projet trouvé" : "Aucun projet"}
                </p>

                <p
                  style={{
                    margin: "0.375rem 0 0",
                    fontSize: "0.75rem",
                    color: "var(--color-foreground-muted)",
                  }}
                >
                  {searchQuery.trim()
                    ? "Essayez une autre recherche."
                    : "Créez votre premier projet pour commencer."}
                </p>
              </div>

              {!searchQuery.trim() && (
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(true);
                  }}
                  style={{
                    marginTop: "0.25rem",
                    height: "34px",
                    padding: "0 0.75rem",
                    borderRadius: "0.625rem",
                    border: "1px solid rgba(93, 184, 58, 0.25)",
                    background: "rgba(93, 184, 58, 0.1)",
                    color: "#5DB83A",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <Plus size={14} />
                  Créer un projet
                </button>
              )}
            </div>
          ) : (
            <div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "minmax(280px, 1fr) 180px 130px 110px 48px",
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
                <span>Projet</span>
                <span>Type</span>
                <span>Statut</span>
                <span>Code</span>
                <span />
              </div>

              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "minmax(280px, 1fr) 180px 130px 110px 48px",
                    gap: "1rem",
                    alignItems: "center",
                    padding: "1rem 1.25rem",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  <Link
                    href={`/dashboard/projects/${project.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      minWidth: 0,
                      textDecoration: "none",
                      color: "var(--color-foreground)",
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
                        background: "rgba(93, 184, 58, 0.1)",
                        color: "#5DB83A",
                      }}
                    >
                      <FolderKanban size={18} />
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
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {project.name}
                      </div>

                      {project.description && (
                        <div
                          style={{
                            marginTop: "0.2rem",
                            fontSize: "0.7rem",
                            color: "var(--color-foreground-muted)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {project.description}
                        </div>
                      )}
                    </div>
                  </Link>

                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--color-foreground-muted)",
                    }}
                  >
                    {project.project_type}
                  </span>

                  <StatusBadge status={project.status} />

                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.7rem",
                      color: "var(--color-foreground-muted)",
                    }}
                  >
                    {project.code}
                  </span>
                </div>
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

function StatusBadge({
  status,
}: {
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}) {
  const config = {
    DRAFT: {
      label: "Brouillon",
      color: "var(--color-foreground-muted)",
      background: "var(--color-surface-raised)",
    },

    PUBLISHED: {
      label: "Publié",
      color: "#5DB83A",
      background: "rgb(93 184 58 / 0.12)",
    },

    ARCHIVED: {
      label: "Archivé",
      color: "#F59E0B",
      background: "rgb(245 158 11 / 0.12)",
    },
  } as const;

  const current = config[status];

  return (
    <span
      style={{
        display: "inline-flex",
        width: "fit-content",
        padding: "0.2rem 0.625rem",
        borderRadius: "999px",
        background: current.background,
        color: current.color,
        fontSize: "0.6875rem",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}
    >
      {current.label}
    </span>
  );
}
