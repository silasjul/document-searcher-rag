"use client";

import { ReactNode, useRef, useMemo } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import dynamic from "next/dynamic";
import type { PdfHighlight } from "./types";
import type { PdfViewerRef } from "./pdf-viewer";

const PdfViewer = dynamic(
  () => import("./pdf-viewer").then((mod) => mod.PdfViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Loading PDF Viewer...
      </div>
    ),
  }
);

interface SplitViewLayoutProps {
  children: ReactNode;
  selectedDocumentId: string | null;
  onClose: () => void;
  /** Optional highlights to display on the PDF */
  highlights?: PdfHighlight[];
  /** Optional: scroll to this highlight when opening */
  initialHighlightId?: string;
  /** Callback when a highlight is clicked */
  onHighlightClick?: (highlight: PdfHighlight) => void;
}

export function SplitViewLayout({
  children,
  selectedDocumentId,
  onClose,
  highlights = [],
  initialHighlightId,
  onHighlightClick,
}: SplitViewLayoutProps) {
  const viewerRef = useRef<PdfViewerRef>(null);

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
          <PdfViewer
            ref={viewerRef}
            fileUrl="/test.pdf"
            highlights={highlights}
            initialHighlightId={initialHighlightId}
            onHighlightClick={onHighlightClick}
            onClose={onClose}
          />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

// =============================================================================
// EXAMPLE: How to use highlights with the split view
// =============================================================================

/**
 * Example component showing how to integrate PDF highlights with a chat/search interface.
 * 
 * In a RAG system, you would:
 * 1. Get search results with text snippets and their PDF coordinates
 * 2. Convert those to PdfHighlight objects
 * 3. Pass them to SplitViewLayout
 * 4. When user clicks a search result, call scrollToHighlight()
 */
export function SplitViewExample() {
  const viewerRef = useRef<PdfViewerRef>(null);

  // Example: Highlights from RAG search results
  // These coordinates would come from your PDF text extraction
  const searchResultHighlights: PdfHighlight[] = useMemo(
    () => [
      {
        id: "result-1",
        pageNumber: 1,
        x: 72, // PDF points from left edge
        y: 680, // PDF points from bottom (PDF coordinate system)
        width: 400,
        height: 24,
        color: "rgba(255, 235, 59, 0.5)", // Yellow
        label: "Machine learning fundamentals",
      },
      {
        id: "result-2",
        pageNumber: 1,
        x: 72,
        y: 450,
        width: 350,
        height: 48,
        color: "rgba(76, 175, 80, 0.4)", // Green
        label: "Neural network architecture",
      },
      {
        id: "result-3",
        pageNumber: 2,
        x: 100,
        y: 600,
        width: 280,
        height: 32,
        color: "rgba(33, 150, 243, 0.4)", // Blue
        label: "Training methodology",
      },
    ],
    []
  );

  // Handler for when user clicks a search result in the sidebar
  const handleSearchResultClick = (highlightId: string) => {
    viewerRef.current?.scrollToHighlight(highlightId);
  };

  // Handler for when user clicks a highlight in the PDF
  const handleHighlightClick = (highlight: PdfHighlight) => {
    console.log("User clicked highlight:", highlight.label);
    // You could show a popover, copy text, etc.
  };

  return (
    <div className="h-screen flex">
      {/* Search Results Sidebar */}
      <div className="w-80 border-r bg-background flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Search Results</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Click a result to jump to it in the PDF
          </p>
        </div>
        <div className="flex-1 overflow-auto p-2 space-y-2">
          {searchResultHighlights.map((highlight) => (
            <button
              key={highlight.id}
              onClick={() => handleSearchResultClick(highlight.id)}
              className="w-full text-left p-3 rounded-lg border hover:bg-muted transition-colors"
            >
              <div className="flex items-start gap-2">
                <div
                  className="w-3 h-3 rounded-full mt-1 shrink-0"
                  style={{ backgroundColor: highlight.color }}
                />
                <div>
                  <div className="font-medium text-sm">{highlight.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Page {highlight.pageNumber}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1">
        <PdfViewer
          ref={viewerRef}
          fileUrl="/test.pdf"
          highlights={searchResultHighlights}
          onHighlightClick={handleHighlightClick}
        />
      </div>
    </div>
  );
}
