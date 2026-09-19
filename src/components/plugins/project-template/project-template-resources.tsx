"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  Database,
  Layers3,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

import { pluginResourceService } from "@/services/plugin-resource.service";

import type { PluginResource } from "@/types/plugin-resource";

import type {
  ProjectQuestionResponseMode,
  ProjectQuestionResponseOption,
  ProjectQuestionResponseOptionsSource,
  ProjectQuestionResponseResourceOptions,
  ProjectQuestionStatisticsCategory,
  ProjectQuestionStatisticsMeasure,
  ProjectQuestionStatisticsPercentageDenominator,
  ProjectResourceBinding,
  ProjectResourceQuestionConfiguration,
  ProjectResourceQuestionHierarchyLevel,
  ProjectResourceUsage,
} from "@/types/plugin-project";

import type { QuestionType } from "@/types/question-bank";

interface Props {
  pluginId: number;
  value: ProjectResourceBinding[];
  onChange: (value: ProjectResourceBinding[]) => void;
}

/* ========================================================================
 * LABELS
 * ======================================================================== */

const usageLabels: Record<ProjectResourceUsage, string> = {
  GENERAL: "Générale",
  QUESTION: "Question",
  SELECTION: "Sélection",
  LOOKUP: "Recherche",
  CALCULATION: "Calcul",
};

const responseModeLabels: Record<ProjectQuestionResponseMode, string> = {
  DEFERRED: "Défini lors de la construction du formulaire",
  FIXED: "Type imposé",
  ALLOWED: "Ensemble de types autorisés",
};

const responseModeDescriptions: Record<ProjectQuestionResponseMode, string> = {
  DEFERRED:
    "Le concepteur du formulaire choisira librement le type de réponse.",
  FIXED:
    "Toutes les questions issues de cette ressource utiliseront le même type de réponse.",
  ALLOWED:
    "Le concepteur choisira le type de réponse parmi ceux autorisés par le modèle.",
};

const questionTypes: Array<{
  value: QuestionType;
  label: string;
}> = [
  {
    value: "TEXT",
    label: "Texte court",
  },
  {
    value: "LONG_TEXT",
    label: "Texte long",
  },
  {
    value: "INTEGER",
    label: "Nombre entier",
  },
  {
    value: "DECIMAL",
    label: "Nombre décimal",
  },
  {
    value: "PERCENTAGE",
    label: "Pourcentage",
  },
  {
    value: "CURRENCY",
    label: "Monnaie",
  },
  {
    value: "SINGLE_CHOICE",
    label: "Choix unique",
  },
  {
    value: "MULTIPLE_CHOICE",
    label: "Choix multiple",
  },
  {
    value: "DROPDOWN",
    label: "Liste déroulante",
  },
  {
    value: "AUTOCOMPLETE",
    label: "Recherche",
  },
  {
    value: "RATING",
    label: "Notation",
  },
  {
    value: "LIKERT_SCALE",
    label: "Échelle de Likert",
  },
  {
    value: "RANKING",
    label: "Classement",
  },
  {
    value: "DATE",
    label: "Date",
  },
  {
    value: "TIME",
    label: "Heure",
  },
  {
    value: "DATETIME",
    label: "Date et heure",
  },
  {
    value: "PHOTO",
    label: "Photo",
  },
  {
    value: "VIDEO",
    label: "Vidéo",
  },
  {
    value: "AUDIO",
    label: "Audio",
  },
  {
    value: "FILE",
    label: "Fichier",
  },
  {
    value: "SIGNATURE",
    label: "Signature",
  },
  {
    value: "POINT",
    label: "Point GPS",
  },
  {
    value: "LINE",
    label: "Ligne",
  },
  {
    value: "POLYGON",
    label: "Polygone",
  },
  {
    value: "ENTITY_SELECT",
    label: "Sélection d'entité",
  },
  {
    value: "ENTITY_SEARCH",
    label: "Recherche d'entité",
  },
  {
    value: "CALCULATION",
    label: "Calcul",
  },
];

const choiceQuestionTypes: QuestionType[] = [
  "SINGLE_CHOICE",
  "MULTIPLE_CHOICE",
  "DROPDOWN",
  "AUTOCOMPLETE",
];

const defaultQuestionConfiguration =
  (): ProjectResourceQuestionConfiguration => ({
    display: {
      question_field_key: "",
      question_key_field_key: null,
      title_field_key: null,
      hierarchy: [],
      group_by_hierarchy: true,
      show_question_key: false,
    },

    response: {
      mode: "DEFERRED",
      types: [],
      options_source: "MANUAL",
      resource_options: null,
      options: [],
      allow_option_customization: true,
      allow_type_override: true,
    },

    statistics: {
      enabled: false,
      realtime: true,
      global: true,
      hierarchy_levels: [],
      measures: ["COUNT", "PERCENTAGE"],
      percentage_denominator: "ANSWERED_QUESTIONS",
      excluded_response_values: [],
      categories: [],
    },
  });

/* ========================================================================
 * MAIN
 * ======================================================================== */

