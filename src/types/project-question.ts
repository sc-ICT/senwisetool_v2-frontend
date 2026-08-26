import type { QuestionType } from "@/types/question-bank";

export interface ProjectQuestion {
  id: number;
  project_id: number;
  section_id: number;

  question_definition_id: number;
  question_version_id: number;

  position: number;

  config: ProjectQuestionConfig;

  question_code: string;
  question_name: string;

  version_number: number;
  version_label: string;

  question_type: QuestionType;

  options: ProjectQuestionOption[];
}

export interface ProjectQuestionListResponse {
  items: ProjectQuestion[];
  count: number;
}

export interface ProjectQuestionCreate {
  question_definition_id: number;
  question_version_id: number;
  config: ProjectQuestionConfig;
}

export interface ProjectQuestionUpdate {
  config?: ProjectQuestionConfig;
}

export interface ProjectQuestionValidationConfig {
  required: boolean;

  min_value: number | null;
  max_value: number | null;

  min_length: number | null;
  max_length: number | null;

  default_value: string | string[] | null;
}

export interface ProjectQuestionDisplayConfig {
  visible: boolean;
  readonly: boolean;

  placeholder: string | null;
  help_text: string | null;
}

export interface ProjectQuestionConfig {
  validation: ProjectQuestionValidationConfig;
  display: ProjectQuestionDisplayConfig;
}

export interface ProjectQuestionOption {
  id: number;
  value: string;
  label: string;
  position: number;
  option_metadata: Record<string, unknown>;
}
