import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/common";
import type { FileNode, FormFilesResponse } from "@/types/file-system";
import type {
  Form,
  FormCreate,
  FormListResponse,
  FormUpdate,
} from "@/types/form";

export const formService = {
  async list(includeArchived = false): Promise<ApiResponse<FormListResponse>> {
    const query = includeArchived ? "?include_archived=true" : "";

    return api.get<FormListResponse>(`/forms${query}`);
  },

  async get(formId: number): Promise<ApiResponse<Form>> {
    return api.get<Form>(`/forms/${formId}`);
  },

  async create(payload: FormCreate): Promise<ApiResponse<Form>> {
    return api.post<Form>("/forms", payload);
  },

  async update(
    formId: number,
    payload: FormUpdate,
  ): Promise<ApiResponse<Form>> {
    return api.patch<Form>(`/forms/${formId}`, payload);
  },

  async publish(formId: number): Promise<ApiResponse<Form>> {
    return api.patch<Form>(`/forms/${formId}`, {
      status: "PUBLISHED",
    });
  },

  async archive(formId: number): Promise<ApiResponse<Form>> {
    return api.patch<Form>(`/forms/${formId}/archive`);
  },

  async restoreToDraft(formId: number): Promise<ApiResponse<Form>> {
    return api.patch<Form>(`/forms/${formId}`, {
      status: "DRAFT",
    });
  },

  async delete(formId: number): Promise<void> {
    await api.delete(`/forms/${formId}`);
  },

  async listFiles(formId: number): Promise<ApiResponse<FormFilesResponse>> {
    return api.get<FormFilesResponse>(`/forms/${formId}/files`);
  },

  async uploadFile(formId: number, file: File): Promise<ApiResponse<FileNode>> {
    const formData = new FormData();

    formData.append("file", file);

    return api.upload<FileNode>(`/forms/${formId}/files`, formData);
  },

  async deleteFile(formId: number, fileId: number): Promise<void> {
    await api.delete(`/forms/${formId}/files/${fileId}`);
  },
};
