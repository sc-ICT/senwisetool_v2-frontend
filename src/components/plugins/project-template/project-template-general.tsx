"use client";

import type {
  PluginProjectTemplate,
  PluginProjectTemplateCreate,
} from "@/types/plugin-project";

type Value = PluginProjectTemplate | PluginProjectTemplateCreate;

type EditableField =
  | "name"
  | "key"
  | "description"
  | "project_type"
  | "icon"
  | "position";

interface Props {
  value: Value;
  onChange: <K extends EditableField>(field: K, value: Value[K]) => void;
}

export function ProjectTemplateGeneral({ value, onChange }: Props) {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h3 className="text-sm font-semibold">Identité du modèle</h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Ces informations permettent d’identifier le modèle de projet dans le
          plugin.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Nom" required>
          <input
            value={value.name}
            onChange={(event) => onChange("name", event.target.value)}
            placeholder="Inspection interne"
            maxLength={255}
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
            placeholder="INSPECTION_INTERNE"
            maxLength={100}
            className={inputClass}
          />
        </Field>

        <Field label="Type de projet" required>
          <input
            value={value.project_type}
            onChange={(event) => onChange("project_type", event.target.value)}
            placeholder="INSPECTION"
            maxLength={100}
            className={inputClass}
          />
        </Field>

        <Field label="Icône">
          <input
            value={value.icon ?? ""}
            onChange={(event) => onChange("icon", event.target.value || null)}
            placeholder="ClipboardCheck"
            maxLength={100}
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
              placeholder="Décrivez l’objectif et le contexte de ce modèle..."
              className={`${inputClass} min-h-[130px] resize-y`}
            />
          </Field>
        </div>
      </div>
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
      <label className="mb-2 block text-xs font-semibold text-foreground">
        {label}

        {required && <span className="ml-1 text-destructive">*</span>}
      </label>

      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary";
