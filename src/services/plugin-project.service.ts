import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/common";
import type {
  PluginProjectTemplate,
  PluginProjectTemplateCreate,
  PluginProjectTemplateListResponse,
  PluginProjectTemplateUpdate,
} from "@/types/plugin-project";

export const pluginProjectService = {
  async list(
    pluginId: number,
    includeInactive = false,
  ): Promise<ApiResponse<PluginProjectTemplateListResponse>> {
    const query = includeInactive ? "?include_inactive=true" : "";

    return api.get<PluginProjectTemplateListResponse>(
      `/plugins/${pluginId}/project-templates${query}`,
    );
  },

  async get(
    pluginId: number,
    templateId: number,
  ): Promise<ApiResponse<PluginProjectTemplate>> {
    return api.get<PluginProjectTemplate>(
      `/plugins/${pluginId}/project-templates/${templateId}`,
    );
  },

  async create(
    pluginId: number,
    payload: PluginProjectTemplateCreate,
  ): Promise<ApiResponse<PluginProjectTemplate>> {
    return api.post<PluginProjectTemplate>(
      `/plugins/${pluginId}/project-templates`,
      payload,
    );
  },

  async update(
    pluginId: number,
    templateId: number,
    payload: PluginProjectTemplateUpdate,
  ): Promise<ApiResponse<PluginProjectTemplate>> {
    return api.patch<PluginProjectTemplate>(
      `/plugins/${pluginId}/project-templates/${templateId}`,
      payload,
    );
  },

  async delete(
    pluginId: number,
    templateId: number,
  ): Promise<ApiResponse<null>> {
    return api.delete<null>(
      `/plugins/${pluginId}/project-templates/${templateId}`,
    );
  },
};
