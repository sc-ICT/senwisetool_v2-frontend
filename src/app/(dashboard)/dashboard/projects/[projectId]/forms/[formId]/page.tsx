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

import { FormGlobalConfigPanel } from "@/components/form-builder/form-global-config-panel";
import { FormImportDialog } from "@/components/form-builder/form-import-dialog";
import { FormImportDocumentationDialog } from "@/components/form-builder/form-import-documentation-dialog";
import { FormQuestionConfigDialog } from "@/components/form-builder/form-question-config-dialog";
import { FormQuestionDependencyDialog } from "@/components/form-builder/form-question-dependency-dialog";
import { FormQuestionPicker } from "@/components/form-builder/form-question-picker";
import { FormSectionCreateDialog } from "@/components/form-builder/form-section-create-dialog";
import { FormSectionQuestions } from "@/components/form-builder/form-section-questions";
import { Header } from "@/components/layout/header";
import { ApiError } from "@/lib/api";
import { createDefaultFormQuestionConfig } from "@/lib/form-builder/question-config";
import { formQuestionService } from "@/services/form-question.service";
import { formSectionService } from "@/services/form-section.service";
import { formService } from "@/services/form.service";
import { questionBankService } from "@/services/question-bank.service";
import type { Form } from "@/types/form";
import { FormQuestion, FormQuestionConfig } from "@/types/form-question";
import { FormSection } from "@/types/form-section";

