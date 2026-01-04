"use server";

import { cache } from "react";
import { MOCK_CASES } from "@/lib/mock-data";

export const getCase = cache(async (caseId: string) => {
  return MOCK_CASES.find((c) => c.id === caseId);
});
