"use server";

import { cache } from "react";
import { MOCK_PROJECTS } from "@/lib/mock-data";

export const getProject = cache(async (projectId: string) => {
  return MOCK_PROJECTS.find((p) => p.id === projectId);
});
