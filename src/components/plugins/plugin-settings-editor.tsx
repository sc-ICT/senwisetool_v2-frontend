"use client";

import { ApiError } from "@/lib/api";
import { pluginService } from "@/services/plugin.service";
import type { Plugin } from "@/types/plugin";
import type {
  PluginApprovalMode,
  PluginAuthorizationDocument,
  PluginAuthorizationForm,
  PluginAuthorizationFormField,
  PluginAuthorizationFormFieldType,
  PluginAuthorizationFormOption,
  PluginParameters,
} from "@/types/plugin-settings";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ChevronDown,
  FileCheck2,
  Info,
  Loader2,
  Save,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  plugin: Plugin;
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary";

const sectionClass = "rounded-2xl border border-border bg-card p-5";

const defaultParameters = (): PluginParameters => ({
  schema_version: 1,
  acquisition: {
    availability: "PUBLIC",
    download_requires_approval: false,
    approval_mode: "SIMPLE_REQUEST",
    authorization_form: null,
    authorization_documents: [],
    instructions_title: null,
    instructions_description: null,
    require_terms_acceptance: false,
    terms_url: null,
  },
  installation: {
    activation_required: true,
    allow_auto_update: true,
    require_update_confirmation: true,
    allow_user_uninstall: true,
    max_active_installations: null,
  },
  permissions: {
    enabled: true,
    require_authentication: true,
    allow_admin_override: true,
    allow_custom_roles: false,
    default_access: "USE",
    allow_data_export: true,
    allow_data_import: true,
    allow_bulk_operations: true,
    allow_audit_log_access: false,
  },
  resources: {
    allow_global_read: true,
    allow_global_create: false,
    allow_global_update: false,
    allow_global_delete: false,
    allow_global_import: false,
    allow_global_export: true,
    allow_user_create: true,
    allow_user_update: true,
    allow_user_delete: true,
    allow_user_import: true,
    allow_user_export: true,
    allow_bulk_operations: true,
    require_delete_confirmation: true,
    allow_offline_editing: true,
    allow_schema_override: true,
  },
  programs: {
    enabled: true,
    allow_user_join: true,
    join_requires_approval: false,
    allow_user_leave: true,
    allow_user_create: false,
    allow_user_manage: false,
    allow_parallel_programs: true,
    allow_multiple_programs_per_user: true,
    allow_manual_start: true,
    allow_automatic_start: true,
    allow_recurring_schedule: true,
  },
  projects: {
    enabled: true,
    allow_user_create: true,
    creation_requires_approval: false,
    allow_user_customize: true,
    allow_resource_override: true,
    allow_form_override: false,
    allow_rules_override: false,
    allow_multiple_active_projects: true,
    allow_self_assignment: false,
    allow_supervisor_assignment: true,
    allow_project_archive: true,
    allow_project_delete: false,
    allow_offline_execution: true,
  },
  collection: {
    enabled: true,
    allow_drafts: true,
    auto_save_drafts: true,
    auto_save_interval_seconds: 30,
    allow_partial_submission: false,
    require_validation_before_submission: true,
    require_submission_confirmation: true,
    allow_edit_after_submission: false,
    correction_requires_approval: true,
    allow_duplicate_submission: false,
  },
  mobile: {
    enabled: true,
    offline_enabled: true,
    offline_allow_data_entry: true,
    offline_allow_data_edit: true,
    offline_allow_data_delete: false,
    max_offline_days: 30,
    automatic_sync: true,
    sync_wifi_only: false,
    sync_interval_seconds: 300,
    retry_sync_on_failure: true,
    location_enabled: true,
    location_required_for_collection: false,
    location_required_for_submission: false,
    camera_enabled: true,
    file_upload_enabled: true,
    max_file_size_mb: 20,
    allowed_file_extensions: ["pdf", "jpg", "jpeg", "png"],
    notifications_enabled: true,
  },
  security: {
    session_max_idle_minutes: 60,
    encrypt_local_storage: true,
    encrypt_sensitive_fields: true,
    audit_enabled: true,
    audit_track_reads: false,
    audit_track_creates: true,
    audit_track_updates: true,
    audit_track_deletes: true,
    audit_track_exports: true,
    require_secure_device: false,
    block_rooted_or_modified_device: false,
  },
  privacy: {
    allow_data_export: true,
    allow_data_deletion: true,
    retention_enabled: false,
    retention_days: null,
    anonymize_after_retention: false,
    require_delete_confirmation: true,
  },
  notifications: {
    enabled: true,
    notify_on_approval_request: true,
    notify_on_approval_decision: true,
    notify_on_sync_failure: true,
    notify_on_project_assignment: true,
    notify_on_submission: true,
    allow_push: true,
    allow_email: true,
  },
  localization: {
    default_language: "fr",
    supported_languages: ["fr"],
    timezone: "UTC",
    date_format: "DD/MM/YYYY",
    decimal_separator: ",",
  },
  support: {
    support_email: null,
    support_url: null,
    documentation_url: null,
    report_issue_url: null,
  },
  legal: {
    terms_url: null,
    privacy_policy_url: null,
    legal_notice_url: null,
    license_name: null,
    require_terms_acceptance_on_installation: false,
  },
  advanced: {
    allow_experimental_features: false,
    debug_mode: false,
    expose_technical_errors: false,
    custom: {},
  },
});

