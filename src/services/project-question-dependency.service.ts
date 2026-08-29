import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/common";

export type DependencyLogicalOperator = "AND" | "OR";

export type DependencyConditionOperator =
  | "EQUALS"
  | "NOT_EQUALS"
  | "IN"
  | "NOT_IN"
  | "GREATER_THAN"
  | "GREATER_THAN_OR_EQUALS"
  | "LESS_THAN"
  | "LESS_THAN_OR_EQUALS"
  | "CONTAINS"
  | "NOT_CONTAINS"
  | "IS_EMPTY"
  | "IS_NOT_EMPTY";

export type DependencyComparisonSourceType = "CONSTANT" | "QUESTION";

export type DependencyTargetType = "QUESTION" | "SECTION";

export type DependencyActionType =
  | "SHOW"
  | "HIDE"
  | "ENABLE"
  | "DISABLE"
  | "REQUIRE"
  | "OPTIONAL"
  | "READONLY"
  | "EDITABLE"
  | "SET_VALUE"
  | "COPY_VALUE"
  | "FILTER_OPTIONS"
  | "CLEAR_VALUE"
  | "REPEAT_SECTION";

export interface DependencyComparisonValue {
  source_type: DependencyComparisonSourceType;

  value?: string | number | boolean | null;

  question_id?: number | null;
}

export interface DependencyCondition {
  source_question_id: number;

  operator: DependencyConditionOperator;

  comparison_value?: DependencyComparisonValue | null;
}

export interface DependencyConditionGroup {
  operator: DependencyLogicalOperator;

  conditions: DependencyCondition[];

  groups: DependencyConditionGroup[];
}

export interface DependencyAction {
  type: DependencyActionType;

  target_type: DependencyTargetType;

  target_id: number;

  config: Record<string, unknown>;
}

export interface ProjectQuestionDependency {
  id: number;

  target_question_id: number;

  condition: DependencyConditionGroup;

  actions_if_true: DependencyAction[];

  actions_if_false: DependencyAction[];

  created_at?: string;
}

export interface ProjectQuestionDependencyCreate {
  condition: DependencyConditionGroup;

  actions_if_true: DependencyAction[];

  actions_if_false: DependencyAction[];
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

  async update(
    projectId: number,
    sectionId: number,
    targetQuestionId: number,
    dependencyId: number,
    payload: ProjectQuestionDependencyCreate,
  ): Promise<ApiResponse<ProjectQuestionDependency>> {
    return api.put<ProjectQuestionDependency>(
      `/projects/${projectId}/sections/${sectionId}/questions/${targetQuestionId}/dependencies/${dependencyId}`,
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
