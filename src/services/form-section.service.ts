import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/common";
import {
  FormSection,
  FormSectionCreate,
  FormSectionListResponse,
  FormSectionUpdate,
} from "@/types/form-section";

export const formSectionService = {
  async list(
    formId: number,
  ): Promise<ApiResponse<FormSectionListResponse>> {
    return api.get<FormSectionListResponse>(
      `/forms/${formId}/sections`,
    );
  },

  async create(
    formId: number,
    payload: FormSectionCreate,
  ): Promise<ApiResponse<FormSection>> {
    return api.post<FormSection>(`/forms/${formId}/sections`, payload);
  },

  async update(
    formId: number,
    sectionId: number,
    payload: FormSectionUpdate,
  ): Promise<ApiResponse<FormSection>> {
    return api.patch<FormSection>(
      `/forms/${formId}/sections/${sectionId}`,
      payload,
    );
  },

  async reorder(
    formId: number,
    orderedSectionIds: number[],
  ): Promise<ApiResponse<FormSectionListResponse>> {
    return api.patch<FormSectionListResponse>(
      `/forms/${formId}/sections/reorder`,
      {
        ordered_section_ids: orderedSectionIds,
      },
    );
  },

  async delete(
    formId: number,
    sectionId: number,
  ): Promise<ApiResponse<null>> {
    return api.delete<null>(`/forms/${formId}/sections/${sectionId}`);
  },
};
