export interface PluginFormTemplate {
  id: number;
  project_template_id: number;
  key: string;
  name: string;
  description: string | null;
  form_type: string;
  position: number;
  is_active: boolean;
  required: boolean;
  min_instances: number;
  max_instances: number | null;
  allow_user_use: boolean;
  allow_user_customization: boolean;
  global_config: Record<string, unknown>;
  definition: Record<string, unknown>;
  resource_bindings: Array<Record<string, unknown>>;
  rules: Array<Record<string, unknown>>;
  metrics: Array<Record<string, unknown>>;
}

export interface PluginFormTemplateListResponse {
  items: PluginFormTemplate[];
  count: number;
}

export interface PluginFormTemplateCreate {
  key: string;
  name: string;
  description?: string | null;
  form_type: string;
  position?: number;
  required?: boolean;
  min_instances?: number;
  max_instances?: number | null;
  allow_user_use?: boolean;
  allow_user_customization?: boolean;
  global_config?: Record<string, unknown>;
  definition?: Record<string, unknown>;
  resource_bindings?: Array<Record<string, unknown>>;
  rules?: Array<Record<string, unknown>>;
  metrics?: Array<Record<string, unknown>>;
}

export interface PluginFormTemplateUpdate {
  key?: string;
  name?: string;
  description?: string | null;
  form_type?: string;
  position?: number;
  is_active?: boolean;
  required?: boolean;
  min_instances?: number;
  max_instances?: number | null;
  allow_user_use?: boolean;
  allow_user_customization?: boolean;
  global_config?: Record<string, unknown>;
  definition?: Record<string, unknown>;
  resource_bindings?: Array<Record<string, unknown>>;
  rules?: Array<Record<string, unknown>>;
  metrics?: Array<Record<string, unknown>>;
}
