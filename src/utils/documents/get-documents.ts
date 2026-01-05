"use server";

import { cache } from "react";
import { MOCK_DOCUMENTS, Document } from "@/lib/mock-data";

export const getDocumentsForCase = cache(
  async (caseId: string): Promise<Document[]> => {
    // In a real app: db.document.findMany({ where: { caseId } })
    return MOCK_DOCUMENTS.filter((doc) => doc.caseId === caseId);
  }
);
