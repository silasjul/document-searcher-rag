"use server";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Document, Tag } from "@/lib/types";

/** Normalise the nested file_tags join into a flat Tag[]. */
function parseDocumentWithTags(raw: Record<string, unknown>): Document {
  const fileTags = (raw.file_tags ?? []) as Array<{
    tag_id: string;
    tags: Tag | null;
  }>;

  const tags: Tag[] = fileTags
    .map((ft) => ft.tags)
    .filter((t): t is Tag => t !== null);

  const { file_tags: _unused, ...rest } = raw;
  return { ...rest, tags } as Document;
}

/**
 * Get all documents linked to a project via the project_documents junction table.
 */
export async function getDocumentsForProject(
  projectId: string,
): Promise<Document[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("project_documents")
    .select("file_id, files(*, file_tags(tag_id, tags(*)))")
    .eq("project_id", projectId);

  if (error) {
    console.error("Failed to fetch project documents:", error.message);
    return [];
  }

  return (data ?? [])
    .map((row) =>
      row.files
        ? parseDocumentWithTags(row.files as unknown as Record<string, unknown>)
        : null,
    )
    .filter((d): d is Document => d !== null);
}

/**
 * Get all documents belonging to the current user.
 */
export const getAllDocuments = cache(async (): Promise<Document[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("files")
    .select("*, file_tags(tag_id, tags(*))")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch all documents:", error.message);
    return [];
  }

  return (data ?? []).map((d) =>
    parseDocumentWithTags(d as unknown as Record<string, unknown>),
  );
});
