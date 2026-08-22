import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/common";
import type { QuestionDefinitionStatus } from "@/types/question-bank";

export type QuestionGroupStatus = "ACTIVE" | "ARCHIVED";

export interface QuestionGroup {
  id: number;
  name: string;
  description: string | null;
  status: QuestionGroupStatus;
  created_by: number;
  question_ids: number[];
}

export interface QuestionGroupQuestion {
  id: number;
  code: string;
  name: string;
  status: QuestionDefinitionStatus;
}

export interface QuestionGroupDetail extends QuestionGroup {
  questions: QuestionGroupQuestion[];
}

export interface QuestionGroupListResponse {
  items: QuestionGroup[];
  count: number;
}

export interface QuestionGroupCreate {
  name: string;
  description: string | null;
}

export interface QuestionGroupUpdate {
  name?: string;
  description?: string | null;
  status?: QuestionGroupStatus;
}

export const questionGroupService = {
  async list(
    includeArchived = false,
  ): Promise<ApiResponse<QuestionGroupListResponse>> {
    const query = includeArchived ? "?include_archived=true" : "";

    return api.get<QuestionGroupListResponse>(`/question-groups${query}`);
  },

  async get(groupId: number): Promise<ApiResponse<QuestionGroupDetail>> {
    return api.get<QuestionGroupDetail>(`/question-groups/${groupId}`);
  },

  async create(
    payload: QuestionGroupCreate,
  ): Promise<ApiResponse<QuestionGroup>> {
    return api.post<QuestionGroup>("/question-groups", payload);
  },

  async update(
    groupId: number,
    payload: QuestionGroupUpdate,
  ): Promise<ApiResponse<QuestionGroup>> {
    return api.patch<QuestionGroup>(`/question-groups/${groupId}`, payload);
  },

  async archive(groupId: number): Promise<ApiResponse<QuestionGroup>> {
    return api.patch<QuestionGroup>(`/question-groups/${groupId}/archive`);
  },

  async addQuestion(
    groupId: number,
    questionId: number,
  ): Promise<ApiResponse<QuestionGroupDetail>> {
    return api.post<QuestionGroupDetail>(
      `/question-groups/${groupId}/questions/${questionId}`,
    );
  },

  async removeQuestion(
    groupId: number,
    questionId: number,
  ): Promise<ApiResponse<QuestionGroupDetail>> {
    return api.delete<QuestionGroupDetail>(
      `/question-groups/${groupId}/questions/${questionId}`,
    );
  },
};
