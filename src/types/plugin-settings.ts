export type PluginAvailability =
  | "PUBLIC"
  | "PRIVATE"
  | "RESTRICTED";

export type PluginApprovalMode =
  | "SIMPLE_REQUEST"
  | "FORM"
  | "DOCUMENT"
  | "FORM_AND_DOCUMENT";

export type PluginAuthorizationFormFieldType =
  | "TEXT"
  | "TEXTAREA"
  | "NUMBER"
  | "EMAIL"
  | "PHONE"
  | "DATE"
  | "DATETIME"
  | "BOOLEAN"
  | "SELECT"
  | "MULTI_SELECT"
  | "RADIO"
  | "CHECKBOX"
  | "FILE"
  | "MULTI_FILE";

export interface PluginAuthorizationDocument {
  key: string;
  name: string;
  document_type: string;
  description: string;
  instructions: string;
  required_elements: string[];
  required: boolean;
  allow_multiple_files: boolean;
  max_files: number;
  accepted_extensions: string[];
  max_file_size_mb: number;
  issuer_required: boolean;
  document_number_required: boolean;
  issue_date_required: boolean;
  expiry_date_required: boolean;
  allow_expired_document: boolean;
}

export interface PluginAuthorizationFormOption {
  value: string;
  label: string;
  description?: string | null;
  is_active: boolean;
}

export interface PluginAuthorizationFormField {
  key: string;
  label: string;
  type: PluginAuthorizationFormFieldType;
  description?: string | null;
  help_text?: string | null;
  placeholder?: string | null;
  required: boolean;
  default_value?: unknown;
  options: PluginAuthorizationFormOption[];
  min_length?: number | null;
  max_length?: number | null;
  min_value?: number | null;
  max_value?: number | null;
  pattern?: string | null;
  accepted_extensions: string[];
  max_file_size_mb: number;
  position: number;
}

export interface PluginAuthorizationForm {
  key: string;
  title: string;
  description: string;
  instructions: string;
  submit_label: string;
  success_message: string;
  allow_save_draft: boolean;
  fields: PluginAuthorizationFormField[];
}

export interface PluginAcquisitionParameters {
  availability: PluginAvailability;
  download_requires_approval: boolean;
  approval_mode: PluginApprovalMode;
  authorization_form: PluginAuthorizationForm | null;
  authorization_documents: PluginAuthorizationDocument[];
  instructions_title: string | null;
  instructions_description: string | null;
  require_terms_acceptance: boolean;
  terms_url: string | null;
}

export interface PluginInstallationParameters {
  activation_required: boolean;
  allow_auto_update: boolean;
  require_update_confirmation: boolean;
  allow_user_uninstall: boolean;
  max_active_installations: number | null;
}

export interface PluginPermissionParameters {
  enabled: boolean;
  require_authentication: boolean;
  allow_admin_override: boolean;
  allow_custom_roles: boolean;
  default_access: "DENY" | "READ" | "USE" | "MANAGE";
  allow_data_export: boolean;
  allow_data_import: boolean;
  allow_bulk_operations: boolean;
  allow_audit_log_access: boolean;
}

export interface PluginResourceParameters {
  allow_global_read: boolean;
  allow_global_create: boolean;
  allow_global_update: boolean;
  allow_global_delete: boolean;
  allow_global_import: boolean;
  allow_global_export: boolean;
  allow_user_create: boolean;
  allow_user_update: boolean;
  allow_user_delete: boolean;
  allow_user_import: boolean;
  allow_user_export: boolean;
  allow_bulk_operations: boolean;
  require_delete_confirmation: boolean;
  allow_offline_editing: boolean;
  allow_schema_override: boolean;
}

export interface PluginProgramParameters {
  enabled: boolean;
  allow_user_join: boolean;
  join_requires_approval: boolean;
  allow_user_leave: boolean;
  allow_user_create: boolean;
  allow_user_manage: boolean;
  allow_parallel_programs: boolean;
  allow_multiple_programs_per_user: boolean;
  allow_manual_start: boolean;
  allow_automatic_start: boolean;
  allow_recurring_schedule: boolean;
}

