// ── Database-backed types ────────────────────────────────────────────────────
// These match the Supabase table schemas.

export type Project = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  status: "active" | "archived";
  created_at: string;
  updated_at: string;
};

export type ProjectDocument = {
  id: string;
  project_id: string;
  file_id: string;
  added_at: string;
};

export type ChatSession = {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  chat_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export type FileStatus =
  | "pending_upload"
  | "uploaded"
  | "queued"
  | "processing"
  | "completed"
  | "failed";

export type Tag = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
};

export type Document = {
  id: string;
  user_id: string;
  original_name: string;
  storage_path: string;
  mime_type: string;
  file_size: number;
  page_count: number;
  status: FileStatus;
  error_message: string | null;
  is_global: boolean;
  tags: Tag[];
  created_at: string;
  updated_at: string;
};
