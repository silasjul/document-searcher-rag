"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProjectName(projectId: string, newName: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("projects")
    .update({ name: newName })
    .eq("id", projectId);

  if (error) {
    console.error("Failed to update project name:", error.message);
    throw new Error("Failed to update project name");
  }

  revalidatePath("/dashboard");
}

export async function createProject(data: {
  name: string;
  description: string;
  documentIds: string[];
}): Promise<string> {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Not authenticated");
  }

  // Create the project
  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name: data.name,
      description: data.description,
      status: "active",
    })
    .select("id")
    .single();

  if (error || !project) {
    console.error("Failed to create project:", error?.message);
    throw new Error("Failed to create project");
  }

  // Link documents to the project via the junction table
  if (data.documentIds.length > 0) {
    const rows = data.documentIds.map((fileId) => ({
      project_id: project.id,
      file_id: fileId,
    }));

    const { error: linkError } = await supabase
      .from("project_documents")
      .insert(rows);

    if (linkError) {
      console.error("Failed to link documents:", linkError.message);
      // Project was created, just log the error
    }
  }

  revalidatePath("/dashboard");
  return project.id;
}

export async function addDocumentsToProject(
  projectId: string,
  documentIds: string[],
) {
  if (documentIds.length === 0) return;

  const supabase = await createClient();

  const rows = documentIds.map((fileId) => ({
    project_id: projectId,
    file_id: fileId,
  }));

  // upsert with onConflict to avoid duplicates
  const { error } = await supabase
    .from("project_documents")
    .upsert(rows, { onConflict: "project_id,file_id", ignoreDuplicates: true });

  if (error) {
    console.error("Failed to add documents to project:", error.message);
    throw new Error("Failed to add documents to project");
  }

  revalidatePath(`/dashboard/project/${projectId}`);
}
