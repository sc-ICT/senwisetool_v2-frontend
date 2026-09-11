import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/common";
import type {
  Plugin,
  PluginCreate,
  PluginListResponse,
  PluginUpdate,
  PluginVersion,
  PluginVersionIntegrity,
} from "@/types/plugin";

export const pluginService = {
  // ==========================================================================
  // LIST
  // ==========================================================================

  async list(
    includeArchived = false,
  ): Promise<ApiResponse<PluginListResponse>> {
    return api.get<PluginListResponse>(
      `/plugins?include_archived=${includeArchived}`,
    );
  },

  // ==========================================================================
  // GET
  // ==========================================================================

  async get(pluginId: number): Promise<ApiResponse<Plugin>> {
    return api.get<Plugin>(`/plugins/${pluginId}`);
  },

  // ==========================================================================
  // CREATE
  // ==========================================================================

  async create(payload: PluginCreate): Promise<ApiResponse<Plugin>> {
    return api.post<Plugin>("/plugins", payload);
  },

  // ==========================================================================
  // UPDATE
  // ==========================================================================

  async update(
    pluginId: number,
    payload: PluginUpdate,
  ): Promise<ApiResponse<Plugin>> {
    return api.patch<Plugin>(`/plugins/${pluginId}`, payload);
  },

  // ==========================================================================
  // DELETE
  // ==========================================================================

  async delete(pluginId: number): Promise<ApiResponse<null>> {
    return api.delete<null>(`/plugins/${pluginId}`);
  },

  // ==========================================================================
  // PUBLISH
  // ==========================================================================

  async publish(pluginId: number): Promise<ApiResponse<Plugin>> {
    return api.post<Plugin>(`/plugins/${pluginId}/publish`);
  },

  // ==========================================================================
  // UNPUBLISH
  // ==========================================================================

  async unpublish(pluginId: number): Promise<ApiResponse<Plugin>> {
    return api.post<Plugin>(`/plugins/${pluginId}/unpublish`);
  },

  // ==========================================================================
  // MOVE TO DRAFT
  // ==========================================================================

  async moveToDraft(pluginId: number): Promise<ApiResponse<Plugin>> {
    return api.post<Plugin>(`/plugins/${pluginId}/draft`);
  },

  // ==========================================================================
  // ARCHIVE
  // ==========================================================================

  async archive(pluginId: number): Promise<ApiResponse<Plugin>> {
    return api.post<Plugin>(`/plugins/${pluginId}/archive`);
  },

  // ==========================================================================
  // VERSION
  // ==========================================================================

  async getVersion(
    pluginId: number,
    versionId: number,
  ): Promise<ApiResponse<PluginVersion>> {
    return api.get<PluginVersion>(`/plugins/${pluginId}/versions/${versionId}`);
  },

  // ==========================================================================
  // VERSION INTEGRITY
  // ==========================================================================

  async verifyVersionIntegrity(
    pluginId: number,
    versionId: number,
  ): Promise<ApiResponse<PluginVersionIntegrity>> {
    return api.get<PluginVersionIntegrity>(
      `/plugins/${pluginId}/versions/${versionId}/integrity`,
    );
  },
};
