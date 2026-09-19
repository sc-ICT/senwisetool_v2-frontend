"use client";

import {
  BarChart3,
  Database,
  FolderKanban,
  GlobeCheck,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  pluginId: number;
}

const items = [
  {
    key: "overview",
    label: "Vue d'ensemble",
    icon: BarChart3,
    href: (id: number) => `/dashboard/plugins/${id}/overview`,
  },
  {
    key: "resources",
    label: "Ressources",
    icon: Database,
    href: (id: number) => `/dashboard/plugins/${id}`,
  },
  {
    key: "programs",
    label: "Programmes",
    icon: GlobeCheck,
    href: (id: number) => `/dashboard/plugins/${id}/programs`,
  },
  {
    key: "projects",
    label: "Projets",
    icon: FolderKanban,
    href: (id: number) => `/dashboard/plugins/${id}/projects`,
  },
  {
    key: "settings",
    label: "Paramètres",
    icon: Settings,
    href: (id: number) => `/dashboard/plugins/${id}/settings`,
  },
];

export function PluginWorkspaceNav({ pluginId }: Props) {
  const pathname = usePathname();

  const getActiveKey = () => {
    if (
      pathname === `/dashboard/plugins/${pluginId}` ||
      pathname.startsWith(`/dashboard/plugins/${pluginId}/resources`)
    ) {
      return "resources";
    }

    if (pathname.startsWith(`/dashboard/plugins/${pluginId}/projects`)) {
      return "projects";
    }

    if (pathname.startsWith(`/dashboard/plugins/${pluginId}/programs`)) {
      return "programs";
    }

    if (pathname.startsWith(`/dashboard/plugins/${pluginId}/settings`)) {
      return "settings";
    }

    return "overview";
  };

  const activeKey = getActiveKey();

  return (
    <nav className="mb-6 overflow-x-auto border-b border-border">
      <div className="flex min-w-max items-center gap-1 justify-between">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.key === activeKey;

          return (
            <Link
              key={item.key}
              href={item.href(pluginId)}
              className={[
                "inline-flex items-center justify-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors w-full",
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
              ].join(" ")}
            >
              <Icon size={16} />

              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
