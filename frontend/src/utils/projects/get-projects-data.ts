"use server";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types";

export const getProjects = cache(async (): Promise<Project[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch projects:", error.message);
    return [];
  }

  return data ?? [];
});
