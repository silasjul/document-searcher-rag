"use client";

import { ReactNode } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { PdfViewer } from "./pdf-viewer";
import { Button } from "./ui/button";
import { IconX } from "@tabler/icons-react";

interface SplitViewLayoutProps {
  children: ReactNode;
  selectedDocumentId: string | null;
  onClose: () => void;
}

export function SplitViewLayout({
  children,
  selectedDocumentId,
  onClose,
}: SplitViewLayoutProps) {
  if (!selectedDocumentId) {
    return <>{children}</>;
  }

  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className="h-full w-full flex-1"
    >
      <ResizablePanel defaultSize={50} minSize={30}>
        {children}
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50} minSize={30} className="relative">
        <div className="absolute inset-0 overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 z-10 h-8 w-8 rounded-full bg-white/90 shadow-md hover:bg-white"
            onClick={onClose}
          >
            <IconX className="h-4 w-4" />
          </Button>
          <PdfViewer documentId={selectedDocumentId} />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
