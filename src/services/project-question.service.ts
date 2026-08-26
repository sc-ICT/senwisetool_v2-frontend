import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/common";
import type {
  ProjectQuestion,
  ProjectQuestionCreate,
  ProjectQuestionListResponse,
  ProjectQuestionUpdate,
} from "@/types/project-question";

export const projectQuestionService = {
  async list(
    projectId: number,
    sectionId: number,
  ): Promise<ApiResponse<ProjectQuestionListResponse>> {
    return api.get<ProjectQuestionListResponse>(
      `/projects/${projectId}/sections/${sectionId}/questions`,
    );
  },

  async create(
    projectId: number,
    sectionId: number,
    payload: ProjectQuestionCreate,
  ): Promise<ApiResponse<ProjectQuestion>> {
    return api.post<ProjectQuestion>(
      `/projects/${projectId}/sections/${sectionId}/questions`,
      payload,
    );
  },

  async update(
    projectId: number,
    sectionId: number,
    projectQuestionId: number,
    payload: ProjectQuestionUpdate,
  ): Promise<ApiResponse<ProjectQuestion>> {
    return api.patch<ProjectQuestion>(
      `/projects/${projectId}/sections/${sectionId}/questions/${projectQuestionId}`,
      payload,
    );
  },

  async delete(
    projectId: number,
    sectionId: number,
    projectQuestionId: number,
  ): Promise<ApiResponse<null>> {
    return api.delete<null>(
      `/projects/${projectId}/sections/${sectionId}/questions/${projectQuestionId}`,
    );
  },

  async reorder(
    projectId: number,
    sectionId: number,
    orderedQuestionIds: number[],
  ): Promise<ApiResponse<ProjectQuestionListResponse>> {
    return api.patch<ProjectQuestionListResponse>(
      `/projects/${projectId}/sections/${sectionId}/questions/reorder`,
      {
        ordered_question_ids: orderedQuestionIds,
      },
    );
  },
};
