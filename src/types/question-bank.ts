export type QuestionDefinitionStatus = "ACTIVE" | "ARCHIVED";

export type QuestionType =
  | "TEXT"
  | "LONG_TEXT"
  | "EMAIL"
  | "PHONE"
  | "URL"
  | "ADDRESS"
  | "INTEGER"
  | "DECIMAL"
  | "PERCENTAGE"
  | "CURRENCY"
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "DROPDOWN"
  | "AUTOCOMPLETE"
  | "RATING"
  | "LIKERT_SCALE"
  | "RANKING"
  | "DATE"
  | "TIME"
  | "DATETIME"
  | "DURATION"
  | "POINT"
  | "LINE"
  | "POLYGON"
  | "AREA"
  | "PHOTO"
  | "VIDEO"
  | "AUDIO"
  | "FILE"
  | "SIGNATURE"
  | "QR_CODE"
  | "BARCODE"
  | "ENTITY_SELECT"
  | "ENTITY_SEARCH"
  | "CALCULATION"
  | "NOTE"
  | "CONSENT"
  | "HIDDEN";

export interface QuestionDefinition {
  id: number;
  code: string;
  name: string;
  description: string | null;
  status: QuestionDefinitionStatus;
  created_by: number;
  current_version: number | null;
  question_type: QuestionType | null;
}

export interface QuestionOption {
  id: number;
  value: string;
  label: string;
  position: number;
  option_metadata: Record<string, unknown>;
}

export interface QuestionVersion {
  id: number;
  question_definition_id: number;
  version: number;
  label: string;
  help_text: string | null;
  question_type: QuestionType;
  base_config: Record<string, unknown>;
  created_by: number;
  options: QuestionOption[];
}

export interface QuestionDefinitionDetail extends QuestionDefinition {
  versions: QuestionVersion[];
}

export interface QuestionDefinitionListResponse {
  items: QuestionDefinition[];
  count: number;
}

export interface QuestionOptionCreate {
  value: string;
  label: string;
  position: number;
  option_metadata: Record<string, unknown>;
}

export interface QuestionVersionCreate {
  label: string;
  help_text: string | null;
  question_type: QuestionType;
  base_config: Record<string, unknown>;
  options: QuestionOptionCreate[];
}

export interface QuestionDefinitionCreate {
  code: string;
  name: string;
  description: string | null;
}

export interface QuestionCreateRequest {
  definition: QuestionDefinitionCreate;
  version: QuestionVersionCreate;
}

export interface QuestionDefinitionUpdate {
  name?: string;
  description?: string | null;
  status?: QuestionDefinitionStatus;
}
