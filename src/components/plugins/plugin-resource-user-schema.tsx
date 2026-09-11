"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api";
import { pluginResourceService } from "@/services/plugin-resource.service";
import type {
  PluginFieldType,
  PluginResourceFieldCreate,
  PluginResourceSchemaField,
} from "@/types/plugin-resource";

interface Props {
  resourceId: number;
  enabled: boolean;
}

interface FieldFormState {
  key: string;
  label: string;
  description: string;
  field_type: PluginFieldType;
  required: boolean;
  min_length: string;
  max_length: string;
  min_value: string;
  max_value: string;
  pattern: string;
  options: string;
  default_value: string;
  is_active: boolean;
}

const EMPTY_FIELD: FieldFormState = {
  key: "",
  label: "",
  description: "",
  field_type: "TEXT",
  required: false,
  min_length: "",
  max_length: "",
  min_value: "",
  max_value: "",
  pattern: "",
  options: "",
  default_value: "",
  is_active: true,
};

const LENGTH_TYPES: PluginFieldType[] = [
  "TEXT",
  "LONG_TEXT",
  "EMAIL",
  "PHONE",
  "COUNTRY",
  "URL",
];

const NUMBER_TYPES: PluginFieldType[] = ["NUMBER", "DECIMAL"];

const CHOICE_TYPES: PluginFieldType[] = ["SINGLE_CHOICE", "MULTIPLE_CHOICE"];

const FIELD_LABELS: Record<PluginFieldType, string> = {
  TEXT: "Texte",
  LONG_TEXT: "Texte long",
  NUMBER: "Nombre entier",
  DECIMAL: "Nombre décimal",
  BOOLEAN: "Booléen",
  DATE: "Date",
  DATETIME: "Date et heure",
  EMAIL: "Email",
  PHONE: "Téléphone",
  COUNTRY: "Pays",
  SINGLE_CHOICE: "Choix unique",
  MULTIPLE_CHOICE: "Choix multiples",
  URL: "URL",
};

function fieldToForm(field: PluginResourceSchemaField): FieldFormState {
  return {
    key: field.key,
    label: field.label,
    description: field.description ?? "",
    field_type: field.field_type,
    required: field.required,
    min_length:
      field.min_length === null || field.min_length === undefined
        ? ""
        : String(field.min_length),
    max_length:
      field.max_length === null || field.max_length === undefined
        ? ""
        : String(field.max_length),
    min_value:
      field.min_value === null || field.min_value === undefined
        ? ""
        : String(field.min_value),
    max_value:
      field.max_value === null || field.max_value === undefined
        ? ""
        : String(field.max_value),
    pattern: field.pattern ?? "",
    options: Array.isArray(field.options)
      ? field.options.map(String).join("\n")
      : "",
    default_value:
      field.default_value === null || field.default_value === undefined
        ? ""
        : String(field.default_value),
    is_active: field.is_active,
  };
}

function buildPayload(
  form: FieldFormState,
  position: number,
): PluginResourceFieldCreate {
  return {
    key: form.key.trim(),
    label: form.label.trim(),
    description: form.description.trim() || null,
    field_type: form.field_type,
    required: form.required,
    min_length:
      LENGTH_TYPES.includes(form.field_type) && form.min_length.trim()
        ? Number(form.min_length)
        : null,
    max_length:
      LENGTH_TYPES.includes(form.field_type) && form.max_length.trim()
        ? Number(form.max_length)
        : null,
    min_value:
      NUMBER_TYPES.includes(form.field_type) && form.min_value.trim()
        ? Number(form.min_value)
        : null,
    max_value:
      NUMBER_TYPES.includes(form.field_type) && form.max_value.trim()
        ? Number(form.max_value)
        : null,
    pattern: form.pattern.trim() || null,
    options: CHOICE_TYPES.includes(form.field_type)
      ? form.options
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean)
      : [],
    default_value: form.default_value.trim() || null,
    position,
    is_active: form.is_active,
  };
}

