"use client";

import { useState } from "react";
import { Case, ChatSession, Document } from "@/lib/mock-data";
import { Chat } from "@/components/chat";
import { CaseOverview } from "@/components/case-overview/case-overview";
import { SplitViewLayout } from "@/components/pdf-viewer/split-view-layout";

interface CasePageWrapperProps {
  caseData: Case;
  chats: ChatSession[];
  documents: Document[];
  chatId?: string;
}

export function CasePageWrapper({
  caseData,
  chats,
  documents,
  chatId,
}: CasePageWrapperProps) {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null
  );

  if (chatId) {
    return (
      <div className="@container/main flex flex-1 flex-col h-full overflow-hidden">
        <Chat chatId={chatId} caseData={caseData} />
      </div>
    );
  }

  return (
    <div className="@container/main flex flex-1 flex-col h-full overflow-hidden">
      <SplitViewLayout
        selectedDocumentId={selectedDocumentId}
        onClose={() => setSelectedDocumentId(null)}
      >
        <CaseOverview
          caseData={caseData}
          chats={chats}
          documents={documents}
          onDocumentClick={setSelectedDocumentId}
        />
      </SplitViewLayout>
    </div>
  );
}
