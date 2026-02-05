"use server";

import { cache } from "react";
import { MOCK_CHATS, ChatSession } from "@/lib/mock-data";

export const getChatsForProject = cache(
  async (projectId: string): Promise<ChatSession[]> => {
    // In a real app: db.chat.findMany({ where: { projectId } })
    return MOCK_CHATS.filter((chat) => chat.projectId === projectId);
  }
);
