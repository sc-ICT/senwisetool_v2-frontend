export type FileNodeType = "FOLDER" | "FILE";

export interface FileNode {
  id: number;
  user_id: number;
  parent_id: number | null;
  name: string;
  type: FileNodeType;
  storage_key: string | null;
  mime_type: string | null;
  extension: string | null;
  size: number | null;
  created_at: string;
  updated_at: string;
}

export interface FileNodeListResponse {
  items: FileNode[];
  count: number;
}

export interface CreateFolderRequest {
  name: string;
  parent_id?: number | null;
}

export interface RenameFileNodeRequest {
  name: string;
}

export interface MoveFileNodeRequest {
  parent_id: number | null;
}
