import type { AgentRole, AgentStatus } from "@/types/agent";

export interface ProjectAgentAssignmentCreate {
  agent_id: number;
  zone_file_ids: number[];
}

export interface ProjectAgentAssignmentAddZones {
  zone_file_ids: number[];
}

export interface ProjectAgentAssignmentAgent {
  id: number;
  full_name: string;
  role: AgentRole;
  status: AgentStatus;
}

export interface ProjectAgentAssignmentZone {
  id: number;
  file_node_id: number;
  file_name: string;
}

export interface ProjectAgentAssignment {
  id: number;
  project_id: number;
  agent_id: number;

  agent: ProjectAgentAssignmentAgent;

  zones: ProjectAgentAssignmentZone[];

  created_at: string;
  updated_at: string;
}

export interface ProjectAgentAssignmentListResponse {
  items: ProjectAgentAssignment[];
  count: number;
}
