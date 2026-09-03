import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/common";
import type {
  ProjectAgentAssignment,
  ProjectAgentAssignmentAddZones,
  ProjectAgentAssignmentCreate,
  ProjectAgentAssignmentListResponse,
} from "@/types/project-agent-assignment";

export const projectAgentAssignmentService = {
  /**
   * Liste les agents affectés à un projet.
   */
  async list(
    projectId: number,
  ): Promise<ApiResponse<ProjectAgentAssignmentListResponse>> {
    return api.get<ProjectAgentAssignmentListResponse>(
      `/projects/${projectId}/assignments`,
    );
  },

  /**
   * Affecte un agent au projet.
   *
   * zone_file_ids peut être vide.
   */
  async create(
    projectId: number,
    payload: ProjectAgentAssignmentCreate,
  ): Promise<ApiResponse<ProjectAgentAssignment>> {
    return api.post<ProjectAgentAssignment>(
      `/projects/${projectId}/assignments`,
      payload,
    );
  },

  /**
   * Ajoute des zones KML / GeoJSON existantes à une affectation.
   */
  async addExistingZones(
    projectId: number,
    assignmentId: number,
    payload: ProjectAgentAssignmentAddZones,
  ): Promise<ApiResponse<ProjectAgentAssignment>> {
    return api.post<ProjectAgentAssignment>(
      `/projects/${projectId}/assignments/${assignmentId}/zones`,
      payload,
    );
  },

  /**
   * Upload de nouvelles zones KML / GeoJSON.
   */
  async uploadZones(
    projectId: number,
    assignmentId: number,
    files: File[],
  ): Promise<ApiResponse<ProjectAgentAssignment>> {
    const formData = new FormData();

    for (const file of files) {
      formData.append("files", file);
    }

    return api.upload<ProjectAgentAssignment>(
      `/projects/${projectId}/assignments/${assignmentId}/zones/upload`,
      formData,
    );
  },

  /**
   * Retire une zone de l'affectation.
   *
   * Le fichier KML / GeoJSON n'est pas supprimé.
   */
  async removeZone(
    projectId: number,
    assignmentId: number,
    zoneId: number,
  ): Promise<ApiResponse<ProjectAgentAssignment>> {
    return api.delete<ProjectAgentAssignment>(
      `/projects/${projectId}/assignments/${assignmentId}/zones/${zoneId}`,
    );
  },

  /**
   * Supprime l'affectation de l'agent au projet.
   *
   * Les fichiers KML / GeoJSON restent dans le projet.
   */
  async delete(
    projectId: number,
    assignmentId: number,
  ): Promise<ApiResponse<null>> {
    return api.delete<null>(
      `/projects/${projectId}/assignments/${assignmentId}`,
    );
  },
};