function validateField(form: FieldFormState): string | null {
  if (!form.key.trim()) {
    return "La clé est obligatoire.";
  }

  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(form.key.trim())) {
    return "La clé doit commencer par une lettre et ne contenir que des lettres, chiffres et underscores.";
  }

  if (!form.label.trim()) {
    return "Le libellé est obligatoire.";
  }

  const minLength = form.min_length.trim() ? Number(form.min_length) : null;

  const maxLength = form.max_length.trim() ? Number(form.max_length) : null;

  if (minLength !== null && (!Number.isInteger(minLength) || minLength < 0)) {
    return "La longueur minimale est invalide.";
  }

  if (maxLength !== null && (!Number.isInteger(maxLength) || maxLength < 0)) {
    return "La longueur maximale est invalide.";
  }

  if (minLength !== null && maxLength !== null && minLength > maxLength) {
    return "La longueur minimale ne peut pas dépasser la longueur maximale.";
  }

  const minValue = form.min_value.trim() ? Number(form.min_value) : null;

  const maxValue = form.max_value.trim() ? Number(form.max_value) : null;

  if (minValue !== null && Number.isNaN(minValue)) {
    return "La valeur minimale est invalide.";
  }

  if (maxValue !== null && Number.isNaN(maxValue)) {
    return "La valeur maximale est invalide.";
  }

  if (minValue !== null && maxValue !== null && minValue > maxValue) {
    return "La valeur minimale ne peut pas dépasser la valeur maximale.";
  }

  if (CHOICE_TYPES.includes(form.field_type)) {
    const options = form.options
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    if (options.length === 0) {
      return "Un champ de choix doit avoir au moins une option.";
    }

    if (new Set(options).size !== options.length) {
      return "Les options doivent être uniques.";
    }
  }

  if (form.pattern.trim()) {
    try {
      new RegExp(form.pattern.trim());
    } catch {
      return "L'expression régulière est invalide.";
    }
  }

  return null;
}

