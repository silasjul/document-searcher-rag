"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import {
  IconFileText,
  IconCheck,
  IconClock,
  IconAlertTriangle,
  IconLibrary,
  IconWorld,
  IconDownload,
  IconTrash,
  IconWorldOff,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Document, Tag } from "@/lib/types";
import { formatFileSize } from "@/lib/utils";
import { Table, TableBody } from "@/components/ui/table";
import { StatCard } from "@/components/documents/stat-card";
import { DocumentTableRow } from "@/components/documents/document-table-row";
import { DocumentTableHeader } from "@/components/documents/document-table-header";
import { DocumentSearchFilters } from "@/components/documents/document-search-filters";
import { DocumentsPageHeader } from "@/components/documents/documents-page-header";
import { NoFilterResults } from "@/components/documents/no-filter-results";
import { BulkActionBar } from "@/components/documents/bulk-action-bar";
import { EmptyState } from "@/components/documents/empty-state";
import { UploadDialog } from "@/components/documents/upload-dialog";
import { PaginationControls } from "@/components/documents/pagination-controls";
import { SplitViewLayout } from "@/components/pdf-viewer/split-view-layout";
import {
  downloadDocument,
  bulkDownloadDocuments,
  deleteDocument,
  toggleDocumentGlobal,
} from "@/utils/documents/document-actions";
import {
  SAMPLE_HIGHLIGHTS,
  type PdfHighlight,
} from "@/components/pdf-viewer/types";
import { apiGet } from "@/lib/api-client";
import { toast } from "sonner";
import { useDocuments, useUserTags } from "@/hooks/use-documents";
import { useDocumentFiltering } from "@/hooks/use-document-filtering";
import { useDocumentSelection } from "@/hooks/use-document-selection";

