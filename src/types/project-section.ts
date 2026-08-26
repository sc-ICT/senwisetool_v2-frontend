import { ProjectQuestion } from "./project-question";

export interface ProjectSection {
  id: number;
  project_id: number;
  name: string;
  description: string | null;
  position: number;
  config: Record<string, unknown>;
}

export interface ProjectSectionListResponse {
  items: ProjectSection[];
  count: number;
}

export interface ProjectSectionCreate {
  name: string;
  description: string | null;
  config: Record<string, unknown>;
}

export interface ProjectSectionUpdate {
  name?: string;
  description?: string | null;
  config?: Record<string, unknown>;
}

// export interface ProjectQuestion {
//   id: number;
//   project_id: number;
//   section_id: number;
//   question_definition_id: number;
//   question_version_id: number;
//   position: number;
//   config: Record<string, unknown>;
// }

export interface ProjectQuestionListResponse {
  items: ProjectQuestion[];
  count: number;
}

export interface ProjectQuestionCreate {
  question_definition_id: number;
  question_version_id: number;
  config: Record<string, unknown>;
}

export interface ProjectQuestionUpdate {
  config?: Record<string, unknown>;
}
