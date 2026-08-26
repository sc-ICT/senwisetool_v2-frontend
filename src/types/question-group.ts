import { QuestionDefinitionStatus } from "./question-bank";

export type QuestionGroupStatus = "ACTIVE" | "ARCHIVED";

export interface QuestionGroup {
  id: number;
  name: string;
  description: string | null;
  status: QuestionGroupStatus;
  created_by: number;
  question_ids: number[];
}

export interface QuestionGroupQuestion {
  id: number;
  code: string;
  name: string;
  status: QuestionDefinitionStatus;
}

export interface QuestionGroupDetail extends QuestionGroup {
  questions: QuestionGroupQuestion[];
}

export interface QuestionGroupListResponse {
  items: QuestionGroup[];
  count: number;
}

export interface QuestionGroupCreate {
  name: string;
  description: string | null;
}

export interface QuestionGroupUpdate {
  name?: string;
  description?: string | null;
  status?: QuestionGroupStatus;
}
