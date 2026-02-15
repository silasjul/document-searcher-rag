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
 * Get all documents linked to a project via the project_documents junction table,
 * plus all global documents (which are automatically included in every project).
 */
export async function getDocumentsForProject(
  projectId: string,
): Promise<Document[]> {
  const supabase = await createClient();

  // Fetch project-specific documents and global documents in parallel
  const [projectDocsResult, globalDocsResult] = await Promise.all([
    supabase
      .from("project_documents")
      .select("file_id, files(*, file_tags(tag_id, tags(*)))")
      .eq("project_id", projectId),
    supabase
      .from("files")
      .select("*, file_tags(tag_id, tags(*))")
      .eq("is_global", true)
      .order("created_at", { ascending: false }),
  ]);

  if (projectDocsResult.error) {
    console.error("Failed to fetch project documents:", projectDocsResult.error.message);
  }
  if (globalDocsResult.error) {
    console.error("Failed to fetch global documents:", globalDocsResult.error.message);
  }

  const projectDocs = (projectDocsResult.data ?? [])
    .map((row) =>
      row.files
        ? parseDocumentWithTags(row.files as unknown as Record<string, unknown>)
        : null,
    )
    .filter((d): d is Document => d !== null);

  const globalDocs = (globalDocsResult.data ?? []).map((d) =>
    parseDocumentWithTags(d as unknown as Record<string, unknown>),
  );

  // Merge, avoiding duplicates (a global doc might also be explicitly added to the project)
  const seenIds = new Set(projectDocs.map((d) => d.id));
  const mergedDocs = [...projectDocs];
  for (const doc of globalDocs) {
    if (!seenIds.has(doc.id)) {
      mergedDocs.push(doc);
    }
  }

  return mergedDocs;
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
