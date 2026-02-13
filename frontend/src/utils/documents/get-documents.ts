"use server";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Document } from "@/lib/types";

/**
 * Get all documents linked to a project via the project_documents junction table.
 */
export async function getDocumentsForProject(
  projectId: string,
): Promise<Document[]> {
  const supabase = await createClient();

  // Query the junction table and join the files data
  const { data, error } = await supabase
    .from("project_documents")
    .select("file_id, files(*)")
    .eq("project_id", projectId);

  if (error) {
    console.error("Failed to fetch project documents:", error.message);
    return [];
  }

  // Extract the nested file objects
  return (data ?? [])
    .map((row) => row.files as unknown as Document)
    .filter(Boolean);
}

/**
 * Get all documents belonging to the current user.
 */
export const getAllDocuments = cache(async (): Promise<Document[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("files")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch all documents:", error.message);
    return [];
  }

  return data ?? [];
});
