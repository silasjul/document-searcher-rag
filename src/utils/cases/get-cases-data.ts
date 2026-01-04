"use server";

import { cache } from "react";
import { MOCK_CASES } from "@/lib/mock-data";

export const getCases = cache(async () => {
  return MOCK_CASES;
});
