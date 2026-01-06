"use server";

import { cache } from "react";
import { MOCK_CASES } from "@/lib/mock-data";

export const getCase = cache(async (caseId: string) => {
  console.log(
    `[getCase] Fetching case ${caseId}. Total cases available: ${MOCK_CASES.length}`
  );
  const foundCase = MOCK_CASES.find((c) => c.id === caseId);
  if (!foundCase) {
    console.log(
      `[getCase] Case ${caseId} NOT FOUND. IDs available: ${MOCK_CASES.map(
        (c) => c.id
      ).join(", ")}`
    );
  }
  return foundCase;
});