function normalizeParameters(
  value: Record<string, unknown> | undefined,
): PluginParameters {
  const defaults = defaultParameters();
  const source = value ?? {};
  const rawAcquisition = asRecord(source.acquisition);
  const {
    approval_form_key: _legacyApprovalFormKey,
    required_documents: _legacyRequiredDocuments,
    installation_requires_approval: _legacyInstallationApproval,
    ...cleanAcquisition
  } = rawAcquisition;

  const legacyFormKey =
    typeof rawAcquisition.approval_form_key === "string"
      ? rawAcquisition.approval_form_key
      : null;

  const legacyDocuments = Array.isArray(rawAcquisition.required_documents)
    ? rawAcquisition.required_documents
        .filter((item): item is string => typeof item === "string")
        .map((name, index) => ({
          ...defaultAuthorizationDocument(),
          key: `document_${index + 1}`,
          name,
          document_type: name,
          description: `Document requis : ${name}.`,
          instructions: "Veuillez fournir un document lisible, complet et à jour.",
        }))
    : [];

  const rawForm = rawAcquisition.authorization_form;
  const authorizationForm =
    rawForm && typeof rawForm === "object" && !Array.isArray(rawForm)
      ? (rawForm as PluginParameters["acquisition"]["authorization_form"])
      : legacyFormKey
        ? {
            ...defaultAuthorizationForm(),
            key: legacyFormKey,
          }
        : null;

  return {
    ...defaults,
    ...source,
    acquisition: {
      ...defaults.acquisition,
      ...cleanAcquisition,
      authorization_form: authorizationForm,
      authorization_documents:
        Array.isArray(rawAcquisition.authorization_documents)
          ? rawAcquisition.authorization_documents
          : legacyDocuments,
      approval_mode:
        rawAcquisition.download_requires_approval === false
          ? "SIMPLE_REQUEST"
          : (rawAcquisition.approval_mode as PluginParameters["acquisition"]["approval_mode"]) ?? "SIMPLE_REQUEST",
    },
    installation: { ...defaults.installation, ...(asRecord(source.installation)) },
    permissions: { ...defaults.permissions, ...(asRecord(source.permissions)) },
    resources: { ...defaults.resources, ...(asRecord(source.resources)) },
    programs: { ...defaults.programs, ...(asRecord(source.programs)) },
    projects: { ...defaults.projects, ...(asRecord(source.projects)) },
    collection: { ...defaults.collection, ...(asRecord(source.collection)) },
    mobile: { ...defaults.mobile, ...(asRecord(source.mobile)) },
    security: { ...defaults.security, ...(asRecord(source.security)) },
    privacy: { ...defaults.privacy, ...(asRecord(source.privacy)) },
    notifications: { ...defaults.notifications, ...(asRecord(source.notifications)) },
    localization: { ...defaults.localization, ...(asRecord(source.localization)) },
    support: { ...defaults.support, ...(asRecord(source.support)) },
    legal: { ...defaults.legal, ...(asRecord(source.legal)) },
    advanced: { ...defaults.advanced, ...(asRecord(source.advanced)) },
  } as PluginParameters;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function PluginSettingsEditor({ plugin }: Props) {
  const queryClient = useQueryClient();
  const [parameters, setParameters] = useState<PluginParameters>(() =>
    normalizeParameters(plugin.parameters),
  );
  const [openSection, setOpenSection] = useState("acquisition");

  const isDraft = plugin.status === "DRAFT";

  const updateMutation = useMutation({
    mutationFn: () =>
      pluginService.update(plugin.id, {
        parameters,
      }),
    onSuccess: async (response) => {
      queryClient.setQueryData(["plugin", plugin.id], response.data);
      await queryClient.invalidateQueries({ queryKey: ["plugin", plugin.id] });
      toast.success("Paramètres enregistrés.");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Impossible d'enregistrer les paramètres.",
      );
    },
  });

  const update = <K extends keyof PluginParameters>(
    section: K,
    value: PluginParameters[K],
  ) => {
    setParameters((current) => ({
      ...current,
      [section]: value,
    }));
  };

  const updateSection = <K extends keyof PluginParameters>(
    section: K,
    field: string,
    value: unknown,
  ) => {
    setParameters((current) => ({
      ...current,
      [section]: {
        ...(current[section] as Record<string, unknown>),
        [field]: value,
      },
    }));
  };

  if (!isDraft) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
          Ce plugin n&apos;est pas en brouillon. Les paramètres sont en lecture
          seule jusqu&apos;à son retour en brouillon.
        </div>
        <SettingsSections
          parameters={parameters}
          openSection={openSection}
          setOpenSection={setOpenSection}
          update={update}
          updateSection={updateSection}
          disabled
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Politique d&apos;exploitation</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ces paramètres définissent les conditions d&apos;acquisition,
            d&apos;installation et d&apos;utilisation du plugin.
          </p>
        </div>

        <button
          type="button"
          onClick={() => updateMutation.mutate()}
          disabled={updateMutation.isPending}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          {updateMutation.isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Enregistrer
        </button>
      </div>

      <SettingsSections
        parameters={parameters}
        openSection={openSection}
        setOpenSection={setOpenSection}
        update={update}
        updateSection={updateSection}
      />
    </div>
  );
}

interface SectionsProps {
  parameters: PluginParameters;
  openSection: string;
  setOpenSection: (value: string) => void;
  update: <K extends keyof PluginParameters>(
    section: K,
    value: PluginParameters[K],
  ) => void;
  updateSection: <K extends keyof PluginParameters>(
    section: K,
    field: string,
    value: unknown,
  ) => void;
  disabled?: boolean;
}

