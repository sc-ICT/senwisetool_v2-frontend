"use client";

import { Database, Loader2, Plus, X } from "lucide-react";
import { useState, type FormEvent } from "react";

import type { PluginResourceScope } from "@/types/plugin";
import type { PluginResourceCreate } from "@/types/plugin-resource";

interface PluginResourceDialogProps {
  open: boolean;
  pending?: boolean;
  onClose: () => void;
  onSubmit: (payload: PluginResourceCreate) => void;
}

interface FormState {
  key: string;
  name: string;
  description: string;
  scope: PluginResourceScope;
  allow_user_schema_override: boolean;
}

const EMPTY_FORM: FormState = {
  key: "",
  name: "",
  description: "",
  scope: "GLOBAL",
  allow_user_schema_override: false,
};

export function PluginResourceDialog({
  open,
  pending = false,
  onClose,
  onSubmit,
}: PluginResourceDialogProps) {
  const [form, setForm] = useState<FormState>({
    ...EMPTY_FORM,
  });

  if (!open) {
    return null;
  }

  const update = (field: keyof FormState, value: string | boolean) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const close = () => {
    if (pending) {
      return;
    }

    setForm({
      ...EMPTY_FORM,
    });

    onClose();
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const key = form.key.trim();
    const name = form.name.trim();

    if (!key) {
      return;
    }

    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(key)) {
      return;
    }

    if (name.length < 2) {
      return;
    }

    onSubmit({
      key,
      name,

      description: form.description.trim() || null,

      scope: form.scope,

      allow_user_schema_override:
        form.scope === "USER" ? form.allow_user_schema_override : false,

      position: 0,

      icon: null,

      is_active: true,

      fields: [],
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !pending) {
          close();
        }
      }}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
              <Database size={18} />
            </div>

            <div>
              <h2 className="text-base font-semibold text-foreground">
                Nouvelle ressource
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Définissez la base de la ressource.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={close}
            disabled={pending}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="grid gap-5 px-6 py-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Nom
              </label>

              <input
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
                disabled={pending}
                placeholder="Planteurs"
                className="h-10 w-full rounded-xl border border-border bg-background-secondary px-3 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Clé technique
              </label>

              <input
                value={form.key}
                onChange={(event) => update("key", event.target.value)}
                disabled={pending}
                placeholder="planter"
                className="h-10 w-full rounded-xl border border-border bg-background-secondary px-3 text-sm text-foreground outline-none focus:border-primary"
              />

              <p className="mt-1 text-xs text-muted-foreground">
                Lettres, chiffres et underscores.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Description
              </label>

              <textarea
                value={form.description}
                onChange={(event) => update("description", event.target.value)}
                disabled={pending}
                rows={4}
                placeholder="Description de la ressource..."
                className="w-full rounded-xl border border-border bg-background-secondary px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Portée
              </label>

              <select
                value={form.scope}
                onChange={(event) => {
                  const scope = event.target.value as PluginResourceScope;

                  update("scope", scope);

                  if (scope === "GLOBAL") {
                    update("allow_user_schema_override", false);
                  }
                }}
                disabled={pending}
                className="h-10 w-full rounded-xl border border-border bg-background-secondary px-3 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="GLOBAL">Globale</option>

                <option value="USER">Utilisateur</option>
              </select>
            </div>

            {form.scope === "GLOBAL" ? (
              <div className="rounded-xl border border-border bg-muted/20 px-4 py-4">
                <p className="text-sm font-medium text-foreground">
                  Ressource globale
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Les données seront communes à tous les utilisateurs du plugin
                  et seront gérées par l&#39;administrateur.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-muted/20 px-4 py-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={form.allow_user_schema_override}
                    onChange={(event) =>
                      update("allow_user_schema_override", event.target.checked)
                    }
                    disabled={pending}
                    className="mt-0.5 h-4 w-4"
                  />

                  <span>
                    <span className="block text-sm font-medium text-foreground">
                      Autoriser la personnalisation du schéma par utilisateur
                    </span>

                    <span className="mt-1 block text-xs text-muted-foreground">
                      Chaque utilisateur pourra adapter son propre schéma sans
                      modifier celui des autres.
                    </span>
                  </span>
                </label>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
            <button
              type="button"
              onClick={close}
              disabled={pending}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium text-white gradient-brand glow-primary disabled:opacity-50"
            >
              {pending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              Créer la ressource
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