export interface PluginProjectParameters {
  enabled: boolean;
  allow_user_create: boolean;
  creation_requires_approval: boolean;
  allow_user_customize: boolean;
  allow_resource_override: boolean;
  allow_form_override: boolean;
  allow_rules_override: boolean;
  allow_multiple_active_projects: boolean;
  allow_self_assignment: boolean;
  allow_supervisor_assignment: boolean;
  allow_project_archive: boolean;
  allow_project_delete: boolean;
  allow_offline_execution: boolean;
}

export interface PluginCollectionParameters {
  enabled: boolean;
  allow_drafts: boolean;
  auto_save_drafts: boolean;
  auto_save_interval_seconds: number;
  allow_partial_submission: boolean;
  require_validation_before_submission: boolean;
  require_submission_confirmation: boolean;
  allow_edit_after_submission: boolean;
  correction_requires_approval: boolean;
  allow_duplicate_submission: boolean;
}

export interface PluginMobileParameters {
  enabled: boolean;
  offline_enabled: boolean;
  offline_allow_data_entry: boolean;
  offline_allow_data_edit: boolean;
  offline_allow_data_delete: boolean;
  max_offline_days: number | null;
  automatic_sync: boolean;
  sync_wifi_only: boolean;
  sync_interval_seconds: number;
  retry_sync_on_failure: boolean;
  location_enabled: boolean;
  location_required_for_collection: boolean;
  location_required_for_submission: boolean;
  camera_enabled: boolean;
  file_upload_enabled: boolean;
  max_file_size_mb: number;
  allowed_file_extensions: string[];
  notifications_enabled: boolean;
}

export interface PluginSecurityParameters {
  session_max_idle_minutes: number;
  encrypt_local_storage: boolean;
  encrypt_sensitive_fields: boolean;
  audit_enabled: boolean;
  audit_track_reads: boolean;
  audit_track_creates: boolean;
  audit_track_updates: boolean;
  audit_track_deletes: boolean;
  audit_track_exports: boolean;
  require_secure_device: boolean;
  block_rooted_or_modified_device: boolean;
}

export interface PluginPrivacyParameters {
  allow_data_export: boolean;
  allow_data_deletion: boolean;
  retention_enabled: boolean;
  retention_days: number | null;
  anonymize_after_retention: boolean;
  require_delete_confirmation: boolean;
}

export interface PluginNotificationParameters {
  enabled: boolean;
  notify_on_approval_request: boolean;
  notify_on_approval_decision: boolean;
  notify_on_sync_failure: boolean;
  notify_on_project_assignment: boolean;
  notify_on_submission: boolean;
  allow_push: boolean;
  allow_email: boolean;
}

export interface PluginLocalizationParameters {
  default_language: string;
  supported_languages: string[];
  timezone: string;
  date_format: string;
  decimal_separator: "." | ",";
}

export interface PluginSupportParameters {
  support_email: string | null;
  support_url: string | null;
  documentation_url: string | null;
  report_issue_url: string | null;
}

export interface PluginLegalParameters {
  terms_url: string | null;
  privacy_policy_url: string | null;
  legal_notice_url: string | null;
  license_name: string | null;
  require_terms_acceptance_on_installation: boolean;
}

export interface PluginAdvancedParameters {
  allow_experimental_features: boolean;
  debug_mode: boolean;
  expose_technical_errors: boolean;
  custom: Record<string, unknown>;
}

export interface PluginParameters {
  schema_version: number;
  acquisition: PluginAcquisitionParameters;
  installation: PluginInstallationParameters;
  permissions: PluginPermissionParameters;
  resources: PluginResourceParameters;
  programs: PluginProgramParameters;
  projects: PluginProjectParameters;
  collection: PluginCollectionParameters;
  mobile: PluginMobileParameters;
  security: PluginSecurityParameters;
  privacy: PluginPrivacyParameters;
  notifications: PluginNotificationParameters;
  localization: PluginLocalizationParameters;
  support: PluginSupportParameters;
  legal: PluginLegalParameters;
  advanced: PluginAdvancedParameters;
}
