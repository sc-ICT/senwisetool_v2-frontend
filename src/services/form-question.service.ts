import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/common";
import type {
  FormQuestion,
  FormQuestionCreate,
  FormQuestionListResponse,
  FormQuestionUpdate,
} from "@/types/form-question";

export const formQuestionService = {
  async list(
    formId: number,
    sectionId: number,
  ): Promise<ApiResponse<FormQuestionListResponse>> {
    return api.get<FormQuestionListResponse>(
      `/forms/${formId}/sections/${sectionId}/questions`,
    );
  },

  async create(
    formId: number,
    sectionId: number,
    payload: FormQuestionCreate,
  ): Promise<ApiResponse<FormQuestion>> {
    return api.post<FormQuestion>(
      `/forms/${formId}/sections/${sectionId}/questions`,
      payload,
    );
  },

  async update(
    formId: number,
    sectionId: number,
    formQuestionId: number,
    payload: FormQuestionUpdate,
  ): Promise<ApiResponse<FormQuestion>> {
    return api.patch<FormQuestion>(
      `/forms/${formId}/sections/${sectionId}/questions/${formQuestionId}`,
      payload,
    );
  },

  async delete(
    formId: number,
    sectionId: number,
    formQuestionId: number,
  ): Promise<ApiResponse<null>> {
    return api.delete<null>(
      `/forms/${formId}/sections/${sectionId}/questions/${formQuestionId}`,
    );
  },

  async reorder(
    formId: number,
    sectionId: number,
    orderedQuestionIds: number[],
  ): Promise<ApiResponse<FormQuestionListResponse>> {
    return api.patch<FormQuestionListResponse>(
      `/forms/${formId}/sections/${sectionId}/questions/reorder`,
      {
        ordered_question_ids: orderedQuestionIds,
      },
    );
  },
};
