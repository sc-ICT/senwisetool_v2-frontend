export type ProjectStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface ProjectGlobalConfig {
  geolocation: {
    enabled: boolean;
    accuracy: number | null;
    capture_on_submit: boolean;
  };

  anti_fraud: {
    enabled: boolean;
    capture_device_info: boolean;
    capture_location_history: boolean;
  };

  offline: {
    enabled: boolean;
  };

  media: {
    allow_photo: boolean;
    allow_video: boolean;
    allow_audio: boolean;
  };
}

export interface Project {
  id: number;
  code: string;
  name: string;
  description: string | null;
  project_type: string;
  status: ProjectStatus;
  global_config: ProjectGlobalConfig;
  created_by: number;
}

export interface ProjectListResponse {
  items: Project[];
  count: number;
}

export interface ProjectCreate {
  code: string;
  name: string;
  description: string | null;
  project_type: string;
  global_config: ProjectGlobalConfig;
}

export interface ProjectUpdate {
  name?: string;
  description?: string | null;
  project_type?: string;
  global_config?: ProjectGlobalConfig;
  status?: ProjectStatus;
}
