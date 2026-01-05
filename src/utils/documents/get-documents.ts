"use server";

import { cache } from "react";
import {
  MOCK_DOCUMENTS,
  Document,
  MOCK_CASES,
} from "@/lib/mock-data";

// Helper function to get documents for a case
export async function getDocumentsForCase(caseId: string): Promise<Document[]> {
  const caseData = MOCK_CASES.find((c) => c.id === caseId);
  if (!caseData) return [];
  return MOCK_DOCUMENTS.filter((doc) => caseData.documentIds.includes(doc.id));
}

export const getAllDocuments = cache(async (): Promise<Document[]> => {
  // In a real app: db.document.findMany()
  return MOCK_DOCUMENTS;
});