export function ProjectTemplateResources({ pluginId, value, onChange }: Props) {
  const [selectedResourceId, setSelectedResourceId] = useState("");

  const [usage, setUsage] = useState<ProjectResourceUsage>("GENERAL");

  const [required, setRequired] = useState(false);

  const resourcesQuery = useQuery({
    queryKey: ["plugin-resources", pluginId],

    queryFn: async () => {
      const response = await pluginResourceService.list(pluginId);

      return response.data;
    },

    enabled: Number.isInteger(pluginId) && pluginId > 0,
  });

  const resources = resourcesQuery.data?.items ?? [];

  const selectedResource = resources.find(
    (resource) => resource.id === Number(selectedResourceId),
  );

  const add = () => {
    const resourceId = Number(selectedResourceId);

    if (!Number.isInteger(resourceId) || resourceId <= 0) {
      return;
    }

    const resource = resources.find((item) => item.id === resourceId);

    if (!resource) {
      return;
    }

    const alreadyExists = value.some(
      (binding) => binding.resource_id === resourceId,
    );

    if (alreadyExists) {
      return;
    }

    const binding: ProjectResourceBinding = {
      resource_id: resource.id,
      resource_key: resource.key,
      usage,
      required,
    };

    if (usage === "QUESTION") {
      binding.configuration =
        defaultQuestionConfiguration() as unknown as Record<string, unknown>;
    }

    onChange([...value, binding]);

    setSelectedResourceId("");
    setUsage("GENERAL");
    setRequired(false);
  };

  const remove = (index: number) => {
    onChange(value.filter((_, currentIndex) => currentIndex !== index));
  };

  const updateBinding = (
    index: number,
    patch: Partial<ProjectResourceBinding>,
  ) => {
    onChange(
      value.map((binding, currentIndex) =>
        currentIndex === index
          ? {
              ...binding,
              ...patch,
            }
          : binding,
      ),
    );
  };

  const isLoading = resourcesQuery.isLoading;

  const errorMessage =
    resourcesQuery.error instanceof Error
      ? resourcesQuery.error.message
      : "Impossible de charger les ressources.";

  return (
    <div className="max-w-6xl space-y-6">
      {/* ============================================================
       * INTRO
       * ========================================================== */}

      <div>
        <h3 className="text-sm font-semibold">Ressources utilisables</h3>

        <p className="mt-1 max-w-4xl text-sm leading-6 text-muted-foreground">
          Définissez les ressources utilisées par les projets issus de ce modèle
          et précisez leur rôle. Une ressource utilisée comme
          <strong> Question </strong>
          devient une source de questions pouvant être structurée, configurée et
          analysée dans les formulaires.
        </p>
      </div>

      {/* ============================================================
       * ADD
       * ========================================================== */}

      <div className="rounded-xl border border-border p-5">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_auto]">
          <div>
            <label
              htmlFor="project-template-resource"
              className="mb-1.5 block text-xs font-medium text-muted-foreground"
            >
              Ressource
            </label>

            {isLoading ? (
              <div className="flex h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm text-muted-foreground">
                <Loader2 size={15} className="animate-spin" />
                Chargement...
              </div>
            ) : resourcesQuery.isError ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
                {errorMessage}
              </div>
            ) : (
              <select
                id="project-template-resource"
                value={selectedResourceId}
                onChange={(event) => setSelectedResourceId(event.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
              >
                <option value="">Sélectionner une ressource</option>

                {resources.map((resource) => (
                  <option
                    key={resource.id}
                    value={resource.id}
                    disabled={value.some(
                      (binding) => binding.resource_id === resource.id,
                    )}
                  >
                    {resource.name} ({resource.key})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label
              htmlFor="project-template-resource-usage"
              className="mb-1.5 block text-xs font-medium text-muted-foreground"
            >
              Usage
            </label>

            <select
              id="project-template-resource-usage"
              value={usage}
              onChange={(event) =>
                setUsage(event.target.value as ProjectResourceUsage)
              }
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
            >
              {Object.entries(usageLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={add}
              disabled={
                !selectedResourceId || isLoading || resourcesQuery.isError
              }
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={15} />
              Ajouter
            </button>
          </div>
        </div>

        {selectedResource && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
            <Database size={14} className="shrink-0" />
            <span className="font-medium text-foreground">
              {selectedResource.name}
            </span>
            <span>·</span>
            <code>{selectedResource.key}</code>
            <span>·</span>
            {selectedResource.fields.length} champ
            {selectedResource.fields.length > 1 ? "s" : ""}
          </div>
        )}

        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={required}
            onChange={(event) => setRequired(event.target.checked)}
            className="h-4 w-4"
          />
          Ressource obligatoire
        </label>
      </div>

      {/* ============================================================
       * LIST
       * ========================================================== */}

      {value.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Aucune ressource n&apos;est encore associée à ce modèle.
        </div>
      ) : (
        <div className="space-y-3">
          {value.map((binding, index) => {
            const resource = resources.find(
              (item) => item.id === binding.resource_id,
            );

            return (
              <ResourceBindingCard
                key={`${binding.resource_id}-${index}`}
                pluginId={pluginId}
                resource={resource}
                resources={resources}
                binding={binding}
                onChange={(patch) => updateBinding(index, patch)}
                onRemove={() => remove(index)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ========================================================================
 * RESOURCE CARD
 * ======================================================================== */

function ResourceBindingCard({
  pluginId,
  resource,
  resources,
  binding,
  onChange,
  onRemove,
}: {
  pluginId: number;
  resource?: PluginResource;
  resources: PluginResource[];
  binding: ProjectResourceBinding;
  onChange: (patch: Partial<ProjectResourceBinding>) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(binding.usage === "QUESTION");

  const questionConfiguration = normalizeQuestionConfiguration(
    binding.configuration,
  );

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="flex items-center justify-between gap-4 p-4">
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          {expanded ? (
            <ChevronDown size={17} className="shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight
              size={17}
              className="shrink-0 text-muted-foreground"
            />
          )}

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="truncate text-sm font-medium">
                {resource?.name ??
                  binding.resource_key ??
                  `Ressource #${binding.resource_id}`}
              </div>

              {(resource?.key ?? binding.resource_key) && (
                <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {resource?.key ?? binding.resource_key}
                </code>
              )}
            </div>

            <div className="mt-1 text-xs text-muted-foreground">
              Usage : {usageLabels[binding.usage] ?? binding.usage}
              {binding.required ? " · obligatoire" : " · facultative"}
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          aria-label="Supprimer la ressource"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-border bg-muted/5 p-5">
          {binding.usage === "QUESTION" ? (
            <QuestionResourceConfiguration
              pluginId={pluginId}
              resource={resource}
              resources={resources}
              configuration={questionConfiguration}
              onChange={(configuration) =>
                onChange({
                  configuration: configuration as unknown as Record<
                    string,
                    unknown
                  >,
                })
              }
            />
          ) : (
            <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">
                Configuration de l&apos;usage{" "}
                {usageLabels[binding.usage] ?? binding.usage}
              </p>

              <p className="mt-1 text-xs leading-5">
                La configuration spécifique de cet usage pourra être définie ici
                lorsque son moteur d&apos;exploitation sera configuré.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ========================================================================
 * QUESTION CONFIGURATION
 * ======================================================================== */

function QuestionResourceConfiguration({
  pluginId,
  resource,
  resources,
  configuration,
  onChange,
}: {
  pluginId: number;
  resource?: PluginResource;
  resources: PluginResource[];
  configuration: ProjectResourceQuestionConfiguration;
  onChange: (configuration: ProjectResourceQuestionConfiguration) => void;
}) {
  if (!resource) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        La ressource utilisée par cette configuration est introuvable.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ==========================================================
       * INTRO
       * ======================================================== */}

      <div>
        <div className="flex items-center gap-2">
          <Layers3 size={17} className="text-primary" />

          <div>
            <h4 className="text-sm font-semibold">
              Configuration de la source de questions
            </h4>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Les enregistrements de cette ressource seront utilisés comme
              questions dans les formulaires.
            </p>
          </div>
        </div>
      </div>

      {/* ==========================================================
       * DISPLAY
       * ======================================================== */}

      <QuestionDisplayConfiguration
        resource={resource}
        configuration={configuration.display}
        onChange={(display) =>
          onChange({
            ...configuration,
            display,
          })
        }
      />

      {/* ==========================================================
       * HIERARCHY
       * ======================================================== */}

      <QuestionHierarchyBuilder
        pluginId={pluginId}
        rootResource={resource}
        hierarchy={configuration.display.hierarchy}
        onChange={(hierarchy) =>
          onChange({
            ...configuration,
            display: {
              ...configuration.display,
              hierarchy,
            },
          })
        }
      />

      {/* ==========================================================
       * RESPONSE
       * ======================================================== */}

      <QuestionResponseConfiguration
        resource={resource}
        resources={resources}
        configuration={configuration.response}
        onChange={(response) =>
          onChange({
            ...configuration,
            response,
          })
        }
      />

      {/* ==========================================================
       * STATISTICS
       * ======================================================== */}

      <QuestionStatisticsConfiguration
        hierarchy={configuration.display.hierarchy}
        response={configuration.response}
        configuration={configuration.statistics}
        onChange={(statistics) =>
          onChange({
            ...configuration,
            statistics,
          })
        }
      />
    </div>
  );
}

/* ========================================================================
 * DISPLAY CONFIGURATION
 * ======================================================================== */

function QuestionDisplayConfiguration({
  resource,
  configuration,
  onChange,
}: {
  resource: PluginResource;
  configuration: ProjectResourceQuestionConfiguration["display"];
  onChange: (
    configuration: ProjectResourceQuestionConfiguration["display"],
  ) => void;
}) {
  return (
    <div className="rounded-xl border border-border p-4">
      <h5 className="text-sm font-medium">Représentation de la question</h5>

      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        Cette configuration permet au moteur de savoir comment présenter chaque
        enregistrement sur mobile et dans le constructeur de formulaire.
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <FieldSelect
          label="Champ contenant la question"
          value={configuration.question_field_key}
          fields={resource.fields}
          placeholder="Sélectionner..."
          onChange={(value) =>
            onChange({
              ...configuration,
              question_field_key: value,
            })
          }
        />

        <FieldSelect
          label="Champ identifiant"
          value={configuration.question_key_field_key ?? ""}
          fields={resource.fields}
          placeholder="Aucun"
          onChange={(value) =>
            onChange({
              ...configuration,
              question_key_field_key: value || null,
            })
          }
        />

        <FieldSelect
          label="Titre court mobile"
          value={configuration.title_field_key ?? ""}
          fields={resource.fields}
          placeholder="Aucun"
          onChange={(value) =>
            onChange({
              ...configuration,
              title_field_key: value || null,
            })
          }
        />
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={configuration.show_question_key}
          onChange={(event) =>
            onChange({
              ...configuration,
              show_question_key: event.target.checked,
            })
          }
          className="h-4 w-4"
        />
        Afficher l&apos;identifiant de la question
      </label>
    </div>
  );
}

/* ========================================================================
 * RESPONSE CONFIGURATION
 * ======================================================================== */

function QuestionResponseConfiguration({
  resources,
  configuration,
  onChange,
}: {
  resource: PluginResource;
  resources: PluginResource[];
  configuration: ProjectResourceQuestionConfiguration["response"];
  onChange: (
    configuration: ProjectResourceQuestionConfiguration["response"],
  ) => void;
}) {
  const selectedTypes = configuration.types;

  const hasChoiceType = selectedTypes.some((type) =>
    choiceQuestionTypes.includes(type),
  );

  const setMode = (mode: ProjectQuestionResponseMode) => {
    if (mode === "DEFERRED") {
      onChange({
        ...configuration,
        mode,
        types: [],
        options_source: "MANUAL",
        resource_options: null,
        options: [],
      });

      return;
    }

    if (mode === "FIXED") {
      const first = selectedTypes[0] ?? "SINGLE_CHOICE";

      onChange({
        ...configuration,
        mode,
        types: [first],
      });

      return;
    }

    onChange({
      ...configuration,
      mode,
    });
  };

  const toggleType = (type: QuestionType) => {
    if (configuration.mode === "FIXED") {
      onChange({
        ...configuration,
        types: [type],
      });

      return;
    }

    const exists = configuration.types.includes(type);

    const types = exists
      ? configuration.types.filter((item) => item !== type)
      : [...configuration.types, type];

    const hasChoiceType = types.some((item) =>
      choiceQuestionTypes.includes(item),
    );

    onChange({
      ...configuration,
      types,
      options_source: hasChoiceType ? configuration.options_source : "MANUAL",
      resource_options: hasChoiceType ? configuration.resource_options : null,
      options: hasChoiceType ? configuration.options : [],
    });
  };

  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h5 className="text-sm font-medium">Type de réponse</h5>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Le type de réponse est optionnel. Vous pouvez le laisser au
            concepteur du formulaire ou le prédéfinir ici.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {(Object.keys(responseModeLabels) as ProjectQuestionResponseMode[]).map(
          (mode) => {
            const active = configuration.mode === mode;

            return (
              <button
                key={mode}
                type="button"
                onClick={() => setMode(mode)}
                className={[
                  "rounded-xl border p-4 text-left transition",
                  active
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/30",
                ].join(" ")}
              >
                <div className="text-sm font-medium">
                  {responseModeLabels[mode]}
                </div>

                <div className="mt-1 text-xs leading-5 text-muted-foreground">
                  {responseModeDescriptions[mode]}
                </div>
              </button>
            );
          },
        )}
      </div>

      {configuration.mode !== "DEFERRED" && (
        <div className="mt-5">
          <div className="mb-3">
            <div className="text-xs font-medium">Types de réponse</div>

            <div className="mt-1 text-[11px] text-muted-foreground">
              {configuration.mode === "FIXED"
                ? "Un seul type sera utilisé pour toutes les questions."
                : "Sélectionnez les types que le concepteur pourra choisir."}
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {questionTypes.map((type) => {
              const checked = configuration.types.includes(type.value);

              return (
                <label
                  key={type.value}
                  className={[
                    "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm",
                    checked ? "border-primary bg-primary/5" : "border-border",
                  ].join(" ")}
                >
                  <input
                    type={configuration.mode === "FIXED" ? "radio" : "checkbox"}
                    name={
                      configuration.mode === "FIXED"
                        ? "fixed-question-type"
                        : undefined
                    }
                    checked={checked}
                    onChange={() => toggleType(type.value)}
                    className="h-4 w-4"
                  />

                  {type.label}
                </label>
              );
            })}
          </div>

          {configuration.mode === "ALLOWED" &&
            configuration.types.length === 0 && (
              <p className="mt-2 text-xs text-destructive">
                Sélectionnez au moins un type de réponse.
              </p>
            )}
        </div>
      )}

      {hasChoiceType && (
        <QuestionResponseOptions
          resources={resources}
          options={configuration.options}
          optionsSource={configuration.options_source}
          resourceOptions={configuration.resource_options ?? null}
          allowCustomization={configuration.allow_option_customization}
          onChange={(options) =>
            onChange({
              ...configuration,
              options,
            })
          }
          onChangeCustomization={(value) =>
            onChange({
              ...configuration,
              allow_option_customization: value,
            })
          }
          onChangeOptionsSource={(source) =>
            onChange({
              ...configuration,
              options_source: source,
              options: source === "RESOURCE" ? [] : configuration.options,
              resource_options:
                source === "RESOURCE"
                  ? (configuration.resource_options ?? {
                      resource_id: 0,
                      value_field_key: "",
                      label_field_key: "",
                    })
                  : null,
            })
          }
          onChangeResourceOptions={(resourceOptions) =>
            onChange({
              ...configuration,
              options_source: "RESOURCE",
              resource_options: resourceOptions,
              options: [],
            })
          }
        />
      )}

      {configuration.mode !== "DEFERRED" && (
        <label className="mt-5 flex items-start gap-3 rounded-lg bg-muted/20 p-3">
          <input
            type="checkbox"
            checked={configuration.allow_type_override}
            onChange={(event) =>
              onChange({
                ...configuration,
                allow_type_override: event.target.checked,
              })
            }
            className="mt-0.5 h-4 w-4"
          />

          <span>
            <span className="block text-sm font-medium">
              Autoriser le concepteur à adapter le type
            </span>

            <span className="mt-1 block text-xs leading-5 text-muted-foreground">
              Le modèle fournit une recommandation, mais le constructeur du
              formulaire pourra l&apos;adapter si nécessaire.
            </span>
          </span>
        </label>
      )}
    </div>
  );
}

/* ========================================================================
 * RESPONSE OPTIONS
 * ======================================================================== */

function QuestionResponseOptions({
  resources,
  options,
  optionsSource,
  resourceOptions,
  allowCustomization,
  onChange,
  onChangeCustomization,
  onChangeOptionsSource,
  onChangeResourceOptions,
}: {
  resources: PluginResource[];
  options: ProjectQuestionResponseOption[];
  optionsSource: ProjectQuestionResponseOptionsSource;
  resourceOptions: ProjectQuestionResponseResourceOptions | null;
  allowCustomization: boolean;
  onChange: (options: ProjectQuestionResponseOption[]) => void;
  onChangeCustomization: (value: boolean) => void;
  onChangeOptionsSource: (source: ProjectQuestionResponseOptionsSource) => void;
  onChangeResourceOptions: (
    options: ProjectQuestionResponseResourceOptions,
  ) => void;
}) {
  const addOption = () => {
    onChange([
      ...options,
      {
        value: "",
        label: "",
        position: options.length,
        is_active: true,
        statistics: {},
      },
    ]);
  };

  const updateOption = (
    index: number,
    patch: Partial<ProjectQuestionResponseOption>,
  ) => {
    onChange(
      options.map((option, currentIndex) =>
        currentIndex === index
          ? {
              ...option,
              ...patch,
            }
          : option,
      ),
    );
  };

  const removeOption = (index: number) => {
    onChange(
      options
        .filter((_, currentIndex) => currentIndex !== index)
        .map((option, position) => ({
          ...option,
          position,
        })),
    );
  };

  return (
    <div className="mt-5 rounded-xl border border-border bg-muted/5 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h6 className="text-sm font-medium">
            Options de réponse prédéfinies
          </h6>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Utilisé lorsque le type de réponse repose sur des choix.
          </p>
        </div>

        {optionsSource === "MANUAL" && (
          <button
            type="button"
            onClick={addOption}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-muted"
          >
            <Plus size={14} />
            Ajouter
          </button>
        )}
      </div>

      <div className="mt-4 rounded-lg border border-border bg-background p-4">
        <div className="text-xs font-medium">Origine des options</div>

        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <button
            type="button"
            onClick={() => onChangeOptionsSource("MANUAL")}
            className={[
              "rounded-lg border p-3 text-left",
              optionsSource === "MANUAL"
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-muted/30",
            ].join(" ")}
          >
            <div className="text-sm font-medium">Saisie manuelle</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Les options sont définies une par une dans le modèle.
            </div>
          </button>

          <button
            type="button"
            onClick={() => onChangeOptionsSource("RESOURCE")}
            className={[
              "rounded-lg border p-3 text-left",
              optionsSource === "RESOURCE"
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-muted/30",
            ].join(" ")}
          >
            <div className="text-sm font-medium">Depuis une ressource</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Chaque enregistrement de la ressource devient une option.
            </div>
          </button>
        </div>

        {optionsSource === "RESOURCE" && (
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Ressource source
              </label>
              <select
                value={resourceOptions?.resource_id ?? ""}
                onChange={(event) => {
                  const resourceId = Number(event.target.value);
                  const selected = resources.find(
                    (item) => item.id === resourceId,
                  );
                  onChangeResourceOptions({
                    resource_id: resourceId,
                    value_field_key: selected?.fields[0]?.key ?? "",
                    label_field_key: selected?.fields[0]?.key ?? "",
                  });
                }}
                className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
              >
                <option value="">Sélectionner...</option>
                {resources.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.key})
                  </option>
                ))}
              </select>
            </div>

            <FieldSelect
              label="Champ valeur"
              value={resourceOptions?.value_field_key ?? ""}
              fields={
                resources.find(
                  (item) => item.id === resourceOptions?.resource_id,
                )?.fields ?? []
              }
              placeholder="Sélectionner..."
              onChange={(value) =>
                resourceOptions &&
                onChangeResourceOptions({
                  ...resourceOptions,
                  value_field_key: value,
                })
              }
            />

            <FieldSelect
              label="Champ libellé"
              value={resourceOptions?.label_field_key ?? ""}
              fields={
                resources.find(
                  (item) => item.id === resourceOptions?.resource_id,
                )?.fields ?? []
              }
              placeholder="Sélectionner..."
              onChange={(value) =>
                resourceOptions &&
                onChangeResourceOptions({
                  ...resourceOptions,
                  label_field_key: value,
                })
              }
            />
          </div>
        )}
      </div>

      {optionsSource === "MANUAL" && options.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-border p-5 text-center text-xs text-muted-foreground">
          Aucune option prédéfinie.
        </div>
      ) : optionsSource === "MANUAL" ? (
        <div className="mt-4 space-y-2">
          {options.map((option, index) => (
            <div
              key={`${index}-${option.value}`}
              className="grid gap-2 md:grid-cols-[1fr_1fr_auto_auto]"
            >
              <input
                type="text"
                value={option.value}
                onChange={(event) =>
                  updateOption(index, {
                    value: event.target.value,
                  })
                }
                placeholder="Valeur"
                className="h-9 rounded-lg border border-border bg-background px-3 text-sm"
              />

              <input
                type="text"
                value={option.label}
                onChange={(event) =>
                  updateOption(index, {
                    label: event.target.value,
                  })
                }
                placeholder="Libellé"
                className="h-9 rounded-lg border border-border bg-background px-3 text-sm"
              />

              <label className="flex items-center gap-2 rounded-lg border border-border px-3 text-xs">
                <input
                  type="checkbox"
                  checked={option.is_active}
                  onChange={(event) =>
                    updateOption(index, {
                      is_active: event.target.checked,
                    })
                  }
                  className="h-4 w-4"
                />
                Active
              </label>

              <button
                type="button"
                onClick={() => removeOption(index)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                aria-label="Supprimer l'option"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground">
          Les options seront chargées à partir des enregistrements de la
          ressource sélectionnée lors de l&#39;utilisation du formulaire.
        </div>
      )}

      <label className="mt-4 flex items-start gap-3">
        <input
          type="checkbox"
          checked={allowCustomization}
          onChange={(event) => onChangeCustomization(event.target.checked)}
          className="mt-0.5 h-4 w-4"
        />

        <span>
          <span className="block text-sm font-medium">
            Autoriser l&apos;adaptation des options
          </span>

          <span className="mt-1 block text-xs leading-5 text-muted-foreground">
            Le concepteur pourra ajouter, modifier ou supprimer des options dans
            son formulaire.
          </span>
        </span>
      </label>
    </div>
  );
}

/* ========================================================================
 * STATISTICS
 * ======================================================================== */

function QuestionStatisticsConfiguration({
  hierarchy,
  response,
  configuration,
  onChange,
}: {
  hierarchy: ProjectResourceQuestionHierarchyLevel[];
  response: ProjectResourceQuestionConfiguration["response"];
  configuration: ProjectResourceQuestionConfiguration["statistics"];
  onChange: (
    configuration: ProjectResourceQuestionConfiguration["statistics"],
  ) => void;
}) {
  const availableResponseValues = response.options
    .filter((option) => option.is_active && option.value.trim())
    .map((option) => ({
      value: option.value,
      label: option.label,
    }));

  const toggleHierarchyLevel = (position: number) => {
    const exists = configuration.hierarchy_levels.includes(position);

    onChange({
      ...configuration,
      hierarchy_levels: exists
        ? configuration.hierarchy_levels.filter((item) => item !== position)
        : [...configuration.hierarchy_levels, position].sort((a, b) => a - b),
    });
  };

  const toggleMeasure = (measure: ProjectQuestionStatisticsMeasure) => {
    const exists = configuration.measures.includes(measure);

    onChange({
      ...configuration,
      measures: exists
        ? configuration.measures.filter((item) => item !== measure)
        : [...configuration.measures, measure],
    });
  };

  const addCategory = () => {
    const category: ProjectQuestionStatisticsCategory = {
      key: `category_${configuration.categories.length + 1}`,
      label: `Catégorie ${configuration.categories.length + 1}`,
      response_values: [],
      excluded_from_percentage: false,
      position: configuration.categories.length,
      is_active: true,
    };

    onChange({
      ...configuration,
      categories: [...configuration.categories, category],
    });
  };

  const updateCategory = (
    index: number,
    patch: Partial<ProjectQuestionStatisticsCategory>,
  ) => {
    onChange({
      ...configuration,
      categories: configuration.categories.map((category, currentIndex) =>
        currentIndex === index
          ? {
              ...category,
              ...patch,
            }
          : category,
      ),
    });
  };

  const removeCategory = (index: number) => {
    onChange({
      ...configuration,
      categories: configuration.categories
        .filter((_, currentIndex) => currentIndex !== index)
        .map((category, position) => ({
          ...category,
          position,
        })),
    });
  };

  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={17} className="text-primary" />

          <div>
            <h5 className="text-sm font-medium">Statistiques</h5>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Configurez les indicateurs que le moteur devra calculer pendant la
              saisie.
            </p>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={configuration.enabled}
            onChange={(event) =>
              onChange({
                ...configuration,
                enabled: event.target.checked,
              })
            }
            className="h-4 w-4"
          />
          Activer
        </label>
      </div>

      {!configuration.enabled ? (
        <div className="mt-4 rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground">
          Les statistiques sont désactivées pour cette ressource.
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          {/* REALTIME */}

          <label className="flex items-start gap-3 rounded-lg bg-muted/20 p-3">
            <input
              type="checkbox"
              checked={configuration.realtime}
              onChange={(event) =>
                onChange({
                  ...configuration,
                  realtime: event.target.checked,
                })
              }
              className="mt-0.5 h-4 w-4"
            />

            <span>
              <span className="block text-sm font-medium">
                Mise à jour en temps réel
              </span>

              <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                Les indicateurs sont recalculés pendant que l&apos;agent
                renseigne le formulaire.
              </span>
            </span>
          </label>

          {/* LEVELS */}

          <div>
            <h6 className="text-xs font-medium">Niveaux d&apos;analyse</h6>

            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={configuration.global}
                  onChange={(event) =>
                    onChange({
                      ...configuration,
                      global: event.target.checked,
                    })
                  }
                  className="h-4 w-4"
                />
                Global
              </label>

              {hierarchy.map((level) => (
                <label
                  key={`${level.relation_id}-${level.position}`}
                  className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={configuration.hierarchy_levels.includes(
                      level.position,
                    )}
                    onChange={() => toggleHierarchyLevel(level.position)}
                    className="h-4 w-4"
                  />

                  {level.label ||
                    level.resource_name ||
                    `Niveau ${level.position + 1}`}
                </label>
              ))}
            </div>
          </div>

          {/* MEASURES */}

          <div>
            <h6 className="text-xs font-medium">Indicateurs</h6>

            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {(
                [
                  ["COUNT", "Nombre"],
                  ["PERCENTAGE", "Pourcentage"],
                ] as const
              ).map(([value, label]) => (
                <label
                  key={value}
                  className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={configuration.measures.includes(value)}
                    onChange={() => toggleMeasure(value)}
                    className="h-4 w-4"
                  />

                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* DENOMINATOR */}

          {configuration.measures.includes("PERCENTAGE") && (
            <div>
              <h6 className="text-xs font-medium">
                Dénominateur des pourcentages
              </h6>

              <select
                value={configuration.percentage_denominator}
                onChange={(event) =>
                  onChange({
                    ...configuration,
                    percentage_denominator: event.target
                      .value as ProjectQuestionStatisticsPercentageDenominator,
                  })
                }
                className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
              >
                <option value="ALL_QUESTIONS">Toutes les questions</option>

                <option value="ANSWERED_QUESTIONS">Questions répondues</option>

                <option value="EXCLUDE_VALUES">
                  Questions répondues en excluant certaines réponses
                </option>
              </select>
            </div>
          )}

          {/* EXCLUDED VALUES */}

          {configuration.percentage_denominator === "EXCLUDE_VALUES" && (
            <div>
              <h6 className="text-xs font-medium">
                Réponses exclues du dénominateur
              </h6>

              <div className="mt-2 flex flex-wrap gap-2">
                {availableResponseValues.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Aucune option de réponse prédéfinie.
                  </p>
                ) : (
                  availableResponseValues.map((option) => {
                    const checked =
                      configuration.excluded_response_values.includes(
                        option.value,
                      );

                    return (
                      <label
                        key={option.value}
                        className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            onChange({
                              ...configuration,
                              excluded_response_values: checked
                                ? configuration.excluded_response_values.filter(
                                    (value) => value !== option.value,
                                  )
                                : [
                                    ...configuration.excluded_response_values,
                                    option.value,
                                  ],
                            })
                          }
                          className="h-4 w-4"
                        />

                        {option.label}
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* CATEGORIES */}

          <div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h6 className="text-xs font-medium">Catégories statistiques</h6>

                <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                  Permet de regrouper plusieurs valeurs de réponse dans un même
                  indicateur.
                </p>
              </div>

              <button
                type="button"
                onClick={addCategory}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-muted"
              >
                <Plus size={14} />
                Ajouter
              </button>
            </div>

            {configuration.categories.length === 0 ? (
              <div className="mt-3 rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground">
                Aucune catégorie statistique.
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                {configuration.categories.map((category, index) => (
                  <StatisticsCategoryEditor
                    key={`${category.key}-${index}`}
                    category={category}
                    responseOptions={availableResponseValues}
                    onChange={(patch) => updateCategory(index, patch)}
                    onRemove={() => removeCategory(index)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ========================================================================
 * STATISTICS CATEGORY
 * ======================================================================== */

function StatisticsCategoryEditor({
  category,
  responseOptions,
  onChange,
  onRemove,
}: {
  category: ProjectQuestionStatisticsCategory;
  responseOptions: Array<{
    value: string;
    label: string;
  }>;
  onChange: (patch: Partial<ProjectQuestionStatisticsCategory>) => void;
  onRemove: () => void;
}) {
  const toggleResponse = (value: string) => {
    const exists = category.response_values.includes(value);

    onChange({
      response_values: exists
        ? category.response_values.filter((item) => item !== value)
        : [...category.response_values, value],
    });
  };

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <input
          type="text"
          value={category.key}
          onChange={(event) =>
            onChange({
              key: event.target.value,
            })
          }
          placeholder="Clé"
          className="h-9 rounded-lg border border-border bg-background px-3 text-sm"
        />

        <input
          type="text"
          value={category.label}
          onChange={(event) =>
            onChange({
              label: event.target.value,
            })
          }
          placeholder="Libellé"
          className="h-9 rounded-lg border border-border bg-background px-3 text-sm"
        />

        <button
          type="button"
          onClick={onRemove}
          className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          aria-label="Supprimer la catégorie"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {responseOptions.length > 0 && (
        <div className="mt-3">
          <div className="mb-2 text-[11px] font-medium text-muted-foreground">
            Valeurs de réponse appartenant à cette catégorie
          </div>

          <div className="flex flex-wrap gap-2">
            {responseOptions.map((option) => {
              const checked = category.response_values.includes(option.value);

              return (
                <label
                  key={option.value}
                  className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleResponse(option.value)}
                    className="h-4 w-4"
                  />

                  {option.label}
                </label>
              );
            })}
          </div>
        </div>
      )}

      <label className="mt-3 flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={category.excluded_from_percentage}
          onChange={(event) =>
            onChange({
              excluded_from_percentage: event.target.checked,
            })
          }
          className="h-4 w-4"
        />
        Exclure cette catégorie du dénominateur des pourcentages
      </label>
    </div>
  );
}

/* ========================================================================
 * HIERARCHY BUILDER
 * ======================================================================== */

function QuestionHierarchyBuilder({
  pluginId,
  rootResource,
  hierarchy,
  onChange,
}: {
  pluginId: number;
  rootResource: PluginResource;
  hierarchy: ProjectResourceQuestionHierarchyLevel[];
  onChange: (hierarchy: ProjectResourceQuestionHierarchyLevel[]) => void;
}) {
  const lastLevel =
    hierarchy.length > 0 ? hierarchy[hierarchy.length - 1] : null;

  const currentResourceId = lastLevel?.resource_id ?? rootResource.id;

  const relationsQuery = useQuery({
    queryKey: ["plugin-resource-relations", pluginId, currentResourceId],

    queryFn: async () => {
      const response =
        await pluginResourceService.listRelations(currentResourceId);

      return response.data ?? [];
    },

    enabled: Number.isInteger(currentResourceId) && currentResourceId > 0,
  });

  /*
   * Très important :
   *
   * listRelations() peut retourner les relations
   * entrantes ET sortantes.
   *
   * Pour construire la hiérarchie depuis la ressource
   * courante, seules les relations dont la ressource
   * courante est la SOURCE sont utilisables.
   */
  const outgoingRelations = useMemo(
    () =>
      (relationsQuery.data ?? []).filter(
        (relation) =>
          relation.source_resource_id === currentResourceId &&
          relation.is_active,
      ),
    [relationsQuery.data, currentResourceId],
  );

  const usedRelationIds = new Set(hierarchy.map((level) => level.relation_id));

  const addLevel = (relationId: number) => {
    const relation = outgoingRelations.find((item) => item.id === relationId);

    if (!relation) {
      return;
    }

    if (usedRelationIds.has(relation.id)) {
      return;
    }

    const level: ProjectResourceQuestionHierarchyLevel = {
      relation_id: relation.id,

      resource_id: relation.target_resource_id,

      resource_key: relation.target_resource_name,

      resource_name: relation.target_resource_name,

      source_field_key: relation.source_field_key,

      target_field_key: relation.target_field_key,

      label: relation.label ?? relation.target_resource_name,

      position: hierarchy.length,
    };

    onChange([...hierarchy, level]);
  };

  const removeFromLevel = (index: number) => {
    onChange(
      hierarchy.slice(0, index).map((level, levelIndex) => ({
        ...level,
        position: levelIndex,
      })),
    );
  };

  const updateLevelLabel = (index: number, label: string) => {
    onChange(
      hierarchy.map((level, levelIndex) =>
        levelIndex === index
          ? {
              ...level,
              label,
            }
          : level,
      ),
    );
  };

  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h5 className="text-sm font-medium">Structure hiérarchique</h5>

          <p className="mt-1 max-w-3xl text-xs leading-5 text-muted-foreground">
            Construisez le chemin relationnel utilisé pour organiser les
            questions. Chaque niveau est basé sur une relation réellement
            définie entre les ressources.
          </p>
        </div>

        <div className="rounded-lg bg-muted px-2.5 py-1.5 text-[11px] text-muted-foreground">
          {hierarchy.length} niveau
          {hierarchy.length > 1 ? "x" : ""}
        </div>
      </div>

      {/* PATH */}

      <div className="mt-5 rounded-lg bg-muted/30 p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <ResourcePathNode
            name={rootResource.name}
            resourceKey={rootResource.key}
          />

          {hierarchy.map((level) => (
            <div
              key={`${level.relation_id}-${level.position}`}
              className="flex items-center gap-2"
            >
              <ChevronRight size={14} className="text-muted-foreground" />

              <div className="rounded-md border border-border bg-background px-2.5 py-1.5">
                <div className="font-medium">
                  {level.label || level.resource_name}
                </div>

                <div className="mt-0.5 text-[10px] text-muted-foreground">
                  {level.resource_name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LEVELS */}

      {hierarchy.length > 0 && (
        <div className="mt-4 space-y-2">
          {hierarchy.map((level, index) => (
            <div
              key={`${level.relation_id}-${index}`}
              className="rounded-lg border border-border p-3"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold">
                    Niveau {index + 1}
                  </div>

                  <div className="mt-1 text-sm">
                    {index === 0
                      ? rootResource.name
                      : hierarchy[index - 1]?.resource_name}

                    <span className="mx-2 text-muted-foreground">→</span>

                    <span className="font-medium">{level.resource_name}</span>
                  </div>

                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {level.source_field_key}
                    {" → "}
                    {level.target_field_key}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeFromLevel(index)}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`Supprimer le niveau ${index + 1}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <input
                type="text"
                value={level.label ?? ""}
                onChange={(event) =>
                  updateLevelLabel(index, event.target.value)
                }
                placeholder={level.resource_name ?? "Libellé"}
                className="mt-3 h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
              />
            </div>
          ))}
        </div>
      )}

      {/* ADD */}

      <div className="mt-4">
        {relationsQuery.isLoading ? (
          <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-3 text-xs text-muted-foreground">
            <Loader2 size={14} className="animate-spin" />
            Chargement des relations...
          </div>
        ) : relationsQuery.isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-3 text-xs text-destructive">
            Impossible de charger les relations.
          </div>
        ) : outgoingRelations.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-3 py-4 text-xs leading-5 text-muted-foreground">
            Aucune relation sortante disponible depuis cette ressource.
          </div>
        ) : (
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Ajouter un niveau
            </span>

            <select
              value=""
              onChange={(event) => {
                const relationId = Number(event.target.value);

                if (relationId > 0) {
                  addLevel(relationId);
                }
              }}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
            >
              <option value="">Sélectionner une relation...</option>

              {outgoingRelations
                .filter((relation) => !usedRelationIds.has(relation.id))
                .map((relation) => (
                  <option key={relation.id} value={relation.id}>
                    {relation.label ??
                      `${relation.source_field_key} → ${relation.target_resource_name}`}
                    {" · "}
                    {relation.source_field_key}
                    {" → "}
                    {relation.target_resource_name}
                  </option>
                ))}
            </select>
          </label>
        )}
      </div>
    </div>
  );
}

/* ========================================================================
 * FIELD SELECT
 * ======================================================================== */

function FieldSelect({
  label,
  value,
  fields,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  fields: PluginResource["fields"];
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
      >
        <option value="">{placeholder}</option>

        {fields
          .filter((field) => field.is_active)
          .map((field) => (
            <option key={field.id} value={field.key}>
              {field.label} ({field.key})
            </option>
          ))}
      </select>
    </label>
  );
}

/* ========================================================================
 * RESOURCE PATH NODE
 * ======================================================================== */

function ResourcePathNode({
  name,
  resourceKey,
}: {
  name: string;
  resourceKey?: string;
}) {
  return (
    <div className="rounded-md border border-primary/30 bg-primary/5 px-2.5 py-1.5">
      <div className="font-medium text-primary">{name}</div>

      {resourceKey && (
        <div className="mt-0.5 text-[10px] text-muted-foreground">
          {resourceKey}
        </div>
      )}
    </div>
  );
}

/* ========================================================================
 * NORMALIZATION
 * ======================================================================== */

function normalizeQuestionConfiguration(
  configuration?: Record<string, unknown>,
): ProjectResourceQuestionConfiguration {
  const defaults = defaultQuestionConfiguration();

  if (!configuration) {
    return defaults;
  }

  const rawDisplay = isRecord(configuration.display)
    ? configuration.display
    : {};

  const rawResponse = isRecord(configuration.response)
    ? configuration.response
    : {};

  const rawStatistics = isRecord(configuration.statistics)
    ? configuration.statistics
    : {};

  const hierarchy = normalizeHierarchy(rawDisplay.hierarchy);

  const types = Array.isArray(rawResponse.types)
    ? rawResponse.types.filter(
        (value): value is QuestionType => typeof value === "string",
      )
    : [];

  const options = normalizeResponseOptions(rawResponse.options);

  const categories = normalizeStatisticsCategories(rawStatistics.categories);

  return {
    display: {
      question_field_key:
        typeof rawDisplay.question_field_key === "string"
          ? rawDisplay.question_field_key
          : defaults.display.question_field_key,

      question_key_field_key:
        typeof rawDisplay.question_key_field_key === "string"
          ? rawDisplay.question_key_field_key
          : null,

      title_field_key:
        typeof rawDisplay.title_field_key === "string"
          ? rawDisplay.title_field_key
          : null,

      hierarchy,

      group_by_hierarchy:
        typeof rawDisplay.group_by_hierarchy === "boolean"
          ? rawDisplay.group_by_hierarchy
          : true,

      show_question_key:
        typeof rawDisplay.show_question_key === "boolean"
          ? rawDisplay.show_question_key
          : false,
    },

    response: {
      mode:
        rawResponse.mode === "FIXED" ||
        rawResponse.mode === "ALLOWED" ||
        rawResponse.mode === "DEFERRED"
          ? rawResponse.mode
          : "DEFERRED",

      types,

      options_source:
        rawResponse.options_source === "RESOURCE" ? "RESOURCE" : "MANUAL",

      resource_options:
        isRecord(rawResponse.resource_options) &&
        typeof rawResponse.resource_options.resource_id === "number"
          ? {
              resource_id: rawResponse.resource_options.resource_id,
              value_field_key:
                typeof rawResponse.resource_options.value_field_key === "string"
                  ? rawResponse.resource_options.value_field_key
                  : "",
              label_field_key:
                typeof rawResponse.resource_options.label_field_key === "string"
                  ? rawResponse.resource_options.label_field_key
                  : "",
            }
          : null,

      options,

      allow_option_customization:
        typeof rawResponse.allow_option_customization === "boolean"
          ? rawResponse.allow_option_customization
          : true,

      allow_type_override:
        typeof rawResponse.allow_type_override === "boolean"
          ? rawResponse.allow_type_override
          : true,
    },

    statistics: {
      enabled:
        typeof rawStatistics.enabled === "boolean"
          ? rawStatistics.enabled
          : false,

      realtime:
        typeof rawStatistics.realtime === "boolean"
          ? rawStatistics.realtime
          : true,

      global:
        typeof rawStatistics.global === "boolean" ? rawStatistics.global : true,

      hierarchy_levels: Array.isArray(rawStatistics.hierarchy_levels)
        ? rawStatistics.hierarchy_levels.filter(
            (value): value is number =>
              typeof value === "number" &&
              Number.isInteger(value) &&
              value >= 0,
          )
        : [],

      measures: Array.isArray(rawStatistics.measures)
        ? rawStatistics.measures.filter(
            (value): value is ProjectQuestionStatisticsMeasure =>
              value === "COUNT" || value === "PERCENTAGE",
          )
        : ["COUNT", "PERCENTAGE"],

      percentage_denominator:
        rawStatistics.percentage_denominator === "ALL_QUESTIONS" ||
        rawStatistics.percentage_denominator === "EXCLUDE_VALUES"
          ? rawStatistics.percentage_denominator
          : "ANSWERED_QUESTIONS",

      excluded_response_values: Array.isArray(
        rawStatistics.excluded_response_values,
      )
        ? rawStatistics.excluded_response_values.filter(
            (value): value is string => typeof value === "string",
          )
        : [],

      categories,
    },
  };
}

/* ========================================================================
 * NORMALIZE HIERARCHY
 * ======================================================================== */

function normalizeHierarchy(
  value: unknown,
): ProjectResourceQuestionHierarchyLevel[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isRecord).map((item, index) => ({
    relation_id: typeof item.relation_id === "number" ? item.relation_id : 0,

    resource_id: typeof item.resource_id === "number" ? item.resource_id : 0,

    resource_key:
      typeof item.resource_key === "string" ? item.resource_key : undefined,

    resource_name:
      typeof item.resource_name === "string" ? item.resource_name : undefined,

    source_field_key:
      typeof item.source_field_key === "string" ? item.source_field_key : "",

    target_field_key:
      typeof item.target_field_key === "string" ? item.target_field_key : "",

    label: typeof item.label === "string" ? item.label : null,

    position: typeof item.position === "number" ? item.position : index,
  }));
}

/* ========================================================================
 * NORMALIZE RESPONSE OPTIONS
 * ======================================================================== */

function normalizeResponseOptions(
  value: unknown,
): ProjectQuestionResponseOption[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isRecord).map((item, index) => ({
    value: typeof item.value === "string" ? item.value : "",

    label: typeof item.label === "string" ? item.label : "",

    position: typeof item.position === "number" ? item.position : index,

    is_active: typeof item.is_active === "boolean" ? item.is_active : true,

    statistics: isRecord(item.statistics) ? item.statistics : {},
  }));
}

/* ========================================================================
 * NORMALIZE STATISTICS CATEGORIES
 * ======================================================================== */

function normalizeStatisticsCategories(
  value: unknown,
): ProjectQuestionStatisticsCategory[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isRecord).map((item, index) => ({
    key: typeof item.key === "string" ? item.key : `category_${index + 1}`,

    label: typeof item.label === "string" ? item.label : "",

    response_values: Array.isArray(item.response_values)
      ? item.response_values.filter(
          (value): value is string => typeof value === "string",
        )
      : [],

    excluded_from_percentage:
      typeof item.excluded_from_percentage === "boolean"
        ? item.excluded_from_percentage
        : false,

    position: typeof item.position === "number" ? item.position : index,

    is_active: typeof item.is_active === "boolean" ? item.is_active : true,
  }));
}

/* ========================================================================
 * RECORD GUARD
 * ======================================================================== */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
