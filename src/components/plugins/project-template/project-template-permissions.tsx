"use client";

interface Props {
  allowUserUse: boolean;
  allowUserCustomization: boolean;
  onChangeUse: (value: boolean) => void;
  onChangeCustomization: (value: boolean) => void;
}

export function ProjectTemplatePermissions({
  allowUserUse,
  allowUserCustomization,
  onChangeUse,
  onChangeCustomization,
}: Props) {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h3 className="text-sm font-semibold">Permissions utilisateur</h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Déterminez comment les utilisateurs du plugin pourront exploiter ce
          modèle.
        </p>
      </div>

      <div className="space-y-4">
        <Permission
          title="Autoriser l’utilisation du modèle"
          description="Les utilisateurs pourront créer un projet à partir de ce modèle."
          checked={allowUserUse}
          onChange={onChangeUse}
        />

        <Permission
          title="Autoriser la personnalisation"
          description="Les utilisateurs pourront adapter les paramètres autorisés du modèle lors de la création de leur projet."
          checked={allowUserCustomization}
          onChange={onChangeCustomization}
        />
      </div>

      {!allowUserUse && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-700">
          Ce modèle restera disponible pour l’administration mais ne pourra pas
          être utilisé par les utilisateurs.
        </div>
      )}
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

        <div className="mt-1 max-w-xl text-xs leading-5 text-muted-foreground">
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
