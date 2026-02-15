"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  IconUpload,
  IconLibrary,
  IconFileTypePdf,
} from "@tabler/icons-react";
import { Table, TableBody } from "@/components/ui/table";
import { DocumentSearchFilters } from "@/components/documents/document-search-filters";
import { DocumentTableHeader } from "@/components/documents/document-table-header";
import { NoFilterResults } from "@/components/documents/no-filter-results";
import { PaginationControls } from "@/components/documents/pagination-controls";
import { ProjectDocumentTableRow } from "./document-table-row";
import type { Document, Tag } from "@/lib/types";
import type { useDocumentFiltering } from "@/hooks/use-document-filtering";
import type { useDocumentSelection } from "@/hooks/use-document-selection";

interface ProjectDocumentsSectionProps {
  documents: Document[];
  projectId: string;
  userTags: Tag[];
  filtering: ReturnType<typeof useDocumentFiltering>;
  selection: ReturnType<typeof useDocumentSelection>;
  onUploadClick: () => void;
  onAddFromLibraryClick: () => void;
  onDocumentClick?: (documentId: string) => void;
  onDocumentRemoved: () => void;
  onDocumentUpdated: (doc: Document) => void;
  onTagCreated: (tag: Tag) => void;
  onTagDeleted: (tagId: string) => void;
}

export function ProjectDocumentsSection({
  documents,
  projectId,
  userTags,
  filtering,
  selection,
  onUploadClick,
  onAddFromLibraryClick,
  onDocumentClick,
  onDocumentRemoved,
  onDocumentUpdated,
  onTagCreated,
  onTagDeleted,
}: ProjectDocumentsSectionProps) {
  // Collect unique tags across all project documents for the tag filter dropdown
  const availableTags = useMemo(() => {
    const tagMap = new Map<string, Tag>();
    for (const doc of documents) {
      for (const tag of doc.tags) {
        if (!tagMap.has(tag.id)) tagMap.set(tag.id, tag);
      }
    }
    return [...tagMap.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [documents]);

  return (
    <div id="documents" className="scroll-mt-24">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Documents</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {documents.length} PDF file{documents.length !== 1 ? "s" : ""} in
            this project
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={onUploadClick}
          >
            <IconUpload className="h-4 w-4" />
            Upload PDF
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={onAddFromLibraryClick}
          >
            <IconLibrary className="h-4 w-4" />
            Add from Library
          </Button>
        </div>
      </div>

      {documents.length === 0 ? (
        <ProjectDocumentsEmptyState
          onUploadClick={onUploadClick}
          onAddFromLibraryClick={onAddFromLibraryClick}
        />
      ) : (
        <div className="space-y-4">
          <DocumentSearchFilters
            searchTerm={filtering.searchTerm}
            onSearchChange={filtering.updateSearch}
            statusFilter={filtering.statusFilter}
            onStatusFilterChange={filtering.updateStatusFilter}
            tagFilter={filtering.tagFilter}
            onTagFilterChange={filtering.updateTagFilter}
            tags={availableTags}
            hideTagFilterWhenEmpty
          />

          {filtering.filteredDocuments.length === 0 ? (
            <NoFilterResults onClearFilters={filtering.resetFilters} />
          ) : (
            <>
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <DocumentTableHeader
                    sortKey={filtering.sortKey}
                    sortDir={filtering.sortDir}
                    onSort={filtering.handleSort}
                    allPageSelected={selection.allPageSelected}
                    somePageSelected={selection.somePageSelected}
                    onSelectAll={selection.toggleSelectAll}
                    extraColumnWidth="w-12"
                  />
                  <TableBody>
                    {filtering.paginatedDocuments.map((doc) => (
                      <ProjectDocumentTableRow
                        key={doc.id}
                        document={doc}
                        projectId={projectId}
                        allTags={userTags}
                        selected={selection.selectedIds.has(doc.id)}
                        onSelectChange={(c) =>
                          selection.toggleSelect(doc.id, c)
                        }
                        onClick={() => onDocumentClick?.(doc.id)}
                        onRemoved={onDocumentRemoved}
                        onUpdated={onDocumentUpdated}
                        onTagCreated={onTagCreated}
                        onTagDeleted={onTagDeleted}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
              {filtering.filteredDocuments.length > filtering.pageSize && (
                <PaginationControls
                  pageIndex={filtering.safePageIndex}
                  pageCount={filtering.pageCount}
                  pageSize={filtering.pageSize}
                  totalItems={filtering.filteredDocuments.length}
                  onPageChange={filtering.setPageIndex}
                  onPageSizeChange={filtering.updatePageSize}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Private sub-component ──────────────────────────────────────────────────

function ProjectDocumentsEmptyState({
  onUploadClick,
  onAddFromLibraryClick,
}: {
  onUploadClick: () => void;
  onAddFromLibraryClick: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-muted/20 py-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground">
        <IconFileTypePdf className="h-7 w-7" strokeWidth={1.5} />
      </div>
      <h3 className="font-medium text-foreground">No documents yet</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Upload PDF files to analyze them with AI and extract insights.
      </p>
      <div className="mt-4 flex gap-2">
        <Button variant="outline" className="gap-2" onClick={onUploadClick}>
          <IconUpload className="h-4 w-4" />
          Upload PDF
        </Button>
        <Button
          variant="outline"
          className="gap-2"
          onClick={onAddFromLibraryClick}
        >
          <IconLibrary className="h-4 w-4" />
          Add from Library
        </Button>
      </div>
    </div>
  );
}
