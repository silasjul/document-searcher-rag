"use client";

import { useState, useCallback, useRef } from "react";
import { Project, ChatSession, Document } from "@/lib/types";
import { Chat } from "@/components/chat";
import { ProjectOverview } from "@/components/project-overview/project-overview";
import { SplitViewLayout } from "@/components/pdf-viewer/split-view-layout";
import { apiGet } from "@/lib/api-client";

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
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  const signedUrlCache = useRef<Map<string, string>>(new Map());

  const handleDocumentClick = useCallback(
    async (documentId: string) => {
      if (selectedDocumentId === documentId) return;

      setSelectedDocumentId(documentId);

      const cached = signedUrlCache.current.get(documentId);
      if (cached) {
        setSelectedFileUrl(cached);
        return;
      }

      setSelectedFileUrl(null);

      try {
        const { signed_url } = await apiGet<{ signed_url: string }>(
          `/files/${documentId}/signed-url`,
        );
        signedUrlCache.current.set(documentId, signed_url);
        setSelectedFileUrl(signed_url);
      } catch (err) {
        console.error("Failed to get signed URL:", err);
      }
    },
    [selectedDocumentId],
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
        fileUrl={selectedFileUrl}
        onClose={() => {
          setSelectedDocumentId(null);
          setSelectedFileUrl(null);
        }}
      >
        <ProjectOverview
          projectData={projectData}
          chats={chats}
          documents={documents}
          onDocumentClick={handleDocumentClick}
        />
      </SplitViewLayout>
    </div>
  );
}
