"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import type { ProjectTemplateRule } from "@/types/plugin-project";

interface Props {
  value: ProjectTemplateRule[];
  onChange: (value: ProjectTemplateRule[]) => void;
}

export function ProjectTemplateRules({ value, onChange }: Props) {
  const [key, setKey] = useState("");
  const [type, setType] = useState("VALIDATION");

  const add = () => {
    const normalizedKey = key.trim();

    if (!normalizedKey) {
      return;
    }

    const alreadyExists = value.some((rule) => rule.key === normalizedKey);

    if (alreadyExists) {
      return;
    }

    const rule: ProjectTemplateRule = {
      key: normalizedKey,
      type,
      configuration: {},
    };

    onChange([...value, rule]);

    setKey("");
    setType("VALIDATION");
  };

  const remove = (index: number) => {
    onChange(value.filter((_, currentIndex) => currentIndex !== index));
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h3 className="text-sm font-semibold">Règles du modèle</h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Les règles décrivent les contraintes métier que le projet devra
          respecter.
        </p>
      </div>

      <div className="rounded-xl border border-border p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_200px_auto]">
          <input
            value={key}
            onChange={(event) => setKey(event.target.value)}
            placeholder="Ex. REQUIRE_PLANTER"
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
          />

          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
          >
            <option value="VALIDATION">Validation</option>

            <option value="REQUIRED">Obligation</option>

            <option value="BUSINESS">Métier</option>

            <option value="WORKFLOW">Workflow</option>
          </select>

          <button
            type="button"
            onClick={add}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            <Plus size={15} />
            Ajouter
          </button>
        </div>
      </div>

      {value.length === 0 ? (
        <Empty />
      ) : (
        <div className="space-y-2">
          {value.map((rule, index) => (
            <div
              key={`${rule.key}-${index}`}
              className="flex items-center justify-between rounded-xl border border-border p-4"
            >
              <div>
                <div className="text-sm font-medium">{rule.key}</div>

                <div className="mt-1 text-xs text-muted-foreground">
                  Type : {rule.type}
                </div>
              </div>

              <button
                type="button"
                onClick={() => remove(index)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                aria-label="Supprimer la règle"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Empty() {
  return (
    <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
      Aucune règle n’est définie pour le moment.
    </div>
  );
}
