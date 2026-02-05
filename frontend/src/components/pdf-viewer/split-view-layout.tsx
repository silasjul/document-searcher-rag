"use client";

import { ReactNode } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "../ui/button";
import { IconX } from "@tabler/icons-react";
import dynamic from "next/dynamic";

const PdfViewer = dynamic(
  () => import("./pdf-viewer").then((mod) => mod.PdfViewer),
  {
    ssr: false,
    loading: () => <p>Loading PDF Viewer...</p>,
  }
);

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
          <PdfViewer documentId={selectedDocumentId} onClose={onClose} />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
