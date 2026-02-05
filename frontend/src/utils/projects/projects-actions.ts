"use server";

import { revalidatePath } from "next/cache";
import { MOCK_PROJECTS, type Project } from "@/lib/mock-data";

export async function updateProjectName(projectId: string, newName: string) {
  // Simulate database update
  // In a real application, this would be your database call:
  // await db.project.update({ where: { id: projectId }, data: { name: newName } });

  const projectIndex = MOCK_PROJECTS.findIndex((p) => p.id === projectId);
  if (projectIndex !== -1) {
    MOCK_PROJECTS[projectIndex].name = newName;
  }

  // Revalidate the dashboard to update the sidebar
  revalidatePath("/dashboard");
}

export async function createProject(data: {
  name: string;
  description: string;
  documentIds: string[];
}) {
  // Simulate database creation
  // In a real application, this would be your database call:
  // const newProject = await db.project.create({ data: { ...data, status: "active" } });
  // return newProject.id;

  const newProject: Project = {
    id: `project-${Date.now()}`,
    name: data.name,
    description: data.description,
    status: "active",
    documentIds: data.documentIds,
  };
  MOCK_PROJECTS.push(newProject);
  return newProject.id;
}

export async function addDocumentsToProject(
  projectId: string,
  documentIds: string[]
) {
  // Simulate database update
  // In a real application, this would be your database call:
  // await db.project.update({
  //   where: { id: projectId },
  //   data: { documentIds: { push: documentIds } }
  // });

  const projectIndex = MOCK_PROJECTS.findIndex((p) => p.id === projectId);
  if (projectIndex !== -1) {
    // Add new document IDs, avoiding duplicates
    const existingIds = new Set(MOCK_PROJECTS[projectIndex].documentIds);
    const newDocumentIds = documentIds.filter((id) => !existingIds.has(id));
    MOCK_PROJECTS[projectIndex].documentIds.push(...newDocumentIds);

    console.log(
      `[addDocumentsToProject] Added ${newDocumentIds.length} documents to project ${projectId}`
    );
  }

  // Revalidate the project page to show new documents
  revalidatePath(`/dashboard/project/${projectId}`);
}
