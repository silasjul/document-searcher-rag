"use client";

import type { ChatSession } from "@/lib/types";
import { ConversationCard } from "./conversation-card";
import { EmptyState } from "./empty-state";

interface ConversationsSectionProps {
  chats: ChatSession[];
  projectId: string;
}

export function ConversationsSection({
  chats,
  projectId,
}: ConversationsSectionProps) {
  const sortedChats = [...chats].sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  );

  return (
    <div id="conversations" className="scroll-mt-24">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          Recent Conversations
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Continue where you left off or start something new
        </p>
      </div>

      {chats.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedChats.map((chat, index) => (
            <div key={chat.id}>
              <ConversationCard
                chat={chat}
                projectId={projectId}
                index={index}
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState projectId={projectId} />
      )}
    </div>
  );
}
