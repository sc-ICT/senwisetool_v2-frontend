"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  BookOpen,
  FolderKanban,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  Save,
  Settings2,
  Trash2,
  Upload,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { FormImportDialog } from "@/components/form-builder/form-import-dialog";
import { FormImportDocumentationDialog } from "@/components/form-builder/form-import-documentation-dialog";
import { ProjectGlobalConfigPanel } from "@/components/form-builder/project-global-config-panel";
import { ProjectQuestionConfigDialog } from "@/components/form-builder/project-question-config-dialog";
import { ProjectQuestionDependencyDialog } from "@/components/form-builder/project-question-dependency-dialog";
import { ProjectQuestionPicker } from "@/components/form-builder/project-question-picker";
import { ProjectSectionCreateDialog } from "@/components/form-builder/project-section-create-dialog";
import { ProjectSectionQuestions } from "@/components/form-builder/project-section-questions";
import { Header } from "@/components/layout/header";
import { ApiError } from "@/lib/api";
import { createDefaultProjectQuestionConfig } from "@/lib/form-builder/question-config";
import { projectQuestionService } from "@/services/project-question.service";
import { projectSectionService } from "@/services/project-section.service";
import { projectService } from "@/services/project.service";
import { questionBankService } from "@/services/question-bank.service";
import type { Project } from "@/types/project";
import {
  ProjectQuestion,
  ProjectQuestionConfig,
} from "@/types/project-question";
import { ProjectSection } from "@/types/project-section";

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();

  const projectId = Number(params.projectId);

  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);

  const [isGlobalConfigOpen, setIsGlobalConfigOpen] = useState(false);

  const [isSectionCreateOpen, setIsSectionCreateOpen] = useState(false);

  const [isFormImportOpen, setIsFormImportOpen] = useState(false);

  const [isFormImportDocumentationOpen, setIsFormImportDocumentationOpen] =
    useState(false);

  const [openSectionMenuId, setOpenSectionMenuId] = useState<number | null>(
    null,
  );

  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);

  const [draggedSectionId, setDraggedSectionId] = useState<number | null>(null);

  const [dragOverSectionId, setDragOverSectionId] = useState<number | null>(
    null,
  );

  const [questionPickerSectionId, setQuestionPickerSectionId] = useState<
    number | null
  >(null);

  const [questionPickerExistingIds, setQuestionPickerExistingIds] = useState<
    number[]
  >([]);

  const [deletingProjectQuestionId, setDeletingProjectQuestionId] = useState<
    number | null
  >(null);

  const [configuringQuestion, setConfiguringQuestion] =
    useState<ProjectQuestion | null>(null);

  const [configuringDependenciesFor, setConfiguringDependenciesFor] =
    useState<ProjectQuestion | null>(null);

  const {
    data: dependencyQuestionsData,
    isLoading: dependencyQuestionsLoading,
  } = useQuery({
    queryKey: [
      "project-questions",
      projectId,
      configuringDependenciesFor?.section_id ?? "none",
    ],

    queryFn: async () => {
      if (configuringDependenciesFor === null) {
        return null;
      }

      const response = await projectQuestionService.list(
        projectId,
        configuringDependenciesFor.section_id,
      );

      return response.data;
    },

    enabled: configuringDependenciesFor !== null && projectId > 0,
  });

  const dependencyQuestions = dependencyQuestionsData?.items ?? [];

  const {
    data: project,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["projects", "detail", projectId],

    queryFn: async () => {
      if (!Number.isInteger(projectId) || projectId <= 0) {
        throw new Error("Identifiant de projet invalide.");
      }

      const response = await projectService.get(projectId);

      return response.data;
    },

    enabled: Number.isInteger(projectId) && projectId > 0,
  });

  const { data: sectionsData, isLoading: sectionsLoading } = useQuery({
    queryKey: ["project-sections", projectId],

    queryFn: async () => {
      const response = await projectSectionService.list(projectId);

      return response.data;
    },

    enabled: Number.isInteger(projectId) && projectId > 0,
  });

  const sections = sectionsData?.items ?? [];

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Project>) => {
      return projectService.update(projectId, {
        name: data.name,
        description: data.description,
        project_type: data.project_type,
        global_config: data.global_config,
      });
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["projects"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["projects", "detail", projectId],
      });

      setIsEditing(false);

      toast.success("Projet modifié avec succès.");
    },

    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de modifier le projet.";

      toast.error(message);
    },
  });

  const updateGlobalConfigMutation = useMutation({
    mutationFn: async (globalConfig: Project["global_config"]) => {
      return projectService.update(projectId, {
        global_config: globalConfig,
      });
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["projects", "detail", projectId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["projects"],
      });

      setIsGlobalConfigOpen(false);

      toast.success("Paramètres globaux enregistrés.");
    },

    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible d'enregistrer les paramètres globaux.";

      toast.error(message);
    },
  });

  const createSectionMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      description: string | null;
      config: Record<string, unknown>;
    }) => {
      return projectSectionService.create(projectId, data);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["project-sections", projectId],
      });

      setIsSectionCreateOpen(false);

      toast.success("Section créée avec succès.");
    },

    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de créer la section.";

      toast.error(message);
    },
  });

  const updateSectionMutation = useMutation({
    mutationFn: async ({
      sectionId,
      name,
      description,
    }: {
      sectionId: number;
      name: string;
      description: string | null;
    }) => {
      return projectSectionService.update(projectId, sectionId, {
        name,
        description,
      });
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["project-sections", projectId],
      });

      setEditingSectionId(null);

      toast.success("Section modifiée avec succès.");
    },

    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de modifier la section.";

      toast.error(message);
    },
  });

  const deleteSectionMutation = useMutation({
    mutationFn: async (sectionId: number) => {
      return projectSectionService.delete(projectId, sectionId);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["project-sections", projectId],
      });

      setOpenSectionMenuId(null);

      toast.success("Section supprimée avec succès.");
    },

    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de supprimer la section.";

      toast.error(message);
    },
  });

  const reorderSectionsMutation = useMutation({
    mutationFn: async (orderedSectionIds: number[]) => {
      return projectSectionService.reorder(projectId, orderedSectionIds);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["project-sections", projectId],
      });

      setDraggedSectionId(null);
      setDragOverSectionId(null);

      toast.success("Ordre des sections mis à jour.");
    },

    onError: (error) => {
      setDraggedSectionId(null);
      setDragOverSectionId(null);

      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de réordonner les sections.";

      toast.error(message);
    },
  });

  const deleteProjectQuestionMutation = useMutation({
    mutationFn: async ({
      sectionId,
      questionId,
    }: {
      sectionId: number;
      questionId: number;
    }) => {
      return projectQuestionService.delete(projectId, sectionId, questionId);
    },

    onMutate: ({ questionId }) => {
      setDeletingProjectQuestionId(questionId);
    },

    onSuccess: async (_response, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["project-questions", projectId, variables.sectionId],
      });

      setDeletingProjectQuestionId(null);

      toast.success("Question retirée du projet.");
    },

    onError: (error) => {
      setDeletingProjectQuestionId(null);

      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de retirer la question.";

      toast.error(message);
    },
  });

  const addProjectQuestionsMutation = useMutation({
    mutationFn: async ({
      sectionId,
      questions,
    }: {
      sectionId: number;
      questions: Array<{
        questionDefinitionId: number;
        questionVersionId: number;
      }>;
    }) => {
      for (const question of questions) {
        await projectQuestionService.create(projectId, sectionId, {
          question_definition_id: question.questionDefinitionId,

          question_version_id: question.questionVersionId,

          config: createDefaultProjectQuestionConfig(),
        });
      }
    },

    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["project-questions", projectId, variables.sectionId],
      });

      setQuestionPickerSectionId(null);

      toast.success(
        `${variables.questions.length} question${
          variables.questions.length > 1 ? "s" : ""
        } ajoutée${variables.questions.length > 1 ? "s" : ""} au projet.`,
      );
    },

    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible d'ajouter les questions.";

      toast.error(message);
    },
  });

  const reorderProjectQuestionsMutation = useMutation({
    mutationFn: async ({
      sectionId,
      orderedQuestionIds,
    }: {
      sectionId: number;
      orderedQuestionIds: number[];
    }) => {
      return projectQuestionService.reorder(
        projectId,
        sectionId,
        orderedQuestionIds,
      );
    },

    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["project-questions", projectId, variables.sectionId],
      });

      toast.success("Ordre des questions mis à jour.");
    },

    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de réordonner les questions.";

      toast.error(message);
    },
  });

  const updateProjectQuestionMutation = useMutation({
    mutationFn: async ({
      question,
      config,
    }: {
      question: ProjectQuestion;
      config: ProjectQuestionConfig;
    }) => {
      return projectQuestionService.update(
        projectId,
        question.section_id,
        question.id,
        {
          config,
        },
      );
    },

    onSuccess: async (_response, variables) => {
      await queryClient.invalidateQueries({
        queryKey: [
          "project-questions",
          projectId,
          variables.question.section_id,
        ],
      });

      setConfiguringQuestion(null);

      toast.success("Configuration de la question enregistrée.");
    },

    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible d'enregistrer la configuration.";

      toast.error(message);
    },
  });

  const moveProjectQuestion = (
    sectionId: number,
    draggedId: number,
    targetId: number,
  ) => {
    if (draggedId === targetId || reorderProjectQuestionsMutation.isPending) {
      return;
    }

    const currentQuestions = queryClient.getQueryData<{
      items: ProjectQuestion[];
      count: number;
    }>(["project-questions", projectId, sectionId]);

    if (!currentQuestions) {
      return;
    }

    const reordered = currentQuestions.items.map((question) => question.id);

    const fromIndex = reordered.indexOf(draggedId);

    const toIndex = reordered.indexOf(targetId);

    if (fromIndex === -1 || toIndex === -1) {
      return;
    }

    const [movedId] = reordered.splice(fromIndex, 1);

    reordered.splice(toIndex, 0, movedId);

    reorderProjectQuestionsMutation.mutate({
      sectionId,
      orderedQuestionIds: reordered,
    });
  };

  const moveSection = (draggedId: number, targetId: number) => {
    if (draggedId === targetId || reorderSectionsMutation.isPending) {
      return;
    }

    const reordered = sections.map((section) => section.id);

    const fromIndex = reordered.indexOf(draggedId);

    const toIndex = reordered.indexOf(targetId);

    if (fromIndex === -1 || toIndex === -1) {
      return;
    }

    const [movedId] = reordered.splice(fromIndex, 1);

    reordered.splice(toIndex, 0, movedId);

    reorderSectionsMutation.mutate(reordered);
  };

  if (isLoading) {
    return (
      <>
        <Header title="Projet" description="Chargement..." />

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
      </>
    );
  }

  if (error || !project) {
    return (
      <>
        <Header title="Projet" description="Impossible de charger le projet." />

        <div
          style={{
            flex: 1,
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
            Impossible de charger le projet
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
                : "Projet introuvable."}
          </div>

          <button
            type="button"
            onClick={() => router.push("/dashboard/projects")}
            style={secondaryButtonStyle}
          >
            <ArrowLeft size={15} />
            Retour aux projets
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title={project.name}
        description={project.description ?? project.code}
        actions={
          <>
            <button
              type="button"
              onClick={() => {
                router.push("/dashboard/projects");
              }}
              style={secondaryButtonStyle}
            >
              <ArrowLeft size={15} />
              Projets
            </button>

            <button
              type="button"
              onClick={() => {
                setIsFormImportOpen(true);
              }}
              style={secondaryButtonStyle}
            >
              <Upload size={15} />
              Importer Excel
            </button>

            <button
              type="button"
              onClick={() => {
                setIsFormImportDocumentationOpen(true);
              }}
              style={secondaryButtonStyle}
              title="Comment préparer mon fichier Excel ?"
            >
              <BookOpen size={15} />
              Guide import
            </button>

            <button
              type="button"
              onClick={() => {
                setIsGlobalConfigOpen(true);
              }}
              style={secondaryButtonStyle}
            >
              <Settings2 size={15} />
              Paramètres
            </button>

            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                style={primaryButtonStyle}
              >
                <Pencil size={15} />
                Modifier
              </button>
            )}
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
            maxWidth: "1000px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {/* Informations */}
          <section style={cardStyle}>
            <SectionHeader
              icon={<FolderKanban size={17} color="#5DB83A" />}
              title="Informations générales"
              description="Identité et type du projet."
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <InfoField label="Code" value={project.code} />

              <InfoField
                label="Statut"
                value={getStatusLabel(project.status)}
              />

              <InfoField label="Nom" value={project.name} />

              <InfoField label="Type" value={project.project_type} />

              <div
                style={{
                  gridColumn: "1 / -1",
                }}
              >
                <InfoField
                  label="Description"
                  value={project.description ?? "Aucune description."}
                />
              </div>
            </div>
          </section>

          {/* Structure */}
          <section style={cardStyle}>
            <SectionHeader
              icon={<Settings2 size={17} color="#8B5CF6" />}
              title="Structure du projet"
              description="Construisez ici les sections et les questions de votre projet."
            />

            <div
              style={{
                marginTop: "0.25rem",
              }}
            >
              <FolderKanban size={24} color="#8B5CF6" />

              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--color-foreground-muted)",
                        position: "relative",
                      }}
                    >
                      {sections.length} section
                      {sections.length > 1 ? "s" : ""}
                    </div>
                    {reorderSectionsMutation.isPending && (
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          marginLeft: "0.625rem",
                          padding: "0.625rem",
                          fontSize: "0.6875rem",
                          fontWeight: 600,
                          color: "#FFF",
                          background: "#5DB83A",
                          borderRadius: 20,
                          position: "absolute",
                          bottom: 30,
                          right: 30,
                        }}
                      >
                        <Loader2 size={13} className="animate-spin" />
                        Réorganisation...
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsSectionCreateOpen(true);
                    }}
                    style={primaryButtonStyle}
                  >
                    <Plus size={15} />
                    Ajouter une section
                  </button>
                </div>

                {sectionsLoading ? (
                  <div
                    style={{
                      minHeight: "180px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Loader2 size={22} className="animate-spin" />
                  </div>
                ) : sections.length === 0 ? (
                  <div
                    style={{
                      minHeight: "180px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.625rem",
                      border: "1px dashed var(--color-border)",
                      borderRadius: "0.75rem",
                      textAlign: "center",
                      padding: "1.5rem",
                    }}
                  >
                    <FolderKanban size={24} color="#8B5CF6" />

                    <div
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                      }}
                    >
                      Aucune section
                    </div>

                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--color-foreground-muted)",
                      }}
                    >
                      Commencez par créer la première section de votre projet.
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.625rem",
                    }}
                  >
                    {sections.map((section) => {
                      const isEditing = editingSectionId === section.id;

                      if (isEditing) {
                        return (
                          <ProjectSectionEditRow
                            key={section.id}
                            section={section}
                            isPending={updateSectionMutation.isPending}
                            onCancel={() => {
                              if (!updateSectionMutation.isPending) {
                                setEditingSectionId(null);
                              }
                            }}
                            onSave={(name, description) => {
                              updateSectionMutation.mutate({
                                sectionId: section.id,
                                name,
                                description,
                              });
                            }}
                          />
                        );
                      }

                      return (
                        <ProjectSectionRow
                          key={section.id}
                          section={section}
                          menuOpen={openSectionMenuId === section.id}
                          deletingQuestionId={deletingProjectQuestionId}
                          projectId={projectId}
                          deleting={
                            deleteSectionMutation.isPending &&
                            deleteSectionMutation.variables === section.id
                          }
                          reorderingQuestions={
                            reorderProjectQuestionsMutation.isPending
                          }
                          onReorderQuestion={(draggedId, targetId) => {
                            moveProjectQuestion(
                              section.id,
                              draggedId,
                              targetId,
                            );
                          }}
                          reordering={reorderSectionsMutation.isPending}
                          dragged={draggedSectionId === section.id}
                          dragOver={dragOverSectionId === section.id}
                          onDragStart={() => {
                            setDraggedSectionId(section.id);
                            setOpenSectionMenuId(null);
                          }}
                          onDragEnd={() => {
                            setDraggedSectionId(null);
                            setDragOverSectionId(null);
                          }}
                          onDragOver={() => {
                            if (draggedSectionId !== section.id) {
                              setDragOverSectionId(section.id);
                            }
                          }}
                          onDrop={() => {
                            if (draggedSectionId === null) {
                              return;
                            }
                            moveSection(draggedSectionId, section.id);
                          }}
                          onToggleMenu={() => {
                            setOpenSectionMenuId((current) =>
                              current === section.id ? null : section.id,
                            );
                          }}
                          onEdit={() => {
                            setOpenSectionMenuId(null);
                            setEditingSectionId(section.id);
                          }}
                          onDelete={() => {
                            const confirmed = window.confirm(
                              `Voulez-vous vraiment supprimer « ${section.name} » ?`,
                            );

                            if (!confirmed) {
                              return;
                            }

                            deleteSectionMutation.mutate(section.id);
                          }}
                          onAddQuestion={(existingQuestionIds) => {
                            setQuestionPickerExistingIds(existingQuestionIds);

                            setQuestionPickerSectionId(section.id);
                          }}
                          onDeleteQuestion={(question) => {
                            const confirmed = window.confirm(
                              `Voulez-vous retirer « ${question.question_name} » du projet ?`,
                            );

                            if (!confirmed) {
                              return;
                            }

                            deleteProjectQuestionMutation.mutate({
                              sectionId: section.id,
                              questionId: question.id,
                            });
                          }}
                          onConfigureQuestion={(question) => {
                            setConfiguringQuestion(question);
                          }}
                          onDependencies={(question) => {
                            setOpenSectionMenuId(null);
                            setConfiguringDependenciesFor(question);
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {isEditing && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.625rem",
          }}
        >
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            disabled={updateMutation.isPending}
            style={secondaryButtonStyle}
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={() => {
              if (!project.name.trim()) {
                toast.error("Le nom du projet est obligatoire.");

                return;
              }

              updateMutation.mutate({
                name: project.name,
                description: project.description,
                project_type: project.project_type,
                global_config: project.global_config,
              });
            }}
            disabled={updateMutation.isPending}
            style={primaryButtonStyle}
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save size={15} />
                Enregistrer
              </>
            )}
          </button>
        </div>
      )}

      {isSectionCreateOpen && (
        <ProjectSectionCreateDialog
          isPending={createSectionMutation.isPending}
          onClose={() => {
            if (!createSectionMutation.isPending) {
              setIsSectionCreateOpen(false);
            }
          }}
          onSubmit={(data) => {
            createSectionMutation.mutate(data);
          }}
        />
      )}

      {questionPickerSectionId !== null && (
        <ProjectQuestionPicker
          isPending={addProjectQuestionsMutation.isPending}
          existingQuestionIds={questionPickerExistingIds}
          onClose={() => {
            if (!addProjectQuestionsMutation.isPending) {
              setQuestionPickerSectionId(null);
            }
          }}
          onSubmit={(questions) => {
            addProjectQuestionsMutation.mutate({
              sectionId: questionPickerSectionId,
              questions,
            });
          }}
        />
      )}

      {configuringQuestion && (
        <ProjectQuestionConfigDialog
          question={configuringQuestion}
          isPending={updateProjectQuestionMutation.isPending}
          onClose={() => {
            if (!updateProjectQuestionMutation.isPending) {
              setConfiguringQuestion(null);
            }
          }}
          onSubmit={(config) => {
            updateProjectQuestionMutation.mutate({
              question: configuringQuestion,
              config,
            });
          }}
        />
      )}

      {isGlobalConfigOpen && (
        <ProjectGlobalConfigPanel
          projectId={projectId}
          config={project.global_config}
          isPending={updateGlobalConfigMutation.isPending}
          onClose={() => setIsGlobalConfigOpen(false)}
          onSubmit={(config) => updateGlobalConfigMutation.mutate(config)}
          onSaveConfig={async (config) => {
            try {
              await updateGlobalConfigMutation.mutateAsync(config);
              return true;
            } catch {
              return false;
            }
          }}
        />
      )}

      {configuringDependenciesFor && (
        <ProjectQuestionDependencyDialog
          projectId={projectId}
          sections={sections}
          sectionId={configuringDependenciesFor.section_id}
          targetQuestion={configuringDependenciesFor}
          allQuestions={dependencyQuestions}
          isPending={dependencyQuestionsLoading}
          onClose={() => {
            setConfiguringDependenciesFor(null);
          }}
          onChanged={() => {
            void queryClient.invalidateQueries({
              queryKey: [
                "project-questions",
                projectId,
                configuringDependenciesFor.section_id,
              ],
            });
          }}
        />
      )}

      {isFormImportOpen && (
        <FormImportDialog
          projectId={projectId}
          onClose={() => {
            setIsFormImportOpen(false);
          }}
          onImported={() => {
            void queryClient.invalidateQueries({
              queryKey: ["project-sections", projectId],
            });

            void queryClient.invalidateQueries({
              queryKey: ["project-questions", projectId],
            });

            toast.success("Le formulaire a été importé avec succès.");
          }}
        />
      )}

      {isFormImportDocumentationOpen && (
        <div>
          <FormImportDocumentationDialog
            onClose={() => {
              setIsFormImportDocumentationOpen(false);
            }}
          />
        </div>
      )}
    </>
  );
}

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "0.625rem",
        marginBottom: "1rem",
      }}
    >
      <div
        style={{
          width: "32px",
          height: "32px",
          flexShrink: 0,
          borderRadius: "0.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-surface-raised)",
          border: "1px solid var(--color-border)",
        }}
      >
        {icon}
      </div>

      <div>
        <div
          style={{
            fontSize: "0.8125rem",
            fontWeight: 700,
            color: "var(--color-foreground)",
          }}
        >
          {title}
        </div>

        <div
          style={{
            marginTop: "0.2rem",
            fontSize: "0.6875rem",
            color: "var(--color-foreground-muted)",
          }}
        >
          {description}
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: "0.75rem",
        borderRadius: "0.625rem",
        border: "1px solid var(--color-border)",
        background: "var(--color-surface-raised)",
      }}
    >
      <div
        style={{
          fontSize: "0.625rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          color: "var(--color-foreground-muted)",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: "0.3rem",
          fontSize: "0.8125rem",
          color: "var(--color-foreground)",
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function getStatusLabel(status: Project["status"]) {
  switch (status) {
    case "DRAFT":
      return "Brouillon";

    case "PUBLISHED":
      return "Publié";

    case "ARCHIVED":
      return "Archivé";

    default:
      return status;
  }
}

function ProjectSectionContent({
  projectId,
  section,
  deletingQuestionId,
  reordering,
  onAddQuestion,
  onDeleteQuestion,
  onReorder,
  onConfigureQuestion,
  onDependencies,
}: {
  projectId: number;
  section: ProjectSection;
  deletingQuestionId: number | null;
  reordering: boolean;
  onAddQuestion: (existingQuestionIds: number[]) => void;
  onDeleteQuestion: (question: ProjectQuestion) => void;
  onReorder: (draggedId: number, targetId: number) => void;
  onConfigureQuestion: (question: ProjectQuestion) => void;
  onDependencies: (question: ProjectQuestion) => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["project-questions", projectId, section.id],

    queryFn: async () => {
      const response = await projectQuestionService.list(projectId, section.id);

      return response.data;
    },
  });

  const { data: questionBankData } = useQuery({
    queryKey: ["question-bank-picker"],

    queryFn: async () => {
      const response = await questionBankService.list(false);

      return response.data;
    },
  });

  const totalAvailableQuestions = questionBankData?.items.length ?? 0;

  const questions = data?.items ?? [];

  const existingQuestionIds = new Set(
    questions.map((question) => question.question_definition_id),
  );

  const availableQuestionCount = Math.max(
    0,
    totalAvailableQuestions - existingQuestionIds.size,
  );

  return (
    <ProjectSectionQuestions
      questions={questions}
      isLoading={isLoading}
      deletingQuestionId={deletingQuestionId}
      reordering={reordering}
      onAdd={() => {
        onAddQuestion(Array.from(existingQuestionIds));
      }}
      availableQuestionCount={availableQuestionCount}
      onDelete={onDeleteQuestion}
      onReorder={onReorder}
      onConfigure={onConfigureQuestion}
      onDependencies={onDependencies}
    />
  );
}

function ProjectSectionRow({
  section,
  menuOpen,
  onToggleMenu,
  onDelete,
  onEdit,
  deleting,
  dragged,
  dragOver,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  reordering,
  deletingQuestionId,
  projectId,
  onAddQuestion,
  onDeleteQuestion,
  reorderingQuestions,
  onReorderQuestion,
  onConfigureQuestion,
  onDependencies,
}: {
  section: ProjectSection;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onDelete: () => void;
  onEdit: () => void;
  deleting: boolean;
  dragged: boolean;
  dragOver: boolean;
  reorderingQuestions: boolean;
  onReorderQuestion: (draggedId: number, targetId: number) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: () => void;
  onDrop: () => void;
  reordering: boolean;
  deletingQuestionId: number | null;
  projectId: number;
  onAddQuestion: (existingQuestionIds: number[]) => void;
  onDeleteQuestion: (question: ProjectQuestion) => void;
  onConfigureQuestion: (question: ProjectQuestion) => void;
  onDependencies: (question: ProjectQuestion) => void;
}) {
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (
        target instanceof Node &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        onToggleMenu();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [menuOpen, onToggleMenu]);

  return (
    <div
      draggable={!deleting && !reordering}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";

        onDragStart();
      }}
      onDragOver={(event) => {
        event.preventDefault();

        event.dataTransfer.dropEffect = "move";

        onDragOver();
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDrop();
      }}
      onDragEnd={onDragEnd}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: "0.875rem",
        padding: "0.875rem",
        border: dragOver
          ? "1px solid rgba(93, 184, 58, 0.45)"
          : "1px solid var(--color-border)",
        borderRadius: "0.875rem",
        background: dragOver
          ? "rgba(93, 184, 58, 0.06)"
          : "var(--color-surface-raised)",
        opacity: dragged ? 0.45 : 1,
        transition:
          "background 0.15s ease, border 0.15s ease, opacity 0.15s ease",
      }}
    >
      {/* En-tête de la section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          minWidth: 0,
        }}
      >
        {/* Poignée */}
        <div
          title="Déplacer la section"
          style={{
            width: "20px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-foreground-muted)",
            cursor: "grab",
            fontSize: "14px",
            userSelect: "none",
          }}
        >
          ⋮⋮
        </div>

        {/* Icône */}
        <div
          style={{
            width: "36px",
            height: "36px",
            flexShrink: 0,
            borderRadius: "0.625rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(139, 92, 246, 0.08)",
            border: "1px solid rgba(139, 92, 246, 0.15)",
          }}
        >
          <FolderKanban size={17} color="#8B5CF6" />
        </div>

        {/* Infos */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              minWidth: 0,
            }}
          >
            <span
              style={{
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontSize: "0.8125rem",
                fontWeight: 700,
                color: "var(--color-foreground)",
              }}
            >
              {section.name}
            </span>

            <span
              style={{
                flexShrink: 0,
                fontSize: "0.625rem",
                padding: "0.2rem 0.45rem",
                borderRadius: "999px",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                color: "var(--color-foreground-muted)",
              }}
            >
              Section {section.position + 1}
            </span>
          </div>

          <div
            style={{
              marginTop: "0.15rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: "0.6875rem",
              color: "var(--color-foreground-muted)",
            }}
          >
            {section.description ?? "Aucune description"}
          </div>
        </div>

        {/* Menu */}
        <div
          ref={menuRef}
          style={{
            position: "relative",
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggleMenu();
            }}
            disabled={deleting}
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "0.5rem",
              border: "1px solid transparent",
              background: menuOpen ? "var(--color-surface)" : "transparent",
              color: "var(--color-foreground-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: deleting ? "not-allowed" : "pointer",
              opacity: deleting ? 0.5 : 1,
            }}
            aria-label={`Actions pour ${section.name}`}
          >
            {deleting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <MoreVertical size={17} />
            )}
          </button>

          {menuOpen && !deleting && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 0.375rem)",
                right: 0,
                zIndex: 100,
                minWidth: "180px",
                padding: "0.375rem",
                border: "1px solid var(--color-border)",
                borderRadius: "0.75rem",
                background: "var(--color-surface)",
                boxShadow: "0 12px 32px rgba(0, 0, 0, 0.14)",
              }}
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              <SectionMenuButton
                icon={<Pencil size={15} />}
                label="Modifier"
                onClick={onEdit}
              />

              <SectionMenuButton
                icon={<Trash2 size={15} />}
                label="Supprimer"
                danger
                onClick={onDelete}
              />
            </div>
          )}
        </div>
      </div>

      {/* Contenu des questions */}
      <div
        style={{
          paddingLeft: "2.3rem",
          paddingRight: "0.125rem",
        }}
      >
        <ProjectSectionContent
          projectId={projectId}
          section={section}
          deletingQuestionId={deletingQuestionId}
          reordering={reorderingQuestions}
          onAddQuestion={onAddQuestion}
          onDeleteQuestion={onDeleteQuestion}
          onReorder={onReorderQuestion}
          onConfigureQuestion={onConfigureQuestion}
          onDependencies={onDependencies}
        />
      </div>
    </div>
  );
}

