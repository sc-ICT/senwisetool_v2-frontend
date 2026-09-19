import type { PluginParameters } from "@/types/plugin-settings";

export type PluginStatus = "DRAFT" | "PUBLISHED" | "UNPUBLISHED" | "ARCHIVED";

export type PluginVersionStatus = "DRAFT" | "PUBLISHED" | "DEPRECATED";

export type PluginResourceScope = "GLOBAL" | "USER";

export interface PluginVersion {
  id: number;
  plugin_id: number;
  version: string;
  status: PluginVersionStatus;

  /**
   * Snapshot immutable de la configuration
   * du plugin au moment de la publication.
   */
  definition: Record<string, unknown>;

  /**
   * SHA-256 du snapshot canonique.
   */
  definition_hash: string | null;

  release_notes: string | null;

  published_at: string | null;
  deprecated_at: string | null;

  created_at: string;
  updated_at: string;
}

export interface Plugin {
  id: number;
  code: string;
  name: string;
  slug: string;
  description: string;
  short_description: string | null;
  icon_url: string | null;
  banner_url: string | null;
  category: string | null;
  tags: string[];
  parameters: PluginParameters;
  metadata_config: Record<string, unknown>;
  status: PluginStatus;
  is_public: boolean;
  created_by: number;
  published_at: string | null;
  unpublished_at: string | null;
  created_at: string;
  updated_at: string;
  versions: PluginVersion[];
}

export interface PluginCreate {
  name: string;
  description: string;
  short_description?: string | null;
  icon_url?: string | null;
  banner_url?: string | null;
  category?: string | null;
  tags?: string[];
  parameters?: PluginParameters;
  metadata_config?: Record<string, unknown>;
  initial_version?: string;
  release_notes?: string | null;
}

export interface PluginUpdate {
  name?: string;
  description?: string;
  short_description?: string | null;
  icon_url?: string | null;
  banner_url?: string | null;
  category?: string | null;
  tags?: string[];
  parameters?: PluginParameters;
  metadata_config?: Record<string, unknown>;
}

export interface PluginListResponse {
  items: Plugin[];
  count: number;
}

export interface PluginVersionIntegrity {
  version_id: number;
  version: string;
  status: PluginVersionStatus;
  valid: boolean;
  definition_hash: string | null;
}
