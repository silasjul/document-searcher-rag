import { createClient } from "@/lib/supabase/client";
import { apiGet } from "@/lib/api-client";
import type { Document, Tag } from "@/lib/types";

// ── Document actions ────────────────────────────────────────────────────────

/**
 * Download a document by fetching a signed URL and triggering a browser download.
 */
export async function downloadDocument(document: Document): Promise<void> {
  const { signed_url } = await apiGet<{ signed_url: string }>(
    `/files/${document.id}/signed-url`,
  );

  const response = await fetch(signed_url);
  const blob = await response.blob();

  const url = URL.createObjectURL(blob);
  const a = window.document.createElement("a");
  a.href = url;
  a.download = document.original_name;
  window.document.body.appendChild(a);
  a.click();

  // Cleanup
  window.document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Delete a document from Supabase.
 * Also removes any project_documents junction rows (cascaded by FK or explicit).
 */
export async function deleteDocument(documentId: string): Promise<void> {
  const supabase = createClient();

  // Remove junction rows first
  const { error: junctionError } = await supabase
    .from("project_documents")
    .delete()
    .eq("file_id", documentId);

  if (junctionError) {
    console.error(
      "Failed to remove project links:",
      junctionError.message,
    );
    throw new Error("Failed to remove project links");
  }

  // Delete the file record
  const { error } = await supabase
    .from("files")
    .delete()
    .eq("id", documentId);

  if (error) {
    console.error("Failed to delete document:", error.message);
    throw new Error("Failed to delete document");
  }
}

/**
 * Toggle the is_global flag on a document.
 * Returns the updated is_global value.
 */
export async function toggleDocumentGlobal(
  documentId: string,
  isGlobal: boolean,
): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("files")
    .update({ is_global: isGlobal })
    .eq("id", documentId);

  if (error) {
    console.error("Failed to update document global status:", error.message);
    throw new Error("Failed to update document global status");
  }

  return isGlobal;
}

// ── Tag actions ─────────────────────────────────────────────────────────────

/**
 * Fetch all tags belonging to the current user.
 */
export async function getUserTags(): Promise<Tag[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to fetch tags:", error.message);
    throw new Error("Failed to fetch tags");
  }

  return data ?? [];
}

/**
 * Create a new tag for the current user.
 * Returns the created tag.
 */
export async function createTag(name: string, color: string): Promise<Tag> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("tags")
    .insert({ user_id: user.id, name, color })
    .select()
    .single();

  if (error) {
    console.error("Failed to create tag:", error.message);
    throw new Error("Failed to create tag");
  }

  return data;
}

/**
 * Delete a tag. Cascades to file_tags automatically.
 */
export async function deleteTag(tagId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("tags").delete().eq("id", tagId);

  if (error) {
    console.error("Failed to delete tag:", error.message);
    throw new Error("Failed to delete tag");
  }
}

/**
 * Add a tag to a document (insert into file_tags junction).
 */
export async function addTagToDocument(
  fileId: string,
  tagId: string,
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("file_tags")
    .upsert({ file_id: fileId, tag_id: tagId }, { onConflict: "file_id,tag_id", ignoreDuplicates: true });

  if (error) {
    console.error("Failed to add tag to document:", error.message);
    throw new Error("Failed to add tag to document");
  }
}

/**
 * Remove a tag from a document (delete from file_tags junction).
 */
export async function removeTagFromDocument(
  fileId: string,
  tagId: string,
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("file_tags")
    .delete()
    .eq("file_id", fileId)
    .eq("tag_id", tagId);

  if (error) {
    console.error("Failed to remove tag from document:", error.message);
    throw new Error("Failed to remove tag from document");
  }
}