function SettingsSections({
  parameters,
  openSection,
  setOpenSection,
  update,
  updateSection,
  disabled = false,
}: SectionsProps) {
  const toggle = (key: string) =>
    setOpenSection(openSection === key ? "" : key);

  return (
    <div className="space-y-3">
      <Section
        id="acquisition"
        title="Acquisition & autorisation"
        description="Détermine les conditions d'accès au téléchargement du plugin. L'autorisation, lorsqu'elle est activée, intervient uniquement avant le téléchargement."
        icon={<FileCheck2 size={18} />}
        open={openSection === "acquisition"}
        onToggle={() => toggle("acquisition")}
      >
        <SelectField
          label="Disponibilité du plugin"
          value={parameters.acquisition.availability}
          disabled={disabled}
          onChange={(value) =>
            updateSection("acquisition", "availability", value)
          }
          options={[
            ["PUBLIC", "Publique"],
            ["PRIVATE", "Privée"],
            ["RESTRICTED", "Restreinte"],
          ]}
        />

        <Toggle
          label="Exiger une autorisation avant le téléchargement"
          description="Si cette option est activée, l'utilisateur doit obtenir l'autorisation avant de pouvoir télécharger le plugin. Aucune autorisation supplémentaire n'est demandée au moment de l'installation."
          checked={parameters.acquisition.download_requires_approval}
          disabled={disabled}
          onChange={(value) => {
            updateSection(
              "acquisition",
              "download_requires_approval",
              value,
            );

            if (!value) {
              updateSection(
                "acquisition",
                "approval_mode",
                "SIMPLE_REQUEST",
              );
              updateSection(
                "acquisition",
                "authorization_form",
                null,
              );
              updateSection(
                "acquisition",
                "authorization_documents",
                [],
              );
            }
          }}
        />

        {parameters.acquisition.download_requires_approval && (
          <>
            <SelectField
              label="Mode d'autorisation"
              value={parameters.acquisition.approval_mode}
              disabled={disabled}
              onChange={(value) => {
                const mode = value as PluginApprovalMode;
                updateSection("acquisition", "approval_mode", mode);

                if (mode === "SIMPLE_REQUEST") {
                  updateSection(
                    "acquisition",
                    "authorization_form",
                    null,
                  );
                  updateSection(
                    "acquisition",
                    "authorization_documents",
                    [],
                  );
                }

                if (mode === "FORM") {
                  updateSection(
                    "acquisition",
                    "authorization_documents",
                    [],
                  );
                }

                if (mode === "DOCUMENT") {
                  updateSection(
                    "acquisition",
                    "authorization_form",
                    null,
                  );
                }
              }}
              options={[
                ["SIMPLE_REQUEST", "Simple demande"],
                ["FORM", "Formulaire détaillé"],
                ["DOCUMENT", "Document justificatif"],
                ["FORM_AND_DOCUMENT", "Formulaire + document"],
              ]}
            />

            {parameters.acquisition.approval_mode === "SIMPLE_REQUEST" && (
              <InfoBox>
                L'utilisateur devra simplement soumettre une demande. Aucun
                formulaire ni document justificatif ne sera demandé.
              </InfoBox>
            )}

            {(parameters.acquisition.approval_mode === "DOCUMENT" ||
              parameters.acquisition.approval_mode === "FORM_AND_DOCUMENT") && (
              <AuthorizationDocumentsEditor
                documents={parameters.acquisition.authorization_documents}
                disabled={disabled}
                onChange={(documents) =>
                  updateSection(
                    "acquisition",
                    "authorization_documents",
                    documents,
                  )
                }
              />
            )}

            {(parameters.acquisition.approval_mode === "FORM" ||
              parameters.acquisition.approval_mode === "FORM_AND_DOCUMENT") && (
              <AuthorizationFormEditor
                form={parameters.acquisition.authorization_form}
                disabled={disabled}
                onChange={(form) =>
                  updateSection(
                    "acquisition",
                    "authorization_form",
                    form,
                  )
                }
              />
            )}
          </>
        )}

        <TextField
          label="Titre des instructions générales"
          value={parameters.acquisition.instructions_title ?? ""}
          disabled={disabled}
          onChange={(value) =>
            updateSection(
              "acquisition",
              "instructions_title",
              value || null,
            )
          }
        />

        <TextAreaField
          label="Instructions générales affichées à l'utilisateur"
          value={parameters.acquisition.instructions_description ?? ""}
          disabled={disabled}
          onChange={(value) =>
            updateSection(
              "acquisition",
              "instructions_description",
              value || null,
            )
          }
        />

        <Toggle
          label="Exiger l'acceptation des conditions d'utilisation"
          checked={parameters.acquisition.require_terms_acceptance}
          disabled={disabled}
          onChange={(value) =>
            updateSection(
              "acquisition",
              "require_terms_acceptance",
              value,
            )
          }
        />

        {parameters.acquisition.require_terms_acceptance && (
          <TextField
            label="URL des conditions d'utilisation"
            value={parameters.acquisition.terms_url ?? ""}
            disabled={disabled}
            onChange={(value) =>
              updateSection(
                "acquisition",
                "terms_url",
                value || null,
              )
            }
          />
        )}
      </Section>

      <Section id="installation" title="Installation & activation" description="Contrôle le cycle de vie local du plugin." icon={<Check size={18} />} open={openSection === "installation"} onToggle={() => toggle("installation")}>
        <Toggle label="Activation obligatoire après installation" checked={parameters.installation.activation_required} disabled={disabled} onChange={(value) => updateSection("installation", "activation_required", value)} />
        <Toggle label="Autoriser les mises à jour automatiques" checked={parameters.installation.allow_auto_update} disabled={disabled} onChange={(value) => updateSection("installation", "allow_auto_update", value)} />
        <Toggle label="Demander confirmation avant mise à jour" checked={parameters.installation.require_update_confirmation} disabled={disabled} onChange={(value) => updateSection("installation", "require_update_confirmation", value)} />
        <Toggle label="Autoriser la désinstallation par l'utilisateur" checked={parameters.installation.allow_user_uninstall} disabled={disabled} onChange={(value) => updateSection("installation", "allow_user_uninstall", value)} />
        <NumberField label="Nombre maximal d'installations actives" value={parameters.installation.max_active_installations} disabled={disabled} onChange={(value) => updateSection("installation", "max_active_installations", value)} />
      </Section>

      <Section id="permissions" title="Permissions & accès" description="Politique globale des droits d'utilisation et des opérations." icon={<ShieldCheck size={18} />} open={openSection === "permissions"} onToggle={() => toggle("permissions")}>
        <Toggle label="Activer la gestion des permissions" checked={parameters.permissions.enabled} disabled={disabled} onChange={(value) => updateSection("permissions", "enabled", value)} />
        <Toggle label="Authentification obligatoire" checked={parameters.permissions.require_authentication} disabled={disabled} onChange={(value) => updateSection("permissions", "require_authentication", value)} />
        <Toggle label="Autoriser l'administrateur à outrepasser les règles" checked={parameters.permissions.allow_admin_override} disabled={disabled} onChange={(value) => updateSection("permissions", "allow_admin_override", value)} />
        <Toggle label="Autoriser des rôles personnalisés" checked={parameters.permissions.allow_custom_roles} disabled={disabled} onChange={(value) => updateSection("permissions", "allow_custom_roles", value)} />
        <SelectField label="Accès par défaut" value={parameters.permissions.default_access} disabled={disabled} onChange={(value) => updateSection("permissions", "default_access", value)} options={[["DENY", "Refusé"], ["READ", "Lecture"], ["USE", "Utilisation"], ["MANAGE", "Gestion"]]} />
        <Toggle label="Autoriser l'export des données" checked={parameters.permissions.allow_data_export} disabled={disabled} onChange={(value) => updateSection("permissions", "allow_data_export", value)} />
        <Toggle label="Autoriser l'import des données" checked={parameters.permissions.allow_data_import} disabled={disabled} onChange={(value) => updateSection("permissions", "allow_data_import", value)} />
        <Toggle label="Autoriser les opérations en masse" checked={parameters.permissions.allow_bulk_operations} disabled={disabled} onChange={(value) => updateSection("permissions", "allow_bulk_operations", value)} />
        <Toggle label="Autoriser l'accès au journal d'audit" checked={parameters.permissions.allow_audit_log_access} disabled={disabled} onChange={(value) => updateSection("permissions", "allow_audit_log_access", value)} />
      </Section>

      <Section id="resources" title="Ressources" description="Règles globales appliquées aux ressources GLOBAL et USER." icon={<Info size={18} />} open={openSection === "resources"} onToggle={() => toggle("resources")}>
        <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">Ces règles sont des valeurs globales. La configuration propre d'une ressource peut ensuite être plus restrictive.</div>
        <Toggle label="Lecture des ressources globales" checked={parameters.resources.allow_global_read} disabled={disabled} onChange={(value) => updateSection("resources", "allow_global_read", value)} />
        <Toggle label="Création de ressources globales" checked={parameters.resources.allow_global_create} disabled={disabled} onChange={(value) => updateSection("resources", "allow_global_create", value)} />
        <Toggle label="Modification de ressources globales" checked={parameters.resources.allow_global_update} disabled={disabled} onChange={(value) => updateSection("resources", "allow_global_update", value)} />
        <Toggle label="Suppression de ressources globales" checked={parameters.resources.allow_global_delete} disabled={disabled} onChange={(value) => updateSection("resources", "allow_global_delete", value)} />
        <Toggle label="Import global" checked={parameters.resources.allow_global_import} disabled={disabled} onChange={(value) => updateSection("resources", "allow_global_import", value)} />
        <Toggle label="Export global" checked={parameters.resources.allow_global_export} disabled={disabled} onChange={(value) => updateSection("resources", "allow_global_export", value)} />
        <Toggle label="Création de données utilisateur" checked={parameters.resources.allow_user_create} disabled={disabled} onChange={(value) => updateSection("resources", "allow_user_create", value)} />
        <Toggle label="Modification de données utilisateur" checked={parameters.resources.allow_user_update} disabled={disabled} onChange={(value) => updateSection("resources", "allow_user_update", value)} />
        <Toggle label="Suppression de données utilisateur" checked={parameters.resources.allow_user_delete} disabled={disabled} onChange={(value) => updateSection("resources", "allow_user_delete", value)} />
        <Toggle label="Import utilisateur" checked={parameters.resources.allow_user_import} disabled={disabled} onChange={(value) => updateSection("resources", "allow_user_import", value)} />
        <Toggle label="Export utilisateur" checked={parameters.resources.allow_user_export} disabled={disabled} onChange={(value) => updateSection("resources", "allow_user_export", value)} />
        <Toggle label="Opérations en masse" checked={parameters.resources.allow_bulk_operations} disabled={disabled} onChange={(value) => updateSection("resources", "allow_bulk_operations", value)} />
        <Toggle label="Confirmer avant suppression" checked={parameters.resources.require_delete_confirmation} disabled={disabled} onChange={(value) => updateSection("resources", "require_delete_confirmation", value)} />
        <Toggle label="Autoriser les modifications hors ligne" checked={parameters.resources.allow_offline_editing} disabled={disabled} onChange={(value) => updateSection("resources", "allow_offline_editing", value)} />
        <Toggle label="Autoriser la personnalisation du schéma utilisateur" checked={parameters.resources.allow_schema_override} disabled={disabled} onChange={(value) => updateSection("resources", "allow_schema_override", value)} />
      </Section>

      <Section id="programs" title="Programmes" description="Règles globales d'accès et d'exécution des programmes." icon={<Info size={18} />} open={openSection === "programs"} onToggle={() => toggle("programs")}>
        <Toggle label="Activer les programmes" checked={parameters.programs.enabled} disabled={disabled} onChange={(value) => updateSection("programs", "enabled", value)} />
        <Toggle label="Permettre à l'utilisateur de rejoindre un programme" checked={parameters.programs.allow_user_join} disabled={disabled} onChange={(value) => updateSection("programs", "allow_user_join", value)} />
        <Toggle label="Adhésion soumise à approbation" checked={parameters.programs.join_requires_approval} disabled={disabled} onChange={(value) => updateSection("programs", "join_requires_approval", value)} />
        <Toggle label="Permettre de quitter un programme" checked={parameters.programs.allow_user_leave} disabled={disabled} onChange={(value) => updateSection("programs", "allow_user_leave", value)} />
        <Toggle label="Permettre de créer un programme" checked={parameters.programs.allow_user_create} disabled={disabled} onChange={(value) => updateSection("programs", "allow_user_create", value)} />
        <Toggle label="Permettre de gérer un programme" checked={parameters.programs.allow_user_manage} disabled={disabled} onChange={(value) => updateSection("programs", "allow_user_manage", value)} />
        <Toggle label="Autoriser plusieurs programmes simultanément" checked={parameters.programs.allow_parallel_programs} disabled={disabled} onChange={(value) => updateSection("programs", "allow_parallel_programs", value)} />
        <Toggle label="Autoriser plusieurs programmes par utilisateur" checked={parameters.programs.allow_multiple_programs_per_user} disabled={disabled} onChange={(value) => updateSection("programs", "allow_multiple_programs_per_user", value)} />
        <Toggle label="Démarrage manuel" checked={parameters.programs.allow_manual_start} disabled={disabled} onChange={(value) => updateSection("programs", "allow_manual_start", value)} />
        <Toggle label="Démarrage automatique" checked={parameters.programs.allow_automatic_start} disabled={disabled} onChange={(value) => updateSection("programs", "allow_automatic_start", value)} />
        <Toggle label="Programmes récurrents" checked={parameters.programs.allow_recurring_schedule} disabled={disabled} onChange={(value) => updateSection("programs", "allow_recurring_schedule", value)} />
      </Section>

      <Section id="projects" title="Projets" description="Politique globale des modèles et projets exploités par le plugin." icon={<Info size={18} />} open={openSection === "projects"} onToggle={() => toggle("projects")}>
        <Toggle label="Activer les projets" checked={parameters.projects.enabled} disabled={disabled} onChange={(value) => updateSection("projects", "enabled", value)} />
        <Toggle label="Autoriser la création par l'utilisateur" checked={parameters.projects.allow_user_create} disabled={disabled} onChange={(value) => updateSection("projects", "allow_user_create", value)} />
        <Toggle label="Création soumise à approbation" checked={parameters.projects.creation_requires_approval} disabled={disabled} onChange={(value) => updateSection("projects", "creation_requires_approval", value)} />
        <Toggle label="Autoriser la personnalisation" checked={parameters.projects.allow_user_customize} disabled={disabled} onChange={(value) => updateSection("projects", "allow_user_customize", value)} />
        <Toggle label="Autoriser la surcharge des ressources" checked={parameters.projects.allow_resource_override} disabled={disabled} onChange={(value) => updateSection("projects", "allow_resource_override", value)} />
        <Toggle label="Autoriser la surcharge des formulaires" checked={parameters.projects.allow_form_override} disabled={disabled} onChange={(value) => updateSection("projects", "allow_form_override", value)} />
        <Toggle label="Autoriser la surcharge des règles" checked={parameters.projects.allow_rules_override} disabled={disabled} onChange={(value) => updateSection("projects", "allow_rules_override", value)} />
        <Toggle label="Plusieurs projets actifs simultanément" checked={parameters.projects.allow_multiple_active_projects} disabled={disabled} onChange={(value) => updateSection("projects", "allow_multiple_active_projects", value)} />
        <Toggle label="Auto-affectation par l'utilisateur" checked={parameters.projects.allow_self_assignment} disabled={disabled} onChange={(value) => updateSection("projects", "allow_self_assignment", value)} />
        <Toggle label="Affectation par un superviseur" checked={parameters.projects.allow_supervisor_assignment} disabled={disabled} onChange={(value) => updateSection("projects", "allow_supervisor_assignment", value)} />
        <Toggle label="Archivage des projets" checked={parameters.projects.allow_project_archive} disabled={disabled} onChange={(value) => updateSection("projects", "allow_project_archive", value)} />
        <Toggle label="Suppression des projets" checked={parameters.projects.allow_project_delete} disabled={disabled} onChange={(value) => updateSection("projects", "allow_project_delete", value)} />
        <Toggle label="Exploitation hors ligne" checked={parameters.projects.allow_offline_execution} disabled={disabled} onChange={(value) => updateSection("projects", "allow_offline_execution", value)} />
      </Section>

      <Section id="collection" title="Collecte & formulaires" description="Règles générales de saisie, brouillon et soumission." icon={<Info size={18} />} open={openSection === "collection"} onToggle={() => toggle("collection")}>
        <Toggle label="Activer la collecte" checked={parameters.collection.enabled} disabled={disabled} onChange={(value) => updateSection("collection", "enabled", value)} />
        <Toggle label="Autoriser les brouillons" checked={parameters.collection.allow_drafts} disabled={disabled} onChange={(value) => updateSection("collection", "allow_drafts", value)} />
        <Toggle label="Sauvegarde automatique des brouillons" checked={parameters.collection.auto_save_drafts} disabled={disabled} onChange={(value) => updateSection("collection", "auto_save_drafts", value)} />
        <NumberField label="Intervalle de sauvegarde automatique (secondes)" value={parameters.collection.auto_save_interval_seconds} disabled={disabled} onChange={(value) => updateSection("collection", "auto_save_interval_seconds", value ?? 30)} />
        <Toggle label="Autoriser la soumission partielle" checked={parameters.collection.allow_partial_submission} disabled={disabled} onChange={(value) => updateSection("collection", "allow_partial_submission", value)} />
        <Toggle label="Exiger une validation avant soumission" checked={parameters.collection.require_validation_before_submission} disabled={disabled} onChange={(value) => updateSection("collection", "require_validation_before_submission", value)} />
        <Toggle label="Exiger une confirmation avant soumission" checked={parameters.collection.require_submission_confirmation} disabled={disabled} onChange={(value) => updateSection("collection", "require_submission_confirmation", value)} />
        <Toggle label="Autoriser la modification après soumission" checked={parameters.collection.allow_edit_after_submission} disabled={disabled} onChange={(value) => updateSection("collection", "allow_edit_after_submission", value)} />
        <Toggle label="Correction soumise à approbation" checked={parameters.collection.correction_requires_approval} disabled={disabled} onChange={(value) => updateSection("collection", "correction_requires_approval", value)} />
        <Toggle label="Autoriser les doublons" checked={parameters.collection.allow_duplicate_submission} disabled={disabled} onChange={(value) => updateSection("collection", "allow_duplicate_submission", value)} />
      </Section>

      <Section id="mobile" title="Mobile & hors ligne" description="Contraintes et capacités de l'application mobile." icon={<Smartphone size={18} />} open={openSection === "mobile"} onToggle={() => toggle("mobile")}>
        <Toggle label="Activer l'exploitation mobile" checked={parameters.mobile.enabled} disabled={disabled} onChange={(value) => updateSection("mobile", "enabled", value)} />
        <Toggle label="Activer le mode hors ligne" checked={parameters.mobile.offline_enabled} disabled={disabled} onChange={(value) => updateSection("mobile", "offline_enabled", value)} />
        <Toggle label="Saisie hors ligne" checked={parameters.mobile.offline_allow_data_entry} disabled={disabled} onChange={(value) => updateSection("mobile", "offline_allow_data_entry", value)} />
        <Toggle label="Modification hors ligne" checked={parameters.mobile.offline_allow_data_edit} disabled={disabled} onChange={(value) => updateSection("mobile", "offline_allow_data_edit", value)} />
        <Toggle label="Suppression hors ligne" checked={parameters.mobile.offline_allow_data_delete} disabled={disabled} onChange={(value) => updateSection("mobile", "offline_allow_data_delete", value)} />
        <NumberField label="Durée maximale hors ligne (jours)" value={parameters.mobile.max_offline_days} disabled={disabled} onChange={(value) => updateSection("mobile", "max_offline_days", value)} />
        <Toggle label="Synchronisation automatique" checked={parameters.mobile.automatic_sync} disabled={disabled} onChange={(value) => updateSection("mobile", "automatic_sync", value)} />
        <Toggle label="Synchroniser uniquement en Wi-Fi" checked={parameters.mobile.sync_wifi_only} disabled={disabled} onChange={(value) => updateSection("mobile", "sync_wifi_only", value)} />
        <NumberField label="Intervalle de synchronisation (secondes)" value={parameters.mobile.sync_interval_seconds} disabled={disabled} onChange={(value) => updateSection("mobile", "sync_interval_seconds", value ?? 300)} />
        <Toggle label="Réessayer automatiquement après échec" checked={parameters.mobile.retry_sync_on_failure} disabled={disabled} onChange={(value) => updateSection("mobile", "retry_sync_on_failure", value)} />
        <Toggle label="Activer la géolocalisation" checked={parameters.mobile.location_enabled} disabled={disabled} onChange={(value) => updateSection("mobile", "location_enabled", value)} />
        <Toggle label="GPS obligatoire pour la collecte" checked={parameters.mobile.location_required_for_collection} disabled={disabled} onChange={(value) => updateSection("mobile", "location_required_for_collection", value)} />
        <Toggle label="GPS obligatoire à la soumission" checked={parameters.mobile.location_required_for_submission} disabled={disabled} onChange={(value) => updateSection("mobile", "location_required_for_submission", value)} />
        <Toggle label="Activer la caméra" checked={parameters.mobile.camera_enabled} disabled={disabled} onChange={(value) => updateSection("mobile", "camera_enabled", value)} />
        <Toggle label="Autoriser les fichiers" checked={parameters.mobile.file_upload_enabled} disabled={disabled} onChange={(value) => updateSection("mobile", "file_upload_enabled", value)} />
        <NumberField label="Taille maximale d'un fichier (Mo)" value={parameters.mobile.max_file_size_mb} disabled={disabled} onChange={(value) => updateSection("mobile", "max_file_size_mb", value ?? 20)} />
        <TextField label="Extensions autorisées" value={parameters.mobile.allowed_file_extensions.join(", ")} disabled={disabled} placeholder="pdf, jpg, jpeg, png" onChange={(value) => updateSection("mobile", "allowed_file_extensions", value.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean))} />
        <Toggle label="Notifications mobiles" checked={parameters.mobile.notifications_enabled} disabled={disabled} onChange={(value) => updateSection("mobile", "notifications_enabled", value)} />
      </Section>

      <Section id="security" title="Sécurité" description="Protection des sessions, données locales et audit." icon={<ShieldCheck size={18} />} open={openSection === "security"} onToggle={() => toggle("security")}>
        <NumberField label="Inactivité maximale de session (minutes)" value={parameters.security.session_max_idle_minutes} disabled={disabled} onChange={(value) => updateSection("security", "session_max_idle_minutes", value ?? 60)} />
        <Toggle label="Chiffrer le stockage local" checked={parameters.security.encrypt_local_storage} disabled={disabled} onChange={(value) => updateSection("security", "encrypt_local_storage", value)} />
        <Toggle label="Chiffrer les champs sensibles" checked={parameters.security.encrypt_sensitive_fields} disabled={disabled} onChange={(value) => updateSection("security", "encrypt_sensitive_fields", value)} />
        <Toggle label="Activer l'audit" checked={parameters.security.audit_enabled} disabled={disabled} onChange={(value) => updateSection("security", "audit_enabled", value)} />
        <Toggle label="Tracer les lectures" checked={parameters.security.audit_track_reads} disabled={disabled} onChange={(value) => updateSection("security", "audit_track_reads", value)} />
        <Toggle label="Tracer les créations" checked={parameters.security.audit_track_creates} disabled={disabled} onChange={(value) => updateSection("security", "audit_track_creates", value)} />
        <Toggle label="Tracer les modifications" checked={parameters.security.audit_track_updates} disabled={disabled} onChange={(value) => updateSection("security", "audit_track_updates", value)} />
        <Toggle label="Tracer les suppressions" checked={parameters.security.audit_track_deletes} disabled={disabled} onChange={(value) => updateSection("security", "audit_track_deletes", value)} />
        <Toggle label="Tracer les exports" checked={parameters.security.audit_track_exports} disabled={disabled} onChange={(value) => updateSection("security", "audit_track_exports", value)} />
        <Toggle label="Exiger un appareil sécurisé" checked={parameters.security.require_secure_device} disabled={disabled} onChange={(value) => updateSection("security", "require_secure_device", value)} />
        <Toggle label="Bloquer les appareils rootés/modifiés" checked={parameters.security.block_rooted_or_modified_device} disabled={disabled} onChange={(value) => updateSection("security", "block_rooted_or_modified_device", value)} />
      </Section>

      <Section id="privacy" title="Confidentialité & conservation" description="Règles globales de conservation et de suppression des données." icon={<ShieldCheck size={18} />} open={openSection === "privacy"} onToggle={() => toggle("privacy")}>
        <Toggle label="Autoriser l'export des données" checked={parameters.privacy.allow_data_export} disabled={disabled} onChange={(value) => updateSection("privacy", "allow_data_export", value)} />
        <Toggle label="Autoriser la suppression des données" checked={parameters.privacy.allow_data_deletion} disabled={disabled} onChange={(value) => updateSection("privacy", "allow_data_deletion", value)} />
        <Toggle label="Activer une durée de conservation" checked={parameters.privacy.retention_enabled} disabled={disabled} onChange={(value) => updateSection("privacy", "retention_enabled", value)} />
        {parameters.privacy.retention_enabled && <NumberField label="Durée de conservation (jours)" value={parameters.privacy.retention_days} disabled={disabled} onChange={(value) => updateSection("privacy", "retention_days", value)} />}
        <Toggle label="Anonymiser après la conservation" checked={parameters.privacy.anonymize_after_retention} disabled={disabled} onChange={(value) => updateSection("privacy", "anonymize_after_retention", value)} />
        <Toggle label="Confirmer avant suppression" checked={parameters.privacy.require_delete_confirmation} disabled={disabled} onChange={(value) => updateSection("privacy", "require_delete_confirmation", value)} />
      </Section>

      <Section id="notifications" title="Notifications" description="Événements qui peuvent générer des notifications." icon={<Info size={18} />} open={openSection === "notifications"} onToggle={() => toggle("notifications")}>
        <Toggle label="Activer les notifications" checked={parameters.notifications.enabled} disabled={disabled} onChange={(value) => updateSection("notifications", "enabled", value)} />
        <Toggle label="Demande d'autorisation" checked={parameters.notifications.notify_on_approval_request} disabled={disabled} onChange={(value) => updateSection("notifications", "notify_on_approval_request", value)} />
        <Toggle label="Décision d'autorisation" checked={parameters.notifications.notify_on_approval_decision} disabled={disabled} onChange={(value) => updateSection("notifications", "notify_on_approval_decision", value)} />
        <Toggle label="Échec de synchronisation" checked={parameters.notifications.notify_on_sync_failure} disabled={disabled} onChange={(value) => updateSection("notifications", "notify_on_sync_failure", value)} />
        <Toggle label="Affectation d'un projet" checked={parameters.notifications.notify_on_project_assignment} disabled={disabled} onChange={(value) => updateSection("notifications", "notify_on_project_assignment", value)} />
        <Toggle label="Soumission de données" checked={parameters.notifications.notify_on_submission} disabled={disabled} onChange={(value) => updateSection("notifications", "notify_on_submission", value)} />
        <Toggle label="Notifications push" checked={parameters.notifications.allow_push} disabled={disabled} onChange={(value) => updateSection("notifications", "allow_push", value)} />
        <Toggle label="Notifications email" checked={parameters.notifications.allow_email} disabled={disabled} onChange={(value) => updateSection("notifications", "allow_email", value)} />
      </Section>

      <Section id="localization" title="Localisation" description="Langue, fuseau horaire et formats." icon={<Info size={18} />} open={openSection === "localization"} onToggle={() => toggle("localization")}>
        <TextField label="Langue par défaut" value={parameters.localization.default_language} disabled={disabled} onChange={(value) => updateSection("localization", "default_language", value)} />
        <TextField label="Langues supportées" value={parameters.localization.supported_languages.join(", ")} disabled={disabled} onChange={(value) => updateSection("localization", "supported_languages", value.split(",").map((item) => item.trim()).filter(Boolean))} />
        <TextField label="Fuseau horaire" value={parameters.localization.timezone} disabled={disabled} onChange={(value) => updateSection("localization", "timezone", value)} />
        <TextField label="Format de date" value={parameters.localization.date_format} disabled={disabled} onChange={(value) => updateSection("localization", "date_format", value)} />
        <SelectField label="Séparateur décimal" value={parameters.localization.decimal_separator} disabled={disabled} onChange={(value) => updateSection("localization", "decimal_separator", value)} options={[[",", "Virgule"], [".", "Point"]]} />
      </Section>

      <Section id="support" title="Support & documentation" description="Informations affichées pour aider l'utilisateur du plugin." icon={<Info size={18} />} open={openSection === "support"} onToggle={() => toggle("support")}>
        <TextField label="Email de support" value={parameters.support.support_email ?? ""} disabled={disabled} onChange={(value) => updateSection("support", "support_email", value || null)} />
        <TextField label="URL de support" value={parameters.support.support_url ?? ""} disabled={disabled} onChange={(value) => updateSection("support", "support_url", value || null)} />
        <TextField label="Documentation" value={parameters.support.documentation_url ?? ""} disabled={disabled} onChange={(value) => updateSection("support", "documentation_url", value || null)} />
        <TextField label="Signaler un problème" value={parameters.support.report_issue_url ?? ""} disabled={disabled} onChange={(value) => updateSection("support", "report_issue_url", value || null)} />
      </Section>

      <Section id="legal" title="Juridique" description="Conditions, politique de confidentialité et licence." icon={<FileCheck2 size={18} />} open={openSection === "legal"} onToggle={() => toggle("legal")}>
        <TextField label="Conditions d'utilisation" value={parameters.legal.terms_url ?? ""} disabled={disabled} onChange={(value) => updateSection("legal", "terms_url", value || null)} />
        <TextField label="Politique de confidentialité" value={parameters.legal.privacy_policy_url ?? ""} disabled={disabled} onChange={(value) => updateSection("legal", "privacy_policy_url", value || null)} />
        <TextField label="Mentions légales" value={parameters.legal.legal_notice_url ?? ""} disabled={disabled} onChange={(value) => updateSection("legal", "legal_notice_url", value || null)} />
        <TextField label="Nom de la licence" value={parameters.legal.license_name ?? ""} disabled={disabled} onChange={(value) => updateSection("legal", "license_name", value || null)} />
        <Toggle label="Exiger l'acceptation des conditions à l'installation" checked={parameters.legal.require_terms_acceptance_on_installation} disabled={disabled} onChange={(value) => updateSection("legal", "require_terms_acceptance_on_installation", value)} />
      </Section>

      <Section id="advanced" title="Avancé" description="Options techniques à utiliser avec précaution." icon={<Info size={18} />} open={openSection === "advanced"} onToggle={() => toggle("advanced")}>
        <Toggle label="Autoriser les fonctionnalités expérimentales" checked={parameters.advanced.allow_experimental_features} disabled={disabled} onChange={(value) => updateSection("advanced", "allow_experimental_features", value)} />
        <Toggle label="Mode debug" checked={parameters.advanced.debug_mode} disabled={disabled} onChange={(value) => updateSection("advanced", "debug_mode", value)} />
        <Toggle label="Exposer les erreurs techniques" checked={parameters.advanced.expose_technical_errors} disabled={disabled} onChange={(value) => updateSection("advanced", "expose_technical_errors", value)} />
      </Section>
    </div>
  );
}


