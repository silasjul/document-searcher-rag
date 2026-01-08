"use server";

import { cache } from "react";
import { MOCK_PROJECTS } from "@/lib/mock-data";

export const getProjects = cache(async () => {
  return MOCK_PROJECTS;
});
