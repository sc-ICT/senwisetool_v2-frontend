"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  GripVertical,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api";
import { pluginResourceService } from "@/services/plugin-resource.service";
import type {
  PluginFieldType,
  PluginResource,
  PluginResourceField,
  PluginResourceFieldCreate,
} from "@/types/plugin-resource";

interface PluginResourceSchemaBuilderProps {
  resource: PluginResource;
  editable: boolean;
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

const FIELD_TYPE_LABELS: Record<PluginFieldType, string> = {
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

const FIELD_TYPES = Object.keys(FIELD_TYPE_LABELS) as PluginFieldType[];

const CHOICE_TYPES: PluginFieldType[] = ["SINGLE_CHOICE", "MULTIPLE_CHOICE"];

const LENGTH_TYPES: PluginFieldType[] = [
  "TEXT",
  "LONG_TEXT",
  "EMAIL",
  "PHONE",
  "URL",
];

const NUMBER_TYPES: PluginFieldType[] = ["NUMBER", "DECIMAL"];

function inputClassName(): string {
  return [
    "w-full",
    "h-10",
    "rounded-xl",
    "text-sm",
    "outline-none",
    "bg-background-secondary",
    "border",
    "border-border",
    "text-foreground",
    "px-3",
    "transition-all",
    "duration-200",
    "focus:border-primary",
    "focus:ring-2",
    "focus:ring-primary/20",
  ].join(" ");
}

function textareaClassName(): string {
  return [
    "w-full",
    "rounded-xl",
    "text-sm",
    "outline-none",
    "bg-background-secondary",
    "border",
    "border-border",
    "text-foreground",
    "px-3",
    "py-2.5",
    "transition-all",
    "duration-200",
    "focus:border-primary",
    "focus:ring-2",
    "focus:ring-primary/20",
    "resize-y",
  ].join(" ");
}

function fieldToForm(field: PluginResourceField): FieldFormState {
  return {
    key: field.key,
    label: field.label,
    description: field.description ?? "",
    field_type: field.field_type,

    required: field.required,

    min_length: field.min_length === null ? "" : String(field.min_length),

    max_length: field.max_length === null ? "" : String(field.max_length),

    min_value: field.min_value === null ? "" : String(field.min_value),

    max_value: field.max_value === null ? "" : String(field.max_value),

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

export function PluginResourceSchemaBuilder({
  resource,
  editable,
}: PluginResourceSchemaBuilderProps) {
  const queryClient = useQueryClient();

  const [editingFieldId, setEditingFieldId] = useState<number | null>(null);

  const [isAddingField, setIsAddingField] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [fieldForm, setFieldForm] = useState<FieldFormState>({
    ...EMPTY_FIELD,
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["plugin-resource", resource.id],
    });

    await queryClient.invalidateQueries({
      queryKey: ["plugin-resources", resource.plugin_id],
    });
  };

  const addFieldMutation = useMutation({
    mutationFn: (payload: PluginResourceFieldCreate) =>
      pluginResourceService.addField(resource.id, payload),

    onSuccess: async () => {
      await invalidate();

      toast.success("Champ ajouté avec succès.");

      setFieldForm({
        ...EMPTY_FIELD,
      });

      setIsAddingField(false);
    },

    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
        return;
      }

      toast.error("Impossible d'ajouter le champ.");
    },
  });

  const updateFieldMutation = useMutation({
    mutationFn: ({
      fieldId,
      payload,
    }: {
      fieldId: number;
      payload: PluginResourceFieldCreate;
    }) => pluginResourceService.updateField(resource.id, fieldId, payload),

    onSuccess: async () => {
      await invalidate();

      toast.success("Champ modifié avec succès.");

      setEditingFieldId(null);

      setFieldForm({
        ...EMPTY_FIELD,
      });
    },

    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
        return;
      }

      toast.error("Impossible de modifier le champ.");
    },
  });

  const deleteFieldMutation = useMutation({
    mutationFn: ({
      resourceId,
      fieldId,
    }: {
      resourceId: number;
      fieldId: number;
    }) => pluginResourceService.deleteField(resourceId, fieldId),

    onSuccess: async () => {
      await invalidate();

      toast.success("Champ supprimé avec succès.");
      setDeletingId(null);
    },

    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
        setDeletingId(null);
        return;
      }

      toast.error("Impossible de supprimer le champ.");
    },
  });

  const updateField = (
    field: keyof FieldFormState,
    value: string | boolean,
  ) => {
    setFieldForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setEditingFieldId(null);
    setIsAddingField(false);
    setFieldForm({
      ...EMPTY_FIELD,
    });
  };

  const startAdd = () => {
    setEditingFieldId(null);

    setFieldForm({
      ...EMPTY_FIELD,
    });

    setIsAddingField(true);
  };

  const startEdit = (field: PluginResourceField) => {
    setIsAddingField(false);
    setEditingFieldId(field.id);
    setFieldForm(fieldToForm(field));
  };

  const validateField = (): boolean => {
    const key = fieldForm.key.trim();
    const label = fieldForm.label.trim();

    if (!key) {
      toast.error("La clé du champ est obligatoire.");
      return false;
    }

    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(key)) {
      toast.error(
        "La clé doit commencer par une lettre et ne contenir que des lettres, chiffres et underscores.",
      );
      return false;
    }

    if (!label) {
      toast.error("Le libellé du champ est obligatoire.");
      return false;
    }

    const minLength =
      fieldForm.min_length.trim() === "" ? null : Number(fieldForm.min_length);

    const maxLength =
      fieldForm.max_length.trim() === "" ? null : Number(fieldForm.max_length);

    if (minLength !== null && (!Number.isInteger(minLength) || minLength < 0)) {
      toast.error("La longueur minimale doit être un entier positif.");
      return false;
    }

    if (maxLength !== null && (!Number.isInteger(maxLength) || maxLength < 0)) {
      toast.error("La longueur maximale doit être un entier positif.");
      return false;
    }

    if (minLength !== null && maxLength !== null && minLength > maxLength) {
      toast.error(
        "La longueur minimale ne peut pas dépasser la longueur maximale.",
      );
      return false;
    }

    const minValue =
      fieldForm.min_value.trim() === "" ? null : Number(fieldForm.min_value);

    const maxValue =
      fieldForm.max_value.trim() === "" ? null : Number(fieldForm.max_value);

    if (minValue !== null && Number.isNaN(minValue)) {
      toast.error("La valeur minimale est invalide.");
      return false;
    }

    if (maxValue !== null && Number.isNaN(maxValue)) {
      toast.error("La valeur maximale est invalide.");
      return false;
    }

    if (minValue !== null && maxValue !== null && minValue > maxValue) {
      toast.error(
        "La valeur minimale ne peut pas dépasser la valeur maximale.",
      );
      return false;
    }

    if (CHOICE_TYPES.includes(fieldForm.field_type)) {
      const options = fieldForm.options
        .split("\n")
        .map((option) => option.trim())
        .filter(Boolean);

      if (options.length === 0) {
        toast.error("Un champ de type choix doit avoir au moins une option.");
        return false;
      }

      if (new Set(options).size !== options.length) {
        toast.error("Les options doivent être uniques.");
        return false;
      }
    }

    if (fieldForm.pattern.trim()) {
      try {
        new RegExp(fieldForm.pattern.trim());
      } catch {
        toast.error("L'expression régulière est invalide.");
        return false;
      }
    }

    return true;
  };

  const buildPayload = (): PluginResourceFieldCreate => {
    const options = CHOICE_TYPES.includes(fieldForm.field_type)
      ? fieldForm.options
          .split("\n")
          .map((option) => option.trim())
          .filter(Boolean)
      : [];

    return {
      key: fieldForm.key.trim(),
      label: fieldForm.label.trim(),

      description: fieldForm.description.trim() || null,

      field_type: fieldForm.field_type,

      required: fieldForm.required,

      min_length:
        LENGTH_TYPES.includes(fieldForm.field_type) &&
        fieldForm.min_length.trim() !== ""
          ? Number(fieldForm.min_length)
          : null,

      max_length:
        LENGTH_TYPES.includes(fieldForm.field_type) &&
        fieldForm.max_length.trim() !== ""
          ? Number(fieldForm.max_length)
          : null,

      min_value:
        NUMBER_TYPES.includes(fieldForm.field_type) &&
        fieldForm.min_value.trim() !== ""
          ? Number(fieldForm.min_value)
          : null,

      max_value:
        NUMBER_TYPES.includes(fieldForm.field_type) &&
        fieldForm.max_value.trim() !== ""
          ? Number(fieldForm.max_value)
          : null,

      pattern: fieldForm.pattern.trim() || null,

      options,

      default_value: fieldForm.default_value.trim() || null,

      position:
        editingFieldId === null
          ? resource.fields.length
          : (resource.fields.find((field) => field.id === editingFieldId)
              ?.position ?? 0),

      is_active: fieldForm.is_active,
    };
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (addFieldMutation.isPending || updateFieldMutation.isPending) {
      return;
    }

    if (!validateField()) {
      return;
    }

    const payload = buildPayload();

    if (editingFieldId !== null) {
      updateFieldMutation.mutate({
        fieldId: editingFieldId,
        payload,
      });

      return;
    }

    addFieldMutation.mutate(payload);
  };

  const handleDeleteField = (field: PluginResourceField) => {
    if (!editable || deleteFieldMutation.isPending) {
      return;
    }

    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer le champ « ${field.label} » ?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(field.id);
    deleteFieldMutation.mutate({
      resourceId: resource.id,
      fieldId: field.id,
    });
  };

  const isFormPending =
    addFieldMutation.isPending || updateFieldMutation.isPending;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Schéma</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Définissez les champs qui composent cette ressource.
          </p>
        </div>

        {editable && !isAddingField && editingFieldId === null && (
          <button
            type="button"
            onClick={startAdd}
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
            <Plus size={16} />
            Ajouter un champ
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {resource.fields.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center">
            <p className="text-sm font-medium text-foreground">Aucun champ</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Cette ressource ne possède encore aucun champ.
            </p>

            {editable && (
              <button
                type="button"
                onClick={startAdd}
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <Plus size={15} />
                Ajouter le premier champ
              </button>
            )}
          </div>
        ) : (
          resource.fields.map((field, index) => {
            const isEditing = editingFieldId === field.id;

            return (
              <div
                key={field.id}
                className={[
                  "rounded-2xl border bg-card transition-all",
                  isEditing ? "border-primary/40" : "border-border",
                  !field.is_active ? "opacity-60" : "",
                ].join(" ")}
              >
                <div className="flex items-start gap-4 px-5 py-4">
                  <div className="mt-1 text-muted-foreground">
                    <GripVertical size={17} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        {index + 1}
                      </span>

                      <strong className="text-sm text-foreground">
                        {field.label}
                      </strong>

                      <code className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {field.key}
                      </code>

                      {!field.is_active && (
                        <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          Désactivé
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>{FIELD_TYPE_LABELS[field.field_type]}</span>

                      {field.required && (
                        <span className="font-medium text-primary">
                          Obligatoire
                        </span>
                      )}

                      {field.min_length !== null && (
                        <span>Min. {field.min_length}</span>
                      )}

                      {field.max_length !== null && (
                        <span>Max. {field.max_length}</span>
                      )}

                      {field.pattern && (
                        <code className="max-w-[300px] truncate">
                          {field.pattern}
                        </code>
                      )}
                    </div>

                    {field.description && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {field.description}
                      </p>
                    )}
                  </div>

                  {editable && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          isEditing ? resetForm() : startEdit(field)
                        }
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                        title={isEditing ? "Annuler" : "Modifier"}
                      >
                        {isEditing ? <X size={16} /> : <Pencil size={16} />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteField(field)}
                        disabled={deleteFieldMutation.isPending}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                        title="Supprimer"
                      >
                        {deletingId === field.id &&
                        deleteFieldMutation.isPending ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {isEditing && editable && (
                  <div className="border-t border-border bg-muted/20 px-5 py-5">
                    <form onSubmit={handleSubmit}>
                      <FieldForm
                        form={fieldForm}
                        disabled={isFormPending}
                        onChange={updateField}
                      />

                      <div className="mt-5 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={resetForm}
                          disabled={isFormPending}
                          className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
                        >
                          Annuler
                        </button>

                        <button
                          type="submit"
                          disabled={isFormPending}
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
                          {isFormPending ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Save size={16} />
                          )}
                          Enregistrer
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {(isAddingField || editingFieldId !== null) &&
        editable &&
        editingFieldId === null && (
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-primary/20 bg-card"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Nouveau champ
                </h3>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  Configurez les propriétés du champ.
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                disabled={isFormPending}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-6">
              <FieldForm
                form={fieldForm}
                disabled={isFormPending}
                onChange={updateField}
              />
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
              <button
                type="button"
                onClick={resetForm}
                disabled={isFormPending}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={isFormPending}
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
                  cursor: isFormPending ? "not-allowed" : "pointer",
                  transition: "background 0.2s, border-color 0.2s",
                }}
              >
                {isFormPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Check size={16} />
                )}
                Ajouter le champ
              </button>
            </div>
          </form>
        )}
    </div>
  );
}

function FieldForm({
  form,
  disabled,
  onChange,
}: {
  form: FieldFormState;
  disabled: boolean;
  onChange: (field: keyof FieldFormState, value: string | boolean) => void;
}) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Clé
        </label>

        <input
          value={form.key}
          onChange={(event) => onChange("key", event.target.value)}
          placeholder="planter_code"
          disabled={disabled}
          className={inputClassName()}
        />

        <p className="mt-1 text-xs text-muted-foreground">
          Identifiant technique unique.
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Libellé
        </label>

        <input
          value={form.label}
          onChange={(event) => onChange("label", event.target.value)}
          placeholder="Code planteur"
          disabled={disabled}
          className={inputClassName()}
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
          className={inputClassName()}
        >
          {FIELD_TYPES.map((type) => (
            <option key={type} value={type}>
              {FIELD_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center">
        <label className="flex cursor-pointer items-center gap-3 text-sm text-foreground">
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

      <div className="md:col-span-2">
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Description
        </label>

        <textarea
          value={form.description}
          onChange={(event) => onChange("description", event.target.value)}
          rows={3}
          disabled={disabled}
          placeholder="Description du champ..."
          className={textareaClassName()}
        />
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
              className={inputClassName()}
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
              className={inputClassName()}
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
              step="any"
              value={form.min_value}
              onChange={(event) => onChange("min_value", event.target.value)}
              disabled={disabled}
              className={inputClassName()}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Valeur maximale
            </label>

            <input
              type="number"
              step="any"
              value={form.max_value}
              onChange={(event) => onChange("max_value", event.target.value)}
              disabled={disabled}
              className={inputClassName()}
            />
          </div>
        </>
      )}

      {LENGTH_TYPES.includes(form.field_type) && (
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Expression régulière
          </label>

          <input
            value={form.pattern}
            onChange={(event) => onChange("pattern", event.target.value)}
            disabled={disabled}
            placeholder="^[A-Z]{5}$"
            className={inputClassName()}
          />

          <p className="mt-1 text-xs text-muted-foreground">
            Exemple : <code>^[A-Z]{5}$</code>
          </p>
        </div>
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
            placeholder={"F\nM"}
            className={textareaClassName()}
          />

          <p className="mt-1 text-xs text-muted-foreground">
            Une option par ligne.
          </p>
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Valeur par défaut
        </label>

        <input
          value={form.default_value}
          onChange={(event) => onChange("default_value", event.target.value)}
          disabled={disabled}
          placeholder="Facultatif"
          className={inputClassName()}
        />
      </div>

      <div className="flex items-center">
        <label className="flex cursor-pointer items-center gap-3 text-sm text-foreground">
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
    </div>
  );
}
