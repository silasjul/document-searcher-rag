"use server";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types";

export const getProject = cache(
  async (projectId: string): Promise<Project | undefined> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (error) {
      console.error("Failed to fetch project:", error.message);
      return undefined;
    }

    return data ?? undefined;
  },
);