const defaultAuthorizationDocument = (): PluginAuthorizationDocument => ({
  key: "document",
  name: "Document d'autorisation",
  document_type: "AUTORISATION",
  description: "Document officiel permettant de justifier l'autorisation demandée.",
  instructions: "Le document doit être lisible, complet et à jour.",
  required_elements: [],
  required: true,
  allow_multiple_files: false,
  max_files: 1,
  accepted_extensions: ["pdf", "jpg", "jpeg", "png"],
  max_file_size_mb: 20,
  issuer_required: false,
  document_number_required: false,
  issue_date_required: false,
  expiry_date_required: false,
  allow_expired_document: false,
});

const defaultAuthorizationForm = (): PluginAuthorizationForm => ({
  key: "demande_autorisation",
  title: "Demande d'autorisation de téléchargement",
  description: "Formulaire permettant de demander l'autorisation de télécharger le plugin.",
  instructions: "Veuillez renseigner toutes les informations nécessaires à l'étude de votre demande.",
  submit_label: "Soumettre la demande",
  success_message: "Votre demande d'autorisation a été soumise.",
  allow_save_draft: false,
  fields: [],
});

const defaultAuthorizationFormField = (
  position: number,
): PluginAuthorizationFormField => ({
  key: `champ_${position + 1}`,
  label: `Champ ${position + 1}`,
  type: "TEXT",
  description: null,
  help_text: null,
  placeholder: null,
  required: true,
  default_value: null,
  options: [],
  min_length: null,
  max_length: null,
  min_value: null,
  max_value: null,
  pattern: null,
  accepted_extensions: [],
  max_file_size_mb: 20,
  position,
});

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm leading-6 text-muted-foreground">
      <div className="flex items-start gap-2">
        <Info size={16} className="mt-0.5 shrink-0" />
        <div>{children}</div>
      </div>
    </div>
  );
}

