import { api } from "@/lib/api";
import type {
  Agent,
  AgentBulkCreate,
  AgentBulkCreatedResponse,
  AgentBulkDelete,
  AgentCreate,
  AgentListResponse,
  AgentUpdate,
} from "@/types/agent";
import type { ApiResponse } from "@/types/common";

export const agentService = {
  async list(): Promise<ApiResponse<AgentListResponse>> {
    return api.get<AgentListResponse>("/agents");
  },

  async get(agentId: number): Promise<ApiResponse<Agent>> {
    return api.get<Agent>(`/agents/${agentId}`);
  },

  async create(payload: AgentCreate): Promise<ApiResponse<Agent>> {
    return api.post<Agent>("/agents", payload);
  },

  async createMany(
    payload: AgentBulkCreate,
  ): Promise<ApiResponse<AgentBulkCreatedResponse>> {
    return api.post<AgentBulkCreatedResponse>("/agents/bulk", payload);
  },

  async update(
    agentId: number,
    payload: AgentUpdate,
  ): Promise<ApiResponse<Agent>> {
    return api.patch<Agent>(`/agents/${agentId}`, payload);
  },

  async delete(agentId: number): Promise<ApiResponse<null>> {
    return api.delete<null>(`/agents/${agentId}`);
  },

  async deleteMany(payload: AgentBulkDelete): Promise<ApiResponse<null>> {
    return api.delete<null>("/agents/bulk", payload);
  },
};
