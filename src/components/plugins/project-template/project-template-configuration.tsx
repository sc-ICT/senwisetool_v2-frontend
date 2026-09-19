"use client";

import { useQuery } from "@tanstack/react-query";

import {
  DEFAULT_PROJECT_GLOBAL_CONFIG,
  normalizeProjectGlobalConfig,
} from "@/lib/project-builder/project-config";
import { pluginProgramService } from "@/services/plugin-program.service";
import type { ProjectGlobalConfig } from "@/types/project";

interface Props {
  pluginId: number;

  value: Record<string, unknown>;

  /**
   * Configuration JSON du projet.
   *
   * L'appartenance au programme n'est PAS stockée ici.
   * Elle est gérée par project-template-editor via program_id.
   */
  programId: number | null;

  onProgramChange: (programId: number | null) => void;

  onChange: (value: Record<string, unknown>) => void;
}

export function ProjectTemplateConfiguration({
  pluginId,
  value,
  programId,
  onProgramChange,
  onChange,
}: Props) {
  const config = normalizeProjectGlobalConfig(
    value as Partial<ProjectGlobalConfig>,
  );

  const programsQuery = useQuery({
    queryKey: ["plugin-programs", pluginId],
    queryFn: async () => {
      const response = await pluginProgramService.list(pluginId, false);

      return response.data?.items ?? [];
    },
  });

  const update = (patch: Partial<ProjectGlobalConfig>) => {
    onChange({
      ...config,
      ...patch,
    });
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* ============================================================
          INTRO
          ============================================================ */}

      <div>
        <h3 className="text-sm font-semibold">
          Configuration par défaut du projet
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Ces paramètres seront utilisés comme configuration initiale lors de la
          création d’un projet à partir de ce modèle.
        </p>
      </div>

      {/* ============================================================
          PROGRAMME
          ============================================================ */}

      <ConfigCard
        title="Programme"
        description="Définissez si les projets créés depuis ce modèle doivent appartenir à un programme."
      >
        <div className="space-y-4">
          <div>
            <span className="mb-3 block text-sm font-medium">
              Ce projet doit-il appartenir à un programme ?
            </span>

            <div className="grid gap-3 sm:grid-cols-2">
              <ChoiceCard
                selected={programId === null}
                title="Non"
                description="Le projet sera indépendant de tout programme."
                onClick={() => onProgramChange(null)}
              />

              <ChoiceCard
                selected={programId !== null}
                title="Oui"
                description="Le projet sera rattaché à un programme du plugin."
                onClick={() => {
                  if (programId === null && programsQuery.data?.length) {
                    onProgramChange(programsQuery.data[0].id);
                  }
                }}
              />
            </div>
          </div>

          {programId !== null && (
            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold">
                  Programme
                  <span className="ml-1 text-destructive">*</span>
                </span>

                <select
                  value={String(programId)}
                  onChange={(event) => {
                    const selectedId = Number(event.target.value);

                    if (Number.isInteger(selectedId) && selectedId > 0) {
                      onProgramChange(selectedId);
                    }
                  }}
                  disabled={
                    programsQuery.isLoading ||
                    programsQuery.isError ||
                    !programsQuery.data?.length
                  }
                  className={selectClass}
                >
                  {!programsQuery.data?.length && (
                    <option value="">Aucun programme disponible</option>
                  )}

                  {programsQuery.data?.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </label>

              {programsQuery.isLoading && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Chargement des programmes...
                </p>
              )}

              {programsQuery.isError && (
                <p className="mt-2 text-xs text-destructive">
                  Impossible de charger les programmes.
                </p>
              )}

              {!programsQuery.isLoading &&
                !programsQuery.isError &&
                programsQuery.data?.length === 0 && (
                  <p className="mt-2 text-xs text-destructive">
                    Aucun programme actif n&#39;est disponible. Créez
                    d&#39;abord un programme dans la section « Programmes » du
                    plugin.
                  </p>
                )}

              {!programsQuery.isLoading &&
                !programsQuery.isError &&
                programsQuery.data &&
                programsQuery.data.length > 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Les projets créés depuis ce modèle seront rattachés au
                    programme sélectionné.
                  </p>
                )}
            </div>
          )}
        </div>
      </ConfigCard>

      {/* ============================================================
          COLLECTE
          ============================================================ */}

      <ConfigCard
        title="Collecte"
        description="Paramètres généraux de collecte."
      >
        <Toggle
          label="Exiger toutes les questions"
          description="Le projet devra considérer toutes les questions comme obligatoires lors de la collecte."
          checked={config.collection.require_all_questions}
          onChange={(checked) =>
            update({
              collection: {
                ...config.collection,
                require_all_questions: checked,
              },
            })
          }
        />
      </ConfigCard>

      {/* ============================================================
          GEOLOCALISATION
          ============================================================ */}

      <ConfigCard
        title="Géolocalisation"
        description="Capture et contraintes géographiques."
      >
        <Toggle
          label="Activer la géolocalisation"
          checked={config.geolocation.enabled}
          onChange={(checked) =>
            update({
              geolocation: {
                ...config.geolocation,
                enabled: checked,
              },
            })
          }
        />

        <Toggle
          label="Capturer la position à la soumission"
          checked={config.geolocation.capture_on_submit}
          onChange={(checked) =>
            update({
              geolocation: {
                ...config.geolocation,
                capture_on_submit: checked,
              },
            })
          }
        />
      </ConfigCard>

      {/* ============================================================
          CARTOGRAPHIE
          ============================================================ */}

      <ConfigCard
        title="Cartographie"
        description="Utilisation des fonctions cartographiques."
      >
        <Toggle
          label="Activer la cartographie"
          checked={config.mapping.enabled}
          onChange={(checked) =>
            update({
              mapping: {
                ...config.mapping,
                enabled: checked,
              },
            })
          }
        />

        <Select
          label="Fond cartographique"
          value={config.mapping.basemap}
          options={[
            {
              value: "standard",
              label: "Standard",
            },
            {
              value: "satellite",
              label: "Satellite",
            },
          ]}
          onChange={(value) =>
            update({
              mapping: {
                ...config.mapping,
                basemap: value as "standard" | "satellite",
              },
            })
          }
        />
      </ConfigCard>

      {/* ============================================================
          HORS LIGNE
          ============================================================ */}

      <ConfigCard
        title="Hors ligne"
        description="Comportement de collecte sans connexion."
      >
        <Toggle
          label="Autoriser la collecte hors ligne"
          checked={config.offline.enabled}
          onChange={(checked) =>
            update({
              offline: {
                ...config.offline,
                enabled: checked,
              },
            })
          }
        />
      </ConfigCard>

      {/* ============================================================
          MEDIAS
          ============================================================ */}

      <ConfigCard
        title="Médias"
        description="Types de médias utilisables pendant la collecte."
      >
        <Toggle
          label="Photos"
          checked={config.media.allow_photo}
          onChange={(checked) =>
            update({
              media: {
                ...config.media,
                allow_photo: checked,
              },
            })
          }
        />

        <Toggle
          label="Vidéos"
          checked={config.media.allow_video}
          onChange={(checked) =>
            update({
              media: {
                ...config.media,
                allow_video: checked,
              },
            })
          }
        />

        <Toggle
          label="Audio"
          checked={config.media.allow_audio}
          onChange={(checked) =>
            update({
              media: {
                ...config.media,
                allow_audio: checked,
              },
            })
          }
        />
      </ConfigCard>

      {/* ============================================================
          PIECES JOINTES
          ============================================================ */}

      <ConfigCard
        title="Pièces jointes"
        description="Documents associés à la collecte."
      >
        <Toggle
          label="Autoriser les pièces jointes"
          checked={config.attachments.enabled}
          onChange={(checked) =>
            update({
              attachments: {
                ...config.attachments,
                enabled: checked,
              },
            })
          }
        />
      </ConfigCard>

      {/* ============================================================
          RESET
          ============================================================ */}

      <button
        type="button"
        onClick={() =>
          onChange({
            ...DEFAULT_PROJECT_GLOBAL_CONFIG,
          })
        }
        className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        Restaurer les paramètres par défaut
      </button>
    </div>
  );
}

