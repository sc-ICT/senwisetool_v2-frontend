import type { QuestionType } from "@/types/question-bank";

export interface FormQuestion {
  id: number;
  form_id: number;
  section_id: number;

  question_definition_id: number;
  question_version_id: number;

  position: number;

  config: FormQuestionConfig;

  question_code: string;
  question_name: string;

  version_number: number;
  version_label: string;

  question_type: QuestionType;

  options: FormQuestionOption[];
}

export interface FormQuestionListResponse {
  items: FormQuestion[];
  count: number;
}

export interface FormQuestionCreate {
  question_definition_id: number;
  question_version_id: number;
  config: FormQuestionConfig;
}

export interface FormQuestionUpdate {
  config?: FormQuestionConfig;
}

export interface FormQuestionValidationConfig {
  required: boolean;

  min_value: number | null;
  max_value: number | null;

  min_length: number | null;
  max_length: number | null;

  default_value: string | string[] | null;
}

export interface FormQuestionDisplayConfig {
  visible: boolean;
  readonly: boolean;

  placeholder: string | null;
  help_text: string | null;
}

export interface FormQuestionConfig {
  validation: FormQuestionValidationConfig;
  display: FormQuestionDisplayConfig;
}

export interface FormQuestionOption {
  id: number;
  value: string;
  label: string;
  position: number;
  option_metadata: Record<string, unknown>;
}
