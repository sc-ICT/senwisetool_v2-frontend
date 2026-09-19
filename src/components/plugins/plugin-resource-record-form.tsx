"use client";

import { Loader2, Plus, Save, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api";
import { pluginResourceService } from "@/services/plugin-resource.service";
import type {
  PluginFieldType,
  PluginResourceRecord,
  PluginResourceSchemaField,
} from "@/types/plugin-resource";

interface Props {
  resourceId: number;
  fields: PluginResourceSchemaField[];
  record?: PluginResourceRecord | null;
  disabled?: boolean;
  onSaved?: () => void;
  onCancel?: () => void;
}

function emptyValue(field: PluginResourceSchemaField): unknown {
  if (field.default_value !== null && field.default_value !== undefined) {
    return field.default_value;
  }

  if (field.field_type === "MULTIPLE_CHOICE") {
    return [];
  }

  if (field.field_type === "BOOLEAN") {
    return false;
  }

  return "";
}

function buildInitialData(
  fields: PluginResourceSchemaField[],
  record?: PluginResourceRecord | null,
): Record<string, unknown> {
  const source = record?.data ?? {};

  return fields.reduce<Record<string, unknown>>((acc, field) => {
    if (Object.prototype.hasOwnProperty.call(source, field.key)) {
      acc[field.key] = source[field.key];
    } else {
      acc[field.key] = emptyValue(field);
    }

    return acc;
  }, {});
}

function normalizeValue(
  field: PluginResourceSchemaField,
  value: unknown,
): unknown {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  switch (field.field_type) {
    case "NUMBER": {
      const number = Number(value);

      return Number.isNaN(number) ? value : number;
    }

    case "DECIMAL": {
      const number = Number(value);

      return Number.isNaN(number) ? value : number;
    }

    case "BOOLEAN":
      return Boolean(value);

    case "MULTIPLE_CHOICE":
      return Array.isArray(value) ? value : [value];

    default:
      return value;
  }
}

function validateClientSide(
  fields: PluginResourceSchemaField[],
  data: Record<string, unknown>,
): string | null {
  for (const field of fields) {
    if (!field.is_active) {
      continue;
    }

    const value = data[field.key];

    const empty =
      value === null ||
      value === undefined ||
      value === "" ||
      (Array.isArray(value) && value.length === 0);

    if (empty && field.required) {
      return `Le champ « ${field.label} » est obligatoire.`;
    }

    if (empty) {
      continue;
    }

    if (
      typeof value === "string" &&
      field.min_length !== null &&
      field.min_length !== undefined &&
      value.length < field.min_length
    ) {
      return `Le champ « ${field.label} » doit contenir au moins ${field.min_length} caractères.`;
    }

    if (
      typeof value === "string" &&
      field.max_length !== null &&
      field.max_length !== undefined &&
      value.length > field.max_length
    ) {
      return `Le champ « ${field.label} » doit contenir au maximum ${field.max_length} caractères.`;
    }

    if (field.pattern && typeof value === "string") {
      try {
        if (!new RegExp(field.pattern).test(value)) {
          return `Le champ « ${field.label} » ne respecte pas le format demandé.`;
        }
      } catch {
        return `Le pattern du champ « ${field.label} » est invalide.`;
      }
    }

    if (["NUMBER", "DECIMAL"].includes(field.field_type)) {
      const number = Number(value);

      if (Number.isNaN(number)) {
        return `Le champ « ${field.label} » doit être numérique.`;
      }

      if (
        field.min_value !== null &&
        field.min_value !== undefined &&
        number < field.min_value
      ) {
        return `Le champ « ${field.label} » doit être supérieur ou égal à ${field.min_value}.`;
      }

      if (
        field.max_value !== null &&
        field.max_value !== undefined &&
        number > field.max_value
      ) {
        return `Le champ « ${field.label} » doit être inférieur ou égal à ${field.max_value}.`;
      }
    }

    if (field.field_type === "SINGLE_CHOICE") {
      const options = (field.options ?? []).map(String);

      if (!options.includes(String(value))) {
        return `La valeur sélectionnée pour « ${field.label} » est invalide.`;
      }
    }

    if (field.field_type === "MULTIPLE_CHOICE") {
      const options = new Set((field.options ?? []).map(String));

      if (
        !Array.isArray(value) ||
        value.some((item) => !options.has(String(item)))
      ) {
        return `Une ou plusieurs valeurs de « ${field.label} » sont invalides.`;
      }
    }
  }

  return null;
}

export function PluginResourceRecordForm({
  resourceId,
  fields,
  record,
  disabled = false,
  onSaved,
  onCancel,
}: Props) {
  const [data, setData] = useState<Record<string, unknown>>(() =>
    buildInitialData(fields, record),
  );

  const [isActive, setIsActive] = useState(record?.is_active ?? true);

  const [isPending, setIsPending] = useState(false);

  const editing = Boolean(record);

  useEffect(() => {
    // Avoid calling setState synchronously within an effect to prevent cascading renders.
    // Schedule updates asynchronously so React won't warn about synchronous setState in effects.
    const nextData = buildInitialData(fields, record);
    const nextActive = record?.is_active ?? true;

    const t = setTimeout(() => {
      setData(nextData);
      setIsActive(nextActive);
    }, 0);

    return () => clearTimeout(t);
  }, [fields, record]);

  const updateValue = (key: string, value: unknown) => {
    setData((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const toggleMultipleChoice = (
    key: string,
    option: string,
    checked: boolean,
  ) => {
    setData((current) => {
      const currentValue = Array.isArray(current[key])
        ? current[key].map(String)
        : [];

      const next = checked
        ? [...new Set([...currentValue, option])]
        : currentValue.filter((item) => item !== option);

      return {
        ...current,
        [key]: next,
      };
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (disabled || isPending) {
      return;
    }

    const validationError = validateClientSide(fields, data);

    if (validationError) {
      toast.error(validationError);
      return;
    }

    const normalized = fields.reduce<Record<string, unknown>>((acc, field) => {
      if (!field.is_active) {
        return acc;
      }

      acc[field.key] = normalizeValue(field, data[field.key]);

      return acc;
    }, {});

    setIsPending(true);

    try {
      if (record) {
        await pluginResourceService.updateRecord(resourceId, record.id, {
          data: normalized,
          is_active: isActive,
        });

        toast.success("Donnée modifiée avec succès.");
      } else {
        await pluginResourceService.createRecord(resourceId, {
          data: normalized,
          is_active: isActive,
        });

        toast.success("Donnée enregistrée avec succès.");
      }

      onSaved?.();
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error(
          editing
            ? "Impossible de modifier la donnée."
            : "Impossible d'enregistrer la donnée.",
        );
      }
    } finally {
      setIsPending(false);
    }
  };

  const renderField = (field: PluginResourceSchemaField) => {
    if (!field.is_active) {
      return null;
    }

    const value = data[field.key];

    const commonClass =
      "w-full rounded-xl border border-border bg-background-secondary px-3 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50";

    const inputType: Record<PluginFieldType, string> = {
      TEXT: "text",
      LONG_TEXT: "text",
      NUMBER: "number",
      DECIMAL: "number",
      BOOLEAN: "checkbox",
      DATE: "date",
      DATETIME: "datetime-local",
      EMAIL: "email",
      PHONE: "tel",
      COUNTRY: "text",
      SINGLE_CHOICE: "text",
      MULTIPLE_CHOICE: "text",
      URL: "url",
    };

    if (field.field_type === "LONG_TEXT") {
      return (
        <textarea
          value={String(value ?? "")}
          onChange={(event) => updateValue(field.key, event.target.value)}
          disabled={disabled || isPending}
          rows={4}
          className={commonClass}
          placeholder={field.description ?? ""}
        />
      );
    }

    if (field.field_type === "BOOLEAN") {
      return (
        <label className="flex h-10 items-center gap-3">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) => updateValue(field.key, event.target.checked)}
            disabled={disabled || isPending}
            className="h-4 w-4"
          />

          <span className="text-sm text-foreground">
            {Boolean(value) ? "Oui" : "Non"}
          </span>
        </label>
      );
    }

    if (field.field_type === "SINGLE_CHOICE") {
      return (
        <select
          value={String(value ?? "")}
          onChange={(event) => updateValue(field.key, event.target.value)}
          disabled={disabled || isPending}
          className={commonClass}
        >
          <option value="">Sélectionner...</option>

          {(field.options ?? []).map((option) => (
            <option key={String(option)} value={String(option)}>
              {String(option)}
            </option>
          ))}
        </select>
      );
    }

    if (field.field_type === "MULTIPLE_CHOICE") {
      const selected = Array.isArray(value) ? value.map(String) : [];

      return (
        <div className="grid gap-2 rounded-xl border border-border bg-background-secondary p-3">
          {(field.options ?? []).map((option) => {
            const optionValue = String(option);

            return (
              <label
                key={optionValue}
                className="flex items-center gap-3 text-sm text-foreground"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(optionValue)}
                  onChange={(event) =>
                    toggleMultipleChoice(
                      field.key,
                      optionValue,
                      event.target.checked,
                    )
                  }
                  disabled={disabled || isPending}
                  className="h-4 w-4"
                />

                {optionValue}
              </label>
            );
          })}
        </div>
      );
    }

    return (
      <input
        type={inputType[field.field_type]}
        value={String(value ?? "")}
        onChange={(event) => updateValue(field.key, event.target.value)}
        disabled={disabled || isPending}
        min={field.min_value ?? undefined}
        max={field.max_value ?? undefined}
        className={commonClass}
        placeholder={field.description ?? ""}
      />
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-card"
    >
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {editing ? "Modifier la donnée" : "Nouvelle donnée"}
          </h3>

          <p className="mt-1 text-xs text-muted-foreground">
            Les valeurs sont contrôlées selon le schéma effectif de la
            ressource.
          </p>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="grid gap-5 p-6 md:grid-cols-2">
        {fields
          .filter((field) => field.is_active)
          .sort((a, b) => a.position - b.position)
          .map((field) => (
            <div
              key={field.key}
              className={
                field.field_type === "LONG_TEXT" ? "md:col-span-2" : ""
              }
            >
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                {field.label}

                {field.required && (
                  <span className="ml-1 text-destructive">*</span>
                )}
              </label>

              {field.description && (
                <p className="mb-2 text-xs text-muted-foreground">
                  {field.description}
                </p>
              )}

              {renderField(field)}
            </div>
          ))}

        <div className="md:col-span-2 rounded-xl border border-border bg-muted/20 px-4 py-4">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              disabled={disabled || isPending}
              className="h-4 w-4"
            />

            <span className="text-sm font-medium text-foreground">
              Donnée active
            </span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
          >
            <X size={16} />
            Annuler
          </button>
        )}

        <button
          type="submit"
          disabled={disabled || isPending}
          style={{
            background: "var(--color-surface-raised)",
            border: "1px solid var(--color-border)",
            color: "var(--color-foreground)",
            padding: "0.5rem 1rem",
            borderRadius: "0.75rem",
            fontSize: "0.8125rem",
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            cursor: "pointer",
            transition: "background 0.2s, border-color 0.2s",
          }}
        >
          {isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : editing ? (
            <Save size={16} />
          ) : (
            <Plus size={16} />
          )}

          {editing ? "Enregistrer" : "Ajouter"}
        </button>
      </div>
    </form>
  );
}
