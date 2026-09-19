"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  Database,
  FileText,
  Loader2,
  Save,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api";
import { pluginProgramService } from "@/services/plugin-program.service";
import type {
  PluginProgram,
  PluginProgramCreate,
  ProgramSchedule,
  ProgramScheduleUnit,
} from "@/types/plugin-program";

type Value = PluginProgram | PluginProgramCreate;

type SectionKey =
  | "general"
  | "scope"
  | "schedule"
  | "configuration"
  | "resources"
  | "projects";

interface Props {
  pluginId: number;
  program: PluginProgram | null;
  onCancel?: () => void;
}

const navigation: Array<{
  key: SectionKey;
  label: string;
  description: string;
  icon: typeof Settings2;
}> = [
  {
    key: "general",
    label: "Général",
    description: "Identité du programme",
    icon: Settings2,
  },
  {
    key: "scope",
    label: "Portée",
    description: "Global ou utilisateur",
    icon: ShieldCheck,
  },
  {
    key: "schedule",
    label: "Temporalité",
    description: "Calendrier du programme",
    icon: CalendarDays,
  },
  {
    key: "configuration",
    label: "Configuration",
    description: "Paramètres métier",
    icon: SlidersHorizontal,
  },
  {
    key: "resources",
    label: "Ressources",
    description: "Données disponibles",
    icon: Database,
  },
  {
    key: "projects",
    label: "Projets",
    description: "Règles des projets",
    icon: FileText,
  },
];

function createDefaultSchedule(): ProgramSchedule {
  return {
    type: "ONE_TIME",
    execution_mode: "MANUAL",
    timezone: "UTC",

    start_at: null,
    end_at: null,

    recurrence_unit: null,
    recurrence_interval: null,

    occurrence_duration: null,
    occurrence_duration_unit: null,

    gap_duration: 0,
    gap_duration_unit: "DAY",

    custom_occurrences: [],
  };
}

function createDefaultProgram(): PluginProgramCreate {
  return {
    key: "",
    code: null,
    name: "",
    description: null,

    icon: "CalendarDays",
    color: null,
    position: 0,

    scope: "GLOBAL",

    allow_user_use: true,
    allow_user_customization: false,
    allow_multiple_projects: true,
    allow_project_creation: true,

    configuration: {},
    project_rules: [],
    resource_bindings: [],

    schedule: createDefaultSchedule(),
  };
}

