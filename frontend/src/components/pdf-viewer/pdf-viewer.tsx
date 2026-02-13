"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
  memo,
} from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Minus,
  Plus,
  RotateCw,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { SAMPLE_HIGHLIGHTS, type PdfHighlight } from "./types";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Custom styles to ensure highlights are interactive above the text layer
const pdfViewerStyles = `
  .pdf-page-wrapper .react-pdf__Page__textContent {
    pointer-events: none !important;
  }
  .pdf-page-wrapper .react-pdf__Page__annotations {
    pointer-events: none !important;
  }
`;

// Use legacy worker to match the legacy pdfjs build (avoids Node.js compatibility warnings)
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

// Re-export for convenience (actual definition in ./types)
export type { PdfHighlight } from "./types";

export interface PdfViewerProps {
  /** URL or path to the PDF file */
  fileUrl?: string;
  /** Array of highlights to render on the PDF */
  highlights?: PdfHighlight[];
  /** Callback when a highlight is clicked */
  onHighlightClick?: (highlight: PdfHighlight) => void;
  /** Initial page to display */
  initialPage?: number;
  /** Initial highlight to scroll to */
  initialHighlightId?: string;
  /** Callback when viewer is closed */
  onClose?: () => void;
  /** Custom class name */
  className?: string;
}

export interface PdfViewerRef {
  /** Scroll to a specific page */
  scrollToPage: (page: number) => void;
  /** Scroll to a specific highlight by ID */
  scrollToHighlight: (highlightId: string) => void;
  /** Get current page number */
  getCurrentPage: () => number;
  /** Set zoom level (0.5 - 2.5) */
  setZoom: (scale: number) => void;
}

// ============================================================================
// Highlight Overlay Component
// ============================================================================

interface HighlightOverlayProps {
  highlights: PdfHighlight[];
  pageNumber: number;
  scale: number;
  pageHeight: number;
  activeHighlightId?: string;
  onHighlightClick?: (highlight: PdfHighlight) => void;
}

const HighlightOverlay = memo(function HighlightOverlay({
  highlights,
  pageNumber,
  scale,
  pageHeight,
  activeHighlightId,
  onHighlightClick,
}: HighlightOverlayProps) {
  const pageHighlights = useMemo(
    () => highlights.filter((h) => h.pageNumber === pageNumber),
    [highlights, pageNumber]
  );

  if (pageHighlights.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
      {pageHighlights.map((highlight) => {
        // Convert PDF coordinates (origin bottom-left) to screen coordinates (origin top-left)
        const screenY = pageHeight - highlight.y - highlight.height;

        const highlightElement = (
          <div
            data-highlight-id={highlight.id}
            className={cn(
              "absolute pointer-events-auto cursor-pointer",
              "transition-all duration-200 ease-out",
              "hover:brightness-110 hover:scale-[1.02] hover:shadow-lg hover:z-10",
              "hover:ring-2 hover:ring-primary/70 hover:ring-offset-2",
              activeHighlightId === highlight.id &&
                "ring-2 ring-primary ring-offset-2 brightness-110 scale-[1.02] shadow-lg z-10"
            )}
            style={{
              left: highlight.x * scale,
              top: screenY * scale,
              width: highlight.width * scale,
              height: highlight.height * scale,
              backgroundColor: highlight.color || "rgba(255, 235, 59, 0.4)",
              borderRadius: 4,
            }}
            onClick={() => onHighlightClick?.(highlight)}
          />
        );

        // Wrap with tooltip if label exists
        if (highlight.label) {
          return (
            <Tooltip key={highlight.id}>
              <TooltipTrigger asChild>{highlightElement}</TooltipTrigger>
              <TooltipContent side="top" sideOffset={8}>
                <span className="font-medium">{highlight.label}</span>
                <span className="text-muted-foreground ml-2">
                  Page {highlight.pageNumber}
                </span>
              </TooltipContent>
            </Tooltip>
          );
        }

        return <div key={highlight.id}>{highlightElement}</div>;
      })}
    </div>
  );
});

// ============================================================================
// PDF Page Component (Memoized)
// ============================================================================

interface PdfPageWrapperProps {
  pageNumber: number;
  scale: number;
  rotation: number;
  highlights: PdfHighlight[];
  activeHighlightId?: string;
  pageDimensions?: { width: number; height: number };
  onPageLoadSuccess: (page: {
    pageNumber: number;
    originalWidth: number;
    originalHeight: number;
  }) => void;
  onHighlightClick?: (highlight: PdfHighlight) => void;
}

