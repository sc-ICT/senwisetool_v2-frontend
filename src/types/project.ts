export type ProjectStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface ProjectGlobalConfig {
  collection: {
    require_all_questions: boolean;
  };

  geolocation: {
    enabled: boolean;
    accuracy: number | null;
    capture_on_submit: boolean;
    max_distance_between_points: number | null;
    min_points: number | null;
    max_points: number | null;
  };

  mapping: {
    enabled: boolean;
    basemap: "standard" | "satellite";
  };

  agent_monitoring: {
    enabled: boolean;

    track_gps: boolean;
    gps_interval_seconds: number;

    track_camera: boolean;
    camera_interval_seconds: number;

    track_audio: boolean;
    audio_clip_duration_seconds: number;
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
  attachments: {
    enabled: boolean;
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
  project_folder_id: number | null;
  created_by: number;
}

export interface ProjectListResponse {
  items: Project[];
  count: number;
}

export interface ProjectCreate {
  name: string;
  description?: string | null;
  project_type: string;
}

export interface ProjectUpdate {
  name?: string;
  description?: string | null;
  project_type?: string;
  global_config?: ProjectGlobalConfig;
  status?: ProjectStatus;
}
