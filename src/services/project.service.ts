import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/common";
import {
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
};
