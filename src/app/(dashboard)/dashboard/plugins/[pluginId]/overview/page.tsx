"use client";

import { Header } from "@/components/layout/header";
import { PluginWorkspaceNav } from "@/components/plugins/plugin-workspace-nav";
import { pluginResourceService } from "@/services/plugin-resource.service";
import { pluginService } from "@/services/plugin.service";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Database,
  FileCode2,
  FileText,
  FolderKanban,
  Globe,
  Hash,
  Info,
  Loader2,
  Settings,
  Tag,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function PluginOverviewPage() {
  const params = useParams();

  const pluginId = Number(params.pluginId);

  const pluginQuery = useQuery({
    queryKey: ["plugin", pluginId],

    queryFn: async () => {
      const response = await pluginService.get(pluginId);

      return response.data;
    },

    enabled: Number.isInteger(pluginId),
  });

  const resourcesQuery = useQuery({
    queryKey: ["plugin-resources", pluginId],

    queryFn: async () => {
      const response = await pluginResourceService.list(pluginId);

      return response.data;
    },

    enabled: Number.isInteger(pluginId),
  });

  if (pluginQuery.isLoading || resourcesQuery.isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  const plugin = pluginQuery.data;

  if (!plugin) {
    return (
      <div className="p-6 text-sm text-destructive">Plugin introuvable.</div>
    );
  }

  const resources = resourcesQuery.data?.items ?? [];

  const globalCount = resources.filter(
    (item) => item.scope === "GLOBAL",
  ).length;

  const userCount = resources.filter((item) => item.scope === "USER").length;

  return (
    <>
      <Header
        title={plugin.name}
        description={
          plugin.short_description ||
          plugin.description ||
          "Vue d'ensemble du plugin."
        }
      />

      <div className="flex-1 overflow-auto p-6">
        <PluginWorkspaceNav pluginId={pluginId} />

        <div className="mb-8 overflow-hidden rounded-3xl border border-border bg-card">
          {plugin.banner_url && (
            <div
              className="h-48 w-full bg-cover bg-center"
              style={{
                backgroundImage: `url("${plugin.banner_url}")`,
              }}
            />
          )}

          <div className="flex flex-col gap-5 p-6 md:flex-row md:items-start">
            {plugin.icon_url ? (
              <img
                src={plugin.icon_url}
                alt=""
                className="h-20 w-20 rounded-2xl border border-border object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-muted">
                <Database size={28} />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold">{plugin.name}</h2>

                <StatusBadge status={plugin.status} />

                {plugin.is_public && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs font-medium">
                    <Globe size={12} />
                    Public
                  </span>
                )}
              </div>

              <p className="mt-2 text-sm text-muted-foreground">
                {plugin.short_description || "Aucune description courte."}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {plugin.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs"
                  >
                    <Tag size={11} />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <section className="mb-8">
          <SectionTitle
            icon={<Info size={18} />}
            title="Informations générales"
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <InfoCard
              icon={<Hash size={16} />}
              label="Code"
              value={plugin.code}
            />

            <InfoCard
              icon={<Hash size={16} />}
              label="Slug"
              value={plugin.slug}
            />

            <InfoCard
              icon={<Tag size={16} />}
              label="Catégorie"
              value={plugin.category || "Non définie"}
            />

            <InfoCard
              icon={<User size={16} />}
              label="Créateur"
              value={String(plugin.created_by)}
            />
          </div>
        </section>

        <section className="mb-8">
          <SectionTitle icon={<FileText size={18} />} title="Description" />

          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
              {plugin.description || "Aucune description."}
            </p>
          </div>
        </section>

        <section className="mb-8">
          <SectionTitle
            icon={<Calendar size={18} />}
            title="Dates et cycle de vie"
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <InfoCard
              icon={<Calendar size={16} />}
              label="Créé le"
              value={formatDate(plugin.created_at)}
            />

            <InfoCard
              icon={<Calendar size={16} />}
              label="Modifié le"
              value={formatDate(plugin.updated_at)}
            />

            <InfoCard
              icon={<Calendar size={16} />}
              label="Publié le"
              value={formatDate(plugin.published_at)}
            />

            <InfoCard
              icon={<Calendar size={16} />}
              label="Dépublié le"
              value={formatDate(plugin.unpublished_at)}
            />
          </div>
        </section>

        <section className="mb-8">
          <SectionTitle icon={<Database size={18} />} title="Ressources" />

          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              icon={<Database size={18} />}
              label="Total"
              value={resources.length}
            />

            <StatCard
              icon={<FileCode2 size={18} />}
              label="Globales"
              value={globalCount}
            />

            <StatCard
              icon={<Users size={18} />}
              label="Utilisateur"
              value={userCount}
            />
          </div>

          {resources.length > 0 && (
            <div className="mt-4 rounded-2xl border border-border bg-card">
              {resources.map((resource) => (
                <Link
                  key={resource.id}
                  href={`/dashboard/plugins/${pluginId}/resources/${resource.id}`}
                  className="flex items-center justify-between border-b border-border px-5 py-4 last:border-b-0 hover:bg-muted/20"
                >
                  <div>
                    <p className="text-sm font-semibold">{resource.name}</p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {resource.key} · {resource.fields.length} champ(s)
                    </p>
                  </div>

                  <span className="text-xs text-muted-foreground">
                    {resource.scope}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="mb-8">
          <SectionTitle icon={<Settings size={18} />} title="Configuration" />

          <div className="grid gap-4 lg:grid-cols-2">
            <JsonCard title="Parameters" value={plugin.parameters} />

            <JsonCard title="Metadata" value={plugin.metadata_config} />
          </div>
        </section>

        <section className="mb-8">
          <SectionTitle icon={<FileCode2 size={18} />} title="Versions" />

          <div className="rounded-2xl border border-border bg-card">
            {plugin.versions.length === 0 ? (
              <div className="p-5 text-sm text-muted-foreground">
                Aucune version.
              </div>
            ) : (
              plugin.versions.map((version) => (
                <div
                  key={version.id}
                  className="flex flex-col gap-2 border-b border-border px-5 py-4 last:border-b-0 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold">v{version.version}</p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Créée le {formatDate(version.created_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                      {version.status}
                    </span>

                    {version.definition_hash && (
                      <code className="hidden max-w-[280px] truncate text-[10px] text-muted-foreground lg:block">
                        {version.definition_hash}
                      </code>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <SectionTitle
            icon={<FolderKanban size={18} />}
            title="Composants du plugin"
          />

          <div className="grid gap-4 md:grid-cols-3">
            <ComponentCard
              href={`/dashboard/plugins/${pluginId}`}
              icon={<Database size={20} />}
              title="Ressources"
              description={`${resources.length} ressource(s)`}
            />

            <ComponentCard
              href={`/dashboard/plugins/${pluginId}/projects`}
              icon={<FolderKanban size={20} />}
              title="Projets"
              description="Projets du plugin"
            />

            <ComponentCard
              href={`/dashboard/plugins/${pluginId}/programs`}
              icon={<FileText size={20} />}
              title="Programmes"
              description="Programmes du plugin"
            />
          </div>
        </section>
      </div>
    </>
  );
}

function SectionTitle({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-2">
      {icon}

      <h3 className="text-base font-semibold">{title}</h3>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>

      <p className="mt-2 truncate text-sm font-semibold">{value}</p>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>

      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function JsonCard({
  title,
  value,
}: {
  title: string;
  value: Record<string, unknown>;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h4 className="text-sm font-semibold">{title}</h4>

      <pre className="mt-3 max-h-64 overflow-auto rounded-xl bg-muted/30 p-4 text-xs">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

function ComponentCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-border bg-card p-5 transition hover:bg-muted/20"
    >
      {icon}

      <h4 className="mt-4 text-sm font-semibold">{title}</h4>

      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
      {status}
    </span>
  );
}

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
