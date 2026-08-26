import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/common";
import {
  ProjectSection,
  ProjectSectionCreate,
  ProjectSectionListResponse,
  ProjectSectionUpdate,
} from "@/types/project-section";

export const projectSectionService = {
  async list(
    projectId: number,
  ): Promise<ApiResponse<ProjectSectionListResponse>> {
    return api.get<ProjectSectionListResponse>(
      `/projects/${projectId}/sections`,
    );
  },

  async create(
    projectId: number,
    payload: ProjectSectionCreate,
  ): Promise<ApiResponse<ProjectSection>> {
    return api.post<ProjectSection>(`/projects/${projectId}/sections`, payload);
  },

  async update(
    projectId: number,
    sectionId: number,
    payload: ProjectSectionUpdate,
  ): Promise<ApiResponse<ProjectSection>> {
    return api.patch<ProjectSection>(
      `/projects/${projectId}/sections/${sectionId}`,
      payload,
    );
  },

  async reorder(
    projectId: number,
    orderedSectionIds: number[],
  ): Promise<ApiResponse<ProjectSectionListResponse>> {
    return api.patch<ProjectSectionListResponse>(
      `/projects/${projectId}/sections/reorder`,
      {
        ordered_section_ids: orderedSectionIds,
      },
    );
  },

  async delete(
    projectId: number,
    sectionId: number,
  ): Promise<ApiResponse<null>> {
    return api.delete<null>(`/projects/${projectId}/sections/${sectionId}`);
  },
};