export function ProgramEditor({ pluginId, program, onCancel }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeSection, setActiveSection] = useState<SectionKey>("general");

  const [form, setForm] = useState<Value>(
    () => program ?? createDefaultProgram(),
  );

  const schedule = form.schedule ?? createDefaultSchedule();

  const update = (field: keyof Value, value: unknown) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateSchedule = <K extends keyof ProgramSchedule>(
    field: K,
    value: ProgramSchedule[K],
  ) => {
    setForm((current) => ({
      ...current,
      schedule: {
        ...(current.schedule ?? createDefaultSchedule()),
        [field]: value,
      },
    }));
  };

  const createMutation = useMutation({
    mutationFn: () =>
      pluginProgramService.create(pluginId, form as PluginProgramCreate),

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: ["plugin-programs", pluginId],
      });

      if (response.data) {
        router.replace(
          `/dashboard/plugins/${pluginId}/programs/${response.data.id}`,
        );
      }

      toast.success("Programme créé avec succès.");
    },

    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Impossible de créer le programme.",
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      pluginProgramService.update(pluginId, program!.id, form as PluginProgram),

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: ["plugin-programs", pluginId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["plugin-program", pluginId, program!.id],
      });

      if (response.data) {
        setForm(response.data);
      }

      toast.success("Programme enregistré.");
    },

    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Impossible d’enregistrer le programme.",
      );
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const save = () => {
    if (!String(form.name ?? "").trim()) {
      setActiveSection("general");
      toast.error("Le nom du programme est obligatoire.");
      return;
    }

    if (!String(form.key ?? "").trim()) {
      setActiveSection("general");
      toast.error("La clé du programme est obligatoire.");
      return;
    }

    if (schedule.type === "ONE_TIME") {
      if (!schedule.start_at || !schedule.end_at) {
        setActiveSection("schedule");
        toast.error(
          "Une programmation unique nécessite une date de début et une date de fin.",
        );
        return;
      }
    }

    if (schedule.type === "RECURRING") {
      if (
        !schedule.start_at ||
        !schedule.recurrence_unit ||
        !schedule.recurrence_interval ||
        !schedule.occurrence_duration ||
        !schedule.occurrence_duration_unit
      ) {
        setActiveSection("schedule");
        toast.error(
          "La récurrence doit définir son début, son intervalle et sa durée.",
        );
        return;
      }
    }

    if (schedule.type === "CUSTOM") {
      if (!schedule.custom_occurrences.length) {
        setActiveSection("schedule");
        toast.error("Ajoutez au moins une occurrence personnalisée.");
        return;
      }
    }

    if (program) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const cancel = () => {
    if (onCancel) {
      onCancel();
      return;
    }

    router.push(`/dashboard/plugins/${pluginId}/programs`);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="grid min-h-[760px] lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="border-b border-border bg-muted/10 lg:border-b-0 lg:border-r">
          <div className="p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Configuration
            </div>

            <div className="mt-1 text-sm font-medium">Programme</div>
          </div>

          <nav className="space-y-1 px-2 pb-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveSection(item.key)}
                  className={[
                    "flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  ].join(" ")}
                >
                  <Icon size={17} className="mt-0.5 shrink-0" />

                  <span>
                    <span className="block text-sm font-medium">
                      {item.label}
                    </span>

                    <span className="mt-0.5 block text-[11px] leading-4 opacity-80">
                      {item.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0">
          <div className="p-6 lg:p-8">
            {activeSection === "general" && (
              <GeneralSection value={form} onChange={update} />
            )}

            {activeSection === "scope" && (
              <ScopeSection value={form} onChange={update} />
            )}

            {activeSection === "schedule" && (
              <ScheduleSection value={schedule} onChange={updateSchedule} />
            )}

            {activeSection === "configuration" && (
              <ConfigurationSection value={form} onChange={update} />
            )}

            {activeSection === "resources" && <ResourcesSection />}

            {activeSection === "projects" && (
              <ProjectsSection value={form} onChange={update} />
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border bg-muted/10 px-6 py-4 lg:px-8">
            <button
              type="button"
              onClick={cancel}
              disabled={isPending}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              Annuler
            </button>

            <button
              type="button"
              onClick={save}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}

              {program ? "Enregistrer" : "Créer le programme"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

// ============================================================================
// GENERAL
// ============================================================================

function GeneralSection({
  value,
  onChange,
}: {
  value: Value;
  onChange: (field: keyof Value, value: unknown) => void;
}) {
  return (
    <Section
      title="Informations générales"
      description="Définissez l'identité du programme dans le plugin."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Nom" required>
          <input
            value={value.name}
            onChange={(event) => onChange("name", event.target.value)}
            placeholder="Campagne EUDR 2026"
            className={inputClass}
          />
        </Field>

        <Field label="Clé technique" required>
          <input
            value={value.key}
            onChange={(event) =>
              onChange(
                "key",
                event.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_"),
              )
            }
            placeholder="CAMPAGNE_EUDR_2026"
            maxLength={100}
            className={inputClass}
          />
        </Field>

        <Field label="Code métier">
          <input
            value={value.code ?? ""}
            onChange={(event) => onChange("code", event.target.value || null)}
            placeholder="CAMP-2026"
            maxLength={100}
            className={inputClass}
          />
        </Field>

        <Field label="Icône">
          <input
            value={value.icon ?? ""}
            onChange={(event) => onChange("icon", event.target.value || null)}
            placeholder="CalendarDays"
            className={inputClass}
          />
        </Field>

        <Field label="Position">
          <input
            type="number"
            min={0}
            value={value.position ?? 0}
            onChange={(event) =>
              onChange("position", Number(event.target.value) || 0)
            }
            className={inputClass}
          />
        </Field>

        <div className="md:col-span-2">
          <Field label="Description">
            <textarea
              value={value.description ?? ""}
              onChange={(event) =>
                onChange("description", event.target.value || null)
              }
              rows={5}
              placeholder="Décrivez l'objectif et le fonctionnement du programme..."
              className={`${inputClass} min-h-[130px] resize-y`}
            />
          </Field>
        </div>
      </div>
    </Section>
  );
}

// ============================================================================
// SCOPE
// ============================================================================

function ScopeSection({
  value,
  onChange,
}: {
  value: Value;
  onChange: (field: keyof Value, value: unknown) => void;
}) {
  const global = value.scope === "GLOBAL";

  return (
    <Section
      title="Portée et permissions"
      description="Définissez qui possède et qui peut utiliser ce programme."
    >
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Choice
            active={global}
            title="Programme global"
            description="Programme défini par l'administration et destiné aux utilisateurs du plugin."
            onClick={() => onChange("scope", "GLOBAL")}
          />

          <Choice
            active={!global}
            title="Programme utilisateur"
            description="Programme appartenant à l'utilisateur qui le crée."
            onClick={() => onChange("scope", "USER")}
          />
        </div>

        <Permission
          title="Autoriser l'utilisation"
          description="Les utilisateurs pourront utiliser ce programme lorsqu'ils créent un projet."
          checked={value.allow_user_use ?? true}
          onChange={(checked) => onChange("allow_user_use", checked)}
        />

        <Permission
          title="Autoriser la personnalisation"
          description="Les utilisateurs pourront adapter les paramètres autorisés sans modifier la définition globale du programme."
          checked={value.allow_user_customization ?? false}
          onChange={(checked) => onChange("allow_user_customization", checked)}
        />

        {!global && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-6 text-primary">
            Ce programme sera rattaché à l&#39;utilisateur qui le crée.
            L&#39;architecture permet ainsi de distinguer clairement les
            programmes globaux des programmes personnels.
          </div>
        )}
      </div>
    </Section>
  );
}

// ============================================================================
// SCHEDULE
// ============================================================================

function ScheduleSection({
  value,
  onChange,
}: {
  value: ProgramSchedule;
  onChange: <K extends keyof ProgramSchedule>(
    field: K,
    value: ProgramSchedule[K],
  ) => void;
}) {
  return (
    <Section
      title="Temporalité"
      description="Configurez précisément le calendrier du programme."
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Choice
            active={value.type === "ONE_TIME"}
            title="Une seule période"
            description="Le programme possède une période unique."
            onClick={() => onChange("type", "ONE_TIME")}
          />

          <Choice
            active={value.type === "RECURRING"}
            title="Périodique"
            description="Le programme se répète suivant une règle."
            onClick={() => onChange("type", "RECURRING")}
          />

          <Choice
            active={value.type === "CUSTOM"}
            title="Personnalisé"
            description="Définissez chaque période manuellement."
            onClick={() => onChange("type", "CUSTOM")}
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Mode">
            <select
              value={value.execution_mode}
              onChange={(event) =>
                onChange(
                  "execution_mode",
                  event.target.value as ProgramSchedule["execution_mode"],
                )
              }
              className={inputClass}
            >
              <option value="MANUAL">Manuel</option>
              <option value="AUTOMATIC">Automatique</option>
            </select>
          </Field>

          <Field label="Fuseau horaire">
            <input
              value={value.timezone}
              onChange={(event) => onChange("timezone", event.target.value)}
              placeholder="Africa/Douala"
              className={inputClass}
            />
          </Field>
        </div>

        {value.type === "ONE_TIME" && (
          <div className="grid gap-5 md:grid-cols-2">
            <DateField
              label="Début"
              value={value.start_at}
              onChange={(next) => onChange("start_at", next)}
            />

            <DateField
              label="Fin"
              value={value.end_at}
              onChange={(next) => onChange("end_at", next)}
            />
          </div>
        )}

        {value.type === "RECURRING" && (
          <RecurringFields value={value} onChange={onChange} />
        )}

        {value.type === "CUSTOM" && (
          <CustomOccurrences value={value} onChange={onChange} />
        )}
      </div>
    </Section>
  );
}

function RecurringFields({
  value,
  onChange,
}: {
  value: ProgramSchedule;
  onChange: <K extends keyof ProgramSchedule>(
    field: K,
    value: ProgramSchedule[K],
  ) => void;
}) {
  return (
    <div className="space-y-5 rounded-2xl border border-border p-5">
      <div className="grid gap-5 md:grid-cols-2">
        <DateField
          label="Première occurrence"
          value={value.start_at}
          onChange={(next) => onChange("start_at", next)}
        />

        <DateField
          label="Fin globale (optionnelle)"
          value={value.end_at}
          onChange={(next) => onChange("end_at", next)}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Répéter tous les">
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              value={value.recurrence_interval ?? 1}
              onChange={(event) =>
                onChange("recurrence_interval", Number(event.target.value) || 1)
              }
              className={`${inputClass} max-w-[130px]`}
            />

            <select
              value={value.recurrence_unit ?? "DAY"}
              onChange={(event) =>
                onChange(
                  "recurrence_unit",
                  event.target.value as ProgramScheduleUnit,
                )
              }
              className={inputClass}
            >
              <option value="DAY">jour(s)</option>
              <option value="WEEK">semaine(s)</option>
              <option value="MONTH">mois</option>
              <option value="YEAR">année(s)</option>
            </select>
          </div>
        </Field>

        <Field label="Durée de chaque occurrence">
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              value={value.occurrence_duration ?? 1}
              onChange={(event) =>
                onChange("occurrence_duration", Number(event.target.value) || 1)
              }
              className={`${inputClass} max-w-[130px]`}
            />

            <select
              value={value.occurrence_duration_unit ?? "DAY"}
              onChange={(event) =>
                onChange(
                  "occurrence_duration_unit",
                  event.target.value as ProgramScheduleUnit,
                )
              }
              className={inputClass}
            >
              <option value="DAY">jour(s)</option>
              <option value="WEEK">semaine(s)</option>
              <option value="MONTH">mois</option>
              <option value="YEAR">année(s)</option>
            </select>
          </div>
        </Field>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Espace entre deux occurrences">
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              value={value.gap_duration}
              onChange={(event) =>
                onChange("gap_duration", Number(event.target.value) || 0)
              }
              className={`${inputClass} max-w-[130px]`}
            />

            <select
              value={value.gap_duration_unit}
              onChange={(event) =>
                onChange(
                  "gap_duration_unit",
                  event.target.value as ProgramScheduleUnit,
                )
              }
              className={inputClass}
            >
              <option value="DAY">jour(s)</option>
              <option value="WEEK">semaine(s)</option>
              <option value="MONTH">mois</option>
              <option value="YEAR">année(s)</option>
            </select>
          </div>
        </Field>
      </div>

      <div className="rounded-xl bg-muted/50 p-4 text-sm leading-6 text-muted-foreground">
        Exemple : une occurrence commence lundi à 08:00, dure 7 jours, puis un
        espace de 3 jours est appliqué. La prochaine occurrence démarre donc
        mercredi à 08:00.
      </div>
    </div>
  );
}

// ============================================================================
// CUSTOM OCCURRENCES
// ============================================================================

function CustomOccurrences({
  value,
  onChange,
}: {
  value: ProgramSchedule;
  onChange: <K extends keyof ProgramSchedule>(
    field: K,
    value: ProgramSchedule[K],
  ) => void;
}) {
  const addOccurrence = () => {
    const start = new Date();
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

    const next = [
      ...value.custom_occurrences,
      {
        start_at: toDatetimeLocal(start),
        end_at: toDatetimeLocal(end),
      },
    ];

    onChange("custom_occurrences", next);
  };

  const removeOccurrence = (index: number) => {
    onChange(
      "custom_occurrences",
      value.custom_occurrences.filter(
        (_, currentIndex) => currentIndex !== index,
      ),
    );
  };

  const updateOccurrence = (
    index: number,
    field: "start_at" | "end_at",
    nextValue: string | null,
  ) => {
    const next = value.custom_occurrences.map((occurrence, currentIndex) =>
      currentIndex === index
        ? {
            ...occurrence,
            [field]: nextValue,
          }
        : occurrence,
    );

    onChange("custom_occurrences", next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold">Occurrences personnalisées</h4>

          <p className="mt-1 text-xs text-muted-foreground">
            Chaque occurrence possède ses propres dates.
          </p>
        </div>

        <button
          type="button"
          onClick={addOccurrence}
          className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
        >
          Ajouter une période
        </button>
      </div>

      {value.custom_occurrences.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Aucune période personnalisée.
        </div>
      )}

      {value.custom_occurrences.map((occurrence, index) => (
        <div
          key={`${index}-${occurrence.start_at}`}
          className="rounded-xl border border-border p-4"
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-semibold">Période {index + 1}</span>

            <button
              type="button"
              onClick={() => removeOccurrence(index)}
              className="text-xs font-medium text-destructive"
            >
              Supprimer
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <DateField
              label="Début"
              value={occurrence.start_at}
              onChange={(next) => updateOccurrence(index, "start_at", next)}
            />

            <DateField
              label="Fin"
              value={occurrence.end_at}
              onChange={(next) => updateOccurrence(index, "end_at", next)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// CONFIGURATION
// ============================================================================

function ConfigurationSection({
  value,
  onChange,
}: {
  value: Value;
  onChange: (field: keyof Value, value: unknown) => void;
}) {
  return (
    <Section
      title="Configuration métier"
      description="Paramètres complémentaires propres au programme."
    >
      <Permission
        title="Autoriser la création de projets"
        description="Un projet peut être créé dans le cadre de ce programme."
        checked={value.allow_project_creation ?? true}
        onChange={(checked) => onChange("allow_project_creation", checked)}
      />

      <Permission
        title="Autoriser plusieurs projets"
        description="Le programme peut contenir plusieurs projets."
        checked={value.allow_multiple_projects ?? true}
        onChange={(checked) => onChange("allow_multiple_projects", checked)}
      />

      <div className="mt-5">
        <Field label="Configuration JSON">
          <textarea
            value={JSON.stringify(value.configuration ?? {}, null, 2)}
            onChange={(event) => {
              try {
                const parsed = JSON.parse(event.target.value);

                onChange("configuration", parsed);
              } catch {
                // La validation JSON est volontairement
                // différée tant que l'utilisateur saisit.
              }
            }}
            rows={14}
            className={`${inputClass} font-mono text-xs`}
          />
        </Field>
      </div>
    </Section>
  );
}

// ============================================================================
// RESOURCES
// ============================================================================

function ResourcesSection() {
  return (
    <Section
      title="Ressources"
      description="Les liaisons de ressources pourront être configurées ici."
    >
      <div className="rounded-xl border border-dashed border-border p-8 text-center">
        <Database size={28} className="mx-auto text-muted-foreground" />

        <h3 className="mt-4 text-sm font-semibold">Liaisons de ressources</h3>

        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
          Le programme utilise le même moteur de ressources que le reste du
          plugin. Cette section pourra donc réutiliser les ressources existantes
          sans créer un second système.
        </p>
      </div>
    </Section>
  );
}

// ============================================================================
// PROJECTS
// ============================================================================

function ProjectsSection({
  value,
  onChange,
}: {
  value: Value;
  onChange: (field: keyof Value, value: unknown) => void;
}) {
  return (
    <Section
      title="Règles des projets"
      description="Définissez comment les projets pourront être construits dans le programme."
    >
      <div className="space-y-5">
        <div className="rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold">Modèles et types autorisés</h3>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            La structure détaillée des règles sera raccordée aux modèles de
            projets existants.
          </p>

          <textarea
            value={JSON.stringify(value.project_rules ?? [], null, 2)}
            onChange={(event) => {
              try {
                onChange("project_rules", JSON.parse(event.target.value));
              } catch {
                // Validation différée.
              }
            }}
            rows={14}
            className={`${inputClass} mt-4 font-mono text-xs`}
          />
        </div>
      </div>
    </Section>
  );
}

// ============================================================================
// SHARED UI
// ============================================================================

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-4xl space-y-7">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>

        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>

      {children}
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold">
        {label}

        {required && <span className="ml-1 text-destructive">*</span>}
      </label>

      {children}
    </div>
  );
}

function Permission({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-6 rounded-xl border border-border p-5">
      <div>
        <div className="text-sm font-semibold">{title}</div>

        <div className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">
          {description}
        </div>
      </div>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4"
      />
    </label>
  );
}

function Choice({
  active,
  title,
  description,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-xl border p-5 text-left transition-colors",
        active
          ? "border-primary bg-primary/5"
          : "border-border hover:bg-muted/50",
      ].join(" ")}
    >
      <div className="text-sm font-semibold">{title}</div>

      <div className="mt-1 text-xs leading-5 text-muted-foreground">
        {description}
      </div>
    </button>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  return (
    <Field label={label}>
      <input
        type="datetime-local"
        value={toDatetimeLocalValue(value)}
        onChange={(event) => onChange(event.target.value || null)}
        className={inputClass}
      />
    </Field>
  );
}

function toDatetimeLocalValue(value: string | null): string {
  if (!value) {
    return "";
  }

  return value.length >= 16 ? value.slice(0, 16) : value;
}

function toDatetimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary";
