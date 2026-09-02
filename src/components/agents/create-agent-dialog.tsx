"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2, UserPlus, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api";
import { agentService } from "@/services/agent.service";
import type { AgentCreate, AgentRole } from "@/types/agent";

interface CreateAgentDialogProps {
  onClose: () => void;
}

const MAX_AGENTS = 100;

const createEmptyAgent = (): AgentCreate => ({
  full_name: "",
  role: "COLLECTOR",
});

export function CreateAgentDialog({ onClose }: CreateAgentDialogProps) {
  const queryClient = useQueryClient();

  const [agents, setAgents] = useState<AgentCreate[]>([createEmptyAgent()]);

  const createMutation = useMutation({
    mutationFn: (payload: { agents: AgentCreate[] }) =>
      agentService.createMany(payload),

    onSuccess: async (response) => {
      if (!response.data) {
        throw new Error("Le backend n'a pas retourné les agents créés.");
      }

      await queryClient.invalidateQueries({
        queryKey: ["agents"],
      });

      toast.success(
        `${response.data.count} agent${
          response.data.count > 1 ? "s" : ""
        } créé${response.data.count > 1 ? "s" : ""} avec succès.`,
      );

      onClose();
    },

    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
        return;
      }

      toast.error("Une erreur est survenue lors de la création des agents.");
    },
  });

  const updateAgent = (
    index: number,
    field: keyof AgentCreate,
    value: string,
  ) => {
    setAgents((currentAgents) =>
      currentAgents.map((agent, currentIndex) =>
        currentIndex === index
          ? {
              ...agent,
              [field]: value,
            }
          : agent,
      ),
    );
  };

  const addAgent = () => {
    if (agents.length >= MAX_AGENTS) {
      toast.error(
        `Vous ne pouvez pas créer plus de ${MAX_AGENTS} agents à la fois.`,
      );
      return;
    }

    setAgents((currentAgents) => [...currentAgents, createEmptyAgent()]);
  };

  const removeAgent = (index: number) => {
    if (agents.length === 1) {
      toast.error("Vous devez conserver au moins un agent.");
      return;
    }

    setAgents((currentAgents) =>
      currentAgents.filter((_, currentIndex) => currentIndex !== index),
    );
  };

  const validateAgents = (): boolean => {
    for (let index = 0; index < agents.length; index++) {
      const agent = agents[index];
      const fullName = agent.full_name.trim();

      if (!fullName) {
        toast.error(`Le nom de l'agent ${index + 1} est obligatoire.`);
        return false;
      }

      if (fullName.length < 2) {
        toast.error(
          `Le nom de l'agent ${index + 1} doit contenir au moins 2 caractères.`,
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (createMutation.isPending) {
      return;
    }

    if (!validateAgents()) {
      return;
    }

    createMutation.mutate({
      agents: agents.map((agent) => ({
        full_name: agent.full_name.trim(),
        role: agent.role,
      })),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-background shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">Ajouter des agents</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Ajoutez un ou plusieurs agents en une seule opération.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={createMutation.isPending}
            className="rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Agents à créer</p>

                <p className="text-xs text-muted-foreground">
                  {agents.length} / {MAX_AGENTS} agent
                  {agents.length > 1 ? "s" : ""}
                </p>
              </div>

              <button
                type="button"
                onClick={addAgent}
                disabled={
                  createMutation.isPending || agents.length >= MAX_AGENTS
                }
                className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Ajouter un agent
              </button>
            </div>

            <div className="space-y-3">
              {agents.map((agent, index) => (
                <div key={index} className="rounded-lg border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Agent {index + 1}
                    </span>

                    <button
                      type="button"
                      onClick={() => removeAgent(index)}
                      disabled={createMutation.isPending || agents.length === 1}
                      className="rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-destructive disabled:pointer-events-none disabled:opacity-40"
                      aria-label={`Supprimer l'agent ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-[1fr_220px]">
                    {/* Nom */}
                    <div className="space-y-2">
                      <label
                        htmlFor={`agent-name-${index}`}
                        className="text-sm font-medium"
                      >
                        Nom complet
                      </label>

                      <input
                        id={`agent-name-${index}`}
                        type="text"
                        value={agent.full_name}
                        onChange={(event) =>
                          updateAgent(index, "full_name", event.target.value)
                        }
                        disabled={createMutation.isPending}
                        placeholder="Ex. Jean Dupont"
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>

                    {/* Rôle */}
                    <div className="space-y-2">
                      <label
                        htmlFor={`agent-role-${index}`}
                        className="text-sm font-medium"
                      >
                        Rôle
                      </label>

                      <select
                        id={`agent-role-${index}`}
                        value={agent.role}
                        onChange={(event) =>
                          updateAgent(
                            index,
                            "role",
                            event.target.value as AgentRole,
                          )
                        }
                        disabled={createMutation.isPending}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="COLLECTOR">Collecteur</option>

                        <option value="INSPECTOR">Inspecteur</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t bg-muted/30 px-6 py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <UserPlus className="h-4 w-4" />

              <span>
                {agents.length} agent
                {agents.length > 1 ? "s" : ""} prêt
                {agents.length > 1 ? "s" : ""} à être créé
                {agents.length > 1 ? "s" : ""}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={createMutation.isPending}
                className="rounded-md border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={createMutation.isPending}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Créer {agents.length} agent
                    {agents.length > 1 ? "s" : ""}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
