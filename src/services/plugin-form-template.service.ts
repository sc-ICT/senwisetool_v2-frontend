import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/common";
import type {
  PluginFormTemplate,
  PluginFormTemplateCreate,
  PluginFormTemplateListResponse,
  PluginFormTemplateUpdate,
} from "@/types/plugin-form-template";

export const pluginFormTemplateService = {
  async list(
    pluginId: number,
    projectTemplateId: number,
    includeInactive = false,
  ): Promise<ApiResponse<PluginFormTemplateListResponse>> {
    const query = includeInactive ? "?include_inactive=true" : "";

    return api.get<PluginFormTemplateListResponse>(
      `/plugins/${pluginId}/project-templates/${projectTemplateId}/form-templates${query}`,
    );
  },

  async get(
    pluginId: number,
    projectTemplateId: number,
    templateId: number,
  ): Promise<ApiResponse<PluginFormTemplate>> {
    return api.get<PluginFormTemplate>(
      `/plugins/${pluginId}/project-templates/${projectTemplateId}/form-templates/${templateId}`,
    );
  },

  async create(
    pluginId: number,
    projectTemplateId: number,
    payload: PluginFormTemplateCreate,
  ): Promise<ApiResponse<PluginFormTemplate>> {
    return api.post<PluginFormTemplate>(
      `/plugins/${pluginId}/project-templates/${projectTemplateId}/form-templates`,
      payload,
    );
  },

  async update(
    pluginId: number,
    projectTemplateId: number,
    templateId: number,
    payload: PluginFormTemplateUpdate,
  ): Promise<ApiResponse<PluginFormTemplate>> {
    return api.patch<PluginFormTemplate>(
      `/plugins/${pluginId}/project-templates/${projectTemplateId}/form-templates/${templateId}`,
      payload,
    );
  },

  async delete(
    pluginId: number,
    projectTemplateId: number,
    templateId: number,
  ): Promise<ApiResponse<null>> {
    return api.delete<null>(
      `/plugins/${pluginId}/project-templates/${projectTemplateId}/form-templates/${templateId}`,
    );
  },
};
