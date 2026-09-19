"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import type { ProjectTemplateMetric } from "@/types/plugin-project";

interface Props {
  value: ProjectTemplateMetric[];
  onChange: (value: ProjectTemplateMetric[]) => void;
}

export function ProjectTemplateMetrics({ value, onChange }: Props) {
  const [key, setKey] = useState("");
  const [label, setLabel] = useState("");
  const [source, setSource] = useState("ANSWERS");
  const [aggregation, setAggregation] = useState("PERCENTAGE");
  const [scope, setScope] = useState("PROJECT");

  const add = () => {
    const normalizedKey = key.trim();
    const normalizedLabel = label.trim();

    if (!normalizedKey || !normalizedLabel) {
      return;
    }

    const alreadyExists = value.some((metric) => metric.key === normalizedKey);

    if (alreadyExists) {
      return;
    }

    const metric: ProjectTemplateMetric = {
      key: normalizedKey,
      label: normalizedLabel,
      source,
      aggregation,
      scope,
    };

    onChange([...value, metric]);

    setKey("");
    setLabel("");
    setSource("ANSWERS");
    setAggregation("PERCENTAGE");
    setScope("PROJECT");
  };

  const remove = (index: number) => {
    onChange(value.filter((_, currentIndex) => currentIndex !== index));
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h3 className="text-sm font-semibold">Statistiques et indicateurs</h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Définissez les indicateurs que le moteur pourra calculer et exposer
          pour les projets issus de ce modèle.
        </p>
      </div>

      <div className="grid gap-4 rounded-xl border border-border p-5 md:grid-cols-2">
        <Field label="Clé">
          <input
            value={key}
            onChange={(event) => setKey(event.target.value)}
            placeholder="compliance_rate"
            className={inputClass}
          />
        </Field>

        <Field label="Libellé">
          <input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="Taux de conformité"
            className={inputClass}
          />
        </Field>

        <Field label="Source">
          <select
            value={source}
            onChange={(event) => setSource(event.target.value)}
            className={inputClass}
          >
            <option value="ANSWERS">Réponses</option>

            <option value="FORMS">Formulaires</option>

            <option value="RESOURCES">Ressources</option>
          </select>
        </Field>

        <Field label="Agrégation">
          <select
            value={aggregation}
            onChange={(event) => setAggregation(event.target.value)}
            className={inputClass}
          >
            <option value="PERCENTAGE">Pourcentage</option>

            <option value="COUNT">Nombre</option>

            <option value="SUM">Somme</option>

            <option value="AVG">Moyenne</option>
          </select>
        </Field>

        <Field label="Portée">
          <select
            value={scope}
            onChange={(event) => setScope(event.target.value)}
            className={inputClass}
          >
            <option value="PROJECT">Projet</option>

            <option value="FORM">Formulaire</option>

            <option value="SECTION">Section</option>
          </select>
        </Field>

        <div className="flex items-end">
          <button
            type="button"
            onClick={add}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
          >
            <Plus size={15} />
            Ajouter l’indicateur
          </button>
        </div>
      </div>

      {value.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Aucun indicateur n’est encore défini.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          {value.map((metric, index) => (
            <div
              key={`${metric.key}-${index}`}
              className="flex items-center justify-between gap-4 border-b border-border p-4 last:border-b-0"
            >
              <div>
                <div className="text-sm font-medium">{metric.label}</div>

                <div className="mt-1 text-xs text-muted-foreground">
                  {metric.key} · {metric.aggregation} · {metric.scope}
                </div>
              </div>

              <button
                type="button"
                onClick={() => remove(index)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                aria-label="Supprimer l’indicateur"
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold">{label}</span>

      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";
