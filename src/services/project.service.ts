import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/common";
import type { FileNode, ProjectFilesResponse } from "@/types/file-system";
import type {
  Project,
  ProjectCreate,
  ProjectListResponse,
  ProjectUpdate,
} from "@/types/project";

export const projectService = {
  async list(
    includeArchived = false,
  ): Promise<ApiResponse<ProjectListResponse>> {
    const query = includeArchived ? "?include_archived=true" : "";

    return api.get<ProjectListResponse>(`/projects${query}`);
  },

  async get(projectId: number): Promise<ApiResponse<Project>> {
    return api.get<Project>(`/projects/${projectId}`);
  },

  async create(payload: ProjectCreate): Promise<ApiResponse<Project>> {
    return api.post<Project>("/projects", payload);
  },

  async update(
    projectId: number,
    payload: ProjectUpdate,
  ): Promise<ApiResponse<Project>> {
    return api.patch<Project>(`/projects/${projectId}`, payload);
  },

  async archive(projectId: number): Promise<ApiResponse<Project>> {
    return api.patch<Project>(`/projects/${projectId}/archive`);
  },

  async delete(projectId: number): Promise<void> {
    await api.delete(`/projects/${projectId}`);
  },

  async listFiles(
    projectId: number,
  ): Promise<ApiResponse<ProjectFilesResponse>> {
    return api.get<ProjectFilesResponse>(`/projects/${projectId}/files`);
  },

  async uploadFile(
    projectId: number,
    file: File,
  ): Promise<ApiResponse<FileNode>> {
    const formData = new FormData();

    formData.append("file", file);

    return api.upload<FileNode>(`/projects/${projectId}/files`, formData);
  },

  async deleteFile(projectId: number, fileId: number): Promise<void> {
    await api.delete(`/projects/${projectId}/files/${fileId}`);
  },
};