function ProjectSectionEditRow({
  section,
  isPending,
  onCancel,
  onSave,
}: {
  section: ProjectSection;
  isPending: boolean;
  onCancel: () => void;
  onSave: (name: string, description: string | null) => void;
}) {
  const [name, setName] = useState(section.name);

  const [description, setDescription] = useState(section.description ?? "");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        padding: "0.875rem",
        border: "1px solid rgba(93, 184, 58, 0.25)",
        borderRadius: "0.75rem",
        background: "rgba(93, 184, 58, 0.04)",
      }}
    >
      <div>
        <label style={fieldLabelStyle}>Nom</label>

        <input
          value={name}
          onChange={(event) => {
            setName(event.target.value);
          }}
          autoFocus
          maxLength={255}
          disabled={isPending}
          // style={inputStyle}
        />
      </div>

      <div>
        <label style={fieldLabelStyle}>Description</label>

        <textarea
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
          }}
          rows={3}
          disabled={isPending}
          style={{
            // ...inputStyle,
            height: "auto",
            minHeight: "72px",
            padding: "0.75rem 0.875rem",
            resize: "vertical",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "0.5rem",
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          style={secondaryButtonStyle}
        >
          Annuler
        </button>

        <button
          type="button"
          onClick={() => {
            const normalizedName = name.trim();

            if (!normalizedName) {
              toast.error("Le nom de la section est obligatoire.");
              return;
            }

            onSave(
              normalizedName,
              description.trim() ? description.trim() : null,
            );
          }}
          disabled={isPending}
          style={{
            ...primaryButtonStyle,
            opacity: isPending ? 0.6 : 1,
          }}
        >
          {isPending ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save size={14} />
              Enregistrer
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function SectionMenuButton({
  icon,
  label,
  onClick,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
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
        fontSize: "0.75rem",
        fontWeight: 500,
        cursor: "pointer",
        textAlign: "left",
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.background = danger
          ? "rgba(239, 68, 68, 0.08)"
          : "var(--color-surface-raised)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.background = "transparent";
      }}
    >
      {icon}
      {label}
    </button>
  );
}

const cardStyle = {
  padding: "1.125rem",
  border: "1px solid var(--color-border)",
  borderRadius: "1rem",
  background: "var(--color-surface)",
};

const secondaryButtonStyle = {
  height: "36px",
  padding: "0 0.75rem",
  borderRadius: "0.5rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface-raised)",
  color: "var(--color-foreground)",
  display: "flex",
  alignItems: "center",
  gap: "0.375rem",
  fontSize: "0.75rem",
  fontWeight: 600,
  cursor: "pointer",
};

const primaryButtonStyle = {
  height: "36px",
  padding: "0 0.75rem",
  borderRadius: "0.5rem",
  border: "1px solid rgba(93, 184, 58, 0.3)",
  background: "rgba(93, 184, 58, 0.12)",
  color: "#5DB83A",
  display: "flex",
  alignItems: "center",
  gap: "0.375rem",
  fontSize: "0.75rem",
  fontWeight: 600,
  cursor: "pointer",
};

const fieldLabelStyle = {
  display: "block",
  marginBottom: "0.375rem",
  fontSize: "0.6875rem",
  fontWeight: 600,
  color: "var(--color-foreground)",
};
