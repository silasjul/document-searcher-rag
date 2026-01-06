"use server";

import { revalidatePath } from "next/cache";
import { MOCK_CASES, type Case } from "@/lib/mock-data";

export async function updateCaseName(caseId: string, newName: string) {
  // Simulate database update
  // In a real application, this would be your database call:
  // await db.case.update({ where: { id: caseId }, data: { name: newName } });

  const caseIndex = MOCK_CASES.findIndex((c) => c.id === caseId);
  if (caseIndex !== -1) {
    MOCK_CASES[caseIndex].name = newName;
  }

  // Revalidate the dashboard to update the sidebar
  revalidatePath("/dashboard");
}

export async function createCase(data: {
  name: string;
  clientName: string;
  documentIds: string[];
}) {
  // Simulate database creation
  // In a real application, this would be your database call:
  // const newCase = await db.case.create({ data: { ...data, status: "active" } });
  // return newCase.id;

  const newCase: Case = {
    id: `case-${Date.now()}`,
    name: data.name,
    clientName: data.clientName,
    status: "active",
    documentIds: data.documentIds,
  };

  MOCK_CASES.push(newCase);
  console.log(
    `[createCase] Created case ${newCase.id}. Total cases: ${MOCK_CASES.length}`
  );

  // Revalidate the dashboard to update the sidebar
  revalidatePath("/dashboard");

  return newCase.id;
}

export async function addDocumentsToCase(
  caseId: string,
  documentIds: string[]
) {
  // Simulate database update
  // In a real application, this would be your database call:
  // await db.case.update({
  //   where: { id: caseId },
  //   data: { documentIds: { push: documentIds } }
  // });

  const caseIndex = MOCK_CASES.findIndex((c) => c.id === caseId);
  if (caseIndex !== -1) {
    // Add new document IDs, avoiding duplicates
    const existingIds = new Set(MOCK_CASES[caseIndex].documentIds);
    const newDocumentIds = documentIds.filter((id) => !existingIds.has(id));
    MOCK_CASES[caseIndex].documentIds.push(...newDocumentIds);

    console.log(
      `[addDocumentsToCase] Added ${newDocumentIds.length} documents to case ${caseId}`
    );
  }

  // Revalidate the case page to show new documents
  revalidatePath(`/dashboard/case/${caseId}`);
}
