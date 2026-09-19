"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { Header } from "@/components/layout/header";
import { PluginWorkspaceNav } from "@/components/plugins/plugin-workspace-nav";
import { ApiError } from "@/lib/api";
import { pluginProgramService } from "@/services/plugin-program.service";
import type { PluginProgram, ProgramSchedule } from "@/types/plugin-program";

export default function PluginProgramsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const pluginId = Number(params.pluginId);

  const { data, isLoading, error } = useQuery({
    queryKey: ["plugin-programs", pluginId],

    queryFn: async () => {
      const response = await pluginProgramService.list(pluginId);

      return response.data;
    },

    enabled: Number.isInteger(pluginId) && pluginId > 0,
  });

  const deleteMutation = useMutation({
    mutationFn: (programId: number) =>
      pluginProgramService.delete(pluginId, programId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["plugin-programs", pluginId],
      });

      toast.success("Programme supprimé avec succès.");
    },

    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Impossible de supprimer le programme.",
      );
    },
  });

  const programs = data?.items ?? [];

  const handleDelete = (program: PluginProgram) => {
    const confirmed = window.confirm(
      `Supprimer le programme « ${program.name} » ?\n\nLes projets existants seront conservés mais ne seront plus rattachés à ce programme.`,
    );

    if (!confirmed) {
      return;
    }

    deleteMutation.mutate(program.id);
  };

  return (
    <>
      <Header
        title="Programmes"
        description="Définissez les programmes qui structurent les activités du plugin."
      />

      <div className="flex-1 overflow-auto p-6">
        <PluginWorkspaceNav pluginId={pluginId} />

        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold">Programmes du plugin</h1>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                Un programme définit un cadre métier, ses permissions, ses
                ressources, ses règles et sa temporalité. Les projets pourront
                ensuite être rattachés à un programme.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push(`/dashboard/plugins/${pluginId}/programs/new`)
              }
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Plus size={16} />
              Nouveau programme
            </button>
          </div>

          {isLoading && (
            <div className="flex min-h-[360px] items-center justify-center">
              <Loader2
                size={25}
                className="animate-spin text-muted-foreground"
              />
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5 text-sm text-destructive">
              {error instanceof Error
                ? error.message
                : "Impossible de charger les programmes."}
            </div>
          )}

          {!isLoading && !error && programs.length === 0 && (
            <div className="flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/10 px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <CalendarDays size={27} />
              </div>

              <h2 className="mt-5 text-lg font-semibold">Aucun programme</h2>

              <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                Créez le premier programme du plugin pour définir son périmètre,
                son calendrier et les règles utilisées par les projets.
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push(`/dashboard/plugins/${pluginId}/programs/new`)
                }
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
              >
                <Plus size={16} />
                Créer un programme
              </button>
            </div>
          )}

          {!isLoading && !error && programs.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {programs.map((program) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  deleting={
                    deleteMutation.isPending &&
                    deleteMutation.variables === program.id
                  }
                  onEdit={() =>
                    router.push(
                      `/dashboard/plugins/${pluginId}/programs/${program.id}`,
                    )
                  }
                  onDelete={() => handleDelete(program)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ProgramCard({
  program,
  deleting,
  onEdit,
  onDelete,
}: {
  program: PluginProgram;
  deleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarDays size={19} />
          </div>

          <div className="min-w-0">
            <h2 className="truncate font-semibold">{program.name}</h2>

            <p className="mt-1 text-xs text-muted-foreground">{program.key}</p>
          </div>
        </div>

        <span
          className={[
            "rounded-full px-2 py-1 text-[11px] font-medium",
            program.scope === "GLOBAL"
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground",
          ].join(" ")}
        >
          {program.scope === "GLOBAL" ? "Global" : "Utilisateur"}
        </span>
      </div>

      <p className="mt-4 line-clamp-3 min-h-[60px] text-sm leading-5 text-muted-foreground">
        {program.description || "Aucune description pour ce programme."}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge>{formatSchedule(program.schedule)}</Badge>

        <Badge>
          {program.schedule.execution_mode === "AUTOMATIC"
            ? "Automatique"
            : "Manuel"}
        </Badge>

        <Badge>
          {program.allow_multiple_projects
            ? "Plusieurs projets"
            : "Projet unique"}
        </Badge>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <span className="text-xs text-muted-foreground">{program.status}</span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Modifier"
            onClick={onEdit}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Pencil size={15} />
          </button>

          <button
            type="button"
            title="Supprimer"
            disabled={deleting}
            onClick={onDelete}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Trash2 size={15} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
      {children}
    </span>
  );
}

function formatSchedule(schedule: ProgramSchedule): string {
  if (schedule.type === "ONE_TIME") {
    return "Une période";
  }

  if (schedule.type === "CUSTOM") {
    return `${schedule.custom_occurrences.length} période(s)`;
  }

  if (schedule.recurrence_interval && schedule.recurrence_unit) {
    const unit = {
      DAY: "jour(s)",
      WEEK: "semaine(s)",
      MONTH: "mois",
      YEAR: "année(s)",
    }[schedule.recurrence_unit];

    return `Tous les ${schedule.recurrence_interval} ${unit}`;
  }

  return "Périodique";
}
