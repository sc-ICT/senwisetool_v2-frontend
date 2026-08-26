import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/common";

export type ProjectQuestionDependencyOperator =
  | "EQUALS"
  | "NOT_EQUALS"
  | "IN"
  | "NOT_IN";

export interface ProjectQuestionDependency {
  id: number;
  target_question_id: number;
  source_question_id: number;
  operator: ProjectQuestionDependencyOperator;
  value: string;
}

export interface ProjectQuestionDependencyCreate {
  source_question_id: number;
  operator: ProjectQuestionDependencyOperator;
  value: string;
}

export const projectQuestionDependencyService = {
  async list(
    projectId: number,
    sectionId: number,
    targetQuestionId: number,
  ): Promise<ApiResponse<ProjectQuestionDependency[]>> {
    return api.get<ProjectQuestionDependency[]>(
      `/projects/${projectId}/sections/${sectionId}/questions/${targetQuestionId}/dependencies`,
    );
  },

  async create(
    projectId: number,
    sectionId: number,
    targetQuestionId: number,
    payload: ProjectQuestionDependencyCreate,
  ): Promise<ApiResponse<ProjectQuestionDependency>> {
    return api.post<ProjectQuestionDependency>(
      `/projects/${projectId}/sections/${sectionId}/questions/${targetQuestionId}/dependencies`,
      payload,
    );
  },

  async delete(
    projectId: number,
    sectionId: number,
    targetQuestionId: number,
    dependencyId: number,
  ): Promise<ApiResponse<null>> {
    return api.delete<null>(
      `/projects/${projectId}/sections/${sectionId}/questions/${targetQuestionId}/dependencies/${dependencyId}`,
    );
  },
};
