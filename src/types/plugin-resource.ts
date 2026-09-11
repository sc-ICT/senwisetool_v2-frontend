import type { PluginResourceScope } from "@/types/plugin";

export type PluginFieldType =
  | "TEXT"
  | "LONG_TEXT"
  | "NUMBER"
  | "DECIMAL"
  | "BOOLEAN"
  | "DATE"
  | "DATETIME"
  | "EMAIL"
  | "PHONE"
  | "COUNTRY"
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "URL";

export interface PluginResourceField {
  id: number;
  resource_id: number;

  key: string;
  label: string;
  description: string | null;

  field_type: PluginFieldType;

  required: boolean;

  min_length: number | null;
  max_length: number | null;

  min_value: number | null;
  max_value: number | null;

  pattern: string | null;

  options: unknown[];

  default_value: unknown;

  position: number;
  is_active: boolean;

  created_at: string;
  updated_at: string;
}

export interface PluginResource {
  id: number;
  plugin_id: number;

  key: string;
  name: string;
  description: string | null;

  scope: PluginResourceScope;

  allow_user_schema_override: boolean;

  schema_definition: Record<string, unknown>;

  position: number;

  icon: string | null;

  is_active: boolean;

  created_at: string;
  updated_at: string;

  fields: PluginResourceField[];
}

export interface PluginResourceListResponse {
  items: PluginResource[];
  count: number;
}

export interface PluginResourceFieldCreate {
  key: string;
  label: string;
  description?: string | null;

  field_type: PluginFieldType;

  required?: boolean;

  min_length?: number | null;
  max_length?: number | null;

  min_value?: number | null;
  max_value?: number | null;

  pattern?: string | null;

  options?: unknown[];

  default_value?: unknown;

  position?: number;

  is_active?: boolean;
}

export interface PluginResourceFieldUpdate {
  key?: string;
  label?: string;
  description?: string | null;

  field_type?: PluginFieldType;

  required?: boolean;

  min_length?: number | null;
  max_length?: number | null;

  min_value?: number | null;
  max_value?: number | null;

  pattern?: string | null;

  options?: unknown[];

  default_value?: unknown;

  position?: number;

  is_active?: boolean;
}

export interface PluginResourceCreate {
  key: string;
  name: string;
  description?: string | null;

  scope: PluginResourceScope;

  allow_user_schema_override?: boolean;

  position?: number;

  icon?: string | null;

  is_active?: boolean;

  fields?: PluginResourceFieldCreate[];
}

export interface PluginResourceUpdate {
  name?: string;
  description?: string | null;

  scope?: PluginResourceScope;

  allow_user_schema_override?: boolean;

  position?: number;

  icon?: string | null;

  is_active?: boolean;
}

/* ============================================================
 * EFFECTIVE SCHEMA
 * ========================================================== */

export interface PluginResourceEffectiveSchema {
  resource_id: number;

  scope: PluginResourceScope;

  allow_user_schema_override: boolean;

  is_overridden: boolean;

  schema_definition: {
    version?: number;
    fields: PluginResourceSchemaField[];
  };

  fields: PluginResourceSchemaField[];
}

export interface PluginResourceSchemaField {
  key: string;
  label: string;
  description?: string | null;

  field_type: PluginFieldType;

  required: boolean;

  min_length?: number | null;
  max_length?: number | null;

  min_value?: number | null;
  max_value?: number | null;

  pattern?: string | null;

  options?: unknown[];

  default_value?: unknown;

  position: number;

  is_active: boolean;
}

export interface PluginResourceUserSchemaUpdate {
  fields: PluginResourceFieldCreate[];
}

export interface PluginResourceUserSchema {
  id: number;

  resource_id: number;

  user_id: number;

  schema_definition: {
    version?: number;
    fields: PluginResourceSchemaField[];
  };

  created_at: string;
  updated_at: string;
}

/* ============================================================
 * RECORDS
 * ========================================================== */

export interface PluginResourceRecord {
  id: number;

  resource_id: number;

  user_id: number | null;

  data: Record<string, unknown>;

  is_active: boolean;

  created_at: string;

  updated_at: string;
}

export interface PluginResourceRecordListResponse {
  items: PluginResourceRecord[];

  count: number;
}

export interface PluginResourceRecordCreate {
  data: Record<string, unknown>;

  is_active?: boolean;
}

export interface PluginResourceRecordUpdate {
  data?: Record<string, unknown>;

  is_active?: boolean;
}

/* ============================================================
 * EXCEL IMPORT
 * ========================================================== */

export interface PluginResourceImportError {
  row: number;

  column: string | null;

  field: string | null;

  message: string;
}

export interface PluginResourceImportResponse {
  resource_id: number;

  imported: number;

  rejected: number;

  errors: PluginResourceImportError[];
}
