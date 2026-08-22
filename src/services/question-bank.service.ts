import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/common";
import {
  QuestionCreateRequest,
  QuestionDefinition,
  QuestionDefinitionDetail,
  QuestionDefinitionListResponse,
  QuestionDefinitionUpdate,
  QuestionVersion,
  QuestionVersionCreate,
} from "@/types/question-bank";

export const questionBankService = {
  async create(
    payload: QuestionCreateRequest,
  ): Promise<ApiResponse<QuestionDefinition>> {
    return api.post<QuestionDefinition>("/question-bank/", payload);
  },

  async list(
    includeArchived = false,
  ): Promise<ApiResponse<QuestionDefinitionListResponse>> {
    const query = includeArchived ? "?include_archived=true" : "";

    return api.get<QuestionDefinitionListResponse>(`/question-bank/${query}`);
  },

  async get(
    questionId: number,
  ): Promise<ApiResponse<QuestionDefinitionDetail>> {
    return api.get<QuestionDefinitionDetail>(`/question-bank/${questionId}`);
  },

  async update(
    questionId: number,
    payload: QuestionDefinitionUpdate,
  ): Promise<ApiResponse<QuestionDefinition>> {
    return api.patch<QuestionDefinition>(
      `/question-bank/${questionId}`,
      payload,
    );
  },

  async duplicate(
    questionId: number,
    payload: {
      code: string;
      name: string;
      description: string | null;
    },
  ): Promise<ApiResponse<QuestionDefinitionDetail>> {
    return api.post<QuestionDefinitionDetail>(
      `/question-bank/${questionId}/duplicate`,
      payload,
    );
  },

  async archive(questionId: number): Promise<ApiResponse<QuestionDefinition>> {
    return api.patch<QuestionDefinition>(
      `/question-bank/${questionId}/archive`,
    );
  },

  async createVersion(
    questionId: number,
    payload: QuestionVersionCreate,
  ): Promise<ApiResponse<QuestionVersion>> {
    return api.post<QuestionVersion>(
      `/question-bank/${questionId}/versions`,
      payload,
    );
  },
};