const PdfPageWrapper = memo(function PdfPageWrapper({
  pageNumber,
  scale,
  rotation,
  highlights,
  activeHighlightId,
  pageDimensions,
  onPageLoadSuccess,
  onHighlightClick,
}: PdfPageWrapperProps) {
  return (
    <div
      id={`pdf-page-${pageNumber}`}
      data-page-number={pageNumber}
      className="pdf-page-wrapper relative shadow-lg"
    >
      <Page
        pageNumber={pageNumber}
        scale={scale}
        rotate={rotation}
        className="bg-white"
        renderTextLayer={true}
        renderAnnotationLayer={true}
        onLoadSuccess={onPageLoadSuccess}
        loading={
          <div
            className="flex flex-col items-center justify-center bg-white gap-3"
            style={{
              width: pageDimensions ? pageDimensions.width * scale : "100%",
              height: pageDimensions ? pageDimensions.height * scale : 800,
            }}
          >
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground/60">
              Rendering pages...
            </p>
          </div>
        }
      />
      {pageDimensions && (
        <HighlightOverlay
          highlights={highlights}
          pageNumber={pageNumber}
          scale={scale}
          pageHeight={pageDimensions.height}
          activeHighlightId={activeHighlightId}
          onHighlightClick={onHighlightClick}
        />
      )}
    </div>
  );
});

// ============================================================================
// Main PDF Viewer Component
// ============================================================================

