"use client";

import { ApiError } from "@/lib/api";
import { agentService } from "@/services/agent.service";
import { fileSystemService } from "@/services/file-system.service";
import { projectAgentAssignmentService } from "@/services/project-agent-assignment.service";
import type { Agent } from "@/types/agent";
import type { ProjectAgentAssignment } from "@/types/project-agent-assignment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FileUp,
  FolderOpen,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { ChangeEvent, useMemo, useState } from "react";
import { toast } from "sonner";

interface ProjectAgentsSectionProps {
  projectId: number;
  projectFolderId: number | null;
}

const ROLE_LABELS: Record<Agent["role"], string> = {
  COLLECTOR: "Collecteur",
  INSPECTOR: "Inspecteur",
};

const STATUS_LABELS: Record<Agent["status"], string> = {
  ACTIVE: "Actif",
  SUSPENDED: "Suspendu",
  DEACTIVATED: "Désactivé",
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export function ProjectAgentsSection({
  projectId,
  projectFolderId,
}: ProjectAgentsSectionProps) {
  const queryClient = useQueryClient();

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);

  const [selectedZoneIds, setSelectedZoneIds] = useState<number[]>([]);

  const [uploadFiles, setUploadFiles] = useState<File[]>([]);

  const [uploadTargetAssignmentId, setUploadTargetAssignmentId] = useState<
    number | null
  >(null);

  const [zoneTargetAssignmentId, setZoneTargetAssignmentId] = useState<
    number | null
  >(null);

  const [zoneIdsToAdd, setZoneIdsToAdd] = useState<number[]>([]);

  const [removingZoneKey, setRemovingZoneKey] = useState<string | null>(null);

  /* ====================================================================== */
  /* AGENTS                                                                  */
  /* ====================================================================== */

  const { data: agentsData, isLoading: isAgentsLoading } = useQuery({
    queryKey: ["agents"],

    queryFn: async () => {
      const response = await agentService.list();

      return response.data;
    },
  });

  const agents = useMemo(() => agentsData?.items ?? [], [agentsData]);

  /* ====================================================================== */
  /* AFFECTATIONS                                                            */
  /* ====================================================================== */

  const {
    data: assignmentsData,
    isLoading: isAssignmentsLoading,
    isFetching: isAssignmentsFetching,
    error: assignmentsError,
    refetch: refetchAssignments,
  } = useQuery({
    queryKey: ["project-agent-assignments", projectId],

    queryFn: async () => {
      const response = await projectAgentAssignmentService.list(projectId);

      return response.data;
    },

    enabled: Number.isFinite(projectId),
  });

  const assignments = useMemo(
    () => assignmentsData?.items ?? [],
    [assignmentsData],
  );

  const assignedAgentIds = useMemo(
    () => new Set(assignments.map((assignment) => assignment.agent_id)),
    [assignments],
  );

  const availableAgents = useMemo(
    () =>
      agents.filter(
        (agent) => agent.status === "ACTIVE" && !assignedAgentIds.has(agent.id),
      ),
    [agents, assignedAgentIds],
  );

  /* ====================================================================== */
  /* DOSSIER ZONES                                                           */
  /* ====================================================================== */

  const {
    data: projectFolderChildrenData,
    isLoading: isProjectFolderChildrenLoading,
  } = useQuery({
    queryKey: ["project-agent-zones-folder", projectFolderId],

    queryFn: async () => {
      if (projectFolderId === null) {
        return {
          items: [],
          count: 0,
        };
      }

      const response = await fileSystemService.listChildren(projectFolderId);

      return response.data;
    },

    enabled: projectFolderId !== null,
  });

  const zonesFolder = useMemo(() => {
    const items = projectFolderChildrenData?.items ?? [];

    return (
      items.find(
        (item) =>
          item.type === "FOLDER" && item.name.toLocaleLowerCase() === "zones",
      ) ?? null
    );
  }, [projectFolderChildrenData]);

  const { data: zonesData, isLoading: isZonesLoading } = useQuery({
    queryKey: ["project-agent-zone-files", zonesFolder?.id],

    queryFn: async () => {
      if (zonesFolder === null) {
        return {
          items: [],
          count: 0,
        };
      }

      const response = await fileSystemService.listChildren(zonesFolder.id);

      return response.data;
    },

    enabled: zonesFolder !== null,
  });

  const zoneFiles = useMemo(
    () =>
      (zonesData?.items ?? []).filter(
        (file) =>
          file.type === "FILE" &&
          (file.name.toLocaleLowerCase().endsWith(".kml") ||
            file.name.toLocaleLowerCase().endsWith(".geojson")),
      ),
    [zonesData],
  );

  /* ====================================================================== */
  /* INVALIDATION                                                            */
  /* ====================================================================== */

  const invalidateAssignmentQueries = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["project-agent-assignments", projectId],
    });

    await queryClient.invalidateQueries({
      queryKey: ["project-agent-zones-folder", projectFolderId],
    });

    if (zonesFolder) {
      await queryClient.invalidateQueries({
        queryKey: ["project-agent-zone-files", zonesFolder.id],
      });
    }

    await queryClient.invalidateQueries({
      queryKey: ["project-files", projectFolderId],
    });

    await queryClient.invalidateQueries({
      queryKey: ["files", projectFolderId],
    });
  };

  /* ====================================================================== */
  /* CRÉATION AFFECTATION                                                    */
  /* ====================================================================== */

  const createAssignmentMutation = useMutation({
    mutationFn: async () => {
      if (selectedAgentId === null) {
        throw new Error("Sélectionnez un agent.");
      }

      return projectAgentAssignmentService.create(projectId, {
        agent_id: selectedAgentId,
        zone_file_ids: selectedZoneIds,
      });
    },

    onSuccess: async () => {
      await invalidateAssignmentQueries();

      setSelectedAgentId(null);
      setSelectedZoneIds([]);
      setIsCreateOpen(false);

      toast.success("Agent affecté au projet avec succès.");
    },

    onError: (error) => {
      toast.error(
        getErrorMessage(error, "Impossible d'affecter l'agent au projet."),
      );
    },
  });

  /* ====================================================================== */
  /* AJOUT ZONES EXISTANTES                                                  */
  /* ====================================================================== */

  const addExistingZonesMutation = useMutation({
    mutationFn: async ({
      assignmentId,
      zoneFileIds,
    }: {
      assignmentId: number;
      zoneFileIds: number[];
    }) => {
      return projectAgentAssignmentService.addExistingZones(
        projectId,
        assignmentId,
        {
          zone_file_ids: zoneFileIds,
        },
      );
    },

    onSuccess: async () => {
      await invalidateAssignmentQueries();

      setZoneTargetAssignmentId(null);
      setZoneIdsToAdd([]);

      toast.success("Zone(s) ajoutée(s) à l'affectation.");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, "Impossible d'ajouter les zones."));
    },
  });

  /* ====================================================================== */
  /* UPLOAD ZONES                                                            */
  /* ====================================================================== */

  const uploadZonesMutation = useMutation({
    mutationFn: async ({
      assignmentId,
      files,
    }: {
      assignmentId: number;
      files: File[];
    }) => {
      return projectAgentAssignmentService.uploadZones(
        projectId,
        assignmentId,
        files,
      );
    },

    onSuccess: async () => {
      await invalidateAssignmentQueries();

      setUploadTargetAssignmentId(null);
      setUploadFiles([]);

      toast.success("Zone(s) KML / GeoJSON importée(s) avec succès.");
    },

    onError: (error) => {
      toast.error(
        getErrorMessage(
          error,
          "Impossible d'importer les zones KML / GeoJSON.",
        ),
      );
    },
  });

  /* ====================================================================== */
  /* SUPPRESSION ZONE DE L'AFFECTATION                                       */
  /* ====================================================================== */

  const removeZoneMutation = useMutation({
    mutationFn: async ({
      assignmentId,
      zoneId,
    }: {
      assignmentId: number;
      zoneId: number;
    }) => {
      return projectAgentAssignmentService.removeZone(
        projectId,
        assignmentId,
        zoneId,
      );
    },

    onSuccess: async () => {
      await invalidateAssignmentQueries();

      toast.success("Zone retirée de l'affectation.");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, "Impossible de retirer la zone."));
    },

    onSettled: () => {
      setRemovingZoneKey(null);
    },
  });

  /* ====================================================================== */
  /* SUPPRESSION AFFECTATION                                                 */
  /* ====================================================================== */

  const deleteAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: number) => {
      return projectAgentAssignmentService.delete(projectId, assignmentId);
    },

    onSuccess: async () => {
      await invalidateAssignmentQueries();

      toast.success("Affectation supprimée avec succès.");
    },

    onError: (error) => {
      toast.error(
        getErrorMessage(error, "Impossible de supprimer l'affectation."),
      );
    },
  });

  /* ====================================================================== */
  /* HANDLERS                                                                */
  /* ====================================================================== */

  const toggleCreateZone = (zoneId: number) => {
    setSelectedZoneIds((currentIds) => {
      if (currentIds.includes(zoneId)) {
        return currentIds.filter((id) => id !== zoneId);
      }

      return [...currentIds, zoneId];
    });
  };

  const toggleExistingZone = (zoneId: number) => {
    setZoneIdsToAdd((currentIds) => {
      if (currentIds.includes(zoneId)) {
        return currentIds.filter((id) => id !== zoneId);
      }

      return [...currentIds, zoneId];
    });
  };

  const handleUploadChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    const invalidFiles = files.filter(
      (file) =>
        !file.name.toLocaleLowerCase().endsWith(".kml") &&
        !file.name.toLocaleLowerCase().endsWith(".geojson"),
    );

    if (invalidFiles.length > 0) {
      toast.error("Seuls les fichiers .kml et .geojson sont autorisés.");
      event.target.value = "";
      return;
    }

    setUploadFiles(files);
  };

  const handleDeleteAssignment = (assignment: ProjectAgentAssignment) => {
    const confirmed = window.confirm(
      `Voulez-vous retirer l'agent « ${assignment.agent.full_name} » de ce projet ?`,
    );

    if (!confirmed) {
      return;
    }

    deleteAssignmentMutation.mutate(assignment.id);
  };

  const handleRemoveZone = (
    assignment: ProjectAgentAssignment,
    zoneId: number,
    zoneName: string,
  ) => {
    const confirmed = window.confirm(
      `Voulez-vous retirer « ${zoneName} » de l'affectation de ${assignment.agent.full_name} ?`,
    );

    if (!confirmed) {
      return;
    }

    const zoneKey = `${assignment.id}:${zoneId}`;

    setRemovingZoneKey(zoneKey);

    removeZoneMutation.mutate({
      assignmentId: assignment.id,
      zoneId,
    });
  };

  /* ====================================================================== */
  /* RENDU                                                                   */
  /* ====================================================================== */

  return (
    <>
      <section
        style={{
          marginBottom: "1.5rem",
          border: "1px solid var(--color-border)",
          borderRadius: "1rem",
          background: "var(--color-surface)",
          overflow: "hidden",
        }}
      >
        {/* ================================================================ */}
        {/* HEADER                                                            */}
        {/* ================================================================ */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            padding: "1rem 1.25rem",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
            }}
          >
            <Users size={17} />

            <div>
              <div
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 700,
                }}
              >
                Agents affectés
              </div>

              <div
                style={{
                  marginTop: "0.2rem",
                  fontSize: "0.7rem",
                  color: "var(--color-foreground-muted)",
                }}
              >
                {assignments.length} agent
                {assignments.length !== 1 ? "s" : ""} affecté
                {assignments.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

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
                void refetchAssignments();
              }}
              disabled={isAssignmentsFetching}
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
                cursor: isAssignmentsFetching ? "not-allowed" : "pointer",
                opacity: isAssignmentsFetching ? 0.6 : 1,
              }}
            >
              {isAssignmentsFetching ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedAgentId(null);
                setSelectedZoneIds([]);
                setIsCreateOpen(true);
              }}
              disabled={availableAgents.length === 0}
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
                cursor:
                  availableAgents.length === 0 ? "not-allowed" : "pointer",
                opacity: availableAgents.length === 0 ? 0.5 : 1,
              }}
            >
              <UserPlus size={15} />
              Affecter un agent
            </button>
          </div>
        </div>

        {/* ================================================================ */}
        {/* CONTENU                                                           */}
        {/* ================================================================ */}

        {isAssignmentsLoading ? (
          <div
            style={{
              minHeight: "140px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Loader2 size={22} className="animate-spin" />
          </div>
        ) : assignmentsError ? (
          <div
            style={{
              padding: "1.25rem",
              color: "var(--color-foreground-muted)",
              fontSize: "0.8125rem",
            }}
          >
            <div style={{ marginBottom: "0.75rem" }}>
              Impossible de récupérer les affectations.
            </div>

            <button
              type="button"
              onClick={() => {
                void refetchAssignments();
              }}
              style={{
                height: "34px",
                padding: "0 0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid var(--color-border)",
                background: "var(--color-surface-raised)",
                cursor: "pointer",
                fontSize: "0.75rem",
              }}
            >
              Réessayer
            </button>
          </div>
        ) : assignments.length === 0 ? (
          <div
            style={{
              padding: "2rem 1.25rem",
              textAlign: "center",
              color: "var(--color-foreground-muted)",
            }}
          >
            <Users
              size={28}
              style={{
                margin: "0 auto 0.75rem",
                opacity: 0.5,
              }}
            />

            <div
              style={{
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "var(--color-foreground)",
              }}
            >
              Aucun agent affecté
            </div>

            <div
              style={{
                marginTop: "0.35rem",
                fontSize: "0.75rem",
              }}
            >
              Affectez un agent à ce projet pour commencer.
            </div>
          </div>
        ) : (
          <div>
            {assignments.map((assignment) => (
              <AssignmentRow
                key={assignment.id}
                assignment={assignment}
                onAddExistingZones={() => {
                  setZoneTargetAssignmentId(assignment.id);
                  setZoneIdsToAdd([]);
                }}
                onUpload={() => {
                  setUploadTargetAssignmentId(assignment.id);
                  setUploadFiles([]);
                }}
                onRemoveZone={(zoneId, zoneName) => {
                  handleRemoveZone(assignment, zoneId, zoneName);
                }}
                onDelete={() => {
                  handleDeleteAssignment(assignment);
                }}
                removingZoneKey={removingZoneKey}
                isDeleting={deleteAssignmentMutation.isPending}
              />
            ))}
          </div>
        )}
      </section>

      {/* ================================================================== */}
      {/* DIALOG : CRÉATION                                                   */}
      {/* ================================================================== */}

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-background shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold">Affecter un agent</h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Sélectionnez un agent et, si nécessaire, les zones KML ou
                  GeoJSON à lui attribuer.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!createAssignmentMutation.isPending) {
                    setIsCreateOpen(false);
                  }
                }}
                disabled={createAssignmentMutation.isPending}
                className="rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-6">
              {/* Agent ---------------------------------------------------- */}

              <div className="space-y-2">
                <label htmlFor="project-agent" className="text-sm font-medium">
                  Agent
                </label>

                <select
                  id="project-agent"
                  value={selectedAgentId ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;

                    setSelectedAgentId(value ? Number(value) : null);
                  }}
                  disabled={
                    createAssignmentMutation.isPending || isAgentsLoading
                  }
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none"
                >
                  <option value="">Sélectionner un agent...</option>

                  {availableAgents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.full_name} — {ROLE_LABELS[agent.role]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Zones ---------------------------------------------------- */}

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Zones de collecte</p>

                    <p className="text-xs text-muted-foreground">
                      Facultatif. Vous pouvez également les ajouter plus tard.
                    </p>
                  </div>

                  <span className="text-xs text-muted-foreground">
                    {selectedZoneIds.length} sélectionnée
                    {selectedZoneIds.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {isProjectFolderChildrenLoading || isZonesLoading ? (
                  <div className="flex items-center justify-center rounded-lg border p-8">
                    <Loader2 className="animate-spin" size={20} />
                  </div>
                ) : zoneFiles.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-5 text-center">
                    <FolderOpen size={24} className="mx-auto mb-2 opacity-50" />

                    <p className="text-sm font-medium">
                      Aucune zone KML / GeoJSON disponible
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Vous pourrez importer une zone après avoir créé
                      l&#39;affectation.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border p-2">
                    {zoneFiles.map((file) => (
                      <label
                        key={file.id}
                        className="flex cursor-pointer items-center gap-3 rounded-md p-3 transition hover:bg-muted"
                      >
                        <input
                          type="checkbox"
                          checked={selectedZoneIds.includes(file.id)}
                          onChange={() => {
                            toggleCreateZone(file.id);
                          }}
                          disabled={createAssignmentMutation.isPending}
                        />

                        <FileUp size={16} className="shrink-0" />

                        <span className="truncate text-sm">{file.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setIsCreateOpen(false);
                }}
                disabled={createAssignmentMutation.isPending}
                className="rounded-md border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={() => {
                  createAssignmentMutation.mutate();
                }}
                disabled={
                  createAssignmentMutation.isPending || selectedAgentId === null
                }
                className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition disabled:pointer-events-none disabled:opacity-50"
                style={{
                  background: "#5DB83A",
                }}
              >
                {createAssignmentMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Affectation...
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    Affecter
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* DIALOG : ZONES EXISTANTES                                           */}
      {/* ================================================================== */}

      {zoneTargetAssignmentId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-xl bg-background shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold">Ajouter des zones</h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Sélectionnez les zones KML / GeoJSON déjà présentes dans ce
                  projet.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!addExistingZonesMutation.isPending) {
                    setZoneTargetAssignmentId(null);
                  }
                }}
                disabled={addExistingZonesMutation.isPending}
                className="rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-6">
              {zoneFiles.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center">
                  <FolderOpen size={26} className="mx-auto mb-2 opacity-50" />

                  <p className="text-sm font-medium">
                    Aucune zone KML / GeoJSON disponible
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Importez d&#39;abord une nouvelle zone KML ou GeoJSON.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {zoneFiles.map((file) => (
                    <label
                      key={file.id}
                      className="flex cursor-pointer items-center gap-3 rounded-md border p-3 transition hover:bg-muted"
                    >
                      <input
                        type="checkbox"
                        checked={zoneIdsToAdd.includes(file.id)}
                        onChange={() => {
                          toggleExistingZone(file.id);
                        }}
                        disabled={addExistingZonesMutation.isPending}
                      />

                      <FileUp size={16} className="shrink-0" />

                      <span className="truncate text-sm">{file.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setZoneTargetAssignmentId(null);
                }}
                disabled={addExistingZonesMutation.isPending}
                className="rounded-md border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={() => {
                  if (zoneTargetAssignmentId === null) {
                    return;
                  }

                  addExistingZonesMutation.mutate({
                    assignmentId: zoneTargetAssignmentId,
                    zoneFileIds: zoneIdsToAdd,
                  });
                }}
                disabled={
                  addExistingZonesMutation.isPending ||
                  zoneIdsToAdd.length === 0
                }
                className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition disabled:pointer-events-none disabled:opacity-50"
                style={{
                  background: "#5DB83A",
                }}
              >
                {addExistingZonesMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Ajout...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Ajouter
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* DIALOG : UPLOAD KML / GEOJSON                                                  */}
      {/* ================================================================== */}

      {uploadTargetAssignmentId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex w-full max-w-xl flex-col overflow-hidden rounded-xl bg-background shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold">
                  Importer une zone KML ou GeoJSON
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Les fichiers seront ajoutés au dossier « zones » du projet.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!uploadZonesMutation.isPending) {
                    setUploadTargetAssignmentId(null);
                  }
                }}
                disabled={uploadZonesMutation.isPending}
                className="rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <label
                htmlFor="project-zone-upload"
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center transition hover:bg-muted"
              >
                <Upload size={28} className="mb-3 opacity-60" />

                <span className="text-sm font-medium">
                  Sélectionner des fichiers KML ou GeoJSON
                </span>

                <span className="mt-1 text-xs text-muted-foreground">
                  Seuls les fichiers .kml et .geojson sont acceptés
                </span>

                <input
                  id="project-zone-upload"
                  type="file"
                  accept=".kml,application/vnd.google-earth.kml+xml,.geojson,application/geo+json"
                  multiple
                  onChange={handleUploadChange}
                  disabled={uploadZonesMutation.isPending}
                  className="hidden"
                />
              </label>

              {uploadFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Fichiers sélectionnés</p>

                  {uploadFiles.map((file) => (
                    <div
                      key={`${file.name}-${file.size}-${file.lastModified}`}
                      className="flex items-center gap-2 rounded-md border p-3"
                    >
                      <FileUp size={15} />

                      <span className="truncate text-sm">{file.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setUploadTargetAssignmentId(null);
                }}
                disabled={uploadZonesMutation.isPending}
                className="rounded-md border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={() => {
                  if (
                    uploadTargetAssignmentId === null ||
                    uploadFiles.length === 0
                  ) {
                    return;
                  }

                  uploadZonesMutation.mutate({
                    assignmentId: uploadTargetAssignmentId,
                    files: uploadFiles,
                  });
                }}
                disabled={
                  uploadZonesMutation.isPending || uploadFiles.length === 0
                }
                className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition disabled:pointer-events-none disabled:opacity-50"
                style={{
                  background: "#5DB83A",
                }}
              >
                {uploadZonesMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Import...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Importer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ========================================================================== */
/* LIGNE AFFECTATION                                                          */
/* ========================================================================== */

interface AssignmentRowProps {
  assignment: ProjectAgentAssignment;
  onAddExistingZones: () => void;
  onUpload: () => void;
  onRemoveZone: (zoneId: number, zoneName: string) => void;
  onDelete: () => void;
  removingZoneKey: string | null;
  isDeleting: boolean;
}

function AssignmentRow({
  assignment,
  onAddExistingZones,
  onUpload,
  onRemoveZone,
  onDelete,
  removingZoneKey,
  isDeleting,
}: AssignmentRowProps) {
  return (
    <div
      style={{
        padding: "1rem 1.25rem",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      {/* Agent ------------------------------------------------------------ */}

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              borderRadius: "50%",
              background: "var(--color-surface-raised)",
              border: "1px solid var(--color-border)",
            }}
          >
            <Users size={17} />
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: "0.8125rem",
                fontWeight: 700,
              }}
            >
              {assignment.agent.full_name}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginTop: "0.25rem",
                fontSize: "0.7rem",
                color: "var(--color-foreground-muted)",
              }}
            >
              <span>{ROLE_LABELS[assignment.agent.role]}</span>

              <span>•</span>

              <span>{STATUS_LABELS[assignment.agent.status]}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          title="Supprimer l'affectation"
          style={{
            width: "34px",
            height: "34px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            borderRadius: "0.5rem",
            border: "1px solid var(--color-border)",
            background: "var(--color-surface-raised)",
            color: "var(--color-foreground-muted)",
            cursor: isDeleting ? "not-allowed" : "pointer",
            opacity: isDeleting ? 0.5 : 1,
          }}
        >
          {isDeleting ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Trash2 size={15} />
          )}
        </button>
      </div>

      {/* Zones ------------------------------------------------------------ */}

      <div
        style={{
          marginTop: "1rem",
          paddingLeft: "2.75rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            marginBottom: "0.5rem",
          }}
        >
          <div
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              color: "var(--color-foreground-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Zones
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
            }}
          >
            <button
              type="button"
              onClick={onAddExistingZones}
              style={{
                height: "30px",
                padding: "0 0.625rem",
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                borderRadius: "0.5rem",
                border: "1px solid var(--color-border)",
                background: "var(--color-surface-raised)",
                color: "var(--color-foreground)",
                fontSize: "0.7rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Plus size={13} />
              Existante
            </button>

            <button
              type="button"
              onClick={onUpload}
              style={{
                height: "30px",
                padding: "0 0.625rem",
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                borderRadius: "0.5rem",
                border: "1px solid rgba(93, 184, 58, 0.25)",
                background: "rgba(93, 184, 58, 0.1)",
                color: "#5DB83A",
                fontSize: "0.7rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Upload size={13} />
              Importer
            </button>
          </div>
        </div>

        {assignment.zones.length === 0 ? (
          <div
            style={{
              padding: "0.75rem",
              borderRadius: "0.5rem",
              border: "1px dashed var(--color-border)",
              color: "var(--color-foreground-muted)",
              fontSize: "0.75rem",
            }}
          >
            Aucune zone affectée.
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            {assignment.zones.map((zone) => {
              const zoneKey = `${assignment.id}:${zone.id}`;
              const isRemovingThisZone = removingZoneKey === zoneKey;

              return (
                <div
                  key={zone.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    maxWidth: "100%",
                    padding: "0.45rem 0.625rem",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface-raised)",
                  }}
                >
                  <FileUp
                    size={14}
                    style={{
                      flexShrink: 0,
                    }}
                  />

                  <span
                    style={{
                      maxWidth: "260px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontSize: "0.72rem",
                    }}
                  >
                    {zone.file_name}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      onRemoveZone(zone.id, zone.file_name);
                    }}
                    disabled={removingZoneKey !== null}
                    title="Retirer cette zone"
                    style={{
                      width: "22px",
                      height: "22px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      border: "none",
                      background: "transparent",
                      color: "var(--color-foreground-muted)",
                      cursor:
                        removingZoneKey !== null ? "not-allowed" : "pointer",
                      opacity: removingZoneKey !== null ? 0.5 : 1,
                    }}
                  >
                    {isRemovingThisZone ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <X size={13} />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
