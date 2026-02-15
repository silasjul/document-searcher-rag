"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Project, ChatSession, Document, Tag } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconMessage,
  IconPlus,
  IconSparkles,
  IconFileText,
  IconBolt,
  IconUpload,
  IconFileTypePdf,
  IconSearch,
  IconFilter,
  IconTag,
  IconArrowUp,
  IconArrowDown,
  IconArrowsSort,
  IconDownload,
  IconTrash,
} from "@tabler/icons-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { StatCard } from "./stat-card";
import { ProjectDocumentTableRow } from "./document-table-row";
import { ConversationCard } from "./conversation-card";
import { EmptyState } from "./empty-state";
import { CreateProjectDialog } from "./create-project-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { PaginationControls } from "@/components/documents/pagination-controls";
import { BulkActionBar } from "@/components/documents/bulk-action-bar";
import {
  downloadDocument,
  removeDocumentFromProject,
} from "@/utils/documents/document-actions";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ProjectOverviewProps {
  projectData: Project;
  chats: ChatSession[];
  documents: Document[];
  onDocumentClick?: (documentId: string) => void;
}

// Main Component
export function ProjectOverview({
  projectData,
  chats,
  documents,
  onDocumentClick,
}: ProjectOverviewProps) {
  const router = useRouter();
  const [isAddDocumentsOpen, setIsAddDocumentsOpen] = useState(false);
  const [allDocuments, setAllDocuments] = useState<Document[]>([]);
  const [localDocs, setLocalDocs] = useState<Document[]>(documents);
  const [userTags, setUserTags] = useState<Tag[]>([]);
  const [docSearch, setDocSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<"name" | "pages" | "size" | "date">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [docPageIndex, setDocPageIndex] = useState(0);
  const [docPageSize, setDocPageSize] = useState(25);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Sync local docs when the prop changes (e.g. after router.refresh)
  useEffect(() => {
    setLocalDocs(documents);
  }, [documents]);

  // Fetch user tags on mount
  useEffect(() => {
    async function fetchTags() {
      const supabase = createClient();
      const { data } = await supabase
        .from("tags")
        .select("*")
        .order("name", { ascending: true });
      setUserTags(data ?? []);
    }
    fetchTags();
  }, []);

  const handleDocumentRemoved = useCallback(() => {
    router.refresh();
  }, [router]);

  const handleDocumentUpdated = useCallback((updated: Document) => {
    setLocalDocs((prev) =>
      prev.map((d) => (d.id === updated.id ? updated : d)),
    );
  }, []);

  const handleTagCreated = useCallback((tag: Tag) => {
    setUserTags((prev) => {
      if (prev.some((t) => t.id === tag.id)) return prev;
      return [...prev, tag].sort((a, b) => a.name.localeCompare(b.name));
    });
  }, []);

  const handleTagDeleted = useCallback((tagId: string) => {
    setUserTags((prev) => prev.filter((t) => t.id !== tagId));
    setLocalDocs((prev) =>
      prev.map((doc) => ({
        ...doc,
        tags: doc.tags.filter((t) => t.id !== tagId),
      })),
    );
  }, []);

  // Fetch all user documents (with tags) when the add-documents dialog opens
  useEffect(() => {
    if (!isAddDocumentsOpen) return;

    async function fetchDocs() {
      const supabase = createClient();
      const { data } = await supabase
        .from("files")
        .select("*, file_tags(tag_id, tags(*))")
        .order("created_at", { ascending: false });

      const parsed = (data ?? []).map((d) => {
        const raw = d as unknown as Record<string, unknown>;
        const fileTags = (raw.file_tags ?? []) as Array<{
          tag_id: string;
          tags: Tag | null;
        }>;
        const tags: Tag[] = fileTags
          .map((ft) => ft.tags)
          .filter((t): t is Tag => t !== null);
        const { file_tags: _unused, ...rest } = raw;
        return { ...rest, tags } as Document;
      });

      setAllDocuments(parsed);
    }
    fetchDocs();
  }, [isAddDocumentsOpen]);

  const sortedChats = [...chats].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  // Collect unique tags across all project documents for the tag filter dropdown
  const availableTags = useMemo(() => {
    const tagMap = new Map<string, Tag>();
    for (const doc of localDocs) {
      for (const tag of doc.tags) {
        if (!tagMap.has(tag.id)) tagMap.set(tag.id, tag);
      }
    }
    return [...tagMap.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [localDocs]);

  // Filter, search, and sort documents
  const filteredDocuments = useMemo(() => {
    let docs = [...localDocs];

    // Search
    const q = docSearch.toLowerCase().trim();
    if (q) {
      docs = docs.filter(
        (d) =>
          d.original_name.toLowerCase().includes(q) ||
          d.tags.some((tag) => tag.name.toLowerCase().includes(q)),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      docs = docs.filter((d) => d.status === statusFilter);
    }

    // Tag filter
    if (tagFilter !== "all") {
      docs = docs.filter((d) => d.tags.some((tag) => tag.id === tagFilter));
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
  }, [localDocs, docSearch, statusFilter, tagFilter, sortKey, sortDir]);

  // Reset to first page when filters change
  const docPageCount = Math.max(1, Math.ceil(filteredDocuments.length / docPageSize));
  const safeDocPageIndex = Math.min(docPageIndex, docPageCount - 1);
  const paginatedDocuments = useMemo(
    () =>
      filteredDocuments.slice(
        safeDocPageIndex * docPageSize,
        (safeDocPageIndex + 1) * docPageSize,
      ),
    [filteredDocuments, safeDocPageIndex, docPageSize],
  );

  const latestChat = sortedChats[0];
  const readyDocuments = localDocs.filter((d) => d.status === "completed").length;
  const hasReadyDocuments = readyDocuments > 0;

  // ── Selection helpers ──────────────────────────────────────────────────────

  const toggleSelect = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedIds(new Set(paginatedDocuments.map((d) => d.id)));
      } else {
        setSelectedIds(new Set());
      }
    },
    [paginatedDocuments],
  );

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const allPageSelected =
    paginatedDocuments.length > 0 &&
    paginatedDocuments.every((d) => selectedIds.has(d.id));
  const somePageSelected =
    !allPageSelected && paginatedDocuments.some((d) => selectedIds.has(d.id));

  const selectedDocuments = useMemo(
    () => filteredDocuments.filter((d) => selectedIds.has(d.id)),
    [filteredDocuments, selectedIds],
  );

  // ── Bulk actions ─────────────────────────────────────────────────────────

  const handleBulkDownload = useCallback(async () => {
    if (isBulkProcessing) return;
    setIsBulkProcessing(true);
    const toastId = toast.loading(`Downloading ${selectedDocuments.length} documents...`);
    let count = 0;
    for (const doc of selectedDocuments) {
      try {
        await downloadDocument(doc);
        count++;
      } catch {
        console.error(`Failed to download ${doc.original_name}`);
      }
    }
    toast.dismiss(toastId);
    toast.success(`Downloaded ${count} document${count !== 1 ? "s" : ""}`);
    setIsBulkProcessing(false);
  }, [selectedDocuments, isBulkProcessing]);

  const handleBulkRemove = useCallback(async () => {
    if (isBulkProcessing) return;
    setIsBulkProcessing(true);
    // Only remove non-global docs
    const removable = selectedDocuments.filter((d) => !d.is_global);
    const toastId = toast.loading(`Removing ${removable.length} documents from project...`);
    let count = 0;
    for (const doc of removable) {
      try {
        await removeDocumentFromProject(doc.id, projectData.id);
        count++;
      } catch {
        console.error(`Failed to remove ${doc.original_name}`);
      }
    }
    toast.dismiss(toastId);
    toast.success(`Removed ${count} document${count !== 1 ? "s" : ""} from project`);
    setSelectedIds(new Set());
    setIsBulkProcessing(false);
    router.refresh();
  }, [selectedDocuments, isBulkProcessing, projectData.id, router]);

  // Toggle sort: if same key, flip direction; if new key, default to desc (except name → asc)
  const handleSort = useCallback(
    (key: "name" | "pages" | "size" | "date") => {
      if (sortKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir(key === "name" ? "asc" : "desc");
      }
      setDocPageIndex(0);
    },
    [sortKey],
  );

  const sortIcon = (key: "name" | "pages" | "size" | "date") => {
    if (sortKey !== key)
      return <IconArrowsSort className="h-3.5 w-3.5 text-muted-foreground/50" />;
    return sortDir === "asc" ? (
      <IconArrowUp className="h-3.5 w-3.5" />
    ) : (
      <IconArrowDown className="h-3.5 w-3.5" />
    );
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden h-full">
      <div className="relative h-full overflow-auto">
        <div className="mx-auto max-w-6xl px-6 py-12 md:px-8 md:py-16">
          <div className="space-y-10">
            {/* Header Section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Badge
                  variant="secondary"
                  className="mb-4 gap-1.5 bg-primary/10 text-primary"
                >
                  <IconBolt className="h-3 w-3" />
                  Active Project
                </Badge>
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Project Overview
                </h1>
                <p className="mt-2 text-muted-foreground">
                  {chats.length} conversation{chats.length !== 1 ? "s" : ""} •{" "}
                  {localDocs.length} document
                  {localDocs.length !== 1 ? "s" : ""}
                  {latestChat && (
                    <>
                      {" "}
                      • Last active{" "}
                      {formatDistanceToNow(new Date(latestChat.updated_at), {
                        addSuffix: true,
                      })}
                    </>
                  )}
                </p>
              </div>

              {hasReadyDocuments ? (
                <Button size="lg" className="group gap-2 font-semibold" asChild>
                  <Link href={`/dashboard/project/${projectData.id}?chatid=new`}>
                    <IconPlus className="h-5 w-5 transition-transform group-hover:rotate-90" />
                    New conversation
                  </Link>
                </Button>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex">
                      <Button size="lg" className="gap-2 font-semibold" disabled>
                        <IconPlus className="h-5 w-5" />
                        New conversation
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="flex items-center gap-1.5">
                      <IconFileText className="h-3.5 w-3.5" />
                      At least one ready document is required to start a conversation
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard
                icon={IconMessage}
                label="Total Conversations"
                value={chats.length}
                onClick={() => scrollToSection("conversations")}
              />
              <StatCard
                icon={IconFileText}
                label="Documents"
                value={`${readyDocuments}/${localDocs.length}`}
                trend={
                  localDocs.length - readyDocuments > 0
                    ? `${localDocs.length - readyDocuments} processing`
                    : undefined
                }
                onClick={() => scrollToSection("documents")}
              />
            </div>

            {/* Conversations Grid — hidden when no documents are ready */}
            {hasReadyDocuments && (
              <div id="conversations" className="scroll-mt-24">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-foreground">
                    Recent Conversations
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Continue where you left off or start something new
                  </p>
                </div>

                {chats.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {sortedChats.map((chat, index) => (
                      <div key={chat.id}>
                        <ConversationCard
                          chat={chat}
                          projectId={projectData.id}
                          index={index}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState projectId={projectData.id} />
                )}
              </div>
            )}

            {/* Documents Section */}
            <div id="documents" className="scroll-mt-24">
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Documents
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {localDocs.length} PDF file{localDocs.length !== 1 ? "s" : ""} in this project
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => setIsAddDocumentsOpen(true)}
                >
                  <IconUpload className="h-4 w-4" />
                  Add documents
                </Button>
              </div>

              {localDocs.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-muted/20 py-12 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground">
                    <IconFileTypePdf className="h-7 w-7" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-medium text-foreground">
                    No documents yet
                  </h3>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    Upload PDF files to analyze them with AI and extract
                    insights.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 gap-2"
                    onClick={() => setIsAddDocumentsOpen(true)}
                  >
                    <IconUpload className="h-4 w-4" />
                    Add your first PDF
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Search and Filters */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1 sm:max-w-sm">
                      <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search documents or tags..."
                        value={docSearch}
                        onChange={(e) => {
                          setDocSearch(e.target.value);
                          setDocPageIndex(0);
                        }}
                        className="pl-9"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={statusFilter}
                        onValueChange={(v) => {
                          setStatusFilter(v);
                          setDocPageIndex(0);
                        }}
                      >
                        <SelectTrigger className="w-35">
                          <IconFilter className="h-4 w-4" />
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          <SelectItem value="all">All status</SelectItem>
                          <SelectItem value="completed">Ready</SelectItem>
                          <SelectItem value="uploaded">Uploaded</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>

                      {availableTags.length > 0 && (
                        <Select
                          value={tagFilter}
                          onValueChange={(v) => {
                            setTagFilter(v);
                            setDocPageIndex(0);
                          }}
                        >
                          <SelectTrigger className="w-35">
                            <IconTag className="h-4 w-4" />
                            <SelectValue placeholder="Tag" />
                          </SelectTrigger>
                          <SelectContent position="popper">
                            <SelectItem value="all">All tags</SelectItem>
                            {availableTags.map((tag) => (
                              <SelectItem key={tag.id} value={tag.id}>
                                <span className="flex items-center gap-2">
                                  <span
                                    className="inline-block h-2.5 w-2.5 rounded-full"
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
                  </div>

                  {filteredDocuments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-muted/20 py-8 text-center">
                      <IconSearch className="mb-3 h-6 w-6 text-muted-foreground" />
                      <h3 className="font-medium text-foreground">
                        No matching documents
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Try adjusting your search or filters
                      </p>
                      <Button
                        variant="outline"
                        className="mt-3"
                        onClick={() => {
                          setDocSearch("");
                          setStatusFilter("all");
                          setTagFilter("all");
                        }}
                      >
                        Clear filters
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-hidden rounded-lg border">
                        <Table>
                          <TableHeader className="bg-muted/50">
                            <TableRow>
                              <TableHead className="w-10 pr-0">
                                <Checkbox
                                  checked={allPageSelected || (somePageSelected && "indeterminate")}
                                  onCheckedChange={(v) => toggleSelectAll(!!v)}
                                  aria-label="Select all"
                                />
                              </TableHead>
                              <TableHead
                                className="min-w-48 cursor-pointer select-none hover:text-foreground transition-colors"
                                onClick={() => handleSort("name")}
                              >
                                <div className="flex items-center gap-1.5">
                                  Name
                                  {sortIcon("name")}
                                </div>
                              </TableHead>
                              <TableHead className="w-25">Status</TableHead>
                              <TableHead className="w-50">Tags</TableHead>
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
                              <TableHead
                                className="w-28 cursor-pointer select-none hover:text-foreground transition-colors"
                                onClick={() => handleSort("date")}
                              >
                                <div className="flex items-center gap-1.5">
                                  Uploaded
                                  {sortIcon("date")}
                                </div>
                              </TableHead>
                              <TableHead className="w-12" />
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedDocuments.map((doc) => (
                              <ProjectDocumentTableRow
                                key={doc.id}
                                document={doc}
                                projectId={projectData.id}
                                allTags={userTags}
                                selected={selectedIds.has(doc.id)}
                                onSelectChange={(c) => toggleSelect(doc.id, c)}
                                onClick={() => onDocumentClick?.(doc.id)}
                                onRemoved={handleDocumentRemoved}
                                onUpdated={handleDocumentUpdated}
                                onTagCreated={handleTagCreated}
                                onTagDeleted={handleTagDeleted}
                              />
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      {filteredDocuments.length > docPageSize && (
                        <PaginationControls
                          pageIndex={safeDocPageIndex}
                          pageCount={docPageCount}
                          pageSize={docPageSize}
                          totalItems={filteredDocuments.length}
                          onPageChange={setDocPageIndex}
                          onPageSizeChange={(size) => {
                            setDocPageSize(size);
                            setDocPageIndex(0);
                          }}
                        />
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions Footer */}
            <div className="rounded-2xl border border-dashed border-border/50 bg-muted/20 p-6">
              <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <IconSparkles className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    Need a specific analysis?
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    You can ask questions that span multiple documents. Try
                    asking &quot;Compare the liability clauses across all
                    contracts&quot;.
                  </p>
                </div>
                {hasReadyDocuments ? (
                  <Button variant="outline" className="gap-2 shrink-0" asChild>
                    <Link
                      href={`/dashboard/project/${projectData.id}?chatid=new`}
                    >
                      <IconMessage className="h-4 w-4" />
                      Ask AI
                    </Link>
                  </Button>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex shrink-0">
                        <Button variant="outline" className="gap-2" disabled>
                          <IconMessage className="h-4 w-4" />
                          Ask AI
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="flex items-center gap-1.5">
                        <IconFileText className="h-3.5 w-3.5" />
                        At least one ready document is required to start a conversation
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Documents Dialog */}
      <CreateProjectDialog
        open={isAddDocumentsOpen}
        onOpenChange={setIsAddDocumentsOpen}
        allDocuments={allDocuments}
        projectId={projectData.id}
        projectName={projectData.name}
        existingDocumentIds={localDocs.map((d) => d.id)}
      />

      <BulkActionBar
        selectedCount={selectedIds.size}
        onClearSelection={clearSelection}
      >
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1.5"
          disabled={isBulkProcessing}
          onClick={handleBulkDownload}
        >
          <IconDownload className="h-3.5 w-3.5" />
          Download
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 text-destructive hover:text-destructive"
          disabled={isBulkProcessing}
          onClick={handleBulkRemove}
        >
          <IconTrash className="h-3.5 w-3.5" />
          Remove from project
        </Button>
      </BulkActionBar>
    </div>
  );
}