export default function FormDetailPage() {
  const router = useRouter();
  const params = useParams();

  const formId = Number(params.formId);

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

  const [deletingFormQuestionId, setDeletingFormQuestionId] = useState<
    number | null
  >(null);

  const [configuringQuestion, setConfiguringQuestion] =
    useState<FormQuestion | null>(null);

  const [configuringDependenciesFor, setConfiguringDependenciesFor] =
    useState<FormQuestion | null>(null);

  const {
    data: dependencyQuestionsData,
    isLoading: dependencyQuestionsLoading,
  } = useQuery({
    queryKey: [
      "form-questions",
      formId,
      configuringDependenciesFor?.section_id ?? "none",
    ],

    queryFn: async () => {
      if (configuringDependenciesFor === null) {
        return null;
      }

      const response = await formQuestionService.list(
        formId,
        configuringDependenciesFor.section_id,
      );

      return response.data;
    },

    enabled: configuringDependenciesFor !== null && formId > 0,
  });

  const dependencyQuestions = dependencyQuestionsData?.items ?? [];

  const {
    data: form,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["forms", "detail", formId],

    queryFn: async () => {
      if (!Number.isInteger(formId) || formId <= 0) {
        throw new Error("Identifiant de formulaire invalide.");
      }

      const response = await formService.get(formId);

      return response.data;
    },

    enabled: Number.isInteger(formId) && formId > 0,
  });

  const { data: sectionsData, isLoading: sectionsLoading } = useQuery({
    queryKey: ["form-sections", formId],

    queryFn: async () => {
      const response = await formSectionService.list(formId);

      return response.data;
    },

    enabled: Number.isInteger(formId) && formId > 0,
  });

  const sections = sectionsData?.items ?? [];

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Form>) => {
      return formService.update(formId, {
        name: data.name,
        description: data.description,
        form_type: data.form_type,
        global_config: data.global_config,
      });
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["forms"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["forms", "detail", formId],
      });

      setIsEditing(false);

      toast.success("Formulaire modifié avec succès.");
    },

    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de modifier le formulaire.";

      toast.error(message);
    },
  });

  const publishFormMutation = useMutation({
    mutationFn: async () => {
      return formService.update(formId, {
        status: "PUBLISHED",
      });
    },

    onSuccess: async (response) => {
      if (response.data) {
        await queryClient.setQueryData(
          ["forms", "detail", formId],
          response.data,
        );
      }

      await queryClient.invalidateQueries({
        queryKey: ["forms"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["forms", "detail", formId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["project-forms", form?.project_id],
      });

      toast.success("Formulaire publié avec succès.");
    },

    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de publier le formulaire.";

      toast.error(message);
    },
  });

  const archiveFormMutation = useMutation({
    mutationFn: async () => {
      return formService.archive(formId);
    },

    onSuccess: async (response) => {
      if (response.data) {
        await queryClient.setQueryData(
          ["forms", "detail", formId],
          response.data,
        );
      }

      await queryClient.invalidateQueries({
        queryKey: ["forms"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["forms", "detail", formId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["project-forms", form?.project_id],
      });

      toast.success("Formulaire archivé avec succès.");
    },

    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible d'archiver le formulaire.";

      toast.error(message);
    },
  });

  const restoreFormToDraftMutation = useMutation({
    mutationFn: async () => formService.restoreToDraft(formId),

    onSuccess: async (response) => {
      if (response.data) {
        queryClient.setQueryData(["form", formId], response.data);
      }

      await queryClient.invalidateQueries({
        queryKey: ["form", formId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["forms"],
      });

      toast.success(
        response.message || "Formulaire remis en brouillon avec succès.",
      );
    },

    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de remettre le formulaire en brouillon.";

      toast.error(message);
    },
  });

  const updateGlobalConfigMutation = useMutation({
    mutationFn: async (globalConfig: Form["global_config"]) => {
      return formService.update(formId, {
        global_config: globalConfig,
      });
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["forms", "detail", formId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["forms"],
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
      return formSectionService.create(formId, data);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["form-sections", formId],
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
      return formSectionService.update(formId, sectionId, {
        name,
        description,
      });
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["form-sections", formId],
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
      return formSectionService.delete(formId, sectionId);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["form-sections", formId],
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
      return formSectionService.reorder(formId, orderedSectionIds);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["form-sections", formId],
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

  const deleteFormQuestionMutation = useMutation({
    mutationFn: async ({
      sectionId,
      questionId,
    }: {
      sectionId: number;
      questionId: number;
    }) => {
      return formQuestionService.delete(formId, sectionId, questionId);
    },

    onMutate: ({ questionId }) => {
      setDeletingFormQuestionId(questionId);
    },

    onSuccess: async (_response, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["form-questions", formId, variables.sectionId],
      });

      setDeletingFormQuestionId(null);

      toast.success("Question retirée du formulaire.");
    },

    onError: (error) => {
      setDeletingFormQuestionId(null);

      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de retirer la question.";

      toast.error(message);
    },
  });

  const addFormQuestionsMutation = useMutation({
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
        await formQuestionService.create(formId, sectionId, {
          question_definition_id: question.questionDefinitionId,

          question_version_id: question.questionVersionId,

          config: createDefaultFormQuestionConfig(),
        });
      }
    },

    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["form-questions", formId, variables.sectionId],
      });

      setQuestionPickerSectionId(null);

      toast.success(
        `${variables.questions.length} question${
          variables.questions.length > 1 ? "s" : ""
        } ajoutée${variables.questions.length > 1 ? "s" : ""} au formulaire.`,
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

  const reorderFormQuestionsMutation = useMutation({
    mutationFn: async ({
      sectionId,
      orderedQuestionIds,
    }: {
      sectionId: number;
      orderedQuestionIds: number[];
    }) => {
      return formQuestionService.reorder(formId, sectionId, orderedQuestionIds);
    },

    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["form-questions", formId, variables.sectionId],
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

  const updateFormQuestionMutation = useMutation({
    mutationFn: async ({
      question,
      config,
    }: {
      question: FormQuestion;
      config: FormQuestionConfig;
    }) => {
      return formQuestionService.update(
        formId,
        question.section_id,
        question.id,
        {
          config,
        },
      );
    },

    onSuccess: async (_response, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["form-questions", formId, variables.question.section_id],
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

  const moveFormQuestion = (
    sectionId: number,
    draggedId: number,
    targetId: number,
  ) => {
    if (draggedId === targetId || reorderFormQuestionsMutation.isPending) {
      return;
    }

    const currentQuestions = queryClient.getQueryData<{
      items: FormQuestion[];
      count: number;
    }>(["form-questions", formId, sectionId]);

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

    reorderFormQuestionsMutation.mutate({
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
        <Header title="Formulaire" description="Chargement..." />

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

  if (error || !form) {
    return (
      <>
        <Header
          title="Formulaire"
          description="Impossible de charger le formulaire."
        />

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
            Impossible de charger le formulaire
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
                : "Formulaire introuvable."}
          </div>

          <button
            type="button"
            onClick={() => router.push("/dashboard/forms")}
            style={secondaryButtonStyle}
          >
            <ArrowLeft size={15} />
            Retour aux formulaires
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title={form.name}
        description={form.description ?? form.code}
        backTo={`/dashboard/projects/${form.project_id}`}
        actions={
          <>
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

            {form.status === "DRAFT" && (
              <button
                type="button"
                onClick={() => {
                  publishFormMutation.mutate();
                }}
                disabled={publishFormMutation.isPending}
                style={{
                  ...primaryButtonStyle,
                  cursor: publishFormMutation.isPending
                    ? "not-allowed"
                    : "pointer",
                  opacity: publishFormMutation.isPending ? 0.6 : 1,
                }}
              >
                {publishFormMutation.isPending ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Publication...
                  </>
                ) : (
                  "Publier"
                )}
              </button>
            )}

            {(form.status === "PUBLISHED" || form.status === "ARCHIVED") && (
              <button
                type="button"
                onClick={() => {
                  const confirmed = window.confirm(
                    `Voulez-vous remettre « ${form.name} » en brouillon ?`,
                  );

                  if (!confirmed) {
                    return;
                  }

                  restoreFormToDraftMutation.mutate();
                }}
                disabled={restoreFormToDraftMutation.isPending}
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
                  cursor: restoreFormToDraftMutation.isPending
                    ? "not-allowed"
                    : "pointer",
                  opacity: restoreFormToDraftMutation.isPending ? 0.6 : 1,
                }}
              >
                {restoreFormToDraftMutation.isPending
                  ? "Restauration..."
                  : "Remettre en brouillon"}
              </button>
            )}

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
              description="Identité et type du formulaire."
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <InfoField label="Code" value={form.code} />

              <InfoField label="Statut" value={getStatusLabel(form.status)} />

              <InfoField label="Nom" value={form.name} />

              <InfoField label="Type" value={form.form_type} />

              <div
                style={{
                  gridColumn: "1 / -1",
                }}
              >
                <InfoField
                  label="Description"
                  value={form.description ?? "Aucune description."}
                />
              </div>
            </div>
          </section>

          {/* Structure */}
          <section style={cardStyle}>
            <SectionHeader
              icon={<Settings2 size={17} color="#8B5CF6" />}
              title="Structure du formulaire"
              description="Construisez ici les sections et les questions de votre formulaire."
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
                      Commencez par créer la première section de votre
                      formulaire.
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
                          <FormSectionEditRow
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
                        <FormSectionRow
                          key={section.id}
                          section={section}
                          menuOpen={openSectionMenuId === section.id}
                          deletingQuestionId={deletingFormQuestionId}
                          formId={formId}
                          deleting={
                            deleteSectionMutation.isPending &&
                            deleteSectionMutation.variables === section.id
                          }
                          reorderingQuestions={
                            reorderFormQuestionsMutation.isPending
                          }
                          onReorderQuestion={(draggedId, targetId) => {
                            moveFormQuestion(section.id, draggedId, targetId);
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
                              `Voulez-vous retirer « ${question.question_name} » du formulaire ?`,
                            );

                            if (!confirmed) {
                              return;
                            }

                            deleteFormQuestionMutation.mutate({
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
              if (!form.name.trim()) {
                toast.error("Le nom du formulaire est obligatoire.");

                return;
              }

              updateMutation.mutate({
                name: form.name,
                description: form.description,
                form_type: form.form_type,
                global_config: form.global_config,
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
        <FormSectionCreateDialog
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
        <FormQuestionPicker
          isPending={addFormQuestionsMutation.isPending}
          existingQuestionIds={questionPickerExistingIds}
          onClose={() => {
            if (!addFormQuestionsMutation.isPending) {
              setQuestionPickerSectionId(null);
            }
          }}
          onSubmit={(questions) => {
            addFormQuestionsMutation.mutate({
              sectionId: questionPickerSectionId,
              questions,
            });
          }}
        />
      )}

      {configuringQuestion && (
        <FormQuestionConfigDialog
          question={configuringQuestion}
          isPending={updateFormQuestionMutation.isPending}
          onClose={() => {
            if (!updateFormQuestionMutation.isPending) {
              setConfiguringQuestion(null);
            }
          }}
          onSubmit={(config) => {
            updateFormQuestionMutation.mutate({
              question: configuringQuestion,
              config,
            });
          }}
        />
      )}

      {isGlobalConfigOpen && (
        <FormGlobalConfigPanel
          formId={formId}
          config={form.global_config}
          isPending={updateGlobalConfigMutation.isPending}
          onClose={() => setIsGlobalConfigOpen(false)}
          onSubmit={(config) => updateGlobalConfigMutation.mutate(config)}
          onSaveConfig={async (config) => {
            try {
              await formService.update(formId, {
                global_config: config,
              });

              await queryClient.invalidateQueries({
                queryKey: ["forms", "detail", formId],
              });

              return true;
            } catch (error) {
              console.error(
                "Erreur lors de la sauvegarde automatique de la configuration",
                error,
              );

              return false;
            }
          }}
        />
      )}

      {configuringDependenciesFor && (
        <FormQuestionDependencyDialog
          formId={formId}
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
                "form-questions",
                formId,
                configuringDependenciesFor.section_id,
              ],
            });
          }}
        />
      )}

      {isFormImportOpen && (
        <FormImportDialog
          formId={formId}
          onClose={() => {
            setIsFormImportOpen(false);
          }}
          onImported={() => {
            void queryClient.invalidateQueries({
              queryKey: ["form-sections", formId],
            });

            void queryClient.invalidateQueries({
              queryKey: ["form-questions", formId],
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

function getStatusLabel(status: Form["status"]) {
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

function FormSectionContent({
  formId,
  section,
  deletingQuestionId,
  reordering,
  onAddQuestion,
  onDeleteQuestion,
  onReorder,
  onConfigureQuestion,
  onDependencies,
}: {
  formId: number;
  section: FormSection;
  deletingQuestionId: number | null;
  reordering: boolean;
  onAddQuestion: (existingQuestionIds: number[]) => void;
  onDeleteQuestion: (question: FormQuestion) => void;
  onReorder: (draggedId: number, targetId: number) => void;
  onConfigureQuestion: (question: FormQuestion) => void;
  onDependencies: (question: FormQuestion) => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["form-questions", formId, section.id],

    queryFn: async () => {
      const response = await formQuestionService.list(formId, section.id);

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
    <FormSectionQuestions
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

function FormSectionRow({
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
  formId,
  onAddQuestion,
  onDeleteQuestion,
  reorderingQuestions,
  onReorderQuestion,
  onConfigureQuestion,
  onDependencies,
}: {
  section: FormSection;
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
  formId: number;
  onAddQuestion: (existingQuestionIds: number[]) => void;
  onDeleteQuestion: (question: FormQuestion) => void;
  onConfigureQuestion: (question: FormQuestion) => void;
  onDependencies: (question: FormQuestion) => void;
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
        <FormSectionContent
          formId={formId}
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

function FormSectionEditRow({
  section,
  isPending,
  onCancel,
  onSave,
}: {
  section: FormSection;
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
