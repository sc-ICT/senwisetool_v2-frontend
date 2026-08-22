"use client";

import {
  QuestionCreateDialog,
  QuestionCreateFormData,
} from "@/components/form-builder/question-create-dialog";
import { QuestionDetailDialog } from "@/components/form-builder/question-detail-dialog";
import { QuestionDuplicateDialog } from "@/components/form-builder/question-duplicate-dialog";
import { QuestionGroupCreateDialog } from "@/components/form-builder/question-group-create-dialog";
import { QuestionGroupMembershipDialog } from "@/components/form-builder/question-group-membership-dialog";
import { QuestionVersionDialog } from "@/components/form-builder/question-version-dialog";
import { Header } from "@/components/layout/header";
import { ApiError } from "@/lib/api";
import { questionBankService } from "@/services/question-bank.service";
import { questionGroupService } from "@/services/question-group.service";
import { QuestionType, type QuestionDefinition } from "@/types/question-bank";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Archive,
  ChevronRight,
  Copy,
  Folder,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function QuestionBankPage() {
  const [includeArchived, setIncludeArchived] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(
    null,
  );

  const [duplicateQuestionId, setDuplicateQuestionId] = useState<number | null>(
    null,
  );

  const [versionQuestionId, setVersionQuestionId] = useState<number | null>(
    null,
  );

  const [isGroupCreateOpen, setIsGroupCreateOpen] = useState(false);

  const [includeArchivedGroups, setIncludeArchivedGroups] = useState(false);

  const [membershipQuestionId, setMembershipQuestionId] = useState<
    number | null
  >(null);

  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["question-bank", includeArchived],

    queryFn: async () => {
      const response = await questionBankService.list(includeArchived);

      return response.data;
    },
  });

  const { data: selectedQuestion, isLoading: isLoadingSelectedQuestion } =
    useQuery({
      queryKey: ["question-bank", "detail", selectedQuestionId],
      queryFn: async () => {
        if (selectedQuestionId === null) {
          throw new Error("Aucune question sélectionnée.");
        }

        const response = await questionBankService.get(selectedQuestionId);

        return response.data;
      },
      enabled: selectedQuestionId !== null,
    });

  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ["question-groups", includeArchivedGroups],

    queryFn: async () => {
      const response = await questionGroupService.list(includeArchivedGroups);

      return response.data;
    },
  });

  const groups = useMemo(() => groupsData?.items ?? [], [groupsData?.items]);

  const items = useMemo(() => data?.items ?? [], [data?.items]);

  const queryClient = useQueryClient();

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();

    let result = items;

    if (selectedGroupId !== null) {
      if (selectedGroupId === -1) {
        result = result.filter(
          (item) =>
            !groups.some((group) => group.question_ids.includes(item.id)),
        );
      } else {
        const selectedGroup = groups.find(
          (group) => group.id === selectedGroupId,
        );

        if (selectedGroup) {
          const questionIds = new Set(selectedGroup.question_ids);

          result = result.filter((item) => questionIds.has(item.id));
        }
      }
    }

    if (!query) {
      return result;
    }

    return result.filter(
      (item) =>
        item.name.toLocaleLowerCase().includes(query) ||
        item.code.toLocaleLowerCase().includes(query),
    );
  }, [items, groups, searchQuery, selectedGroupId]);

  const createMutation = useMutation({
    mutationFn: async (formData: QuestionCreateFormData) => {
      return questionBankService.create({
        definition: {
          code: formData.code,
          name: formData.name,
          description: formData.description.trim()
            ? formData.description.trim()
            : null,
        },

        version: {
          label: formData.label,
          help_text: formData.helpText.trim() ? formData.helpText.trim() : null,
          question_type: formData.questionType,
          base_config: {},
          options: formData.options.map((option, index) => ({
            value: option.value.trim(),
            label: option.label.trim(),
            position: index,
            option_metadata: {},
          })),
        },
      });
    },

    onSuccess: async () => {
      setIsCreateDialogOpen(false);

      await refetch();

      toast.success("Question créée avec succès.");
    },

    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de créer la question.";

      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      questionId,
      name,
      description,
    }: {
      questionId: number;
      name: string;
      description: string;
    }) => {
      return questionBankService.update(questionId, {
        name,
        description: description.trim() ? description.trim() : null,
      });
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["question-bank"],
      });

      toast.success("Question modifiée avec succès.");
    },

    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de modifier la question.";

      toast.error(message);
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async ({
      questionId,
      code,
      name,
      description,
    }: {
      questionId: number;
      code: string;
      name: string;
      description: string | null;
    }) => {
      return questionBankService.duplicate(questionId, {
        code,
        name,
        description,
      });
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["question-bank"],
      });

      toast.success("Question dupliquée avec succès.");
    },

    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de dupliquer la question.";

      toast.error(message);
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (questionId: number) => {
      return questionBankService.archive(questionId);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["question-bank"],
      });

      setOpenMenuId(null);

      toast.success("Question archivée avec succès.");
    },

    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible d'archiver la question.";

      toast.error(message);
    },
  });

  const createVersionMutation = useMutation({
    mutationFn: async ({
      questionId,
      payload,
    }: {
      questionId: number;
      payload: {
        label: string;
        help_text: string | null;
        question_type: QuestionType;
        base_config: Record<string, unknown>;
        options: {
          value: string;
          label: string;
        }[];
      };
    }) => {
      return questionBankService.createVersion(questionId, {
        ...payload,
        options: payload.options.map((option, index) => ({
          ...option,
          position: index,
          option_metadata: {},
        })),
      });
    },

    onSuccess: async (_response, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["question-bank"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["question-bank", "detail", variables.questionId],
      });

      toast.success("Nouvelle version créée avec succès.");
      console.log("Succes", _response);
    },

    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de créer la version.";

      toast.error(message);
      console.log("error", error);
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: async (payload: {
      name: string;
      description: string | null;
    }) => {
      return questionGroupService.create(payload);
    },

    onSuccess: async () => {
      setIsGroupCreateOpen(false);

      await queryClient.invalidateQueries({
        queryKey: ["question-groups"],
      });

      toast.success("Groupe créé avec succès.");
    },

    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de créer le groupe.";

      toast.error(message);
    },
  });

  const addQuestionToGroupMutation = useMutation({
    mutationFn: async ({
      groupId,
      questionId,
    }: {
      groupId: number;
      questionId: number;
    }) => {
      return questionGroupService.addQuestion(groupId, questionId);
    },
  });

  const removeQuestionFromGroupMutation = useMutation({
    mutationFn: async ({
      groupId,
      questionId,
    }: {
      groupId: number;
      questionId: number;
    }) => {
      return questionGroupService.removeQuestion(groupId, questionId);
    },
  });

  const updateQuestionGroupsMutation = useMutation({
    mutationFn: async ({
      questionId,
      selectedGroupIds,
      previousGroupIds,
    }: {
      questionId: number;
      selectedGroupIds: number[];
      previousGroupIds: number[];
    }) => {
      const previous = new Set(previousGroupIds);

      const selected = new Set(selectedGroupIds);

      const toAdd = selectedGroupIds.filter(
        (groupId) => !previous.has(groupId),
      );

      const toRemove = previousGroupIds.filter(
        (groupId) => !selected.has(groupId),
      );

      await Promise.all([
        ...toAdd.map((groupId) =>
          addQuestionToGroupMutation.mutateAsync({
            groupId,
            questionId,
          }),
        ),

        ...toRemove.map((groupId) =>
          removeQuestionFromGroupMutation.mutateAsync({
            groupId,
            questionId,
          }),
        ),
      ]);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["question-groups"],
      });

      toast.success("Organisation de la question mise à jour.");

      setMembershipQuestionId(null);
    },

    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de modifier les groupes.";

      toast.error(message);
    },
  });

  return (
    <>
      <Header
        title="Banque de questions"
        description="Centralisez les questions réutilisables de vos formulaires."
        actions={
          <>
            <button
              type="button"
              onClick={() => {
                setIsGroupCreateOpen(true);
              }}
              style={{
                height: "34px",
                padding: "0 0.625rem",
                borderRadius: "0.5rem",
                border: "1px solid rgba(93, 184, 58, 0.25)",
                background: "rgba(93, 184, 58, 0.08)",
                color: "#5DB83A",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              + Groupe
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
              Nouvelle question
            </button>

            <button
              type="button"
              onClick={() => {
                void refetch();
              }}
              disabled={isFetching}
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
              title="Actualiser"
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
                placeholder="Rechercher une question..."
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
                  setOpenMenuId(null);
                }}
              />
              Afficher les archivées
            </label>
          </div>

          {/* Corps */}
          {isLoading ? (
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
          ) : error ? (
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
                  color: "var(--color-foreground)",
                }}
              >
                Impossible de charger la banque
              </div>

              <div
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--color-foreground-muted)",
                  maxWidth: "520px",
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
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Réessayer
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", bottom: 30, right: 30 }}>
                {!searchQuery && (
                  <GroupFilterButton
                    label="Nombre de groupe disponible:"
                    count={items.length}
                    active={selectedGroupId === null}
                    onClick={() => {
                      setSelectedGroupId(null);
                    }}
                  />
                )}
              </div>
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
                  <Settings2 size={22} color="#5DB83A" />
                </div>

                <div
                  style={{
                    fontSize: "0.9375rem",
                    fontWeight: 600,
                    color: "var(--color-foreground)",
                  }}
                >
                  {searchQuery
                    ? "Aucun résultat"
                    : "Votre banque de questions est vide"}
                </div>

                <div
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--color-foreground-muted)",
                    maxWidth: "460px",
                  }}
                >
                  {searchQuery
                    ? `Aucune question ne correspond à « ${searchQuery} ».`
                    : "Créez votre première question pour commencer à construire vos formulaires."}
                </div>

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                    }}
                    style={{
                      marginTop: "0.25rem",
                      border: 0,
                      background: "transparent",
                      color: "#5DB83A",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Effacer la recherche
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div
                style={{
                  padding: "0.875rem 1.25rem",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "0.8125rem",
                        fontWeight: 700,
                        color: "var(--color-foreground)",
                      }}
                    >
                      Groupes
                    </div>

                    <div
                      style={{
                        marginTop: "0.2rem",
                        fontSize: "0.6875rem",
                        color: "var(--color-foreground-muted)",
                      }}
                    >
                      Organisez vos questions par thème pour les retrouver
                      facilement.
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.375rem",
                        fontSize: "0.6875rem",
                        color: "var(--color-foreground-muted)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={includeArchivedGroups}
                        onChange={(event) => {
                          setIncludeArchivedGroups(event.target.checked);
                        }}
                      />
                      Groupes Archivés
                    </label>
                  </div>
                </div>

                {groupsLoading ? (
                  <div
                    style={{
                      padding: "1rem 0",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <Loader2 size={18} className="animate-spin" />
                  </div>
                ) : groups.length === 0 ? (
                  <div
                    style={{
                      marginTop: "0.75rem",
                      padding: "0.875rem",
                      border: "1px dashed var(--color-border)",
                      borderRadius: "0.625rem",
                      fontSize: "0.75rem",
                      color: "var(--color-foreground-muted)",
                    }}
                  >
                    Aucun groupe créé.
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginTop: "0.75rem",
                      overflowX: "auto",
                      paddingBottom: "0.25rem",
                    }}
                  >
                    <GroupFilterButton
                      label="Toutes"
                      count={items.length}
                      active={selectedGroupId === null}
                      onClick={() => {
                        setSelectedGroupId(null);
                      }}
                    />

                    <GroupFilterButton
                      label="Sans groupe"
                      count={
                        items.filter((item) =>
                          groups.every(
                            (group) => !group.question_ids.includes(item.id),
                          ),
                        ).length
                      }
                      active={selectedGroupId === -1}
                      onClick={() => {
                        setSelectedGroupId(-1);
                      }}
                    />

                    {groups.map((group) => (
                      <GroupFilterButton
                        key={group.id}
                        label={group.name}
                        count={group.question_ids.length}
                        active={selectedGroupId === group.id}
                        onClick={() => {
                          setSelectedGroupId(group.id);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {selectedGroupId !== null && (
                <div
                  style={{
                    padding: "0.625rem 1.25rem",
                    background: "var(--color-surface-raised)",
                    borderBottom: "1px solid var(--color-border)",
                    fontSize: "0.6875rem",
                    color: "var(--color-foreground-muted)",
                  }}
                >
                  {selectedGroupId === -1
                    ? "Questions sans groupe"
                    : `Groupe : ${
                        groups.find((group) => group.id === selectedGroupId)
                          ?.name ?? ""
                      }`}
                </div>
              )}

              {/* En-tête */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(280px, 1fr) 180px 120px 48px",
                  gap: "1rem",
                  padding: "0.75rem 1.25rem",
                  borderBottom: "1px solid var(--color-border)",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "var(--color-foreground-muted)",
                }}
              >
                <div>Question</div>
                <div>Type</div>
                <div>Statut</div>
                <div />
              </div>

              {filteredItems.map((item) => (
                <QuestionRow
                  key={item.id}
                  item={item}
                  menuOpen={openMenuId === item.id}
                  onToggleMenu={() => {
                    setOpenMenuId((current) =>
                      current === item.id ? null : item.id,
                    );
                  }}
                  onViewDetails={() => {
                    setOpenMenuId(null);
                    setSelectedQuestionId(item.id);
                  }}
                  onDuplicate={() => {
                    setOpenMenuId(null);
                    setDuplicateQuestionId(item.id);
                  }}
                  onManageGroups={() => {
                    setOpenMenuId(null);
                    setMembershipQuestionId(item.id);
                  }}
                  onArchive={() => {
                    setOpenMenuId(null);
                    archiveMutation.mutate(item.id);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {isCreateDialogOpen && (
        <QuestionCreateDialog
          isPending={createMutation.isPending}
          onClose={() => {
            if (!createMutation.isPending) {
              setIsCreateDialogOpen(false);
            }
          }}
          onSubmit={(formData) => {
            createMutation.mutate(formData);
          }}
        />
      )}

      {selectedQuestionId !== null && selectedQuestion && (
        <QuestionDetailDialog
          question={selectedQuestion}
          isLoading={isLoadingSelectedQuestion}
          isSaving={updateMutation.isPending}
          onClose={() => {
            setSelectedQuestionId(null);
          }}
          onSave={async ({ name, description }) => {
            await updateMutation.mutateAsync({
              questionId: selectedQuestionId!,
              name,
              description,
            });
          }}
          onCreateVersion={() => {
            setVersionQuestionId(selectedQuestion.id);
          }}
        />
      )}

      {duplicateQuestionId !== null &&
        (() => {
          const question = items.find(
            (item) => item.id === duplicateQuestionId,
          );

          if (!question) {
            return null;
          }

          return (
            <QuestionDuplicateDialog
              question={question}
              isPending={duplicateMutation.isPending}
              onClose={() => {
                if (!duplicateMutation.isPending) {
                  setDuplicateQuestionId(null);
                }
              }}
              onSubmit={(data) => {
                duplicateMutation.mutate(
                  {
                    questionId: question.id,
                    code: data.code,
                    name: data.name,
                    description: data.description,
                  },
                  {
                    onSuccess: () => {
                      setDuplicateQuestionId(null);
                    },
                  },
                );
              }}
            />
          );
        })()}

      {versionQuestionId !== null &&
        selectedQuestion &&
        versionQuestionId === selectedQuestion.id && (
          <QuestionVersionDialog
            currentVersion={{
              label: selectedQuestion.versions.at(-1)?.label ?? "",
              help_text: selectedQuestion.versions.at(-1)?.help_text ?? null,
              question_type:
                selectedQuestion.versions.at(-1)?.question_type ?? "TEXT",
              base_config: selectedQuestion.versions.at(-1)?.base_config ?? {},
              options: selectedQuestion.versions.at(-1)?.options ?? [],
            }}
            isPending={createVersionMutation.isPending}
            onClose={() => {
              if (!createVersionMutation.isPending) {
                setVersionQuestionId(null);
              }
            }}
            onSubmit={(payload) => {
              createVersionMutation.mutate(
                {
                  questionId: selectedQuestion.id,
                  payload,
                },
                {
                  onSuccess: () => {
                    setVersionQuestionId(null);

                    setSelectedQuestionId(selectedQuestion.id);
                  },
                },
              );
            }}
          />
        )}

      {membershipQuestionId !== null &&
        (() => {
          const question = items.find(
            (item) => item.id === membershipQuestionId,
          );

          if (!question) {
            return null;
          }

          const currentGroupIds = groups
            .filter((group) => group.question_ids.includes(question.id))
            .map((group) => group.id);

          return (
            <QuestionGroupMembershipDialog
              questionName={question.name}
              groups={groups.map((group) => ({
                id: group.id,
                name: group.name,
                selected: currentGroupIds.includes(group.id),
              }))}
              isPending={updateQuestionGroupsMutation.isPending}
              onClose={() => {
                if (!updateQuestionGroupsMutation.isPending) {
                  setMembershipQuestionId(null);
                }
              }}
              onSubmit={(selectedGroupIds, previousGroupIds) => {
                updateQuestionGroupsMutation.mutate({
                  questionId: question.id,
                  selectedGroupIds,
                  previousGroupIds,
                });
              }}
            />
          );
        })()}

      {isGroupCreateOpen && (
        <QuestionGroupCreateDialog
          isPending={createGroupMutation.isPending}
          onClose={() => {
            if (!createGroupMutation.isPending) {
              setIsGroupCreateOpen(false);
            }
          }}
          onSubmit={(data) => {
            createGroupMutation.mutate(data);
          }}
        />
      )}
    </>
  );
}

function QuestionRow({
  item,
  menuOpen,
  onToggleMenu,
  onViewDetails,
  onDuplicate,
  onArchive,
  onManageGroups,
}: {
  item: QuestionDefinition;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onViewDetails: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onManageGroups: () => void;
}) {
  return (
    <div
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "minmax(280px, 1fr) 180px 120px 48px",
        gap: "1rem",
        alignItems: "center",
        padding: "0.875rem 1.25rem",
        borderBottom: "1px solid var(--color-border)",
        transition: "background 0.15s ease",
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
            border: "1px solid rgba(93, 184, 58, 0.15)",
            color: "#5DB83A",
          }}
        >
          <Settings2 size={17} />
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
            {item.name}
          </div>

          <div
            style={{
              marginTop: "0.125rem",
              fontSize: "0.6875rem",
              color: "var(--color-foreground-muted)",
            }}
          >
            {item.code}
          </div>
        </div>
      </div>

      <div
        style={{
          fontSize: "0.75rem",
          color: "var(--color-foreground-muted)",
        }}
      >
        {item.question_type ? getQuestionTypeLabel(item.question_type) : "—"}
      </div>

      <div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            height: "24px",
            padding: "0 0.5rem",
            borderRadius: "999px",
            background:
              item.status === "ACTIVE"
                ? "rgba(93, 184, 58, 0.1)"
                : "rgba(148, 163, 184, 0.1)",
            color:
              item.status === "ACTIVE"
                ? "#5DB83A"
                : "var(--color-foreground-muted)",
            fontSize: "0.6875rem",
            fontWeight: 600,
          }}
        >
          {item.status === "ACTIVE" ? "Active" : "Archivée"}
        </span>
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
          aria-label={`Actions pour ${item.name}`}
        >
          <MoreVertical size={17} />
        </button>

        {menuOpen && (
          <QuestionContextMenu
            onViewDetails={onViewDetails}
            onDuplicate={onDuplicate}
            onArchive={onArchive}
            onManageGroups={onManageGroups}
          />
        )}
      </div>
    </div>
  );
}

function QuestionContextMenu({
  onViewDetails,
  onDuplicate,
  onManageGroups,
  onArchive,
}: {
  onViewDetails: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onManageGroups: () => void;
}) {
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
      <MenuButton
        icon={ChevronRight}
        label="Voir les détails"
        onClick={onViewDetails}
      />

      <MenuButton
        icon={Pencil}
        label="Modifier"
        onClick={() => {
          toast.info("Modification à l'étape suivante.");
        }}
      />

      <MenuButton icon={Copy} label="Dupliquer" onClick={onDuplicate} />

      <MenuButton icon={Folder} label="Organiser" onClick={onManageGroups} />

      <div
        style={{
          height: "1px",
          margin: "0.375rem 0",
          background: "var(--color-border)",
        }}
      />

      <MenuButton icon={Archive} label="Archiver" onClick={onArchive} />
    </div>
  );
}

function MenuButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Pencil;
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
        padding: "0 0.625rem",
        border: 0,
        borderRadius: "0.5rem",
        background: "transparent",
        color: "var(--color-foreground)",
        display: "flex",
        alignItems: "center",
        gap: "0.625rem",
        fontSize: "0.8125rem",
        fontWeight: 500,
        textAlign: "left",
        cursor: "pointer",
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

function getQuestionTypeLabel(type: QuestionType): string {
  const labels: Record<QuestionType, string> = {
    TEXT: "Texte",
    LONG_TEXT: "Texte long",
    EMAIL: "E-mail",
    PHONE: "Téléphone",
    URL: "URL",
    ADDRESS: "Adresse",
    INTEGER: "Nombre entier",
    DECIMAL: "Nombre décimal",
    PERCENTAGE: "Pourcentage",
    CURRENCY: "Monnaie",
    SINGLE_CHOICE: "Choix unique",
    MULTIPLE_CHOICE: "Choix multiple",
    DROPDOWN: "Liste",
    AUTOCOMPLETE: "Recherche",
    RATING: "Évaluation",
    LIKERT_SCALE: "Échelle",
    RANKING: "Classement",
    DATE: "Date",
    TIME: "Heure",
    DATETIME: "Date + heure",
    DURATION: "Durée",
    POINT: "Point GPS",
    LINE: "Ligne",
    POLYGON: "Polygone",
    AREA: "Zone",
    PHOTO: "Photo",
    VIDEO: "Vidéo",
    AUDIO: "Audio",
    FILE: "Fichier",
    SIGNATURE: "Signature",
    QR_CODE: "QR Code",
    BARCODE: "Code-barres",
    ENTITY_SELECT: "Sélection d'entité",
    ENTITY_SEARCH: "Recherche d'entité",
    CALCULATION: "Calcul",
    NOTE: "Note",
    CONSENT: "Consentement",
    HIDDEN: "Champ caché",
  };

  return labels[type];
}

function GroupFilterButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flexShrink: 0,
        height: "34px",
        padding: "0 0.7rem",
        borderRadius: "999px",
        border: active
          ? "1px solid rgba(93, 184, 58, 0.3)"
          : "1px solid var(--color-border)",
        background: active
          ? "rgba(93, 184, 58, 0.1)"
          : "var(--color-surface-raised)",
        color: active ? "#5DB83A" : "var(--color-foreground-muted)",
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        fontSize: "0.6875rem",
        fontWeight: active ? 600 : 500,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {label}

      <span
        style={{
          opacity: 0.7,
        }}
      >
        {count}
      </span>
    </button>
  );
}
