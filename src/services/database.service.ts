/**
 * SenWiseTool — Database Service
 * src/services/database.service.ts
 */

import { api } from "@/lib/api";
import {
  ImportConfig,
  ImportJob,
  ParseResult,
  RowsResponse,
  SWColumn,
  SWRow,
  SWTable,
  SWTableWithColumns,
} from "@/types/database";

// ─── Tables ──────────────────────────────────────────────────────────────────

const tables = {
  list: () => api.get<SWTable[]>("/database/tables"),

  get: (id: string) => api.get<SWTableWithColumns>(`/database/tables/${id}`),

  create: (body: {
    name: string;
    description?: string;
    source?: string;
    tags?: string[];
    columns?: unknown[];
  }) => api.post<SWTableWithColumns>("/database/tables", body),

  update: (
    id: string,
    body: { name?: string; description?: string; tags?: string[] },
  ) => api.patch<SWTable>(`/database/tables/${id}`, body),

  delete: (id: string) => api.delete<null>(`/database/tables/${id}`),

  export: (id: string, format: "csv" | "json" = "csv") => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/database/tables/${id}/export?format=${format}`;
    window.open(url, "_blank");
  },
};

// ─── Columns ─────────────────────────────────────────────────────────────────

const columns = {
  list: (tableId: string) =>
    api.get<SWColumn[]>(`/database/tables/${tableId}/columns`),

  add: (
    tableId: string,
    body: { name: string; type: string; config?: object },
  ) => api.post<SWColumn>(`/database/tables/${tableId}/columns`, body),

  update: (
    columnId: string,
    body: { name?: string; type?: string; is_hidden?: boolean },
  ) => api.patch<SWColumn>(`/database/columns/${columnId}`, body),

  remove: (columnId: string) =>
    api.delete<null>(`/database/columns/${columnId}`),
};

// ─── Rows ─────────────────────────────────────────────────────────────────────

const rows = {
  list: (
    tableId: string,
    params: {
      page?: number;
      page_size?: number;
      search?: string;
      sort_slug?: string;
      sort_dir?: "asc" | "desc";
    } = {},
  ) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.page_size) qs.set("page_size", String(params.page_size));
    if (params.search) qs.set("search", params.search);
    if (params.sort_slug) qs.set("sort_slug", params.sort_slug);
    if (params.sort_dir) qs.set("sort_dir", params.sort_dir);
    return api.get<RowsResponse>(
      `/database/tables/${tableId}/rows?${qs.toString()}`,
    );
  },

  add: (tableId: string, data: Record<string, unknown>) =>
    api.post<SWRow>(`/database/tables/${tableId}/rows`, { data }),

  update: (rowId: string, data: Record<string, unknown>) =>
    api.patch<SWRow>(`/database/rows/${rowId}`, { data }),

  remove: (rowId: string) => api.delete<null>(`/database/rows/${rowId}`),

  removeBulk: (tableId: string, rowIds: string[]) =>
    api.delete<null>(`/database/tables/${tableId}/rows/bulk`, {
      body: JSON.stringify({ row_ids: rowIds }),
    }),
};

// ─── Import ───────────────────────────────────────────────────────────────────

const imports = {
  /** Étape 1 : uploader le fichier */
  upload: async (file: File): Promise<ImportJob> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.upload<ImportJob>(
      "/database/import/upload",
      formData,
    );
    return res.data as ImportJob;
  },

  /** Étape 2 : parser le fichier → schéma détecté */
  parse: (jobId: string) =>
    api.post<ParseResult>(`/database/import/${jobId}/parse`, {}),

  /** Étape 3 : enregistrer la config utilisateur */
  configure: (jobId: string, config: ImportConfig) =>
    api.post<ImportJob>(`/database/import/${jobId}/configure`, config),

  /** Étape 4 : lancer l'import */
  execute: (jobId: string) =>
    api.post<ImportJob>(`/database/import/${jobId}/execute`, {}),

  /** Statut du job */
  status: (jobId: string) =>
    api.get<ImportJob>(`/database/import/${jobId}/status`),
};

export const databaseService = { tables, columns, rows, imports };
