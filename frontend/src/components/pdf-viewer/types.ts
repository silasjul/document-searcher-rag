/**
 * PDF viewer types and constants.
 * Kept in a separate file so they can be imported without loading react-pdf/pdfjs
 * (which uses browser-only APIs like DOMMatrix and fails during SSR/prerender).
 */

/**
 * Represents a highlight region on a PDF page.
 * Coordinates are in PDF points (1/72 inch), relative to page origin (bottom-left).
 */
export interface PdfHighlight {
  id: string;
  pageNumber: number;
  /** X coordinate from left edge of page (in PDF points) */
  x: number;
  /** Y coordinate from bottom edge of page (in PDF points) */
  y: number;
  /** Width of highlight region (in PDF points) */
  width: number;
  /** Height of highlight region (in PDF points) */
  height: number;
  /** Optional highlight color (CSS color string) */
  color?: string;
  /** Optional label/tooltip for the highlight */
  label?: string;
}

/**
 * Sample highlights for demonstration.
 * In a real app, these would come from your RAG system with coordinates
 * extracted from the PDF text positions.
 */
export const SAMPLE_HIGHLIGHTS: PdfHighlight[] = [
  {
    id: "highlight-1",
    pageNumber: 1,
    x: 72,
    y: 700,
    width: 200,
    height: 20,
    color: "rgba(255, 235, 59, 0.5)",
    label: "Important finding",
  },
  {
    id: "highlight-2",
    pageNumber: 1,
    x: 72,
    y: 500,
    width: 300,
    height: 40,
    color: "rgba(76, 175, 80, 0.4)",
    label: "Key conclusion",
  },
  {
    id: "highlight-3",
    pageNumber: 2,
    x: 100,
    y: 600,
    width: 250,
    height: 30,
    color: "rgba(33, 150, 243, 0.4)",
    label: "Reference citation",
  },
];
