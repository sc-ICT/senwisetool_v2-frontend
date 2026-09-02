"use client";

import { ApiError } from "@/lib/api";
import { agentService } from "@/services/agent.service";
import type { Agent, AgentRole } from "@/types/agent";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, UserRoundPen, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

interface EditAgentDialogProps {
  agent: Agent;
  onClose: () => void;
}

const ROLE_OPTIONS: Array<{
  value: AgentRole;
  label: string;
}> = [
  {
    value: "COLLECTOR",
    label: "Collecteur",
  },
  {
    value: "INSPECTOR",
    label: "Inspecteur",
  },
];

export function EditAgentDialog({ agent, onClose }: EditAgentDialogProps) {
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState(agent?.full_name ?? "");
  const [role, setRole] = useState<AgentRole>(agent?.role ?? "COLLECTOR");

  const updateMutation = useMutation({
    mutationFn: () =>
      agentService.update(agent.id, {
        full_name: fullName.trim(),
        role,
      }),

    onSuccess: async (response) => {
      if (!response.data) {
        toast.error("Le backend n'a pas retourné l'agent modifié.");
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: ["agents"],
      });

      toast.success("Agent modifié avec succès.");

      onClose();
    },

    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
        return;
      }

      toast.error(
        "Une erreur est survenue lors de la modification de l'agent.",
      );
    },
  });

  if (!agent) {
    return null;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedName = fullName.trim();

    if (!normalizedName) {
      toast.error("Le nom complet est obligatoire.");
      return;
    }

    if (normalizedName.length < 2) {
      toast.error("Le nom complet doit contenir au moins 2 caractères.");
      return;
    }

    updateMutation.mutate();
  };

  const handleClose = () => {
    if (updateMutation.isPending) {
      return;
    }

    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-agent-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "rgba(0, 0, 0, 0.45)",
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          borderRadius: "1rem",
          border: "1px solid var(--color-border)",
          background: "var(--color-surface)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.18)",
          overflow: "hidden",
        }}
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
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
                borderRadius: "0.75rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--color-primary-soft)",
                color: "var(--color-primary)",
              }}
            >
              <UserRoundPen size={19} />
            </div>

            <div>
              <h2
                id="edit-agent-title"
                style={{
                  margin: 0,
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  color: "var(--color-foreground)",
                }}
              >
                Modifier l&#39;agent
              </h2>

              <p
                style={{
                  margin: "0.2rem 0 0",
                  fontSize: "0.82rem",
                  color: "var(--color-foreground-muted)",
                }}
              >
                Modifiez les informations de l&#39;agent.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={updateMutation.isPending}
            aria-label="Fermer"
            style={{
              width: "34px",
              height: "34px",
              border: "none",
              borderRadius: "0.5rem",
              background: "transparent",
              color: "var(--color-foreground-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: updateMutation.isPending ? "not-allowed" : "pointer",
              opacity: updateMutation.isPending ? 0.5 : 1,
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
            }}
          >
            <div>
              <label
                htmlFor="edit-agent-full-name"
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "var(--color-foreground)",
                }}
              >
                Nom complet
              </label>

              <input
                id="edit-agent-full-name"
                type="text"
                value={fullName}
                onChange={(event) => {
                  setFullName(event.target.value);
                }}
                maxLength={255}
                disabled={updateMutation.isPending}
                autoFocus
                style={{
                  width: "100%",
                  height: "42px",
                  padding: "0 0.75rem",
                  borderRadius: "0.625rem",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface-raised)",
                  color: "var(--color-foreground)",
                  outline: "none",
                  fontSize: "0.9rem",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label
                htmlFor="edit-agent-role"
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "var(--color-foreground)",
                }}
              >
                Rôle
              </label>

              <select
                id="edit-agent-role"
                value={role}
                onChange={(event) => {
                  setRole(event.target.value as AgentRole);
                }}
                disabled={updateMutation.isPending}
                style={{
                  width: "100%",
                  height: "42px",
                  padding: "0 0.75rem",
                  borderRadius: "0.625rem",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface-raised)",
                  color: "var(--color-foreground)",
                  outline: "none",
                  fontSize: "0.9rem",
                  boxSizing: "border-box",
                }}
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
              padding: "1rem 1.5rem",
              borderTop: "1px solid var(--color-border)",
            }}
          >
            <button
              type="button"
              onClick={handleClose}
              disabled={updateMutation.isPending}
              style={{
                height: "40px",
                padding: "0 1rem",
                borderRadius: "0.625rem",
                border: "1px solid var(--color-border)",
                background: "var(--color-surface-raised)",
                color: "var(--color-foreground)",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: updateMutation.isPending ? "not-allowed" : "pointer",
                opacity: updateMutation.isPending ? 0.6 : 1,
              }}
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={updateMutation.isPending || !fullName.trim()}
              style={{
                height: "40px",
                padding: "0 1rem",
                borderRadius: "0.625rem",
                border: "none",
                background: "var(--color-primary)",
                color: "white",
                fontSize: "0.85rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor:
                  updateMutation.isPending || !fullName.trim()
                    ? "not-allowed"
                    : "pointer",
                opacity: updateMutation.isPending || !fullName.trim() ? 0.6 : 1,
              }}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
