"use server";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { ChatSession } from "@/lib/types";

export const getChatsForProject = cache(
  async (projectId: string): Promise<ChatSession[]> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("project_id", projectId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch chats:", error.message);
      return [];
    }

    return data ?? [];
  },
);