// ── Page component ──────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const {
    documents,
    isLoading: isDocsLoading,
    mutate: mutateDocs,
  } = useDocuments();
  const { tags: userTags, mutate: mutateTags } = useUserTags();

  const [activeTab, setActiveTab] = useState<"library" | "global">("library");
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null,
  );
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Cache signed URLs for the lifetime of the page (URLs are valid for 1 hour)
  const signedUrlCache = useRef<Map<string, string>>(new Map());

  // Separate documents into library and global
  const libraryDocuments = useMemo(
    () => documents.filter((doc) => !doc.is_global),
    [documents],
  );
  const globalDocuments = useMemo(
    () => documents.filter((doc) => doc.is_global),
    [documents],
  );

  const currentDocuments =
    activeTab === "library" ? libraryDocuments : globalDocuments;

  // ── Filtering & sorting (shared hook) ────────────────────────────────────
  const filtering = useDocumentFiltering({
    documents: currentDocuments,
    defaultPageSize: 50,
  });

  // ── Selection (shared hook) ──────────────────────────────────────────────
  const selection = useDocumentSelection({
    filteredDocuments: filtering.filteredDocuments,
    paginatedDocuments: filtering.paginatedDocuments,
  });

  // ── Stats ────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const docs = currentDocuments;
    const ready = docs.filter((d) => d.status === "completed").length;
    const processing = docs.filter(
      (d) => d.status === "processing" || d.status === "queued",
    ).length;
    const error = docs.filter((d) => d.status === "failed").length;
    const totalSize = docs.reduce((acc, d) => acc + d.file_size, 0);
    const totalPages = docs.reduce((acc, d) => acc + d.page_count, 0);

    return { ready, processing, error, totalSize, totalPages, total: docs.length };
  }, [currentDocuments]);

  // ── Callbacks ────────────────────────────────────────────────────────────

  const addUploadedDocuments = useCallback(async () => {
    await mutateDocs();
  }, [mutateDocs]);

  const handleTagCreated = useCallback(
    (tag: Tag) => {
      mutateTags(
        (prev) => {
          if (!prev) return [tag];
          if (prev.some((t) => t.id === tag.id)) return prev;
          return [...prev, tag].sort((a, b) => a.name.localeCompare(b.name));
        },
        { revalidate: false },
      );
    },
    [mutateTags],
  );

  const handleTagDeleted = useCallback(
    (tagId: string) => {
      mutateTags(
        (prev) => (prev ?? []).filter((t) => t.id !== tagId),
        { revalidate: false },
      );
      mutateDocs(
        (prev) =>
          (prev ?? []).map((doc) => ({
            ...doc,
            tags: doc.tags.filter((t) => t.id !== tagId),
          })),
        { revalidate: false },
      );
    },
    [mutateTags, mutateDocs],
  );

  const handleDocumentSelect = useCallback(
    async (doc: Document) => {
      if (selectedDocumentId === doc.id) return;
      setSelectedDocumentId(doc.id);

      const cached = signedUrlCache.current.get(doc.id);
      if (cached) {
        setSelectedFileUrl(cached);
        return;
      }

      setSelectedFileUrl(null);
      try {
        const { signed_url } = await apiGet<{ signed_url: string }>(
          `/files/${doc.id}/signed-url`,
        );
        signedUrlCache.current.set(doc.id, signed_url);
        setSelectedFileUrl(signed_url);
      } catch (err) {
        console.error("Failed to get signed URL:", err);
      }
    },
    [selectedDocumentId],
  );

  const handleDocumentDeleted = useCallback(
    (documentId: string) => {
      mutateDocs(
        (prev) => (prev ?? []).filter((d) => d.id !== documentId),
        { revalidate: false },
      );
      if (selectedDocumentId === documentId) {
        setSelectedDocumentId(null);
        setSelectedFileUrl(null);
      }
    },
    [selectedDocumentId, mutateDocs],
  );

  const handleDocumentUpdated = useCallback(
    (updated: Document) => {
      mutateDocs(
        (prev) => (prev ?? []).map((d) => (d.id === updated.id ? updated : d)),
        { revalidate: false },
      );
    },
    [mutateDocs],
  );

  const handleHighlightClick = (highlight: PdfHighlight) => {
    console.log("Highlight clicked:", highlight.label, "on page", highlight.pageNumber);
  };

  // ── Bulk actions ─────────────────────────────────────────────────────────

  const handleBulkDownload = useCallback(async () => {
    if (selection.isBulkProcessing) return;
    selection.setIsBulkProcessing(true);
    const toastId = toast.loading(
      `Preparing ${selection.selectedDocuments.length} documents for download...`,
    );
    try {
      if (selection.selectedDocuments.length === 1) {
        await downloadDocument(selection.selectedDocuments[0]);
      } else {
        await bulkDownloadDocuments(selection.selectedDocuments);
      }
      toast.dismiss(toastId);
      toast.success(
        `Downloaded ${selection.selectedDocuments.length} document${selection.selectedDocuments.length !== 1 ? "s" : ""}`,
      );
    } catch {
      toast.dismiss(toastId);
      toast.error("Failed to download documents");
    }
    selection.setIsBulkProcessing(false);
  }, [selection]);

  const handleBulkDelete = useCallback(async () => {
    if (selection.isBulkProcessing) return;
    selection.setIsBulkProcessing(true);
    const toastId = toast.loading(
      `Deleting ${selection.selectedDocuments.length} documents...`,
    );
    const deletedIds: string[] = [];
    for (const doc of selection.selectedDocuments) {
      try {
        await deleteDocument(doc.id);
        deletedIds.push(doc.id);
      } catch {
        console.error(`Failed to delete ${doc.original_name}`);
      }
    }
    toast.dismiss(toastId);
    toast.success(
      `Deleted ${deletedIds.length} document${deletedIds.length !== 1 ? "s" : ""}`,
    );
    const deletedSet = new Set(deletedIds);
    mutateDocs(
      (prev) => (prev ?? []).filter((d) => !deletedSet.has(d.id)),
      { revalidate: false },
    );
    selection.clearSelection();
    if (selectedDocumentId && deletedIds.includes(selectedDocumentId)) {
      setSelectedDocumentId(null);
      setSelectedFileUrl(null);
    }
    selection.setIsBulkProcessing(false);
  }, [selection, selectedDocumentId, mutateDocs]);

  const handleBulkToggleGlobal = useCallback(
    async (makeGlobal: boolean) => {
      if (selection.isBulkProcessing) return;
      selection.setIsBulkProcessing(true);
      const label = makeGlobal ? "Setting as global" : "Removing from global";
      const toastId = toast.loading(`${label}...`);
      let count = 0;
      for (const doc of selection.selectedDocuments) {
        try {
          await toggleDocumentGlobal(doc.id, makeGlobal);
          count++;
        } catch {
          console.error(`Failed to toggle global for ${doc.original_name}`);
        }
      }
      toast.dismiss(toastId);
      toast.success(
        makeGlobal
          ? `Moved ${count} document${count !== 1 ? "s" : ""} to global`
          : `Removed ${count} document${count !== 1 ? "s" : ""} from global`,
      );
      mutateDocs(
        (prev) =>
          (prev ?? []).map((d) =>
            selection.selectedIds.has(d.id)
              ? { ...d, is_global: makeGlobal }
              : d,
          ),
        { revalidate: false },
      );
      selection.clearSelection();
      selection.setIsBulkProcessing(false);
    },
    [selection, mutateDocs],
  );

  // ── Tab switch handler ───────────────────────────────────────────────────

  const handleTabChange = useCallback(
    (v: string) => {
      setActiveTab(v as "library" | "global");
      filtering.resetFilters();
      selection.clearSelection();
    },
    [filtering, selection],
  );

  // ── Render ───────────────────────────────────────────────────────────────

  if (isDocsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading documents...</p>
      </div>
    );
  }

  const hasActiveFilters =
    filtering.searchTerm !== "" ||
    filtering.statusFilter !== "all" ||
    filtering.tagFilter !== "all";

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden h-full">
      <SplitViewLayout
        selectedDocumentId={selectedDocumentId}
        fileUrl={selectedFileUrl}
        onClose={() => {
          setSelectedDocumentId(null);
          setSelectedFileUrl(null);
        }}
        highlights={SAMPLE_HIGHLIGHTS}
        onHighlightClick={handleHighlightClick}
      >
        <div className="relative h-full overflow-auto">
          <div className="mx-auto max-w-6xl px-6 py-12 md:px-8 md:py-16">
            <div className="space-y-10">
              <DocumentsPageHeader
                activeTab={activeTab}
                onUploadClick={() => setUploadDialogOpen(true)}
              />

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="library" className="gap-2">
                    <IconLibrary className="h-4 w-4" />
                    My Library
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                      {libraryDocuments.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="global" className="gap-2">
                    <IconWorld className="h-4 w-4" />
                    Global Docs
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                      {globalDocuments.length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Stats Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  icon={IconFileText}
                  label="Total Documents"
                  value={stats.total}
                  subtext={formatFileSize(stats.totalSize)}
                  onClick={() => filtering.updateStatusFilter("all")}
                  isActive={filtering.statusFilter === "all"}
                />
                <StatCard
                  icon={IconCheck}
                  label="Ready"
                  value={stats.ready}
                  subtext={`${stats.totalPages} total pages`}
                  onClick={() => filtering.updateStatusFilter("completed")}
                  isActive={filtering.statusFilter === "completed"}
                />
                <StatCard
                  icon={IconClock}
                  label="Processing"
                  value={stats.processing}
                  onClick={() => filtering.updateStatusFilter("processing")}
                  isActive={filtering.statusFilter === "processing"}
                />
                <StatCard
                  icon={IconAlertTriangle}
                  label="Failed"
                  value={stats.error}
                  onClick={() => filtering.updateStatusFilter("failed")}
                  isActive={filtering.statusFilter === "failed"}
                />
              </div>

              <div className="space-y-5">
                <DocumentSearchFilters
                  searchTerm={filtering.searchTerm}
                  onSearchChange={filtering.updateSearch}
                  statusFilter={filtering.statusFilter}
                  onStatusFilterChange={filtering.updateStatusFilter}
                  tagFilter={filtering.tagFilter}
                  onTagFilterChange={filtering.updateTagFilter}
                  tags={userTags}
                />

                {/* Documents Table */}
                <div className="space-y-3">
                  {filtering.filteredDocuments.length === 0 ? (
                    hasActiveFilters ? (
                      <NoFilterResults
                        onClearFilters={filtering.resetFilters}
                      />
                    ) : (
                      <EmptyState
                        onUploadClick={() => setUploadDialogOpen(true)}
                        variant={activeTab}
                      />
                    )
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
                          />
                          <TableBody>
                            {filtering.paginatedDocuments.map((doc) => (
                              <DocumentTableRow
                                key={doc.id}
                                document={doc}
                                allTags={userTags}
                                selected={selection.selectedIds.has(doc.id)}
                                onSelectChange={(c) =>
                                  selection.toggleSelect(doc.id, c)
                                }
                                onClick={() => handleDocumentSelect(doc)}
                                onDeleted={handleDocumentDeleted}
                                onUpdated={handleDocumentUpdated}
                                onTagCreated={handleTagCreated}
                                onTagDeleted={handleTagDeleted}
                              />
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      <PaginationControls
                        pageIndex={filtering.safePageIndex}
                        pageCount={filtering.pageCount}
                        pageSize={filtering.pageSize}
                        totalItems={filtering.filteredDocuments.length}
                        onPageChange={filtering.setPageIndex}
                        onPageSizeChange={filtering.updatePageSize}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SplitViewLayout>

      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        isGlobal={activeTab === "global"}
        existingFileNames={documents.map((d) => d.original_name)}
        onUploadComplete={addUploadedDocuments}
      />

      <BulkActionBar
        selectedCount={selection.selectedIds.size}
        onClearSelection={selection.clearSelection}
      >
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1.5"
          disabled={selection.isBulkProcessing}
          onClick={handleBulkDownload}
        >
          <IconDownload className="h-3.5 w-3.5" />
          Download
        </Button>
        {activeTab === "library" ? (
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1.5"
            disabled={selection.isBulkProcessing}
            onClick={() => handleBulkToggleGlobal(true)}
          >
            <IconWorld className="h-3.5 w-3.5" />
            Set as global
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1.5"
            disabled={selection.isBulkProcessing}
            onClick={() => handleBulkToggleGlobal(false)}
          >
            <IconWorldOff className="h-3.5 w-3.5" />
            Remove from global
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 text-destructive hover:text-destructive"
          disabled={selection.isBulkProcessing}
          onClick={handleBulkDelete}
        >
          <IconTrash className="h-3.5 w-3.5" />
          Delete
        </Button>
      </BulkActionBar>
    </div>
  );
}
