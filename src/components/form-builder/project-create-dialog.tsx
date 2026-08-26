"use client";

import {
  CloudOff,
  FileVideo,
  FolderKanban,
  Loader2,
  MapPin,
  ShieldCheck,
  X,
} from "lucide-react";
import { useState } from "react";

import type { ProjectGlobalConfig } from "@/types/project";

interface ProjectCreateDialogProps {
  isPending: boolean;
  onClose: () => void;
  onSubmit: (data: {
    code: string;
    name: string;
    description: string | null;
    projectType: string;
    globalConfig: ProjectGlobalConfig;
  }) => void;
}

const projectTypes = [
  {
    value: "INSPECTION_INITIALE",
    label: "Inspection initiale",
  },
  {
    value: "INSPECTION_INTERNE",
    label: "Inspection interne",
  },
  {
    value: "ENQUETE",
    label: "Enquête",
  },
  {
    value: "AUDIT",
    label: "Audit",
  },
  {
    value: "SUIVI",
    label: "Suivi",
  },
];

const defaultGlobalConfig: ProjectGlobalConfig = {
  geolocation: {
    enabled: false,
    accuracy: null,
    capture_on_submit: true,
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
};

export function ProjectCreateDialog({
  isPending,
  onClose,
  onSubmit,
}: ProjectCreateDialogProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [projectType, setProjectType] = useState("INSPECTION_INITIALE");

  const [globalConfig, setGlobalConfig] =
    useState<ProjectGlobalConfig>(defaultGlobalConfig);

  const [error, setError] = useState<string | null>(null);

  const updateConfig = <
    Section extends keyof ProjectGlobalConfig,
    Key extends keyof ProjectGlobalConfig[Section],
  >(
    section: Section,
    key: Key,
    value: ProjectGlobalConfig[Section][Key],
  ) => {
    setGlobalConfig((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [key]: value,
      },
    }));
  };

  const submit = () => {
    setError(null);

    const normalizedCode = code.trim().toUpperCase();

    const normalizedName = name.trim();

    const normalizedDescription = description.trim();

    if (!normalizedCode) {
      setError("Le code du projet est obligatoire.");
      return;
    }

    if (!normalizedName) {
      setError("Le nom du projet est obligatoire.");
      return;
    }

    onSubmit({
      code: normalizedCode,
      name: normalizedName,
      description: normalizedDescription || null,
      projectType,
      globalConfig,
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 150,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        background: "rgba(0, 0, 0, 0.35)",
        backdropFilter: "blur(4px)",
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPending) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-create-title"
        style={{
          width: "100%",
          maxWidth: "720px",
          maxHeight: "min(820px, 90vh)",
          display: "flex",
          flexDirection: "column",
          borderRadius: "1rem",
          border: "1px solid var(--color-border)",
          background: "var(--color-surface)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.18)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1rem 1.125rem",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div>
            <div
              id="project-create-title"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.9375rem",
                fontWeight: 700,
                color: "var(--color-foreground)",
              }}
            >
              <FolderKanban size={16} />
              Nouveau projet
            </div>

            <div
              style={{
                marginTop: "0.25rem",
                fontSize: "0.75rem",
                color: "var(--color-foreground-muted)",
              }}
            >
              Préparez le cadre général de votre projet.
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            aria-label="Fermer"
            style={closeButtonStyle}
          >
            <X size={16} />
          </button>
        </div>

        {/* Corps */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            padding: "1.25rem",
          }}
        >
          {error && (
            <div
              style={{
                marginBottom: "1rem",
                padding: "0.75rem 0.875rem",
                borderRadius: "0.625rem",
                border: "1px solid rgba(239, 68, 68, 0.18)",
                background: "rgba(239, 68, 68, 0.08)",
                color: "#DC2626",
                fontSize: "0.75rem",
              }}
            >
              {error}
            </div>
          )}

          <section>
            <SectionTitle>Informations générales</SectionTitle>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <Field
                label="Code"
                required
                hint="Identifiant technique du projet."
              >
                <input
                  value={code}
                  onChange={(event) => {
                    setCode(event.target.value);
                  }}
                  maxLength={100}
                  disabled={isPending}
                  placeholder="Ex. INSPECTION_CACAO_2026"
                  style={inputStyle}
                />
              </Field>

              <Field label="Nom" required>
                <input
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                  }}
                  maxLength={255}
                  disabled={isPending}
                  placeholder="Ex. Inspection initiale cacao"
                  style={inputStyle}
                />
              </Field>

              <Field label="Type de projet">
                <select
                  value={projectType}
                  onChange={(event) => {
                    setProjectType(event.target.value);
                  }}
                  disabled={isPending}
                  style={inputStyle}
                >
                  {projectTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </Field>

              <div
                style={{
                  gridColumn: "1 / -1",
                }}
              >
                <Field label="Description">
                  <textarea
                    value={description}
                    onChange={(event) => {
                      setDescription(event.target.value);
                    }}
                    rows={3}
                    disabled={isPending}
                    placeholder="Décrivez l'objectif de ce projet..."
                    style={{
                      ...inputStyle,
                      height: "auto",
                      minHeight: "84px",
                      padding: "0.75rem 0.875rem",
                      resize: "vertical",
                    }}
                  />
                </Field>
              </div>
            </div>
          </section>

          <section
            style={{
              marginTop: "1.5rem",
            }}
          >
            <SectionTitle>Paramètres globaux</SectionTitle>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {/* Géolocalisation */}
              <ConfigCard
                icon={<MapPin size={17} color="#0EA5E9" />}
                title="Géolocalisation"
                description="Définit le comportement GPS par défaut du projet."
              >
                <ToggleRow
                  label="Activer la géolocalisation"
                  checked={globalConfig.geolocation.enabled}
                  disabled={isPending}
                  onChange={(value) => {
                    updateConfig("geolocation", "enabled", value);
                  }}
                />

                {globalConfig.geolocation.enabled && (
                  <>
                    <div
                      style={{
                        marginTop: "0.75rem",
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "0.75rem",
                      }}
                    >
                      <Field
                        label="Précision souhaitée (m)"
                        hint="Valeur par défaut pour les éléments GPS du projet."
                      >
                        <input
                          type="number"
                          min={1}
                          value={globalConfig.geolocation.accuracy ?? ""}
                          disabled={isPending}
                          onChange={(event) => {
                            const raw = event.target.value;

                            updateConfig(
                              "geolocation",
                              "accuracy",
                              raw === "" ? null : Number(raw),
                            );
                          }}
                          style={inputStyle}
                        />
                      </Field>
                    </div>

                    <ToggleRow
                      label="Capturer la position lors de la soumission"
                      checked={globalConfig.geolocation.capture_on_submit}
                      disabled={isPending}
                      onChange={(value) => {
                        updateConfig("geolocation", "capture_on_submit", value);
                      }}
                    />
                  </>
                )}
              </ConfigCard>

              {/* Anti-fraude */}
              <ConfigCard
                icon={<ShieldCheck size={17} color="#5DB83A" />}
                title="Sécurité et anti-fraude"
                description="Paramètres globaux pour documenter le contexte de collecte."
              >
                <ToggleRow
                  label="Activer la sécurité anti-fraude"
                  checked={globalConfig.anti_fraud.enabled}
                  disabled={isPending}
                  onChange={(value) => {
                    updateConfig("anti_fraud", "enabled", value);
                  }}
                />

                {globalConfig.anti_fraud.enabled && (
                  <div
                    style={{
                      marginTop: "0.75rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.25rem",
                    }}
                  >
                    <ToggleRow
                      label="Capturer les informations de l'appareil"
                      checked={globalConfig.anti_fraud.capture_device_info}
                      disabled={isPending}
                      onChange={(value) => {
                        updateConfig(
                          "anti_fraud",
                          "capture_device_info",
                          value,
                        );
                      }}
                    />

                    <ToggleRow
                      label="Capturer l'historique de position"
                      checked={globalConfig.anti_fraud.capture_location_history}
                      disabled={isPending}
                      onChange={(value) => {
                        updateConfig(
                          "anti_fraud",
                          "capture_location_history",
                          value,
                        );
                      }}
                    />
                  </div>
                )}
              </ConfigCard>

              {/* Offline */}
              <ConfigCard
                icon={<CloudOff size={17} color="#8B5CF6" />}
                title="Collecte hors ligne"
                description="Permet de travailler lorsque la connexion est indisponible."
              >
                <ToggleRow
                  label="Autoriser la collecte hors ligne"
                  checked={globalConfig.offline.enabled}
                  disabled={isPending}
                  onChange={(value) => {
                    updateConfig("offline", "enabled", value);
                  }}
                />
              </ConfigCard>

              {/* Médias */}
              <ConfigCard
                icon={<FileVideo size={17} color="#F59E0B" />}
                title="Médias"
                description="Définit les types de médias autorisés par défaut."
              >
                <ToggleRow
                  label="Autoriser les photos"
                  checked={globalConfig.media.allow_photo}
                  disabled={isPending}
                  onChange={(value) => {
                    updateConfig("media", "allow_photo", value);
                  }}
                />

                <ToggleRow
                  label="Autoriser les vidéos"
                  checked={globalConfig.media.allow_video}
                  disabled={isPending}
                  onChange={(value) => {
                    updateConfig("media", "allow_video", value);
                  }}
                />

                <ToggleRow
                  label="Autoriser les fichiers audio"
                  checked={globalConfig.media.allow_audio}
                  disabled={isPending}
                  onChange={(value) => {
                    updateConfig("media", "allow_audio", value);
                  }}
                />
              </ConfigCard>
            </div>
          </section>

          <div
            style={{
              marginTop: "1rem",
              padding: "0.75rem 0.875rem",
              borderRadius: "0.625rem",
              background: "var(--color-surface-raised)",
              border: "1px solid var(--color-border)",
              fontSize: "0.6875rem",
              color: "var(--color-foreground-muted)",
              lineHeight: 1.5,
            }}
          >
            Ces paramètres sont des valeurs globales par défaut. Lors de la
            construction du projet, une section ou une question pourra définir
            sa propre valeur lorsqu&#39;elle doit se comporter différemment.
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.625rem",
            padding: "0.875rem 1.125rem",
            borderTop: "1px solid var(--color-border)",
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
            onClick={submit}
            disabled={isPending || !code.trim() || !name.trim()}
            style={{
              ...primaryButtonStyle,
              opacity: isPending || !code.trim() || !name.trim() ? 0.55 : 1,
              cursor:
                isPending || !code.trim() || !name.trim()
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {isPending ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Création...
              </>
            ) : (
              <>
                <FolderKanban size={15} />
                Créer le projet
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        marginBottom: "0.75rem",
        fontSize: "0.8125rem",
        fontWeight: 700,
        color: "var(--color-foreground)",
      }}
    >
      {children}
    </div>
  );
}

function ConfigCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: "0.875rem",
        borderRadius: "0.75rem",
        border: "1px solid var(--color-border)",
        background: "var(--color-surface-raised)",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "0.625rem",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            flexShrink: 0,
            borderRadius: "0.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          {icon}
        </div>

        <div>
          <div
            style={{
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "var(--color-foreground)",
            }}
          >
            {title}
          </div>

          <div
            style={{
              marginTop: "0.2rem",
              fontSize: "0.6875rem",
              color: "var(--color-foreground-muted)",
            }}
          >
            {description}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: "0.75rem",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label
      style={{
        minHeight: "36px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <span
        style={{
          fontSize: "0.75rem",
          color: "var(--color-foreground)",
        }}
      >
        {label}
      </span>

      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => {
          onChange(event.target.checked);
        }}
      />
    </label>
  );
}

const inputStyle = {
  width: "100%",
  minHeight: "40px",
  padding: "0 0.75rem",
  borderRadius: "0.625rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface-raised)",
  color: "var(--color-foreground)",
  outline: "none",
  fontSize: "0.8125rem",
  boxSizing: "border-box" as const,
};

const closeButtonStyle = {
  width: "32px",
  height: "32px",
  borderRadius: "0.5rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface-raised)",
  color: "var(--color-foreground-muted)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

const secondaryButtonStyle = {
  height: "38px",
  padding: "0 0.875rem",
  borderRadius: "0.625rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface-raised)",
  color: "var(--color-foreground)",
  display: "flex",
  alignItems: "center",
  gap: "0.375rem",
  fontSize: "0.8125rem",
  fontWeight: 600,
  cursor: "pointer",
};

const primaryButtonStyle = {
  height: "38px",
  padding: "0 0.875rem",
  borderRadius: "0.625rem",
  border: "1px solid rgba(93, 184, 58, 0.3)",
  background: "rgba(93, 184, 58, 0.12)",
  color: "#5DB83A",
  display: "flex",
  alignItems: "center",
  gap: "0.375rem",
  fontSize: "0.8125rem",
  fontWeight: 600,
  cursor: "pointer",
};

function Field({
  label,
  required = false,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          marginBottom: "0.425rem",
          fontSize: "0.75rem",
          fontWeight: 600,
          color: "var(--color-foreground)",
        }}
      >
        {label}

        {required && (
          <span
            style={{
              marginLeft: "0.2rem",
              color: "#EF4444",
            }}
          >
            *
          </span>
        )}
      </label>

      {children}

      {hint && (
        <div
          style={{
            marginTop: "0.3rem",
            fontSize: "0.6875rem",
            color: "var(--color-foreground-muted)",
          }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}
