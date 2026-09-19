export type PluginResourceScope = "GLOBAL" | "USER";

export type PluginFieldType =
  | "TEXT"
  | "LONG_TEXT"
  | "NUMBER"
  | "INTEGER"
  | "DECIMAL"
  | "BOOLEAN"
  | "DATE"
  | "DATETIME"
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "EMAIL"
  | "PHONE"
  | "URL"
  | "FILE"
  | "IMAGE"
  | "LOCATION";

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

  position: number;

  icon: string | null;

  is_active: boolean;

  fields: PluginResourceField[];

  created_at: string;

  updated_at: string;
}

/* ============================================================
 * RESOURCE LIST
 * ========================================================== */

export interface PluginResourceListResponse {
  items: PluginResource[];

  count: number;
}

/* ============================================================
 * RESOURCE RELATIONS
 * ========================================================== */

export interface PluginResourceRelation {
  id: number;

  source_resource_id: number;

  source_field_key: string;

  target_resource_id: number;

  target_field_key: string;

  source_resource_name: string;

  target_resource_name: string;

  label: string | null;

  is_active: boolean;

  created_at: string;

  updated_at: string;
}

export interface PluginResourceRelationCreate {
  source_field_key: string;

  target_resource_id: number;

  target_field_key: string;

  label?: string | null;

  is_active?: boolean;
}

export interface PluginResourceRelatedRecordsResponse {
  relation_id: number;

  source_resource_id: number;

  source_record_id: number;

  target_resource_id: number;

  direction: "SOURCE_TO_TARGET" | "TARGET_TO_SOURCE";

  items: PluginResourceRecord[];

  count: number;
}

/* ============================================================
 * RESOURCE RECORD
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

export interface PluginResourceRelation {
  id: number;

  source_resource_id: number;
  source_field_key: string;

  target_resource_id: number;
  target_field_key: string;

  source_resource_name: string;
  target_resource_name: string;

  label: string | null;

  is_active: boolean;

  created_at: string;
  updated_at: string;
}

export interface PluginResourceRelationCreate {
  source_field_key: string;

  target_resource_id: number;

  target_field_key: string;

  label?: string | null;

  is_active?: boolean;
}

export interface PluginResourceRelatedRecordsResponse {
  relation_id: number;

  source_resource_id: number;

  source_record_id: number;

  target_resource_id: number;

  direction: "SOURCE_TO_TARGET" | "TARGET_TO_SOURCE";

  items: PluginResourceRecord[];

  count: number;
}

export interface PluginResourceWorkbookImportResponse {
  plugin_id: number;

  sheets: number;

  resources_created: number;
  resources_updated: number;

  schemas_created: number;
  schemas_updated: number;

  relations_created: number;
  relations_existing: number;

  records_imported: number;

  errors: PluginResourceImportError[];
}
