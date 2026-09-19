import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/common";
import type {
  PluginProgram,
  PluginProgramCreate,
  PluginProgramListResponse,
  PluginProgramUpdate,
} from "@/types/plugin-program";

export const pluginProgramService = {
  async list(
    pluginId: number,
    includeInactive = false,
  ): Promise<ApiResponse<PluginProgramListResponse>> {
    const query = includeInactive ? "?include_inactive=true" : "";

    return api.get<PluginProgramListResponse>(
      `/plugins/${pluginId}/programs${query}`,
    );
  },

  async get(
    pluginId: number,
    programId: number,
  ): Promise<ApiResponse<PluginProgram>> {
    return api.get<PluginProgram>(`/plugins/${pluginId}/programs/${programId}`);
  },

  async create(
    pluginId: number,
    payload: PluginProgramCreate,
  ): Promise<ApiResponse<PluginProgram>> {
    return api.post<PluginProgram>(`/plugins/${pluginId}/programs`, payload);
  },

  async update(
    pluginId: number,
    programId: number,
    payload: PluginProgramUpdate,
  ): Promise<ApiResponse<PluginProgram>> {
    return api.patch<PluginProgram>(
      `/plugins/${pluginId}/programs/${programId}`,
      payload,
    );
  },

  async delete(
    pluginId: number,
    programId: number,
  ): Promise<ApiResponse<null>> {
    return api.delete<null>(`/plugins/${pluginId}/programs/${programId}`);
  },
};