function AuthorizationDocumentsEditor({
  documents,
  disabled,
  onChange,
}: {
  documents: PluginAuthorizationDocument[];
  disabled?: boolean;
  onChange: (documents: PluginAuthorizationDocument[]) => void;
}) {
  const add = () => {
    const document = defaultAuthorizationDocument();
    document.key = `document_${documents.length + 1}`;
    document.name = `Document ${documents.length + 1}`;
    onChange([...documents, document]);
  };

  const update = <K extends keyof PluginAuthorizationDocument>(
    index: number,
    field: K,
    value: PluginAuthorizationDocument[K],
  ) => {
    onChange(
      documents.map((document, currentIndex) =>
        currentIndex === index
          ? { ...document, [field]: value }
          : document,
      ),
    );
  };

  const remove = (index: number) => {
    onChange(documents.filter((_, currentIndex) => currentIndex !== index));
  };

  return (
    <div className="space-y-4 rounded-xl border border-border p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold">Documents exigés</h4>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Pour chaque document, définis exactement ce que l'utilisateur doit
            fournir, le type de document attendu, son contenu et les contraintes
            de dépôt.
          </p>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={add}
          className="rounded-lg border border-border px-3 py-2 text-xs font-semibold disabled:opacity-50"
        >
          Ajouter un document
        </button>
      </div>

      {documents.length === 0 && (
        <InfoBox>
          Aucun document n'est encore défini. Ajoute au moins un document pour
          pouvoir enregistrer une configuration DOCUMENT.
        </InfoBox>
      )}

      {documents.map((document, index) => (
        <div key={`${document.key}-${index}`} className="space-y-4 rounded-xl border border-border bg-muted/10 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h5 className="text-sm font-semibold">Document {index + 1}</h5>
              <p className="text-xs text-muted-foreground">Définition du justificatif attendu.</p>
            </div>
            <button
              type="button"
              disabled={disabled}
              onClick={() => remove(index)}
              className="text-xs font-semibold text-destructive disabled:opacity-50"
            >
              Supprimer
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              label="Clé technique"
              value={document.key}
              disabled={disabled}
              onChange={(value) => update(index, "key", value)}
            />
            <TextField
              label="Nom du document"
              value={document.name}
              disabled={disabled}
              onChange={(value) => update(index, "name", value)}
            />
            <TextField
              label="Type de document"
              value={document.document_type}
              placeholder="Ex. Autorisation officielle, certificat, registre"
              disabled={disabled}
              onChange={(value) => update(index, "document_type", value)}
            />
            <TextField
              label="Extensions acceptées"
              value={document.accepted_extensions.join(", ")}
              placeholder="pdf, jpg, png"
              disabled={disabled}
              onChange={(value) =>
                update(
                  index,
                  "accepted_extensions",
                  value.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean),
                )
              }
            />
          </div>

          <TextAreaField
            label="Description du document"
            value={document.description}
            disabled={disabled}
            onChange={(value) => update(index, "description", value)}
          />

          <TextAreaField
            label="Instructions de contenu"
            value={document.instructions}
            disabled={disabled}
            onChange={(value) => update(index, "instructions", value)}
          />

          <TextAreaField
            label="Éléments que le document doit obligatoirement porter"
            value={document.required_elements.join("\n")}
            disabled={disabled}
            onChange={(value) =>
              update(
                index,
                "required_elements",
                value.split("\n").map((item) => item.trim()).filter(Boolean),
              )
            }
          />

          <div className="grid gap-4 md:grid-cols-3">
            <NumberField
              label="Taille maximale (Mo)"
              value={document.max_file_size_mb}
              disabled={disabled}
              onChange={(value) => update(index, "max_file_size_mb", value ?? 20)}
            />
            <NumberField
              label="Nombre maximal de fichiers"
              value={document.max_files}
              disabled={disabled}
              onChange={(value) => update(index, "max_files", value ?? 1)}
            />
            <Toggle
              label="Document obligatoire"
              checked={document.required}
              disabled={disabled}
              onChange={(value) => update(index, "required", value)}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Toggle label="Autoriser plusieurs fichiers" checked={document.allow_multiple_files} disabled={disabled} onChange={(value) => update(index, "allow_multiple_files", value)} />
            <Toggle label="Nom de l'émetteur obligatoire" checked={document.issuer_required} disabled={disabled} onChange={(value) => update(index, "issuer_required", value)} />
            <Toggle label="Numéro du document obligatoire" checked={document.document_number_required} disabled={disabled} onChange={(value) => update(index, "document_number_required", value)} />
            <Toggle label="Date d'émission obligatoire" checked={document.issue_date_required} disabled={disabled} onChange={(value) => update(index, "issue_date_required", value)} />
            <Toggle label="Date d'expiration obligatoire" checked={document.expiry_date_required} disabled={disabled} onChange={(value) => update(index, "expiry_date_required", value)} />
            <Toggle label="Autoriser un document expiré" checked={document.allow_expired_document} disabled={disabled} onChange={(value) => update(index, "allow_expired_document", value)} />
          </div>
        </div>
      ))}
    </div>
  );
}

