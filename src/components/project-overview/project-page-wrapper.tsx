"use client";

import { useState } from "react";
import { Project, ChatSession, Document } from "@/lib/mock-data";
import { Chat } from "@/components/chat";
import { ProjectOverview } from "@/components/project-overview/project-overview";
import { SplitViewLayout } from "@/components/pdf-viewer/split-view-layout";

interface ProjectPageWrapperProps {
  projectData: Project;
  chats: ChatSession[];
  documents: Document[];
  chatId?: string;
}

export function ProjectPageWrapper({
  projectData,
  chats,
  documents,
  chatId,
}: ProjectPageWrapperProps) {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null
  );

  if (chatId) {
    return (
      <div className="@container/main flex flex-1 flex-col h-full overflow-hidden">
        <Chat chatId={chatId} projectData={projectData} />
      </div>
    );
  }

  return (
    <div className="@container/main flex flex-1 flex-col h-full overflow-hidden">
      <SplitViewLayout
        selectedDocumentId={selectedDocumentId}
        onClose={() => setSelectedDocumentId(null)}
      >
        <ProjectOverview
          projectData={projectData}
          chats={chats}
          documents={documents}
          onDocumentClick={setSelectedDocumentId}
        />
      </SplitViewLayout>
    </div>
  );
}
