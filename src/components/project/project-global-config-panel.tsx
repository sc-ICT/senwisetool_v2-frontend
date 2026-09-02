"use client";

import {
  ChevronDown,
  ChevronRight,
  Image,
  Loader2,
  MapPin,
  Mic,
  Paperclip,
  Save,
  ShieldCheck,
  Video,
  Wifi,
  X,
} from "lucide-react";
import { useState } from "react";

import { fileSystemService } from "@/services/file-system.service";
import type { FileNode } from "@/types/file-system";
import type { ProjectGlobalConfig } from "@/types/project";

import { AttachmentsSection } from "@/components/form-builder/form-attachments-section";

interface ProjectGlobalConfigPanelProps {
  projectFolderId: number | null;
  config: ProjectGlobalConfig;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (config: ProjectGlobalConfig) => void;
}

type ConfigSection =
  | "collection"
  | "geolocation"
  | "mapping"
  | "agent_monitoring"
  | "anti_fraud"
  | "offline"
  | "media"
  | "attachments";

export function ProjectGlobalConfigPanel({
  projectFolderId,
  config,
  isPending,
  onClose,
  onSubmit,
}: ProjectGlobalConfigPanelProps) {
  const [localConfig, setLocalConfig] = useState<ProjectGlobalConfig>(() =>
    normalizeProjectGlobalConfig(config),
  );

  const [openSections, setOpenSections] = useState<
    Record<ConfigSection, boolean>
  >({
    collection: true,
    geolocation: true,
    mapping: true,
    agent_monitoring: false,
    anti_fraud: false,
    offline: false,
    media: false,
    attachments: true,
  });

  const toggleSection = (section: ConfigSection) => {
    setOpenSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  };

  const updateCollection = (
    patch: Partial<ProjectGlobalConfig["collection"]>,
  ) => {
    setLocalConfig((current) => ({
      ...current,
      collection: {
        ...current.collection,
        ...patch,
      },
    }));
  };

  const updateGeolocation = (
    patch: Partial<ProjectGlobalConfig["geolocation"]>,
  ) => {
    setLocalConfig((current) => ({
      ...current,
      geolocation: {
        ...current.geolocation,
        ...patch,
      },
    }));
  };

  const updateMapping = (patch: Partial<ProjectGlobalConfig["mapping"]>) => {
    setLocalConfig((current) => ({
      ...current,
      mapping: {
        ...current.mapping,
        ...patch,
      },
    }));
  };

  const updateMonitoring = (
    patch: Partial<ProjectGlobalConfig["agent_monitoring"]>,
  ) => {
    setLocalConfig((current) => ({
      ...current,
      agent_monitoring: {
        ...current.agent_monitoring,
        ...patch,
      },
    }));
  };

  const updateAntiFraud = (
    patch: Partial<ProjectGlobalConfig["anti_fraud"]>,
  ) => {
    setLocalConfig((current) => ({
      ...current,
      anti_fraud: {
        ...current.anti_fraud,
        ...patch,
      },
    }));
  };

  const updateOffline = (patch: Partial<ProjectGlobalConfig["offline"]>) => {
    setLocalConfig((current) => ({
      ...current,
      offline: {
        ...current.offline,
        ...patch,
      },
    }));
  };

  const updateMedia = (patch: Partial<ProjectGlobalConfig["media"]>) => {
    setLocalConfig((current) => ({
      ...current,
      media: {
        ...current.media,
        ...patch,
      },
    }));
  };

  const updateAttachments = (
    patch: Partial<ProjectGlobalConfig["attachments"]>,
  ) => {
    setLocalConfig((current) => ({
      ...current,
      attachments: {
        ...current.attachments,
        ...patch,
      },
    }));
  };

  return (
    <>
      {/* Overlay */}
      <div
        onMouseDown={(event) => {
          if (event.target === event.currentTarget && !isPending) {
            onClose();
          }
        }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 90,
          background: "rgba(0, 0, 0, 0.18)",
        }}
      />

      {/* Panel */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 100,
          width: "min(460px, 92vw)",
          display: "flex",
          flexDirection: "column",
          background: "var(--color-surface)",
          borderLeft: "1px solid var(--color-border)",
          boxShadow: "-12px 0 40px rgba(0, 0, 0, 0.12)",
        }}
      >
        {/* Header */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "1rem",
            padding: "1.25rem",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
              }}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "0.625rem",
                  background: "rgba(14, 165, 233, 0.10)",
                }}
              >
                <ShieldCheck size={17} color="#0EA5E9" />
              </div>

              <div>
                <div
                  style={{
                    fontSize: "0.9375rem",
                    fontWeight: 700,
                    color: "var(--color-foreground)",
                  }}
                >
                  Paramètres globaux du projet
                </div>

                <div
                  style={{
                    marginTop: "0.2rem",
                    fontSize: "0.6875rem",
                    lineHeight: 1.45,
                    color: "var(--color-foreground-muted)",
                  }}
                >
                  Configurez les règles générales du projet.
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            aria-label="Fermer les paramètres"
            style={iconButtonStyle}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0.75rem",
          }}
        >
          {/* COLLECTION */}
          <ConfigSectionHeader
            icon={<ShieldCheck size={16} />}
            title="Collecte"
            description="Règles générales appliquées aux formulaires."
            open={openSections.collection}
            onClick={() => toggleSection("collection")}
          />

          {openSections.collection && (
            <div style={sectionContentStyle}>
              <ToggleRow
                label="Toutes les questions obligatoires"
                description="Les formulaires du projet pourront appliquer cette règle par défaut."
                checked={localConfig.collection.require_all_questions}
                disabled={isPending}
                onChange={(value) => {
                  updateCollection({
                    require_all_questions: value,
                  });
                }}
              />
            </div>
          )}

          {/* GEOLOCATION */}
          <ConfigSectionHeader
            icon={<MapPin size={16} />}
            title="Géolocalisation"
            description="Paramètres GPS globaux du projet."
            open={openSections.geolocation}
            onClick={() => toggleSection("geolocation")}
          />

          {openSections.geolocation && (
            <div style={sectionContentStyle}>
              <ToggleRow
                label="Activer la géolocalisation"
                description="Autorise l'utilisation de la position GPS."
                checked={localConfig.geolocation.enabled}
                disabled={isPending}
                onChange={(value) => {
                  updateGeolocation({
                    enabled: value,
                  });
                }}
              />

              {localConfig.geolocation.enabled && (
                <div style={nestedFieldsStyle}>
                  <NumberField
                    label="Précision GPS"
                    suffix="mètres"
                    value={localConfig.geolocation.accuracy}
                    disabled={isPending}
                    min={1}
                    nullable
                    onChange={(value) => {
                      updateGeolocation({
                        accuracy: value,
                      });
                    }}
                  />

                  <ToggleRow
                    label="Capturer à la soumission"
                    description="Enregistre la position au moment de la validation."
                    checked={localConfig.geolocation.capture_on_submit}
                    disabled={isPending}
                    onChange={(value) => {
                      updateGeolocation({
                        capture_on_submit: value,
                      });
                    }}
                  />

                  <NumberField
                    label="Distance maximale entre les points"
                    suffix="mètres"
                    value={localConfig.geolocation.max_distance_between_points}
                    disabled={isPending}
                    min={1}
                    nullable
                    onChange={(value) => {
                      updateGeolocation({
                        max_distance_between_points: value,
                      });
                    }}
                  />

                  <NumberField
                    label="Nombre minimum de points"
                    value={localConfig.geolocation.min_points}
                    disabled={isPending}
                    min={1}
                    nullable
                    onChange={(value) => {
                      updateGeolocation({
                        min_points: value,
                      });
                    }}
                  />

                  <NumberField
                    label="Nombre maximum de points"
                    value={localConfig.geolocation.max_points}
                    disabled={isPending}
                    min={1}
                    nullable
                    onChange={(value) => {
                      updateGeolocation({
                        max_points: value,
                      });
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* MAPPING */}
          <ConfigSectionHeader
            icon={<MapPin size={16} />}
            title="Fond de carte"
            description="Configuration cartographique globale."
            open={openSections.mapping}
            onClick={() => toggleSection("mapping")}
          />

          {openSections.mapping && (
            <div style={sectionContentStyle}>
              <ToggleRow
                label="Activer le fond de carte"
                description="Permet d'utiliser un fond cartographique."
                checked={localConfig.mapping.enabled}
                disabled={isPending}
                onChange={(value) => {
                  updateMapping({
                    enabled: value,
                  });
                }}
              />

              {localConfig.mapping.enabled && (
                <div style={{ marginTop: "1rem" }}>
                  <div style={subsectionTitleStyle}>Fond cartographique</div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                      marginTop: "0.625rem",
                    }}
                  >
                    <RadioRow
                      label="Google Maps"
                      checked={localConfig.mapping.basemap === "standard"}
                      disabled={isPending}
                      onChange={() => {
                        updateMapping({
                          basemap: "standard",
                        });
                      }}
                    />

                    <RadioRow
                      label="Google Satellite"
                      checked={localConfig.mapping.basemap === "satellite"}
                      disabled={isPending}
                      onChange={() => {
                        updateMapping({
                          basemap: "satellite",
                        });
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MONITORING */}
          <ConfigSectionHeader
            icon={<MapPin size={16} />}
            title="Surveillance terrain"
            description="Suivi périodique du travail des agents."
            open={openSections.agent_monitoring}
            onClick={() => toggleSection("agent_monitoring")}
          />

          {openSections.agent_monitoring && (
            <div style={sectionContentStyle}>
              <ToggleRow
                label="Activer la surveillance terrain"
                description="Permet de suivre certains événements pendant la collecte."
                checked={localConfig.agent_monitoring.enabled}
                disabled={isPending}
                onChange={(value) => {
                  updateMonitoring({
                    enabled: value,
                  });
                }}
              />

              {localConfig.agent_monitoring.enabled && (
                <div style={nestedFieldsStyle}>
                  <div style={subsectionTitleStyle}>Suivi GPS</div>

                  <ToggleRow
                    label="Suivre la position GPS"
                    checked={localConfig.agent_monitoring.track_gps}
                    disabled={isPending}
                    onChange={(value) => {
                      updateMonitoring({
                        track_gps: value,
                      });
                    }}
                  />

                  {localConfig.agent_monitoring.track_gps && (
                    <NumberField
                      label="Intervalle GPS"
                      suffix="secondes"
                      value={localConfig.agent_monitoring.gps_interval_seconds}
                      disabled={isPending}
                      min={1}
                      onChange={(value) => {
                        updateMonitoring({
                          gps_interval_seconds: value ?? 30,
                        });
                      }}
                    />
                  )}

                  <div style={subsectionTitleStyle}>Caméra</div>

                  <ToggleRow
                    // eslint-disable-next-line jsx-a11y/alt-text
                    icon={<Image size={15} />}
                    label="Capturer périodiquement"
                    checked={localConfig.agent_monitoring.track_camera}
                    disabled={isPending}
                    onChange={(value) => {
                      updateMonitoring({
                        track_camera: value,
                      });
                    }}
                  />

                  {localConfig.agent_monitoring.track_camera && (
                    <NumberField
                      label="Intervalle caméra"
                      suffix="secondes"
                      value={
                        localConfig.agent_monitoring.camera_interval_seconds
                      }
                      disabled={isPending}
                      min={1}
                      onChange={(value) => {
                        updateMonitoring({
                          camera_interval_seconds: value ?? 300,
                        });
                      }}
                    />
                  )}

                  <div style={subsectionTitleStyle}>Audio</div>

                  <ToggleRow
                    icon={<Mic size={15} />}
                    label="Capturer l'audio"
                    checked={localConfig.agent_monitoring.track_audio}
                    disabled={isPending}
                    onChange={(value) => {
                      updateMonitoring({
                        track_audio: value,
                      });
                    }}
                  />

                  {localConfig.agent_monitoring.track_audio && (
                    <NumberField
                      label="Durée d'un extrait audio"
                      suffix="secondes"
                      value={
                        localConfig.agent_monitoring.audio_clip_duration_seconds
                      }
                      disabled={isPending}
                      min={1}
                      onChange={(value) => {
                        updateMonitoring({
                          audio_clip_duration_seconds: value ?? 10,
                        });
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* ANTI FRAUD */}
          <ConfigSectionHeader
            icon={<ShieldCheck size={16} />}
            title="Sécurité et anti-fraude"
            description="Contrôles globaux appliqués au projet."
            open={openSections.anti_fraud}
            onClick={() => toggleSection("anti_fraud")}
          />

          {openSections.anti_fraud && (
            <div style={sectionContentStyle}>
              <ToggleRow
                label="Activer les contrôles anti-fraude"
                checked={localConfig.anti_fraud.enabled}
                disabled={isPending}
                onChange={(value) => {
                  updateAntiFraud({
                    enabled: value,
                  });
                }}
              />

              {localConfig.anti_fraud.enabled && (
                <div style={nestedFieldsStyle}>
                  <ToggleRow
                    label="Capturer les informations de l'appareil"
                    checked={localConfig.anti_fraud.capture_device_info}
                    disabled={isPending}
                    onChange={(value) => {
                      updateAntiFraud({
                        capture_device_info: value,
                      });
                    }}
                  />

                  <ToggleRow
                    label="Conserver l'historique de position"
                    checked={localConfig.anti_fraud.capture_location_history}
                    disabled={isPending}
                    onChange={(value) => {
                      updateAntiFraud({
                        capture_location_history: value,
                      });
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* OFFLINE */}
          <ConfigSectionHeader
            icon={<Wifi size={16} />}
            title="Hors connexion"
            description="Autorisation de travailler sans connexion."
            open={openSections.offline}
            onClick={() => toggleSection("offline")}
          />

          {openSections.offline && (
            <div style={sectionContentStyle}>
              <ToggleRow
                label="Autoriser la collecte hors connexion"
                description="Les données pourront être synchronisées ultérieurement."
                checked={localConfig.offline.enabled}
                disabled={isPending}
                onChange={(value) => {
                  updateOffline({
                    enabled: value,
                  });
                }}
              />
            </div>
          )}

          {/* MEDIA */}
          <ConfigSectionHeader
            // eslint-disable-next-line jsx-a11y/alt-text
            icon={<Image size={16} />}
            title="Médias"
            description="Types de médias autorisés dans le projet."
            open={openSections.media}
            onClick={() => toggleSection("media")}
          />

          {openSections.media && (
            <div style={sectionContentStyle}>
              <ToggleRow
                // eslint-disable-next-line jsx-a11y/alt-text
                icon={<Image size={15} />}
                label="Photos"
                checked={localConfig.media.allow_photo}
                disabled={isPending}
                onChange={(value) => {
                  updateMedia({
                    allow_photo: value,
                  });
                }}
              />

              <ToggleRow
                icon={<Video size={15} />}
                label="Vidéos"
                checked={localConfig.media.allow_video}
                disabled={isPending}
                onChange={(value) => {
                  updateMedia({
                    allow_video: value,
                  });
                }}
              />

              <ToggleRow
                icon={<Mic size={15} />}
                label="Audio"
                checked={localConfig.media.allow_audio}
                disabled={isPending}
                onChange={(value) => {
                  updateMedia({
                    allow_audio: value,
                  });
                }}
              />
            </div>
          )}

          {/* ATTACHMENTS */}
          <ConfigSectionHeader
            icon={<Paperclip size={16} />}
            title="Fichiers attachés"
            description="Règle globale concernant les fichiers."
            open={openSections.attachments}
            onClick={() => toggleSection("attachments")}
          />

          {openSections.attachments && (
            <div style={sectionContentStyle}>
              <ToggleRow
                label="Autoriser les fichiers attachés"
                description="Les formulaires pourront utiliser les fichiers attachés."
                checked={localConfig.attachments.enabled}
                disabled={isPending}
                onChange={(value) => {
                  updateAttachments({
                    enabled: value,
                  });
                }}
              />

              {localConfig.attachments.enabled && (
                <AttachmentsSection
                  enabled={localConfig.attachments.enabled}
                  disabled={isPending || projectFolderId === null}
                  listFiles={async (): Promise<FileNode[]> => {
                    if (projectFolderId === null) {
                      throw new Error(
                        "Le dossier de fichiers du projet est introuvable.",
                      );
                    }

                    const response =
                      await fileSystemService.listChildren(projectFolderId);

                    if (!response.data) {
                      throw new Error(
                        "Les fichiers du projet n'ont pas pu être récupérés.",
                      );
                    }

                    return response.data.items.filter(
                      (item) => item.type === "FILE",
                    );
                  }}
                  uploadFile={async (file) => {
                    if (projectFolderId === null) {
                      throw new Error(
                        "Le dossier de fichiers du projet est introuvable.",
                      );
                    }

                    const response = await fileSystemService.import(
                      [file],
                      [file.name],
                      projectFolderId,
                    );

                    if (!response.data) {
                      throw new Error(
                        "Le fichier uploadé n'a pas pu être récupéré.",
                      );
                    }

                    const uploadedFile = response.data.find(
                      (item) => item.type === "FILE",
                    );

                    if (!uploadedFile) {
                      throw new Error(
                        "Le fichier uploadé n'a pas pu être récupéré.",
                      );
                    }

                    return uploadedFile;
                  }}
                  deleteFile={async (fileId) => {
                    await fileSystemService.delete(fileId);
                  }}
                  emptyMessage="Aucun fichier attaché à ce projet."
                />
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.5rem",
            padding: "0.875rem 1rem",
            borderTop: "1px solid var(--color-border)",
            background: "var(--color-surface-raised)",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            style={secondaryButtonStyle}
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={() => onSubmit(localConfig)}
            disabled={isPending}
            style={{
              ...primaryButtonStyle,
              opacity: isPending ? 0.65 : 1,
            }}
          >
            {isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save size={14} />
                Enregistrer
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

function normalizeProjectGlobalConfig(
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
        config?.agent_monitoring?.camera_interval_seconds ?? 300,
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

function ConfigSectionHeader({
  icon,
  title,
  description,
  open,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "0.625rem",
        padding: "0.8rem 0.5rem",
        border: 0,
        borderTop: "1px solid var(--color-border)",
        background: "transparent",
        color: "var(--color-foreground)",
        textAlign: "left",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: "30px",
          height: "30px",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "0.5rem",
          background: "var(--color-surface-raised)",
          color: "var(--color-foreground-muted)",
        }}
      >
        {icon}
      </div>

      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
          }}
        >
          {title}
        </div>

        <div
          style={{
            marginTop: "0.15rem",
            fontSize: "0.625rem",
            color: "var(--color-foreground-muted)",
          }}
        >
          {description}
        </div>
      </div>

      {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
    </button>
  );
}

function ToggleRow({
  icon,
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  icon?: React.ReactNode;
  label: string;
  description?: string;
  checked: boolean;
  disabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.625rem",
        minHeight: "52px",
        padding: "0rem 0 0.2rem 2.5rem",
      }}
    >
      {icon && (
        <div
          style={{
            width: "28px",
            height: "28px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "0.5rem",
            background: "var(--color-surface-raised)",
            color: "var(--color-foreground-muted)",
          }}
        >
          {icon}
        </div>
      )}

      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: "0.6875rem",
            fontWeight: 500,
            color: "var(--color-foreground)",
          }}
        >
          {label}
        </div>

        {description && (
          <div
            style={{
              marginTop: "0.15rem",
              fontSize: "0.625rem",
              lineHeight: 1.4,
              color: "var(--color-foreground-muted)",
            }}
          >
            {description}
          </div>
        )}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        style={{
          position: "relative",
          width: "38px",
          height: "22px",
          flexShrink: 0,
          border: 0,
          borderRadius: "999px",
          background: checked ? "#5DB83A" : "var(--color-border)",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: "3px",
            left: checked ? "19px" : "3px",
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            background: "#FFFFFF",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.25)",
            transition: "left 0.15s ease",
          }}
        />
      </button>
    </div>
  );
}

function RadioRow({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: () => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <input
        type="radio"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />

      <span
        style={{
          fontSize: "0.6875rem",
          color: "var(--color-foreground)",
        }}
      >
        {label}
      </span>
    </label>
  );
}

function NumberField({
  label,
  suffix,
  value,
  disabled,
  min,
  nullable = false,
  onChange,
}: {
  label: string;
  suffix?: string;
  value: number | null;
  disabled: boolean;
  min?: number;
  nullable?: boolean;
  onChange: (value: number | null) => void;
}) {
  return (
    <div style={{ padding: "0.625rem 0" }}>
      <label
        style={{
          display: "block",
          marginBottom: "0.375rem",
          fontSize: "0.65625rem",
          fontWeight: 600,
          color: "var(--color-foreground)",
        }}
      >
        {label}
      </label>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <input
          type="number"
          min={min}
          value={value ?? ""}
          disabled={disabled}
          onChange={(event) => {
            const raw = event.target.value;

            if (raw === "") {
              onChange(nullable ? null : value);
              return;
            }

            const parsed = Number(raw);

            if (!Number.isFinite(parsed)) {
              return;
            }

            onChange(min !== undefined ? Math.max(min, parsed) : parsed);
          }}
          style={inputStyle}
        />

        {suffix && (
          <span
            style={{
              fontSize: "0.625rem",
              color: "var(--color-foreground-muted)",
            }}
          >
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

const sectionContentStyle = {
  padding: "0 0.5rem 0.5rem",
};

const nestedFieldsStyle = {
  marginLeft: "0.75rem",
  paddingLeft: "0.75rem",
  borderLeft: "2px solid var(--color-border)",
};

const subsectionTitleStyle = {
  padding: "0.75rem 0 0.35rem",
  fontSize: "0.625rem",
  fontWeight: 700,
  textTransform: "uppercase" as const,
  letterSpacing: "0.04em",
  color: "var(--color-foreground-muted)",
};

const iconButtonStyle = {
  width: "32px",
  height: "32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  border: "1px solid var(--color-border)",
  borderRadius: "0.5rem",
  background: "var(--color-surface-raised)",
  color: "var(--color-foreground-muted)",
  cursor: "pointer",
};

const inputStyle = {
  width: "160px",
  height: "34px",
  padding: "0 0.625rem",
  border: "1px solid var(--color-border)",
  borderRadius: "0.5rem",
  background: "var(--color-surface-raised)",
  color: "var(--color-foreground)",
  fontSize: "0.6875rem",
  outline: "none",
};

const secondaryButtonStyle = {
  height: "34px",
  padding: "0 0.75rem",
  borderRadius: "0.5rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface)",
  color: "var(--color-foreground)",
  fontSize: "0.6875rem",
  fontWeight: 600,
  cursor: "pointer",
};

const primaryButtonStyle = {
  height: "34px",
  padding: "0 0.75rem",
  borderRadius: "0.5rem",
  border: "1px solid rgba(93, 184, 58, 0.3)",
  background: "rgba(93, 184, 58, 0.12)",
  color: "#5DB83A",
  display: "flex",
  alignItems: "center",
  gap: "0.375rem",
  fontSize: "0.6875rem",
  fontWeight: 600,
  cursor: "pointer",
};