export const PdfViewer = forwardRef<PdfViewerRef, PdfViewerProps>(
  function PdfViewer(
    {
      fileUrl = "/test.pdf",
      highlights = [],
      onHighlightClick,
      initialPage = 1,
      initialHighlightId,
      onClose,
      className,
    },
    ref
  ) {
    const [numPages, setNumPages] = useState(0);
    const [pageNumber, setPageNumber] = useState(initialPage);
    const [scale, setScale] = useState(1.0);
    const [rotation, setRotation] = useState(0);
    const [activeHighlightId, setActiveHighlightId] = useState<
      string | undefined
    >(initialHighlightId);
    const [pageDimensions, setPageDimensions] = useState<
      Record<number, { width: number; height: number }>
    >({});

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    // ========================================================================
    // Imperative Handle (exposed methods)
    // ========================================================================

    const scrollToPage = useCallback(
      (page: number) => {
        if (page < 1 || page > numPages) return;
        const pageElement = document.getElementById(`pdf-page-${page}`);
        if (pageElement) {
          pageElement.scrollIntoView({ behavior: "smooth", block: "start" });
          setPageNumber(page);
        }
      },
      [numPages]
    );

    const scrollToHighlight = useCallback(
      (highlightId: string) => {
        const highlight = highlights.find((h) => h.id === highlightId);
        if (!highlight) return;

        setActiveHighlightId(highlightId);

        // First scroll to the page
        const pageElement = document.getElementById(
          `pdf-page-${highlight.pageNumber}`
        );
        if (pageElement) {
          pageElement.scrollIntoView({ behavior: "smooth", block: "center" });
          setPageNumber(highlight.pageNumber);

          // Then scroll to the highlight within the page (with a small delay for page scroll)
          setTimeout(() => {
            const highlightElement = document.querySelector(
              `[data-highlight-id="${highlightId}"]`
            );
            if (highlightElement) {
              highlightElement.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }
          }, 300);
        }
      },
      [highlights]
    );

    useImperativeHandle(
      ref,
      () => ({
        scrollToPage,
        scrollToHighlight,
        getCurrentPage: () => pageNumber,
        setZoom: (newScale: number) =>
          setScale(Math.max(0.5, Math.min(2.5, newScale))),
      }),
      [scrollToPage, scrollToHighlight, pageNumber]
    );

    // ========================================================================
    // Document Load Handler
    // ========================================================================

    const onDocumentLoadSuccess = useCallback(
      ({ numPages: pages }: { numPages: number }) => {
        setNumPages(pages);
        setPageNumber(initialPage);

        // If there's an initial highlight, scroll to it after load
        if (initialHighlightId) {
          setTimeout(() => scrollToHighlight(initialHighlightId), 500);
        }
      },
      [initialPage, initialHighlightId, scrollToHighlight]
    );

    // ========================================================================
    // Page Load Handler
    // ========================================================================

    const onPageLoadSuccess = useCallback(
      (page: {
        pageNumber: number;
        originalWidth: number;
        originalHeight: number;
      }) => {
        setPageDimensions((prev) => {
          const existing = prev[page.pageNumber];
          if (
            existing?.width === page.originalWidth &&
            existing?.height === page.originalHeight
          ) {
            return prev;
          }
          return {
            ...prev,
            [page.pageNumber]: {
              width: page.originalWidth,
              height: page.originalHeight,
            },
          };
        });
      },
      []
    );

    // ========================================================================
    // Intersection Observer for Page Tracking
    // ========================================================================

    useEffect(() => {
      const container = scrollContainerRef.current;
      if (!container || numPages === 0) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const pageNum = parseInt(
                entry.target.getAttribute("data-page-number") || "1"
              );
              setPageNumber(pageNum);
            }
          });
        },
        {
          root: container,
          rootMargin: "0px 0px -50% 0px",
          threshold: 0,
        }
      );

      const pages = container.querySelectorAll(".pdf-page-wrapper");
      pages.forEach((page) => observerRef.current?.observe(page));

      return () => observerRef.current?.disconnect();
    }, [numPages]);

    // ========================================================================
    // Highlight Click Handler
    // ========================================================================

    const handleHighlightClick = useCallback(
      (highlight: PdfHighlight) => {
        setActiveHighlightId(highlight.id);
        onHighlightClick?.(highlight);
      },
      [onHighlightClick]
    );

    // ========================================================================
    // Zoom Handlers
    // ========================================================================

    const zoomIn = useCallback(
      () => setScale((s) => Math.min(2.5, s + 0.25)),
      []
    );
    const zoomOut = useCallback(
      () => setScale((s) => Math.max(0.5, s - 0.25)),
      []
    );
    const resetZoom = useCallback(() => setScale(1.0), []);

    // ========================================================================
    // Render
    // ========================================================================

    return (
      <div
        className={cn(
          "flex h-full w-full flex-col overflow-hidden bg-background",
          className
        )}
      >
        {/* Inject styles to make highlights interactive */}
        <style dangerouslySetInnerHTML={{ __html: pdfViewerStyles }} />
        
        {/* Simplified Toolbar */}
        <div className="flex h-12 items-center justify-between border-b bg-muted/30 px-3">
          {/* Left: Page Navigation */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => scrollToPage(pageNumber - 1)}
              disabled={pageNumber <= 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm tabular-nums min-w-16 text-center">
              {pageNumber} / {numPages || "-"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => scrollToPage(pageNumber + 1)}
              disabled={pageNumber >= numPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Center: Zoom Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={zoomOut}
              disabled={scale <= 0.5}
              className="h-8 w-8 p-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetZoom}
              className="h-8 px-2 text-xs tabular-nums"
            >
              {Math.round(scale * 100)}%
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={zoomIn}
              disabled={scale >= 2.5}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="h-8 w-8 p-0"
              title="Rotate"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* PDF Content */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-auto bg-muted/10 p-6"
        >
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex flex-col items-center justify-center gap-3 min-h-[calc(100vh-10rem)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground/60">
                  Loading pages...
                </p>
              </div>
            }
            className="flex flex-col items-center gap-4 min-h-full"
          >
            {numPages > 0 &&
              Array.from({ length: numPages }, (_, index) => (
                <PdfPageWrapper
                  key={index + 1}
                  pageNumber={index + 1}
                  scale={scale}
                  rotation={rotation}
                  highlights={highlights}
                  activeHighlightId={activeHighlightId}
                  pageDimensions={pageDimensions[index + 1]}
                  onPageLoadSuccess={onPageLoadSuccess}
                  onHighlightClick={handleHighlightClick}
                />
              ))}
          </Document>
        </div>
      </div>
    );
  }
);

// Re-export for convenience (actual definition in ./types)
export { SAMPLE_HIGHLIGHTS } from "./types";

/**
 * Demo component showing how to use the PDF viewer with highlights.
 */
export function PdfViewerDemo() {
  const viewerRef = useRef<PdfViewerRef>(null);

  const handleHighlightClick = (highlight: PdfHighlight) => {
    console.log("Highlight clicked:", highlight);
  };

  return (
    <div className="h-screen flex">
      {/* Sidebar with highlight list */}
      <div className="w-64 border-r bg-background p-4">
        <h3 className="font-semibold mb-4">Highlights</h3>
        <div className="space-y-2">
          {SAMPLE_HIGHLIGHTS.map((h) => (
            <button
              key={h.id}
              onClick={() => viewerRef.current?.scrollToHighlight(h.id)}
              className="w-full text-left p-2 rounded hover:bg-muted text-sm"
            >
              <div className="font-medium">{h.label}</div>
              <div className="text-muted-foreground text-xs">
                Page {h.pageNumber}
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
          highlights={SAMPLE_HIGHLIGHTS}
          onHighlightClick={handleHighlightClick}
        />
      </div>
    </div>
  );
}
