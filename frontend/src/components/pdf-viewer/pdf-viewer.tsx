"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  RotateCw,
  Loader2,
  Minus,
  Plus,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface PdfViewerProps {
  documentId: string;
  onClose?: () => void;
}

export function PdfViewer({ onClose }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [inputValue, setInputValue] = useState<string>("1");
  const [pageDimensions, setPageDimensions] = useState<
    Record<number, { width: number; height: number }>
  >({});

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const fileUrl = "/test.pdf";

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
    setInputValue("1");
  }

  // Handle intersection observer to update current page on scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || numPages === 0) return;

    const options = {
      root: container,
      rootMargin: "0px 0px -50% 0px", // Trigger when page is in the top half of the container
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const pageNum = parseInt(
            entry.target.getAttribute("data-page-number") || "1"
          );
          setPageNumber(pageNum);
          setInputValue(String(pageNum));
        }
      });
    }, options);

    // Observe all page wrappers
    const pages = container.querySelectorAll(".pdf-page-wrapper");
    pages.forEach((page) => {
      observerRef.current?.observe(page);
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [numPages]);

  function scrollToPage(page: number) {
    if (page < 1 || page > numPages) return;

    const pageElement = document.getElementById(`pdf-page-${page}`);
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: "smooth" });
      setPageNumber(page);
      setInputValue(String(page));
    }
  }

  function changePage(offset: number) {
    const newPage = pageNumber + offset;
    scrollToPage(newPage);
  }

  function handlePageInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
  }

  function handlePageInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const page = parseInt(inputValue);
      if (!isNaN(page) && page >= 1 && page <= numPages) {
        scrollToPage(page);
      } else {
        setInputValue(String(pageNumber));
      }
    }
  }

  function handlePageInputBlur() {
    const page = parseInt(inputValue);
    if (!isNaN(page) && page >= 1 && page <= numPages) {
      scrollToPage(page);
    } else {
      setInputValue(String(pageNumber));
    }
  }

  const onPageLoadSuccess = useCallback(
    (page: {
      pageNumber: number;
      originalWidth: number;
      originalHeight: number;
    }) => {
      setPageDimensions((prev) => {
        if (
          prev[page.pageNumber] &&
          prev[page.pageNumber].width === page.originalWidth &&
          prev[page.pageNumber].height === page.originalHeight
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

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background text-foreground">
      {/* Toolbar */}
      <div className="flex h-14 items-center justify-between gap-2 border-b bg-muted/40 px-4 py-2 shadow-sm">
        {/* Left: Search Hint */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="cursor-default text-muted-foreground hover:text-foreground hover:bg-transparent"
              >
                <Search className="h-4 w-4" />
                <span className="sr-only">Search (Ctrl + F)</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Use your browser&apos;s search (Ctrl + F or Cmd + F)</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Center: Pagination */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => changePage(-1)}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous Page</span>
          </Button>

          <div className="flex items-center gap-1 text-sm">
            <Input
              value={inputValue}
              onChange={handlePageInputChange}
              onKeyDown={handlePageInputKeyDown}
              onBlur={handlePageInputBlur}
              className="h-8 w-12 px-1 text-center"
            />
            <span className="text-muted-foreground">/ {numPages || "--"}</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => changePage(1)}
            disabled={pageNumber >= numPages}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next Page</span>
          </Button>
        </div>

        {/* Right: Zoom & Rotate & Close */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
              >
                <Minus className="h-4 w-4" />
                <span className="sr-only">Zoom Out</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom Out</TooltipContent>
          </Tooltip>

          <span className="w-12 text-center text-sm">
            {Math.round(scale * 100)}%
          </span>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setScale((s) => Math.min(2.5, s + 0.1))}
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only">Zoom In</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom In</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="mx-1 h-6" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setRotation((r) => (r + 90) % 360)}
              >
                <RotateCw className="h-4 w-4" />
                <span className="sr-only">Rotate</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Rotate</TooltipContent>
          </Tooltip>

          {onClose && (
            <>
              <Separator orientation="vertical" className="mx-1 h-6" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Close</TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div
        ref={scrollContainerRef}
        className="flex flex-1 flex-col items-center overflow-auto bg-muted/20 p-8"
      >
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          }
          className="flex flex-col gap-4"
        >
          {numPages > 0 &&
            Array.from(new Array(numPages), (el, index) => (
              <div
                key={`page_${index + 1}`}
                id={`pdf-page-${index + 1}`}
                data-page-number={index + 1}
                className="pdf-page-wrapper shadow-lg"
              >
                <Page
                  pageNumber={index + 1}
                  scale={scale}
                  rotate={rotation}
                  className="bg-white"
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  onLoadSuccess={onPageLoadSuccess}
                  loading={
                    <div
                      className="flex items-center justify-center bg-white text-muted-foreground"
                      style={{
                        width: pageDimensions[index + 1]
                          ? pageDimensions[index + 1].width * scale
                          : "100%",
                        height: pageDimensions[index + 1]
                          ? pageDimensions[index + 1].height * scale
                          : "800px",
                      }}
                    >
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  }
                />
              </div>
            ))}
        </Document>
      </div>
    </div>
  );
}