export function PluginResourceUserSchema({ resourceId, enabled }: Props) {
  const queryClient = useQueryClient();

  const [fields, setFields] = useState<PluginResourceSchemaField[]>([]);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [isAdding, setIsAdding] = useState(false);

  const [form, setForm] = useState<FieldFormState>({
    ...EMPTY_FIELD,
  });

  const effectiveQuery = useQuery({
    queryKey: ["plugin-resource-effective-schema", resourceId],

    queryFn: async () => {
      const response =
        await pluginResourceService.getEffectiveSchema(resourceId);

      return response.data;
    },

    enabled: enabled && Number.isInteger(resourceId),

    staleTime: 0,
  });

  const saveMutation = useMutation({
    mutationFn: (payload: { fields: PluginResourceFieldCreate[] }) =>
      pluginResourceService.updateUserSchema(resourceId, payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["plugin-resource-effective-schema", resourceId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["plugin-resource-records", resourceId],
      });

      toast.success("Votre schéma personnalisé a été enregistré.");

      setEditingIndex(null);
      setIsAdding(false);
    },

    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
        return;
      }

      toast.error("Impossible d'enregistrer votre schéma.");
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => pluginResourceService.resetUserSchema(resourceId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["plugin-resource-effective-schema", resourceId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["plugin-resource-records", resourceId],
      });

      toast.success("Le schéma a été réinitialisé.");

      setFields([]);
      setEditingIndex(null);
      setIsAdding(false);
    },

    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
        return;
      }

      toast.error("Impossible de réinitialiser le schéma.");
    },
  });

  if (!enabled) {
    return null;
  }

  const effective = effectiveQuery.data;

  if (effectiveQuery.isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8">
        <div className="flex items-center justify-center">
          <Loader2 size={22} className="animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!effective) {
    return null;
  }

  const displayedFields = fields.length > 0 ? fields : effective.fields;

  const isOverridden = effective.is_overridden || fields.length > 0;

  const startAdd = () => {
    setForm({
      ...EMPTY_FIELD,
    });

    setEditingIndex(null);
    setIsAdding(true);
  };

  const startEdit = (index: number) => {
    setForm(fieldToForm(displayedFields[index]));

    setEditingIndex(index);
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setForm({
      ...EMPTY_FIELD,
    });

    setEditingIndex(null);
    setIsAdding(false);
  };

  const updateForm = (key: keyof FieldFormState, value: string | boolean) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleFieldSave = () => {
    const error = validateField(form);

    if (error) {
      toast.error(error);
      return;
    }

    const position =
      editingIndex === null
        ? displayedFields.length
        : displayedFields[editingIndex].position;

    const payload = buildPayload(form, position);

    const nextField: PluginResourceSchemaField = {
      ...payload,
      key: payload.key,
      label: payload.label,
      description: payload.description ?? null,
      field_type: payload.field_type,
      required: payload.required ?? false,
      min_length: payload.min_length ?? null,
      max_length: payload.max_length ?? null,
      min_value: payload.min_value ?? null,
      max_value: payload.max_value ?? null,
      pattern: payload.pattern ?? null,
      options: payload.options ?? [],
      default_value: payload.default_value ?? null,
      position: payload.position ?? 0,
      is_active: payload.is_active ?? true,
    };

    let nextFields: PluginResourceSchemaField[];

    if (editingIndex !== null) {
      nextFields = displayedFields.map((field, index) =>
        index === editingIndex ? nextField : field,
      );
    } else {
      nextFields = [...displayedFields, nextField];
    }

    setFields(
      nextFields.map((field, index) => ({
        ...field,
        position: index,
      })),
    );

    cancelEdit();
  };

  const deleteField = (index: number) => {
    const confirmed = window.confirm(
      `Supprimer le champ « ${displayedFields[index].label} » de votre schéma personnalisé ?`,
    );

    if (!confirmed) {
      return;
    }

    const next = displayedFields
      .filter((_, itemIndex) => itemIndex !== index)
      .map((field, itemIndex) => ({
        ...field,
        position: itemIndex,
      }));

    setFields(next);
  };

  const saveSchema = () => {
    const source = fields.length > 0 ? fields : effective.fields;

    const payload: PluginResourceFieldCreate[] = source.map((field, index) =>
      buildPayload(fieldToForm(field), index),
    );

    saveMutation.mutate({
      fields: payload,
    });
  };

  const resetSchema = () => {
    if (resetMutation.isPending || saveMutation.isPending) {
      return;
    }

    const confirmed = window.confirm(
      "Réinitialiser votre schéma et revenir au schéma défini par l'administrateur ?",
    );

    if (!confirmed) {
      return;
    }

    resetMutation.mutate();
  };

  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Personnalisation du schéma
          </h2>

          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Vous pouvez adapter le schéma de cette ressource uniquement parce
            que l'administrateur a autorisé cette personnalisation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isOverridden && (
            <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              Personnalisé
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="mb-5 rounded-xl border border-border bg-muted/20 px-4 py-4">
          <p className="text-sm font-medium text-foreground">Important</p>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Votre modification ne change pas le schéma des autres utilisateurs.
          </p>
        </div>

        <div className="space-y-3">
          {displayedFields.map((field, index) => {
            const editing = editingIndex === index;

            return (
              <div
                key={`${field.key}-${index}`}
                className="rounded-xl border border-border bg-background"
              >
                <div className="flex items-start gap-4 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-sm text-foreground">
                        {field.label}
                      </strong>

                      <code className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {field.key}
                      </code>

                      <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                        {FIELD_LABELS[field.field_type]}
                      </span>

                      {field.required && (
                        <span className="text-[10px] font-medium text-primary">
                          Obligatoire
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {field.min_length !== null &&
                        field.min_length !== undefined && (
                          <span>Min. {field.min_length}</span>
                        )}

                      {field.max_length !== null &&
                        field.max_length !== undefined && (
                          <span>Max. {field.max_length}</span>
                        )}

                      {field.options && field.options.length > 0 && (
                        <span>{field.options.length} option(s)</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        editing ? cancelEdit() : startEdit(index)
                      }
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      {editing ? <X size={16} /> : <Pencil size={16} />}
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteField(index)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {editing && (
                  <div className="border-t border-border bg-muted/20 p-5">
                    <FieldEditor
                      form={form}
                      disabled={saveMutation.isPending}
                      onChange={updateForm}
                    />

                    <div className="mt-5 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-medium text-foreground hover:bg-muted"
                      >
                        <X size={16} />
                        Annuler
                      </button>

                      <button
                        type="button"
                        onClick={handleFieldSave}
                        className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium text-white gradient-brand glow-primary"
                      >
                        <Check size={16} />
                        Valider
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {isAdding && (
          <div className="mt-4 rounded-xl border border-primary/20 bg-muted/10 p-5">
            <FieldEditor
              form={form}
              disabled={saveMutation.isPending}
              onChange={updateForm}
            />

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={cancelEdit}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-medium text-foreground hover:bg-muted"
              >
                <X size={16} />
                Annuler
              </button>

              <button
                type="button"
                onClick={handleFieldSave}
                className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium text-white gradient-brand glow-primary"
              >
                <Check size={16} />
                Ajouter
              </button>
            </div>
          </div>
        )}

        {!isAdding && (
          <button
            type="button"
            onClick={startAdd}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <Plus size={15} />
            Ajouter un champ
          </button>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-border pt-5">
          {isOverridden && (
            <button
              type="button"
              onClick={resetSchema}
              disabled={resetMutation.isPending || saveMutation.isPending}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
            >
              {resetMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RotateCcw size={16} />
              )}
              Revenir au schéma admin
            </button>
          )}

          <button
            type="button"
            onClick={saveSchema}
            disabled={saveMutation.isPending || resetMutation.isPending}
            className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium text-white gradient-brand glow-primary disabled:opacity-50"
          >
            {saveMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Enregistrer mon schéma
          </button>
        </div>
      </div>
    </div>
  );
}

function FieldEditor({
  form,
  disabled,
  onChange,
}: {
  form: FieldFormState;
  disabled: boolean;
  onChange: (key: keyof FieldFormState, value: string | boolean) => void;
}) {
  const inputClass =
    "h-10 w-full rounded-xl border border-border bg-background-secondary px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50";

  const textareaClass =
    "w-full rounded-xl border border-border bg-background-secondary px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50";

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Clé
        </label>

        <input
          value={form.key}
          onChange={(event) => onChange("key", event.target.value)}
          disabled={disabled}
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Libellé
        </label>

        <input
          value={form.label}
          onChange={(event) => onChange("label", event.target.value)}
          disabled={disabled}
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Type
        </label>

        <select
          value={form.field_type}
          onChange={(event) =>
            onChange("field_type", event.target.value as PluginFieldType)
          }
          disabled={disabled}
          className={inputClass}
        >
          {(Object.keys(FIELD_LABELS) as PluginFieldType[]).map((type) => (
            <option key={type} value={type}>
              {FIELD_LABELS[type]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center">
        <label className="flex items-center gap-3 text-sm text-foreground">
          <input
            type="checkbox"
            checked={form.required}
            onChange={(event) => onChange("required", event.target.checked)}
            disabled={disabled}
            className="h-4 w-4"
          />
          Champ obligatoire
        </label>
      </div>

      {LENGTH_TYPES.includes(form.field_type) && (
        <>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Longueur minimale
            </label>

            <input
              type="number"
              min={0}
              value={form.min_length}
              onChange={(event) => onChange("min_length", event.target.value)}
              disabled={disabled}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Longueur maximale
            </label>

            <input
              type="number"
              min={0}
              value={form.max_length}
              onChange={(event) => onChange("max_length", event.target.value)}
              disabled={disabled}
              className={inputClass}
            />
          </div>
        </>
      )}

      {NUMBER_TYPES.includes(form.field_type) && (
        <>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Valeur minimale
            </label>

            <input
              type="number"
              value={form.min_value}
              onChange={(event) => onChange("min_value", event.target.value)}
              disabled={disabled}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Valeur maximale
            </label>

            <input
              type="number"
              value={form.max_value}
              onChange={(event) => onChange("max_value", event.target.value)}
              disabled={disabled}
              className={inputClass}
            />
          </div>
        </>
      )}

      {CHOICE_TYPES.includes(form.field_type) && (
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Options
          </label>

          <textarea
            value={form.options}
            onChange={(event) => onChange("options", event.target.value)}
            disabled={disabled}
            rows={5}
            className={textareaClass}
            placeholder={"F\nM"}
          />

          <p className="mt-1 text-xs text-muted-foreground">
            Une option par ligne.
          </p>
        </div>
      )}

      <div className="md:col-span-2">
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Pattern
        </label>

        <input
          value={form.pattern}
          onChange={(event) => onChange("pattern", event.target.value)}
          disabled={disabled}
          placeholder="^[A-Z]{5}$"
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Valeur par défaut
        </label>

        <input
          value={form.default_value}
          onChange={(event) => onChange("default_value", event.target.value)}
          disabled={disabled}
          className={inputClass}
        />
      </div>

      <div className="flex items-center">
        <label className="flex items-center gap-3 text-sm text-foreground">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(event) => onChange("is_active", event.target.checked)}
            disabled={disabled}
            className="h-4 w-4"
          />
          Champ actif
        </label>
      </div>

      <div className="md:col-span-2">
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Description
        </label>

        <textarea
          value={form.description}
          onChange={(event) => onChange("description", event.target.value)}
          disabled={disabled}
          rows={3}
          className={textareaClass}
        />
      </div>
    </div>
  );
}