function AuthorizationFormEditor({
  form,
  disabled,
  onChange,
}: {
  form: PluginAuthorizationForm | null;
  disabled?: boolean;
  onChange: (form: PluginAuthorizationForm) => void;
}) {
  const currentForm = form ?? defaultAuthorizationForm();

  const updateForm = <K extends keyof PluginAuthorizationForm>(
    field: K,
    value: PluginAuthorizationForm[K],
  ) => {
    onChange({ ...currentForm, [field]: value });
  };

  const addField = () => {
    const fields = [
      ...currentForm.fields,
      defaultAuthorizationFormField(currentForm.fields.length),
    ];
    onChange({ ...currentForm, fields });
  };

  const updateField = (
    index: number,
    field: PluginAuthorizationFormField,
  ) => {
    onChange({
      ...currentForm,
      fields: currentForm.fields.map((item, currentIndex) =>
        currentIndex === index ? field : item,
      ),
    });
  };

  const removeField = (index: number) => {
    onChange({
      ...currentForm,
      fields: currentForm.fields
        .filter((_, currentIndex) => currentIndex !== index)
        .map((field, position) => ({ ...field, position })),
    });
  };

  return (
    <div className="space-y-4 rounded-xl border border-border p-4">
      <div>
        <h4 className="text-sm font-semibold">Formulaire d'autorisation</h4>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Le formulaire est défini directement dans la configuration du plugin.
          Chaque champ possède son type, son libellé, ses contraintes, ses
          options et ses règles de saisie.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="Clé du formulaire" value={currentForm.key} disabled={disabled} onChange={(value) => updateForm("key", value)} />
        <TextField label="Titre" value={currentForm.title} disabled={disabled} onChange={(value) => updateForm("title", value)} />
      </div>

      <TextAreaField label="Description" value={currentForm.description} disabled={disabled} onChange={(value) => updateForm("description", value)} />
      <TextAreaField label="Instructions à l'utilisateur" value={currentForm.instructions} disabled={disabled} onChange={(value) => updateForm("instructions", value)} />

      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="Libellé du bouton de soumission" value={currentForm.submit_label} disabled={disabled} onChange={(value) => updateForm("submit_label", value)} />
        <TextField label="Message après soumission" value={currentForm.success_message} disabled={disabled} onChange={(value) => updateForm("success_message", value)} />
      </div>

      <Toggle label="Autoriser l'enregistrement d'un brouillon" checked={currentForm.allow_save_draft} disabled={disabled} onChange={(value) => updateForm("allow_save_draft", value)} />

      <div className="space-y-4 border-t border-border pt-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h5 className="text-sm font-semibold">Champs du formulaire</h5>
            <p className="mt-1 text-xs text-muted-foreground">
              Définis toutes les informations que l'utilisateur doit fournir.
            </p>
          </div>
          <button type="button" disabled={disabled} onClick={addField} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold disabled:opacity-50">
            Ajouter un champ
          </button>
        </div>

        {currentForm.fields.length === 0 && (
          <InfoBox>
            Aucun champ n'est défini. Ajoute les champs nécessaires à
            l'instruction et à l'analyse de la demande d'autorisation.
          </InfoBox>
        )}

        {currentForm.fields.map((field, index) => (
          <AuthorizationFormFieldEditor
            key={`${field.key}-${index}`}
            field={field}
            index={index}
            disabled={disabled}
            onChange={(value) => updateField(index, value)}
            onRemove={() => removeField(index)}
          />
        ))}
      </div>
    </div>
  );
}

