"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, PackagePlus, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api";
import { pluginService } from "@/services/plugin.service";
import type { Plugin, PluginCreate, PluginUpdate } from "@/types/plugin";

interface PluginDialogProps {
  open: boolean;
  plugin?: Plugin | null;
  onClose: () => void;
}

interface FormState {
  name: string;
  description: string;
  short_description: string;
  category: string;
  tags: string;
  icon_url: string;
  banner_url: string;
  initial_version: string;
  release_notes: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  short_description: "",
  category: "",
  tags: "",
  icon_url: "",
  banner_url: "",
  initial_version: "1.0.0",
  release_notes: "",
};

function getDraftVersion(plugin: Plugin) {
  return plugin.versions.find((version) => version.status === "DRAFT");
}

function pluginToForm(plugin: Plugin): FormState {
  const draftVersion = getDraftVersion(plugin);

  return {
    name: plugin.name,
    description: plugin.description,
    short_description: plugin.short_description ?? "",
    category: plugin.category ?? "",
    tags: plugin.tags.join(", "),
    icon_url: plugin.icon_url ?? "",
    banner_url: plugin.banner_url ?? "",
    initial_version: draftVersion?.version ?? "1.0.0",
    release_notes: draftVersion?.release_notes ?? "",
  };
}

export function PluginDialog({ open, plugin, onClose }: PluginDialogProps) {
  const queryClient = useQueryClient();

  const isEditing = Boolean(plugin);
  const canEdit = !plugin || plugin.status === "DRAFT";

  const [form, setForm] = useState<FormState>(() => {
    if (plugin) {
      return pluginToForm(plugin);
    }

    return { ...EMPTY_FORM };
  });

  const createMutation = useMutation({
    mutationFn: (payload: PluginCreate) => pluginService.create(payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["plugins"],
      });

      toast.success("Plugin créé avec succès.");

      onClose();
    },

    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
        return;
      }

      toast.error("Une erreur est survenue lors de la création du plugin.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      pluginId,
      payload,
    }: {
      pluginId: number;
      payload: PluginUpdate;
    }) => pluginService.update(pluginId, payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["plugins"],
      });

      toast.success("Plugin modifié avec succès.");

      onClose();
    },

    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
        return;
      }

      toast.error("Une erreur est survenue lors de la modification du plugin.");
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const validate = (): boolean => {
    if (!form.name.trim()) {
      toast.error("Le nom du plugin est obligatoire.");
      return false;
    }

    if (form.name.trim().length < 2) {
      toast.error("Le nom du plugin doit contenir au moins 2 caractères.");
      return false;
    }

    if (!form.description.trim()) {
      toast.error("La description du plugin est obligatoire.");
      return false;
    }

    if (!isEditing && !form.initial_version.trim()) {
      toast.error("La version initiale est obligatoire.");
      return false;
    }

    return true;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isPending || !validate()) {
      return;
    }

    const tags = form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (isEditing && plugin) {
      const payload: PluginUpdate = {
        name: form.name.trim(),
        description: form.description.trim(),
        short_description: form.short_description.trim() || null,
        category: form.category.trim() || null,
        tags,
        icon_url: form.icon_url.trim() || null,
        banner_url: form.banner_url.trim() || null,
      };

      updateMutation.mutate({
        pluginId: plugin.id,
        payload,
      });

      return;
    }

    const payload: PluginCreate = {
      name: form.name.trim(),
      description: form.description.trim(),
      short_description: form.short_description.trim() || null,
      category: form.category.trim() || null,
      tags,
      icon_url: form.icon_url.trim() || null,
      banner_url: form.banner_url.trim() || null,
      initial_version: form.initial_version.trim(),
      release_notes: form.release_notes.trim() || null,
      parameters: {},
      metadata_config: {},
    };

    createMutation.mutate(payload);
  };

  if (!open || !canEdit) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="plugin-dialog-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "rgba(0, 0, 0, 0.62)",
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPending) {
          onClose();
        }
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "760px",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "1px solid var(--color-border)",
          borderRadius: "1rem",
          background: "var(--color-surface)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.32)",
        }}
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "1rem",
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "0.625rem",
                background: "rgba(93, 184, 58, 0.08)",
                border: "1px solid rgba(93, 184, 58, 0.15)",
                color: "#5DB83A",
              }}
            >
              <PackagePlus size={18} />
            </div>

            <div>
              <h2
                id="plugin-dialog-title"
                style={{
                  margin: 0,
                  fontSize: "1rem",
                  lineHeight: 1.4,
                  fontWeight: 600,
                  color: "var(--color-foreground)",
                }}
              >
                {isEditing ? "Modifier le plugin" : "Créer un plugin"}
              </h2>

              <p
                style={{
                  margin: "0.25rem 0 0",
                  fontSize: "0.75rem",
                  color: "var(--color-foreground-muted)",
                }}
              >
                {isEditing
                  ? "Modifiez les informations générales du plugin."
                  : "Créez la base d'un nouveau plugin pour votre écosystème."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            aria-label="Fermer"
            style={{
              width: "34px",
              height: "34px",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid transparent",
              borderRadius: "0.5rem",
              background: "transparent",
              color: "var(--color-foreground-muted)",
              cursor: isPending ? "not-allowed" : "pointer",
              opacity: isPending ? 0.5 : 1,
            }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            minHeight: 0,
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              minHeight: 0,
              flex: 1,
              overflowY: "auto",
              padding: "1.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              {/* Identité */}
              <section>
                <SectionHeader
                  title="Identité du plugin"
                  description="Ces informations permettent d'identifier le plugin dans la plateforme."
                />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  <Field>
                    <FieldLabel htmlFor="plugin-name">Nom</FieldLabel>

                    <StyledInput
                      id="plugin-name"
                      type="text"
                      value={form.name}
                      onChange={(event) =>
                        updateField("name", event.target.value)
                      }
                      disabled={isPending}
                      placeholder="ex. EUDR Traceability"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="plugin-short-code">
                      Identifiant
                    </FieldLabel>

                    <div
                      style={{
                        minHeight: "40px",
                        display: "flex",
                        alignItems: "center",
                        padding: "0 0.875rem",
                        border: "1px solid var(--color-border)",
                        borderRadius: "0.625rem",
                        background: "var(--color-surface-raised)",
                        color: "var(--color-foreground-muted)",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.75rem",
                      }}
                    >
                      {isEditing
                        ? (plugin?.code ?? "—")
                        : "Généré automatiquement"}
                    </div>

                    {isEditing && (
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.6875rem",
                          color: "var(--color-foreground-muted)",
                        }}
                      >
                        Le code technique ne peut pas être modifié.
                      </p>
                    )}
                  </Field>
                </div>
              </section>

              {/* Présentation */}
              <section>
                <SectionHeader title="Présentation" />

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  <Field>
                    <FieldLabel htmlFor="plugin-short-description">
                      Description courte
                    </FieldLabel>

                    <StyledInput
                      id="plugin-short-description"
                      type="text"
                      value={form.short_description}
                      onChange={(event) =>
                        updateField("short_description", event.target.value)
                      }
                      disabled={isPending}
                      placeholder="Une courte présentation du plugin"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="plugin-description">
                      Description
                    </FieldLabel>

                    <StyledTextarea
                      id="plugin-description"
                      value={form.description}
                      onChange={(event) =>
                        updateField("description", event.target.value)
                      }
                      disabled={isPending}
                      rows={5}
                      placeholder="Décrivez précisément le rôle et le contenu du plugin..."
                    />
                  </Field>
                </div>
              </section>

              {/* Classification */}
              <section>
                <SectionHeader title="Classification" />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  <Field>
                    <FieldLabel htmlFor="plugin-category">Catégorie</FieldLabel>

                    <StyledInput
                      id="plugin-category"
                      type="text"
                      value={form.category}
                      onChange={(event) =>
                        updateField("category", event.target.value)
                      }
                      disabled={isPending}
                      placeholder="ex. Traçabilité"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="plugin-tags">Tags</FieldLabel>

                    <StyledInput
                      id="plugin-tags"
                      type="text"
                      value={form.tags}
                      onChange={(event) =>
                        updateField("tags", event.target.value)
                      }
                      disabled={isPending}
                      placeholder="eudr, cacao, conformité"
                    />

                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.6875rem",
                        color: "var(--color-foreground-muted)",
                      }}
                    >
                      Séparez les tags par des virgules.
                    </p>
                  </Field>
                </div>
              </section>

              {/* Visuels */}
              <section>
                <SectionHeader title="Visuels" />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  <Field>
                    <FieldLabel htmlFor="plugin-icon-url">
                      URL de l&#39;icône
                    </FieldLabel>

                    <StyledInput
                      id="plugin-icon-url"
                      type="url"
                      value={form.icon_url}
                      onChange={(event) =>
                        updateField("icon_url", event.target.value)
                      }
                      disabled={isPending}
                      placeholder="https://..."
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="plugin-banner-url">
                      URL de la bannière
                    </FieldLabel>

                    <StyledInput
                      id="plugin-banner-url"
                      type="url"
                      value={form.banner_url}
                      onChange={(event) =>
                        updateField("banner_url", event.target.value)
                      }
                      disabled={isPending}
                      placeholder="https://..."
                    />
                  </Field>
                </div>
              </section>

              {/* Version */}
              {!isEditing && (
                <section>
                  <SectionHeader
                    title="Première version"
                    description="Un plugin possède une version propre à sa définition."
                  />

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: "1rem",
                    }}
                  >
                    <Field>
                      <FieldLabel htmlFor="plugin-version">
                        Version initiale
                      </FieldLabel>

                      <StyledInput
                        id="plugin-version"
                        type="text"
                        value={form.initial_version}
                        onChange={(event) =>
                          updateField("initial_version", event.target.value)
                        }
                        disabled={isPending}
                        placeholder="1.0.0"
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="plugin-release-notes">
                        Notes de version
                      </FieldLabel>

                      <StyledInput
                        id="plugin-release-notes"
                        type="text"
                        value={form.release_notes}
                        onChange={(event) =>
                          updateField("release_notes", event.target.value)
                        }
                        disabled={isPending}
                        placeholder="Version initiale du plugin"
                      />
                    </Field>
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "0.625rem",
              padding: "1rem 1.5rem",
              borderTop: "1px solid var(--color-border)",
              background: "var(--color-surface-raised)",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              style={{
                height: "36px",
                padding: "0 0.875rem",
                borderRadius: "0.625rem",
                border: "1px solid var(--color-border)",
                background: "var(--color-surface)",
                color: "var(--color-foreground-muted)",
                fontSize: "0.8125rem",
                fontWeight: 600,
                cursor: isPending ? "not-allowed" : "pointer",
                opacity: isPending ? 0.5 : 1,
              }}
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={isPending}
              style={{
                height: "36px",
                padding: "0 0.875rem",
                borderRadius: "0.625rem",
                border: "1px solid rgba(93, 184, 58, 0.25)",
                background: "rgba(93, 184, 58, 0.1)",
                color: "#5DB83A",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                fontSize: "0.8125rem",
                fontWeight: 600,
                cursor: isPending ? "not-allowed" : "pointer",
                opacity: isPending ? 0.6 : 1,
              }}
            >
              {isPending && <Loader2 size={15} className="animate-spin" />}

              {isPending
                ? "Enregistrement..."
                : isEditing
                  ? "Enregistrer"
                  : "Créer le plugin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* UI helpers                                                                 */
/* -------------------------------------------------------------------------- */

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div
      style={{
        marginBottom: "1rem",
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: "0.8125rem",
          fontWeight: 600,
          color: "var(--color-foreground)",
        }}
      >
        {title}
      </h3>

      {description && (
        <p
          style={{
            margin: "0.25rem 0 0",
            fontSize: "0.6875rem",
            color: "var(--color-foreground-muted)",
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}

function Field({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      {children}
    </div>
  );
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        fontSize: "0.75rem",
        fontWeight: 600,
        color: "var(--color-foreground)",
      }}
    >
      {children}
    </label>
  );
}

function StyledInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        height: "40px",
        padding: "0 0.875rem",
        borderRadius: "0.625rem",
        border: "1px solid var(--color-border)",
        background: "var(--color-surface-raised)",
        color: "var(--color-foreground)",
        outline: "none",
        fontSize: "0.8125rem",
        boxSizing: "border-box",
        opacity: props.disabled ? 0.6 : 1,
        ...(props.style ?? {}),
      }}
      onFocus={(event) => {
        event.currentTarget.style.borderColor = "#5DB83A";

        event.currentTarget.style.boxShadow =
          "0 0 0 3px rgba(93, 184, 58, 0.10)";

        props.onFocus?.(event);
      }}
      onBlur={(event) => {
        event.currentTarget.style.borderColor = "var(--color-border)";

        event.currentTarget.style.boxShadow = "none";

        props.onBlur?.(event);
      }}
    />
  );
}

function StyledTextarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      style={{
        width: "100%",
        minHeight: "120px",
        padding: "0.75rem 0.875rem",
        borderRadius: "0.625rem",
        border: "1px solid var(--color-border)",
        background: "var(--color-surface-raised)",
        color: "var(--color-foreground)",
        outline: "none",
        fontSize: "0.8125rem",
        lineHeight: 1.5,
        resize: "vertical",
        boxSizing: "border-box",
        opacity: props.disabled ? 0.6 : 1,
        ...(props.style ?? {}),
      }}
      onFocus={(event) => {
        event.currentTarget.style.borderColor = "#5DB83A";

        event.currentTarget.style.boxShadow =
          "0 0 0 3px rgba(93, 184, 58, 0.10)";

        props.onFocus?.(event);
      }}
      onBlur={(event) => {
        event.currentTarget.style.borderColor = "var(--color-border)";

        event.currentTarget.style.boxShadow = "none";

        props.onBlur?.(event);
      }}
    />
  );
}
