"use server";

import { cache } from "react";
import {
  MOCK_DOCUMENTS,
  Document,
  MOCK_PROJECTS,
} from "@/lib/mock-data";

// Helper function to get documents for a project
export async function getDocumentsForProject(projectId: string): Promise<Document[]> {
  const projectData = MOCK_PROJECTS.find((p) => p.id === projectId);
  if (!projectData) return [];
  return MOCK_DOCUMENTS.filter((doc) => projectData.documentIds.includes(doc.id));
}

export const getAllDocuments = cache(async (): Promise<Document[]> => {
  // In a real app: db.document.findMany()
  return MOCK_DOCUMENTS;
});
