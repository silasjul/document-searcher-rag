"use server";

import { cache } from "react";
import { MOCK_CHATS, ChatSession } from "@/lib/mock-data";

export const getChatsForCase = cache(
  async (caseId: string): Promise<ChatSession[]> => {
    // In a real app: db.chat.findMany({ where: { caseId } })
    return MOCK_CHATS.filter((chat) => chat.caseId === caseId);
  }
);
