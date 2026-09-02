import { FormQuestion } from "./form-question";

export interface FormSection {
  id: number;
  form_id: number;
  name: string;
  description: string | null;
  position: number;
  config: Record<string, unknown>;
}

export interface FormSectionListResponse {
  items: FormSection[];
  count: number;
}

export interface FormSectionCreate {
  name: string;
  description: string | null;
  config: Record<string, unknown>;
}

export interface FormSectionUpdate {
  name?: string;
  description?: string | null;
  config?: Record<string, unknown>;
}

// export interface FormQuestion {
//   id: number;
//   form_id: number;
//   section_id: number;
//   question_definition_id: number;
//   question_version_id: number;
//   position: number;
//   config: Record<string, unknown>;
// }

export interface FormQuestionListResponse {
  items: FormQuestion[];
  count: number;
}

export interface FormQuestionCreate {
  question_definition_id: number;
  question_version_id: number;
  config: Record<string, unknown>;
}

export interface FormQuestionUpdate {
  config?: Record<string, unknown>;
}
