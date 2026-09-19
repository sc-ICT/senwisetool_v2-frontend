export type ProgramScope = "GLOBAL" | "USER";

export type ProgramStatus =
  | "DRAFT"
  | "ACTIVE"
  | "PAUSED"
  | "COMPLETED"
  | "ARCHIVED";

export type ProgramScheduleType = "ONE_TIME" | "RECURRING" | "CUSTOM";

export type ProgramExecutionMode = "MANUAL" | "AUTOMATIC";

export type ProgramScheduleUnit = "DAY" | "WEEK" | "MONTH" | "YEAR";

export interface ProgramCustomOccurrence {
  start_at: string;
  end_at: string;
}

export interface ProgramSchedule {
  type: ProgramScheduleType;
  execution_mode: ProgramExecutionMode;
  timezone: string;

  start_at: string | null;
  end_at: string | null;

  recurrence_unit: ProgramScheduleUnit | null;
  recurrence_interval: number | null;

  occurrence_duration: number | null;
  occurrence_duration_unit: ProgramScheduleUnit | null;

  gap_duration: number;
  gap_duration_unit: ProgramScheduleUnit;

  custom_occurrences: ProgramCustomOccurrence[];
}

export interface PluginProgram {
  id: number;
  plugin_id: number;

  key: string;
  code: string | null;

  name: string;
  description: string | null;

  icon: string | null;
  color: string | null;
  position: number;

  status: ProgramStatus;
  is_active: boolean;

  scope: ProgramScope;

  created_by: number;
  owner_user_id: number | null;

  allow_user_use: boolean;
  allow_user_customization: boolean;
  allow_multiple_projects: boolean;
  allow_project_creation: boolean;

  configuration: Record<string, unknown>;
  project_rules: Array<Record<string, unknown>>;
  resource_bindings: Array<Record<string, unknown>>;

  schedule: ProgramSchedule;

  created_at: string;
  updated_at: string;
}

export interface PluginProgramCreate {
  key: string;
  code?: string | null;

  name: string;
  description?: string | null;

  icon?: string | null;
  color?: string | null;
  position?: number;

  scope?: ProgramScope;

  allow_user_use?: boolean;
  allow_user_customization?: boolean;
  allow_multiple_projects?: boolean;
  allow_project_creation?: boolean;

  configuration?: Record<string, unknown>;
  project_rules?: Array<Record<string, unknown>>;
  resource_bindings?: Array<Record<string, unknown>>;

  schedule?: ProgramSchedule;
}

export type PluginProgramUpdate = Partial<PluginProgramCreate> & {
  status?: ProgramStatus;
  is_active?: boolean;
};

export interface PluginProgramListResponse {
  items: PluginProgram[];
  count: number;
}
