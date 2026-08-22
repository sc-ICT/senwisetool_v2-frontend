import { api } from "@/lib/api";
import type {
  CreateFolderRequest,
  FileNode,
  FileNodeListResponse,
  MoveFileNodeRequest,
  RenameFileNodeRequest,
} from "@/types/file-system";

export const fileSystemService = {
  listRoot: () => api.get<FileNodeListResponse>("/files/"),

  listChildren: (nodeId: number) =>
    api.get<FileNodeListResponse>(`/files/${nodeId}/children`),

  getDescendants: (nodeId: number) =>
    api.get<FileNode[]>(`/files/${nodeId}/descendants`),

  createFolder: (data: CreateFolderRequest) =>
    api.post<FileNode>("/files/folders", data),

  rename: (nodeId: number, data: RenameFileNodeRequest) =>
    api.patch<FileNode>(`/files/${nodeId}`, data),

  move: (nodeId: number, data: MoveFileNodeRequest) =>
    api.patch<FileNode>(`/files/${nodeId}/move`, data),

  delete: (nodeId: number) => api.delete<void>(`/files/${nodeId}`),

  export: (nodeId: number) => api.getBlob(`/files/${nodeId}/export`),

  import: (files: File[], relativePaths: string[], parentId: number | null) => {
    const formData = new FormData();

    for (const file of files) {
      formData.append("files", file);
    }

    for (const relativePath of relativePaths) {
      formData.append("relative_paths", relativePath);
    }

    const query =
      parentId === null ? "" : `?parent_id=${encodeURIComponent(parentId)}`;

    return api.upload<FileNode[]>(`/files/import${query}`, formData);
  },

  importZip: (file: File, parentId: number | null) => {
    const formData = new FormData();

    formData.append("file", file);

    const query =
      parentId === null ? "" : `?parent_id=${encodeURIComponent(parentId)}`;

    return api.upload<FileNode[]>(`/files/import-zip${query}`, formData);
  },

  batchDelete: (nodeIds: number[]) =>
    api.post<void>("/files/batch-delete", {
      node_ids: nodeIds,
    }),

  batchMove: (nodeIds: number[], parentId: number | null) =>
    api.post<void>("/files/batch-move", {
      node_ids: nodeIds,
      parent_id: parentId,
    }),
};
