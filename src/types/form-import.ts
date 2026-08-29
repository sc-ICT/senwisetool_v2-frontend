import type { ApiResponse } from "@/types/common";

export interface FormImportIssue {
  sheet: string | null;
  column: string | null;
  row: number | null;
  message: string;
}

export interface FormImportResult {
  success: boolean;
  message: string;

  sheets: number;
  questions: number;
  sections: number;
  groups: number;
  dependencies: number;

  created_questions: number;
  reused_questions: number;

  created_sections: number;
  reused_sections: number;

  created_groups: number;
  reused_groups: number;

  created_dependencies: number;
  reused_dependencies: number;

  issues: FormImportIssue[];
}

export type FormImportApiResponse = ApiResponse<FormImportResult>;
