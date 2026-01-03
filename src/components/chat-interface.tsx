"use client";

import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCase } from "@/contexts/case-context";
import { IconFile, IconPaperclip, IconSend } from "@tabler/icons-react";

interface ChatInterfaceProps {
  caseId?: number;
  chatId?: number;
}

export function ChatInterface({ caseId, chatId }: ChatInterfaceProps) {
  const { caseData, setCaseId, setChatId } = useCase();

  useEffect(() => {
    if (caseId) {
      setCaseId(caseId);
    }
    if (chatId) {
      setChatId(chatId.toString());
    }
  }, [caseId, chatId, setCaseId, setChatId]);

  if (!caseData) {
    return <div>Case not found</div>;
  }

  return (
    <div className="@container/main flex flex-1 flex-col">
      {/* Case Header */}
      <div className="border-b bg-background px-4 py-4 lg:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-semibold truncate">
                {caseData.title}
              </h1>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-muted-foreground">
                Case ID: {caseData.id}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="shrink-0">
            <IconPaperclip className="h-4 w-4 mr-2" />
            Upload Documents
          </Button>
        </div>
      </div>

      {/* Documents Section */}
      <div className="border-b bg-muted/30 px-4 py-3 lg:px-6">
        <div className="flex items-center gap-2 text-sm">
          <IconFile className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Documents:</span>
          <Badge variant="outline" className="text-xs">
            3 files uploaded
          </Badge>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 lg:px-6">
        <div className="mx-auto max-w-3xl space-y-6"></div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-background px-4 py-4 lg:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Ask a question about the case documents..."
                className="pr-10"
              />
            </div>
            <Button size="icon" className="shrink-0">
              <IconSend className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground text-center">
            AI responses are generated based on uploaded documents. Always
            verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
