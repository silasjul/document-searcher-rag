"use server";

import { revalidatePath } from "next/cache";
import { MOCK_CASES } from "@/lib/mock-data";

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
