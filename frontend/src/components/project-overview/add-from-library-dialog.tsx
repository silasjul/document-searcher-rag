"use client";

import { useState, useCallback, useMemo } from "react";
import {
  IconSearch,
  IconLibrary,
  IconTag,
  IconFileTypePdf,
  IconFiles,
  IconArrowUp,
  IconArrowDown,
  IconArrowsSort,
} from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// Types are used implicitly via the SWR hooks
import { DocumentStatusBadge } from "@/components/documents/document-status-badge";
import { TagBadge } from "@/components/documents/tag-badge";
import { PaginationControls } from "@/components/documents/pagination-controls";
import { formatFileSize } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { addDocumentsToProject } from "@/utils/projects/projects-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLibraryDocuments, useUserTags } from "@/hooks/use-documents";

interface AddFromLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
  existingDocumentIds: string[];
}

type SortKey = "name" | "pages" | "size" | "date";
type SortDir = "asc" | "desc";

const DEFAULT_PAGE_SIZE = 25;

export function AddFromLibraryDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
  existingDocumentIds,
}: AddFromLibraryDialogProps) {
  const router = useRouter();

  // ── SWR-powered data (cached across open/close, deduplicated) ─────────────
  const { documents: allDocuments, isLoading: isDocsLoading } = useLibraryDocuments(open);
  const { tags: availableTags } = useUserTags();

  const [isAdding, setIsAdding] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [tagFilter, setTagFilter] = useState<string>("all");

  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // ── Selection state (persists across pages / searches) ────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Track whether we have data (SWR returns [] initially before first fetch)
  const hasFetched = !isDocsLoading;

  // ── Stable set of existing IDs for fast lookups ────────────────────────────
  const existingIdSet = useMemo(
    () => new Set(existingDocumentIds),
    [existingDocumentIds],
  );

  // ── Client-side filter, sort, paginate (instant — no refetch) ─────────────
  const filteredDocuments = useMemo(() => {
    // Exclude documents already in the project from the cached list
    let docs = allDocuments.filter((d) => !existingIdSet.has(d.id));

    // Search by name
    const q = searchTerm.toLowerCase().trim();
    if (q) {
      docs = docs.filter(
        (d) =>
          d.original_name.toLowerCase().includes(q) ||
          d.tags.some((tag) => tag.name.toLowerCase().includes(q)),
      );
    }

    // Tag filter
    if (tagFilter !== "all") {
      docs = docs.filter((d) => d.tags.some((t) => t.id === tagFilter));
    }

    // Sort
    const dir = sortDir === "asc" ? 1 : -1;
    docs.sort((a, b) => {
      switch (sortKey) {
        case "name":
          return dir * a.original_name.localeCompare(b.original_name);
        case "pages":
          return dir * (a.page_count - b.page_count);
        case "size":
          return dir * (a.file_size - b.file_size);
        case "date":
          return (
            dir *
            (new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime())
          );
        default:
          return 0;
      }
    });

    return docs;
  }, [allDocuments, existingIdSet, searchTerm, tagFilter, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(filteredDocuments.length / pageSize));
  const safePageIndex = Math.min(pageIndex, pageCount - 1);
  const paginatedDocuments = useMemo(
    () =>
      filteredDocuments.slice(
        safePageIndex * pageSize,
        (safePageIndex + 1) * pageSize,
      ),
    [filteredDocuments, safePageIndex, pageSize],
  );

  // ── Reset UI state on close (keep cached data) ─────────────────────────────
  const handleClose = (value: boolean) => {
    if (!value) {
      setTimeout(() => {
        setSelectedIds(new Set());
        setSearchTerm("");
        setTagFilter("all");
        setSortKey("date");
        setSortDir("desc");
        setPageIndex(0);
        setPageSize(DEFAULT_PAGE_SIZE);
      }, 200);
    }
    onOpenChange(value);
  };

  // ── Selection helpers ─────────────────────────────────────────────────────
  const toggleDocument = useCallback((docId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(docId)) next.delete(docId);
      else next.add(docId);
      return next;
    });
  }, []);

  const allPageSelected =
    paginatedDocuments.length > 0 &&
    paginatedDocuments.every((d) => selectedIds.has(d.id));
  const somePageSelected =
    !allPageSelected &&
    paginatedDocuments.some((d) => selectedIds.has(d.id));

  const toggleSelectAllPage = useCallback(
    (checked: boolean) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (checked) {
          for (const doc of paginatedDocuments) next.add(doc.id);
        } else {
          for (const doc of paginatedDocuments) next.delete(doc.id);
        }
        return next;
      });
    },
    [paginatedDocuments]
  );

  // ── Sort helpers ──────────────────────────────────────────────────────────
  const handleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir(key === "name" ? "asc" : "desc");
      }
      setPageIndex(0);
    },
    [sortKey]
  );

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key)
      return (
        <IconArrowsSort className="h-3.5 w-3.5 text-muted-foreground/50" />
      );
    return sortDir === "asc" ? (
      <IconArrowUp className="h-3.5 w-3.5" />
    ) : (
      <IconArrowDown className="h-3.5 w-3.5" />
    );
  };

  // ── Add action ────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (selectedIds.size === 0) {
      toast.error("Please select at least one document");
      return;
    }

    setIsAdding(true);
    try {
      await addDocumentsToProject(projectId, Array.from(selectedIds));
      toast.success(
        `Added ${selectedIds.size} document${selectedIds.size !== 1 ? "s" : ""} to project`
      );
      handleClose(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to add documents");
      console.error(error);
    } finally {
      setIsAdding(false);
    }
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const showSkeleton = isDocsLoading;
  const showEmptyState = !isDocsLoading && hasFetched && paginatedDocuments.length === 0;
  const showTable = !showSkeleton && !showEmptyState;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconLibrary className="h-5 w-5" />
            Add from Library
          </DialogTitle>
          <DialogDescription>
            Select documents from your library to add to &ldquo;{projectName}
            &rdquo;.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-3">
          {/* Search + filter bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>
            {availableTags.length > 0 && (
              <Select value={tagFilter} onValueChange={setTagFilter}>
                <SelectTrigger className="w-40 shrink-0">
                  <IconTag className="h-4 w-4" />
                  <SelectValue placeholder="All tags" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="all">All tags</SelectItem>
                  {availableTags.map((tag) => (
                    <SelectItem key={tag.id} value={tag.id}>
                      <span className="flex items-center gap-2">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Document table area */}
          <div className="relative flex-1 overflow-auto rounded-lg border">
            {showSkeleton && (
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-10 pr-0">
                      <Skeleton className="h-4 w-4 rounded" />
                    </TableHead>
                    <TableHead className="min-w-44">
                      <Skeleton className="h-3.5 w-12" />
                    </TableHead>
                    <TableHead className="w-24">
                      <Skeleton className="h-3.5 w-12" />
                    </TableHead>
                    <TableHead className="w-44">
                      <Skeleton className="h-3.5 w-8" />
                    </TableHead>
                    <TableHead className="w-16">
                      <Skeleton className="h-3.5 w-12" />
                    </TableHead>
                    <TableHead className="w-20">
                      <Skeleton className="h-3.5 w-8" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="w-10 pr-0">
                        <Skeleton className="h-4 w-4 rounded" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Skeleton className="h-4 w-4 shrink-0 rounded" />
                          <Skeleton
                            className="h-4 rounded"
                            style={{ width: `${55 + ((i * 37) % 35)}%` }}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Skeleton className="h-5 w-14 rounded-full" />
                          {i % 3 !== 2 && (
                            <Skeleton className="h-5 w-12 rounded-full" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-8" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-12" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {showEmptyState && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <IconFiles className="mb-3 h-8 w-8 text-muted-foreground" />
                <h3 className="font-medium text-foreground">
                  {searchTerm || tagFilter !== "all"
                    ? "No documents match your search"
                    : "No documents available"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {searchTerm || tagFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Upload documents to your library first"}
                </p>
                {(searchTerm || tagFilter !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setSearchTerm("");
                      setTagFilter("all");
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}

            {showTable && (
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="w-10 pr-0">
                      <Checkbox
                        checked={
                          allPageSelected ||
                          (somePageSelected && "indeterminate")
                        }
                        onCheckedChange={(v) => toggleSelectAllPage(!!v)}
                        aria-label="Select all on page"
                      />
                    </TableHead>
                    <TableHead
                      className="min-w-44 cursor-pointer select-none hover:text-foreground transition-colors"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center gap-1.5">
                        Name
                        {sortIcon("name")}
                      </div>
                    </TableHead>
                    <TableHead className="w-24">Status</TableHead>
                    <TableHead className="w-44">Tags</TableHead>
                    <TableHead
                      className="w-16 cursor-pointer select-none hover:text-foreground transition-colors"
                      onClick={() => handleSort("pages")}
                    >
                      <div className="flex items-center gap-1.5">
                        Pages
                        {sortIcon("pages")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="w-20 cursor-pointer select-none hover:text-foreground transition-colors"
                      onClick={() => handleSort("size")}
                    >
                      <div className="flex items-center gap-1.5">
                        Size
                        {sortIcon("size")}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedDocuments.map((doc) => {
                    const isSelected = selectedIds.has(doc.id);
                    return (
                      <TableRow
                        key={doc.id}
                        className="cursor-pointer hover:bg-muted/50"
                        data-state={isSelected ? "selected" : undefined}
                        onClick={() => toggleDocument(doc.id)}
                      >
                        <TableCell
                          className="w-10 pr-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleDocument(doc.id)}
                            aria-label={`Select ${doc.original_name}`}
                          />
                        </TableCell>
                        <TableCell className="max-w-62.5">
                          <div className="flex items-center gap-2.5">
                            <IconFileTypePdf className="h-4 w-4 shrink-0 text-red-500" />
                            <span className="truncate font-medium text-sm">
                              {doc.original_name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DocumentStatusBadge status={doc.status} />
                        </TableCell>
                        <TableCell className="max-w-44">
                          <div className="flex items-center gap-1 overflow-hidden">
                            {doc.tags.slice(0, 3).map((tag) => (
                              <TagBadge key={tag.id} tag={tag} />
                            ))}
                            {doc.tags.length > 3 && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] px-1.5 h-5"
                              >
                                +{doc.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm tabular-nums">
                          {doc.page_count}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatFileSize(doc.file_size)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Pagination – always rendered when we have data to keep layout stable */}
          {hasFetched && filteredDocuments.length > 0 && (
            <PaginationControls
              pageIndex={safePageIndex}
              pageCount={pageCount}
              pageSize={pageSize}
              totalItems={filteredDocuments.length}
              onPageChange={setPageIndex}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPageIndex(0);
              }}
              pageSizeOptions={[10, 25, 50]}
            />
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isAdding}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={selectedIds.size === 0 || isAdding}
          >
            {isAdding
              ? "Adding..."
              : `Add ${selectedIds.size} document${selectedIds.size !== 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
