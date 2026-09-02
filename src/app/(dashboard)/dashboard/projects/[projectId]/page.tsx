"use client";

import { FormCreateDialog } from "@/components/form-builder/form-create-dialog";
import { Header } from "@/components/layout/header";
import { ProjectGlobalConfigPanel } from "@/components/project/project-global-config-panel";
import { ApiError } from "@/lib/api";
import { formService } from "@/services/form.service";
import { projectService } from "@/services/project.service";
import type { Form } from "@/types/form";
import type { Project } from "@/types/project";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  FolderKanban,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Settings,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const projectId = Number(params.projectId);

  /* ------------------------------------------------------------------------ */
  /* État local                                                               */
  /* ------------------------------------------------------------------------ */

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isGlobalConfigOpen, setIsGlobalConfigOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);

  /* ------------------------------------------------------------------------ */
  /* Projet                                                                    */
  /* ------------------------------------------------------------------------ */

  const {
    data: projectData,
    isLoading: isProjectLoading,
    error: projectError,
    refetch: refetchProject,
  } = useQuery({
    queryKey: ["project", projectId],

    queryFn: async () => {
      const response = await projectService.get(projectId);

      return response.data;
    },

    enabled: Number.isFinite(projectId),
  });

  const project = projectData as Project | undefined;

  /* ------------------------------------------------------------------------ */
  /* Formulaires du projet                                                    */
  /* ------------------------------------------------------------------------ */

  const {
    data: formsData,
    isLoading: isFormsLoading,
    isFetching: isFormsFetching,
    error: formsError,
    refetch: refetchForms,
  } = useQuery({
    queryKey: ["project-forms", projectId, includeArchived],

    queryFn: async () => {
      const response = await projectService.listForms(
        projectId,
        includeArchived,
      );

      return response.data;
    },

    enabled: Number.isFinite(projectId),
  });

  const forms = useMemo(() => formsData?.items ?? [], [formsData]);

  /* ------------------------------------------------------------------------ */
  /* Recherche                                                                 */
  /* ------------------------------------------------------------------------ */

  const filteredForms = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();

    if (!query) {
      return forms;
    }

    return forms.filter(
      (form) =>
        form.name.toLocaleLowerCase().includes(query) ||
        form.code.toLocaleLowerCase().includes(query) ||
        form.form_type.toLocaleLowerCase().includes(query),
    );
  }, [forms, searchQuery]);

  /* ------------------------------------------------------------------------ */
  /* Mutation : configuration globale du projet                              */
  /* ------------------------------------------------------------------------ */

  const updateProjectConfigMutation = useMutation({
    mutationFn: async (globalConfig: Project["global_config"]) => {
      return projectService.update(projectId, {
        global_config: globalConfig,
      });
    },

    onSuccess: async (response) => {
      if (response.data) {
        queryClient.setQueryData(["project", projectId], response.data);
      }

      await queryClient.invalidateQueries({
        queryKey: ["project", projectId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["projects"],
      });

      setIsGlobalConfigOpen(false);

      toast.success(
        response.message || "Paramètres du projet enregistrés avec succès.",
      );
    },

    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible d'enregistrer les paramètres du projet.";

      toast.error(message);
    },
  });

  /* ------------------------------------------------------------------------ */
  /* Mutation : publication du projet                                        */
  /* ------------------------------------------------------------------------ */

  const publishProjectMutation = useMutation({
    mutationFn: async () => projectService.publish(projectId),

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: ["project", projectId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["projects"],
      });

      toast.success(response.message || "Projet publié avec succès.");
    },

    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de publier le projet.";

      toast.error(message);
    },
  });

  /* ------------------------------------------------------------------------ */
  /* Mutation : archivage du projet                                           */
  /* ------------------------------------------------------------------------ */

  const archiveProjectMutation = useMutation({
    mutationFn: async () => projectService.archive(projectId),

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: ["project", projectId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["projects"],
      });

      toast.success(response.message || "Projet archivé avec succès.");
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

  /* ------------------------------------------------------------------------ */
  /* Mutation : Restauration du projet                                           */
  /* ------------------------------------------------------------------------ */

  const restoreProjectToDraftMutation = useMutation({
    mutationFn: async () => projectService.restoreToDraft(projectId),

    onSuccess: async (response) => {
      if (response.data) {
        queryClient.setQueryData(["project", projectId], response.data);
      }

      await queryClient.invalidateQueries({
        queryKey: ["project", projectId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["projects"],
      });

      toast.success(
        response.message || "Projet remis en brouillon avec succès.",
      );
    },

    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de remettre le projet en brouillon.";

      toast.error(message);
    },
  });

  /* ------------------------------------------------------------------------ */
  /* Mutation : création d'un formulaire dans le projet                       */
  /* ------------------------------------------------------------------------ */

  const createFormMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      description: string | null;
      formType: string;
    }) => {
      return formService.create({
        name: data.name,
        description: data.description,
        form_type: data.formType,

        // Le formulaire est automatiquement rattaché au projet.
        project_id: projectId,
      });
    },

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: ["project-forms", projectId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["forms"],
      });

      setIsCreateOpen(false);

      toast.success(response.message || "Formulaire créé avec succès.");
    },

    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de créer le formulaire.";

      toast.error(message);
    },
  });

  /* ------------------------------------------------------------------------ */
  /* Chargement du projet                                                     */
  /* ------------------------------------------------------------------------ */

  if (isProjectLoading) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Projet introuvable                                                       */
  /* ------------------------------------------------------------------------ */

  if (projectError || !project) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "2rem",
        }}
      >
        <FolderKanban size={32} />

        <div
          style={{
            fontSize: "0.875rem",
            color: "var(--color-foreground-muted)",
          }}
        >
          Impossible de récupérer ce projet.
        </div>

        <button
          type="button"
          onClick={() => {
            void refetchProject();
          }}
          style={{
            height: "36px",
            padding: "0 0.875rem",
            borderRadius: "0.625rem",
            border: "1px solid var(--color-border)",
            background: "var(--color-surface-raised)",
            color: "var(--color-foreground)",
            cursor: "pointer",
          }}
        >
          Réessayer
        </button>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Rendu                                                                    */
  /* ------------------------------------------------------------------------ */

  return (
    <>
      <Header
        title={project.name}
        description={
          project.description ||
          "Gérez les formulaires et les ressources de ce projet."
        }
        backTo="/dashboard/projects"
        actions={
          <>
            <button
              type="button"
              onClick={() => {
                setIsGlobalConfigOpen(true);
              }}
              style={{
                height: "36px",
                padding: "0 0.875rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                borderRadius: "0.625rem",
                border: "1px solid var(--color-border)",
                background: "var(--color-surface-raised)",
                color: "var(--color-foreground)",
                fontSize: "0.8125rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Settings size={15} />
              Paramètres
            </button>

            {project.status === "DRAFT" && (
              <button
                type="button"
                onClick={() => {
                  publishProjectMutation.mutate();
                }}
                disabled={publishProjectMutation.isPending}
                style={{
                  height: "36px",
                  padding: "0 0.875rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  borderRadius: "0.625rem",
                  border: "1px solid rgba(93, 184, 58, 0.25)",
                  background: "rgba(93, 184, 58, 0.1)",
                  color: "#5DB83A",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  cursor: publishProjectMutation.isPending
                    ? "not-allowed"
                    : "pointer",
                  opacity: publishProjectMutation.isPending ? 0.6 : 1,
                }}
              >
                {publishProjectMutation.isPending ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  "Publier"
                )}
              </button>
            )}

            {project.status === "PUBLISHED" && (
              <button
                type="button"
                onClick={() => {
                  archiveProjectMutation.mutate();
                }}
                disabled={archiveProjectMutation.isPending}
                style={{
                  height: "36px",
                  padding: "0 0.875rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  borderRadius: "0.625rem",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface-raised)",
                  color: "var(--color-foreground)",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  cursor: archiveProjectMutation.isPending
                    ? "not-allowed"
                    : "pointer",
                  opacity: archiveProjectMutation.isPending ? 0.6 : 1,
                }}
              >
                {archiveProjectMutation.isPending ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  "Archiver"
                )}
              </button>
            )}

            {(project.status === "PUBLISHED" ||
              project.status === "ARCHIVED") && (
              <button
                type="button"
                onClick={() => {
                  const confirmed = window.confirm(
                    `Voulez-vous remettre « ${project.name} » en brouillon ?`,
                  );

                  if (!confirmed) {
                    return;
                  }

                  restoreProjectToDraftMutation.mutate();
                }}
                disabled={restoreProjectToDraftMutation.isPending}
                style={{
                  height: "36px",
                  padding: "0 0.875rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  borderRadius: "0.625rem",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface-raised)",
                  color: "var(--color-foreground)",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  cursor: restoreProjectToDraftMutation.isPending
                    ? "not-allowed"
                    : "pointer",
                  opacity: restoreProjectToDraftMutation.isPending ? 0.6 : 1,
                }}
              >
                {restoreProjectToDraftMutation.isPending ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Restauration...
                  </>
                ) : (
                  "Remettre en brouillon"
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setIsCreateOpen(true);
              }}
              style={{
                height: "36px",
                padding: "0 0.875rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                borderRadius: "0.625rem",
                border: "1px solid rgba(93, 184, 58, 0.25)",
                background: "rgba(93, 184, 58, 0.1)",
                color: "#5DB83A",
                fontSize: "0.8125rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Plus size={16} />
              Nouveau formulaire
            </button>

            <button
              type="button"
              onClick={() => {
                void refetchForms();
              }}
              disabled={isFormsFetching}
              title="Actualiser"
              style={{
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "0.625rem",
                border: "1px solid var(--color-border)",
                background: "var(--color-surface-raised)",
                color: "var(--color-foreground-muted)",
                cursor: isFormsFetching ? "not-allowed" : "pointer",
                opacity: isFormsFetching ? 0.6 : 1,
              }}
            >
              {isFormsFetching ? (
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
        {/* ---------------------------------------------------------------- */}
        {/* Informations du projet                                          */}
        {/* ---------------------------------------------------------------- */}

        <section
          style={{
            marginBottom: "1.5rem",
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "1rem",
          }}
        >
          <InfoCard label="Code" value={project.code} />
          <InfoCard label="Type" value={project.project_type} />
          <InfoCard label="Statut" value={project.status} />
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Formulaires                                                      */}
        {/* ---------------------------------------------------------------- */}

        <section
          style={{
            border: "1px solid var(--color-border)",
            borderRadius: "1rem",
            background: "var(--color-surface)",
          }}
        >
          {/* En-tête */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem 1.25rem",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <FileText size={17} />

              <div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 700,
                  }}
                >
                  Formulaires
                </div>

                <div
                  style={{
                    marginTop: "0.2rem",
                    fontSize: "0.7rem",
                    color: "var(--color-foreground-muted)",
                  }}
                >
                  {filteredForms.length} formulaire
                  {filteredForms.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "end",
              }}
            >
              {/* Recherche */}
              <div
                style={{
                  position: "relative",
                  width: "320px",
                  maxWidth: "40%",
                }}
              >
                <Search
                  size={15}
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
                  placeholder="Rechercher un formulaire..."
                  style={{
                    width: "100%",
                    height: "36px",
                    padding: "0 0.75rem 0 2.25rem",
                    borderRadius: "0.625rem",
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface-raised)",
                    color: "var(--color-foreground)",
                    outline: "none",
                    fontSize: "0.75rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Filtres */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  paddingLeft: "1.25rem",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
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
            </div>
          </div>

          {/* Contenu */}
          {isFormsLoading ? (
            <LoadingState />
          ) : formsError ? (
            <ErrorState
              error={formsError}
              onRetry={() => {
                void refetchForms();
              }}
            />
          ) : filteredForms.length === 0 ? (
            <EmptyState
              hasSearch={Boolean(searchQuery.trim())}
              onCreate={() => {
                setIsCreateOpen(true);
              }}
            />
          ) : (
            <div>
              {/* En-tête du tableau */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(280px, 1fr) 200px 130px 110px",
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
                <div>Formulaire</div>
                <div>Type</div>
                <div>Statut</div>
                <div>Créateur</div>
              </div>

              {filteredForms.map((form) => (
                <FormRow
                  key={form.id}
                  form={form}
                  onOpen={() => {
                    router.push(
                      `/dashboard/projects/${form.project_id}/forms/${form.id}`,
                    );
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Création formulaire                                                */}
      {/* ------------------------------------------------------------------ */}

      {isCreateOpen && (
        <FormCreateDialog
          isPending={createFormMutation.isPending}
          onClose={() => {
            if (!createFormMutation.isPending) {
              setIsCreateOpen(false);
            }
          }}
          onSubmit={(data) => {
            createFormMutation.mutate(data);
          }}
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Configuration globale du projet                                    */}
      {/* ------------------------------------------------------------------ */}

      {isGlobalConfigOpen && (
        <ProjectGlobalConfigPanel
          projectFolderId={project.project_folder_id}
          config={project.global_config}
          isPending={updateProjectConfigMutation.isPending}
          onClose={() => {
            if (!updateProjectConfigMutation.isPending) {
              setIsGlobalConfigOpen(false);
            }
          }}
          onSubmit={(globalConfig) => {
            updateProjectConfigMutation.mutate(globalConfig);
          }}
        />
      )}
    </>
  );
}

/* ========================================================================== */
/* Carte d'information                                                        */
/* ========================================================================== */

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: "1rem",
        border: "1px solid var(--color-border)",
        borderRadius: "0.875rem",
        background: "var(--color-surface)",
      }}
    >
      <div
        style={{
          marginBottom: "0.35rem",
          fontSize: "0.6875rem",
          fontWeight: 600,
          color: "var(--color-foreground-muted)",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "0.875rem",
          fontWeight: 700,
          color: "var(--color-foreground)",
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* ========================================================================== */
/* Ligne formulaire                                                           */
/* ========================================================================== */

function FormRow({ form, onOpen }: { form: Form; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      style={{
        width: "100%",
        position: "relative",
        display: "grid",
        gridTemplateColumns: "minmax(280px, 1fr) 200px 130px 110px",
        gap: "1rem",
        alignItems: "center",
        padding: "0.875rem 1.25rem",
        border: "none",
        borderBottom: "1px solid var(--color-border)",
        background: "transparent",
        color: "inherit",
        textAlign: "left",
        transition: "background 0.15s ease",
        cursor: "pointer",
      }}
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
            {form.name}
          </div>

          <div
            style={{
              marginTop: "0.125rem",
              fontSize: "0.6875rem",
              color: "var(--color-foreground-muted)",
            }}
          >
            {form.code}
          </div>
        </div>
      </div>

      <div
        style={{
          fontSize: "0.75rem",
          color: "var(--color-foreground-muted)",
        }}
      >
        {form.form_type}
      </div>

      <div>
        <StatusBadge status={form.status} />
      </div>

      <div
        style={{
          fontSize: "0.75rem",
          color: "var(--color-foreground-muted)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {form.created_by}
      </div>
    </button>
  );
}

/* ========================================================================== */
/* Badge de statut                                                            */
/* ========================================================================== */

function StatusBadge({ status }: { status: Form["status"] }) {
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

/* ========================================================================== */
/* Loading                                                                    */
/* ========================================================================== */

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

/* ========================================================================== */
/* Erreur                                                                     */
/* ========================================================================== */

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
        Impossible de charger les formulaires
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

/* ========================================================================== */
/* État vide                                                                  */
/* ========================================================================== */

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
        {hasSearch ? "Aucun résultat" : "Aucun formulaire"}
      </div>

      <div
        style={{
          fontSize: "0.8125rem",
          color: "var(--color-foreground-muted)",
          maxWidth: "460px",
        }}
      >
        {hasSearch
          ? "Aucun formulaire ne correspond à votre recherche."
          : "Créez votre premier formulaire pour commencer à construire votre collecte."}
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
          Créer un formulaire
        </button>
      )}
    </div>
  );
}
