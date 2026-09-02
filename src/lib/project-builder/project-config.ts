import type { ProjectGlobalConfig } from "@/types/project";

export const DEFAULT_PROJECT_GLOBAL_CONFIG: ProjectGlobalConfig = {
  collection: {
    require_all_questions: false,
  },

  geolocation: {
    enabled: false,
    accuracy: null,
    capture_on_submit: true,
    max_distance_between_points: null,
    min_points: null,
    max_points: null,
  },

  mapping: {
    enabled: false,
    basemap: "standard",
  },

  agent_monitoring: {
    enabled: false,
    track_gps: false,
    gps_interval_seconds: 30,
    track_camera: false,
    camera_interval_seconds: 30,
    track_audio: false,
    audio_clip_duration_seconds: 10,
  },

  anti_fraud: {
    enabled: false,
    capture_device_info: true,
    capture_location_history: false,
  },

  offline: {
    enabled: true,
  },

  media: {
    allow_photo: true,
    allow_video: false,
    allow_audio: false,
  },

  attachments: {
    enabled: false,
  },
};

export function normalizeProjectGlobalConfig(
  config: Partial<ProjectGlobalConfig> | undefined,
): ProjectGlobalConfig {
  return {
    collection: {
      require_all_questions: config?.collection?.require_all_questions ?? false,
    },

    geolocation: {
      enabled: config?.geolocation?.enabled ?? false,
      accuracy: config?.geolocation?.accuracy ?? null,
      capture_on_submit: config?.geolocation?.capture_on_submit ?? true,
      max_distance_between_points:
        config?.geolocation?.max_distance_between_points ?? null,
      min_points: config?.geolocation?.min_points ?? null,
      max_points: config?.geolocation?.max_points ?? null,
    },

    mapping: {
      enabled: config?.mapping?.enabled ?? false,
      basemap: config?.mapping?.basemap ?? "standard",
    },

    agent_monitoring: {
      enabled: config?.agent_monitoring?.enabled ?? false,
      track_gps: config?.agent_monitoring?.track_gps ?? false,
      gps_interval_seconds:
        config?.agent_monitoring?.gps_interval_seconds ?? 30,
      track_camera: config?.agent_monitoring?.track_camera ?? false,
      camera_interval_seconds:
        config?.agent_monitoring?.camera_interval_seconds ?? 30,
      track_audio: config?.agent_monitoring?.track_audio ?? false,
      audio_clip_duration_seconds:
        config?.agent_monitoring?.audio_clip_duration_seconds ?? 10,
    },

    anti_fraud: {
      enabled: config?.anti_fraud?.enabled ?? false,
      capture_device_info: config?.anti_fraud?.capture_device_info ?? true,
      capture_location_history:
        config?.anti_fraud?.capture_location_history ?? false,
    },

    offline: {
      enabled: config?.offline?.enabled ?? true,
    },

    media: {
      allow_photo: config?.media?.allow_photo ?? true,
      allow_video: config?.media?.allow_video ?? false,
      allow_audio: config?.media?.allow_audio ?? false,
    },

    attachments: {
      enabled: config?.attachments?.enabled ?? false,
    },
  };
}
