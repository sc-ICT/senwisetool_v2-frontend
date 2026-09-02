export type AgentRole = "COLLECTOR" | "INSPECTOR";

export type AgentStatus = "ACTIVE" | "SUSPENDED" | "DEACTIVATED";

export interface Agent {
  id: number;
  full_name: string;
  role: AgentRole;
  status: AgentStatus;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface AgentCreate {
  full_name: string;
  role: AgentRole;
}

export interface AgentBulkCreate {
  agents: AgentCreate[];
}

export interface AgentBulkDelete {
  agent_ids: number[];
}

export interface AgentUpdate {
  full_name?: string;
  role?: AgentRole;
  status?: AgentStatus;
}

export interface AgentListResponse {
  items: Agent[];
  count: number;
}

export interface AgentBulkCreatedResponse {
  items: Agent[];
  count: number;
}
