import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/common";
import {
  QuestionGroup,
  QuestionGroupCreate,
  QuestionGroupDetail,
  QuestionGroupListResponse,
  QuestionGroupUpdate,
} from "@/types/question-group";

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