/* ========================================================================
   CHOICE CARD
   ======================================================================== */

function ChoiceCard({
  selected,
  title,
  description,
  onClick,
}: {
  selected: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-xl border p-4 text-left transition-colors",
        selected
          ? "border-primary bg-primary/5"
          : "border-border hover:bg-muted",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <span
          className={[
            "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
            selected ? "border-primary" : "border-muted-foreground/40",
          ].join(" ")}
        >
          {selected && <span className="h-2 w-2 rounded-full bg-primary" />}
        </span>

        <span>
          <span className="block text-sm font-medium">{title}</span>

          <span className="mt-1 block text-xs leading-5 text-muted-foreground">
            {description}
          </span>
        </span>
      </div>
    </button>
  );
}

/* ========================================================================
   CONFIG CARD
   ======================================================================== */

function ConfigCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border p-5">
      <h4 className="text-sm font-semibold">{title}</h4>

      <p className="mt-1 text-xs text-muted-foreground">{description}</p>

      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

/* ========================================================================
   TOGGLE
   ======================================================================== */

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-5">
      <span>
        <span className="block text-sm font-medium">{label}</span>

        {description && (
          <span className="mt-1 block max-w-xl text-xs leading-5 text-muted-foreground">
            {description}
          </span>
        )}
      </span>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4"
      />
    </label>
  );
}

/* ========================================================================
   SELECT
   ======================================================================== */

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{
    value: string;
    label: string;
  }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold">{label}</span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={selectClass}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

const selectClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary";