function AuthorizationFormFieldEditor({
  field,
  index,
  disabled,
  onChange,
  onRemove,
}: {
  field: PluginAuthorizationFormField;
  index: number;
  disabled?: boolean;
  onChange: (field: PluginAuthorizationFormField) => void;
  onRemove: () => void;
}) {
  const update = <K extends keyof PluginAuthorizationFormField>(
    key: K,
    value: PluginAuthorizationFormField[K],
  ) => onChange({ ...field, [key]: value });

  const isChoice = ["SELECT", "MULTI_SELECT", "RADIO"].includes(field.type);
  const isFile = ["FILE", "MULTI_FILE"].includes(field.type);
  const isText = ["TEXT", "TEXTAREA", "EMAIL", "PHONE"].includes(field.type);
  const isNumber = field.type === "NUMBER";

  const addOption = () => {
    const option: PluginAuthorizationFormOption = {
      value: `option_${field.options.length + 1}`,
      label: `Option ${field.options.length + 1}`,
      description: null,
      is_active: true,
    };
    update("options", [...field.options, option]);
  };

  const updateOption = (
    indexOption: number,
    key: keyof PluginAuthorizationFormOption,
    value: string | boolean | null,
  ) => {
    update(
      "options",
      field.options.map((option, currentIndex) =>
        currentIndex === indexOption
          ? { ...option, [key]: value }
          : option,
      ),
    );
  };

  const removeOption = (indexOption: number) => {
    update(
      "options",
      field.options.filter((_, currentIndex) => currentIndex !== indexOption),
    );
  };

  const changeType = (value: string) => {
    const type = value as PluginAuthorizationFormFieldType;
    const next: PluginAuthorizationFormField = {
      ...field,
      type,
      options: ["SELECT", "MULTI_SELECT", "RADIO"].includes(type)
        ? field.options.length > 0
          ? field.options
          : [
              {
                value: "option_1",
                label: "Option 1",
                description: null,
                is_active: true,
              },
            ]
        : [],
      accepted_extensions: ["FILE", "MULTI_FILE"].includes(type)
        ? field.accepted_extensions
        : [],
      min_length: ["TEXT", "TEXTAREA", "EMAIL", "PHONE"].includes(type)
        ? field.min_length
        : null,
      max_length: ["TEXT", "TEXTAREA", "EMAIL", "PHONE"].includes(type)
        ? field.max_length
        : null,
      pattern: ["TEXT", "TEXTAREA", "EMAIL", "PHONE"].includes(type)
        ? field.pattern
        : null,
      min_value: type === "NUMBER" ? field.min_value : null,
      max_value: type === "NUMBER" ? field.max_value : null,
    };
    onChange(next);
  };

  return (
    <div className="space-y-4 rounded-xl border border-border bg-muted/10 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h6 className="text-sm font-semibold">Champ {index + 1}</h6>
          <p className="text-xs text-muted-foreground">Définition complète du champ.</p>
        </div>
        <button type="button" disabled={disabled} onClick={onRemove} className="text-xs font-semibold text-destructive disabled:opacity-50">
          Supprimer
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <TextField label="Clé technique" value={field.key} disabled={disabled} onChange={(value) => update("key", value)} />
        <TextField label="Libellé" value={field.label} disabled={disabled} onChange={(value) => update("label", value)} />
        <SelectField
          label="Type"
          value={field.type}
          disabled={disabled}
          onChange={changeType}
          options={[
            ["TEXT", "Texte court"],
            ["TEXTAREA", "Texte long"],
            ["NUMBER", "Nombre"],
            ["EMAIL", "Email"],
            ["PHONE", "Téléphone"],
            ["DATE", "Date"],
            ["DATETIME", "Date et heure"],
            ["BOOLEAN", "Booléen"],
            ["SELECT", "Liste déroulante"],
            ["MULTI_SELECT", "Sélection multiple"],
            ["RADIO", "Choix unique"],
            ["CHECKBOX", "Case à cocher"],
            ["FILE", "Fichier"],
            ["MULTI_FILE", "Plusieurs fichiers"],
          ]}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TextAreaField label="Description" value={field.description ?? ""} disabled={disabled} onChange={(value) => update("description", value || null)} />
        <TextAreaField label="Aide affichée à l'utilisateur" value={field.help_text ?? ""} disabled={disabled} onChange={(value) => update("help_text", value || null)} />
      </div>

      {isText && (
        <div className="grid gap-4 md:grid-cols-3">
          <TextField label="Placeholder" value={field.placeholder ?? ""} disabled={disabled} onChange={(value) => update("placeholder", value || null)} />
          <NumberField label="Longueur minimale" value={field.min_length ?? null} disabled={disabled} onChange={(value) => update("min_length", value)} />
          <NumberField label="Longueur maximale" value={field.max_length ?? null} disabled={disabled} onChange={(value) => update("max_length", value)} />
          <TextField label="Expression de validation" value={field.pattern ?? ""} disabled={disabled} onChange={(value) => update("pattern", value || null)} />
        </div>
      )}

      {isNumber && (
        <div className="grid gap-4 md:grid-cols-2">
          <NumberField label="Valeur minimale" value={field.min_value ?? null} disabled={disabled} onChange={(value) => update("min_value", value)} />
          <NumberField label="Valeur maximale" value={field.max_value ?? null} disabled={disabled} onChange={(value) => update("max_value", value)} />
        </div>
      )}

      {isFile && (
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Extensions acceptées" value={field.accepted_extensions.join(", ")} placeholder="pdf, jpg, png" disabled={disabled} onChange={(value) => update("accepted_extensions", value.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean))} />
          <NumberField label="Taille maximale (Mo)" value={field.max_file_size_mb} disabled={disabled} onChange={(value) => update("max_file_size_mb", value ?? 20)} />
        </div>
      )}

      {isChoice && (
        <div className="space-y-3 rounded-lg border border-border p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h6 className="text-xs font-semibold">Options</h6>
              <p className="text-xs text-muted-foreground">Valeur technique, libellé et description de chaque choix.</p>
            </div>
            <button type="button" disabled={disabled} onClick={addOption} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold disabled:opacity-50">
              Ajouter une option
            </button>
          </div>

          {field.options.map((option, optionIndex) => (
            <div key={`${option.value}-${optionIndex}`} className="grid gap-3 rounded-lg border border-border bg-muted/10 p-3 md:grid-cols-4">
              <TextField label="Valeur" value={option.value} disabled={disabled} onChange={(value) => updateOption(optionIndex, "value", value)} />
              <TextField label="Libellé" value={option.label} disabled={disabled} onChange={(value) => updateOption(optionIndex, "label", value)} />
              <TextField label="Description" value={option.description ?? ""} disabled={disabled} onChange={(value) => updateOption(optionIndex, "description", value || null)} />
              <div className="flex items-end gap-3">
                <Toggle label="Active" checked={option.is_active} disabled={disabled} onChange={(value) => updateOption(optionIndex, "is_active", value)} />
                <button type="button" disabled={disabled} onClick={() => removeOption(optionIndex)} className="mb-4 text-xs font-semibold text-destructive disabled:opacity-50">
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Toggle label="Champ obligatoire" checked={field.required} disabled={disabled} onChange={(value) => update("required", value)} />
        <NumberField label="Position" value={field.position} disabled={disabled} onChange={(value) => update("position", value ?? index)} />
      </div>
    </div>
  );
}

function Section({ id, title, description, icon, open, onToggle, children }: { id: string; title: string; description: string; icon: React.ReactNode; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <section className={sectionClass} data-section={id}>
      <button type="button" onClick={onToggle} className="flex w-full items-start gap-3 text-left">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">{title}</span>
          <span className="mt-1 block text-xs leading-5 text-muted-foreground">{description}</span>
        </span>
        <ChevronDown size={18} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>
      {open && <div className="mt-5 grid gap-4 border-t border-border pt-5">{children}</div>}
    </section>
  );
}

function Toggle({ label, description, checked, disabled, onChange }: { label: string; description?: string; checked: boolean; disabled?: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-border p-4 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {description && <span className="mt-1 block text-xs text-muted-foreground">{description}</span>}
      </span>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" />
    </label>
  );
}

function SelectField({ label, value, options, disabled, onChange }: { label: string; value: string; options: Array<[string, string]>; disabled?: boolean; onChange: (value: string) => void }) {
  return (
    <label>
      <span className="mb-2 block text-xs font-semibold">{label}</span>
      <select value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className={inputClass}>
        {options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}
      </select>
    </label>
  );
}

function TextField({ label, value, placeholder, disabled, onChange }: { label: string; value: string; placeholder?: string; disabled?: boolean; onChange: (value: string) => void }) {
  return (
    <label>
      <span className="mb-2 block text-xs font-semibold">{label}</span>
      <input value={value} placeholder={placeholder} disabled={disabled} onChange={(event) => onChange(event.target.value)} className={inputClass} />
    </label>
  );
}

function TextAreaField({ label, value, disabled, onChange }: { label: string; value: string; disabled?: boolean; onChange: (value: string) => void }) {
  return (
    <label>
      <span className="mb-2 block text-xs font-semibold">{label}</span>
      <textarea value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} rows={4} className={`${inputClass} resize-y`} />
    </label>
  );
}

function NumberField({ label, value, disabled, onChange }: { label: string; value: number | null; disabled?: boolean; onChange: (value: number | null) => void }) {
  return (
    <label>
      <span className="mb-2 block text-xs font-semibold">{label}</span>
      <input type="number" min={0} value={value ?? ""} disabled={disabled} onChange={(event) => onChange(event.target.value === "" ? null : Number(event.target.value))} className={inputClass} />
    </label>
  );
}
