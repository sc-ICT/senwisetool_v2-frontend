import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/common";
import type {
  PluginResource,
  PluginResourceCreate,
  PluginResourceEffectiveSchema,
  PluginResourceFieldCreate,
  PluginResourceFieldUpdate,
  PluginResourceImportResponse,
  PluginResourceListResponse,
  PluginResourceRecord,
  PluginResourceRecordCreate,
  PluginResourceRecordListResponse,
  PluginResourceRecordUpdate,
  PluginResourceUpdate,
  PluginResourceUserSchema,
  PluginResourceUserSchemaUpdate,
} from "@/types/plugin-resource";

export const pluginResourceService = {
  /* ============================================================
   * RESOURCES
   * ========================================================== */

  async list(
    pluginId: number,
  ): Promise<ApiResponse<PluginResourceListResponse>> {
    return api.get<PluginResourceListResponse>(
      `/plugins/${pluginId}/resources`,
    );
  },

  async get(resourceId: number): Promise<ApiResponse<PluginResource>> {
    return api.get<PluginResource>(`/plugins/resources/${resourceId}`);
  },

  async create(
    pluginId: number,
    payload: PluginResourceCreate,
  ): Promise<ApiResponse<PluginResource>> {
    return api.post<PluginResource>(`/plugins/${pluginId}/resources`, payload);
  },

  async update(
    resourceId: number,
    payload: PluginResourceUpdate,
  ): Promise<ApiResponse<PluginResource>> {
    return api.patch<PluginResource>(
      `/plugins/resources/${resourceId}`,
      payload,
    );
  },

  async delete(resourceId: number): Promise<ApiResponse<null>> {
    return api.delete<null>(`/plugins/resources/${resourceId}`);
  },

  /* ============================================================
   * FIELDS
   * ========================================================== */

  async addField(
    resourceId: number,
    payload: PluginResourceFieldCreate,
  ): Promise<ApiResponse<PluginResource>> {
    return api.post<PluginResource>(
      `/plugins/resources/${resourceId}/fields`,
      payload,
    );
  },

  async updateField(
    resourceId: number,
    fieldId: number,
    payload: PluginResourceFieldUpdate,
  ): Promise<ApiResponse<PluginResource>> {
    return api.patch<PluginResource>(
      `/plugins/resources/${resourceId}/fields/${fieldId}`,
      payload,
    );
  },

  async deleteField(
    resourceId: number,
    fieldId: number,
  ): Promise<ApiResponse<PluginResource>> {
    return api.delete<PluginResource>(
      `/plugins/resources/${resourceId}/fields/${fieldId}`,
    );
  },

  /* ============================================================
   * EFFECTIVE SCHEMA
   * ========================================================== */

  async getEffectiveSchema(
    resourceId: number,
  ): Promise<ApiResponse<PluginResourceEffectiveSchema>> {
    return api.get<PluginResourceEffectiveSchema>(
      `/plugins/resources/${resourceId}/schema/effective`,
    );
  },

  /* ============================================================
   * USER SCHEMA OVERRIDE
   * ========================================================== */

  async updateUserSchema(
    resourceId: number,
    payload: PluginResourceUserSchemaUpdate,
  ): Promise<ApiResponse<PluginResourceUserSchema>> {
    return api.put<PluginResourceUserSchema>(
      `/plugins/resources/${resourceId}/schema/override`,
      payload,
    );
  },

  async resetUserSchema(resourceId: number): Promise<ApiResponse<null>> {
    return api.delete<null>(`/plugins/resources/${resourceId}/schema/override`);
  },

  /* ============================================================
   * RECORDS
   * ========================================================== */

  async listRecords(
    resourceId: number,
  ): Promise<ApiResponse<PluginResourceRecordListResponse>> {
    return api.get<PluginResourceRecordListResponse>(
      `/plugins/resources/${resourceId}/records`,
    );
  },

  async createRecord(
    resourceId: number,
    payload: PluginResourceRecordCreate,
  ): Promise<ApiResponse<PluginResourceRecord>> {
    return api.post<PluginResourceRecord>(
      `/plugins/resources/${resourceId}/records`,
      payload,
    );
  },

  async updateRecord(
    resourceId: number,
    recordId: number,
    payload: PluginResourceRecordUpdate,
  ): Promise<ApiResponse<PluginResourceRecord>> {
    return api.patch<PluginResourceRecord>(
      `/plugins/resources/${resourceId}/records/${recordId}`,
      payload,
    );
  },

  async deleteRecord(
    resourceId: number,
    recordId: number,
  ): Promise<ApiResponse<null>> {
    return api.delete<null>(
      `/plugins/resources/${resourceId}/records/${recordId}`,
    );
  },

  /* ============================================================
   * EXCEL
   * ========================================================== */

  async importExcel(
    resourceId: number,
    file: File,
  ): Promise<ApiResponse<PluginResourceImportResponse>> {
    const formData = new FormData();

    formData.append("file", file);

    return api.upload<PluginResourceImportResponse>(
      `/plugins/resources/${resourceId}/records/import`,
      formData,
    );
  },
};
