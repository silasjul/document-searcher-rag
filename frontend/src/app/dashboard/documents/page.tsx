"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  IconUpload,
  IconSearch,
  IconFileText,
  IconCheck,
  IconClock,
  IconAlertTriangle,
  IconFilter,
  IconSortDescending,
  IconTag,
  IconLibrary,
  IconWorld,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Document, Tag } from "@/lib/types";
import { formatFileSize } from "@/lib/utils";
import { StatCard } from "@/components/documents/stat-card";
import { DocumentRow } from "@/components/documents/document-row";
import { EmptyState } from "@/components/documents/empty-state";
import { UploadDialog } from "@/components/documents/upload-dialog";
import { SplitViewLayout } from "@/components/pdf-viewer/split-view-layout";
import {
  SAMPLE_HIGHLIGHTS,
  type PdfHighlight,
} from "@/components/pdf-viewer/types";
import { createClient } from "@/lib/supabase/client";
import { apiGet } from "@/lib/api-client";

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Supabase returns file_tags as nested objects; this normalises them into Tag[]. */
function parseDocumentWithTags(raw: Record<string, unknown>): Document {
  const fileTags = (raw.file_tags ?? []) as Array<{
    tag_id: string;
    tags: Tag | null;
  }>;

  const tags: Tag[] = fileTags
    .map((ft) => ft.tags)
    .filter((t): t is Tag => t !== null);

  // Remove the raw nested field and replace with flat tags array
  const { file_tags: _unused, ...rest } = raw;
  return { ...rest, tags } as Document;
}

// ── Page component ──────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState<"library" | "global">("library");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null,
  );
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [userTags, setUserTags] = useState<Tag[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Cache signed URLs for the lifetime of the page (URLs are valid for 1 hour)
  const signedUrlCache = useRef<Map<string, string>>(new Map());

  // Fetch only specific documents by ID and merge them into state
  const addUploadedDocuments = useCallback(async (fileIds: string[]) => {
    if (fileIds.length === 0) return;
    const supabase = createClient();
    const { data, error } = await supabase
      .from("files")
      .select("*, file_tags(tag_id, tags(*))")
      .in("id", fileIds);

    if (error) {
      console.error("Failed to fetch uploaded documents:", error.message);
      return;
    }

    if (data && data.length > 0) {
      const parsed = data.map((d) =>
        parseDocumentWithTags(d as unknown as Record<string, unknown>),
      );
      setDocuments((prev) => {
        const existingIds = new Set(parsed.map((d) => d.id));
        const filtered = prev.filter((d) => !existingIds.has(d.id));
        return [...parsed, ...filtered];
      });
    }
  }, []);

  // Fetch all documents + user tags from Supabase on initial mount
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      const supabase = createClient();

      // Fetch documents with their tags via the junction table
      const [docsResult, tagsResult] = await Promise.all([
        supabase
          .from("files")
          .select("*, file_tags(tag_id, tags(*))")
          .order("created_at", { ascending: false }),
        supabase
          .from("tags")
          .select("*")
          .order("name", { ascending: true }),
      ]);

      if (cancelled) return;

      if (docsResult.error) {
        console.error(
          "Failed to fetch documents:",
          docsResult.error.message,
        );
      } else {
        const parsed = (docsResult.data ?? []).map((d) =>
          parseDocumentWithTags(d as unknown as Record<string, unknown>),
        );
        setDocuments(parsed);
      }

      if (tagsResult.error) {
        console.error("Failed to fetch tags:", tagsResult.error.message);
      } else {
        setUserTags(tagsResult.data ?? []);
      }

      setIsInitialLoad(false);
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  // When a new tag is created (from any DocumentRow), add it to the user's tag list
  const handleTagCreated = useCallback((tag: Tag) => {
    setUserTags((prev) => {
      if (prev.some((t) => t.id === tag.id)) return prev;
      return [...prev, tag].sort((a, b) => a.name.localeCompare(b.name));
    });
  }, []);

  // When a tag is permanently deleted, remove it from the user's list and all documents
  const handleTagDeleted = useCallback((tagId: string) => {
    setUserTags((prev) => prev.filter((t) => t.id !== tagId));
    setDocuments((prev) =>
      prev.map((doc) => ({
        ...doc,
        tags: doc.tags.filter((t) => t.id !== tagId),
      })),
    );
  }, []);

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

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    let docs = [...currentDocuments];

    // Apply search filter
    const normalizedSearch = searchTerm.toLowerCase().trim();
    if (normalizedSearch) {
      docs = docs.filter(
        (doc) =>
          doc.original_name.toLowerCase().includes(normalizedSearch) ||
          doc.tags.some((tag) =>
            tag.name.toLowerCase().includes(normalizedSearch),
          ),
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      docs = docs.filter((doc) => doc.status === statusFilter);
    }

    // Apply tag filter
    if (tagFilter !== "all") {
      docs = docs.filter((doc) => doc.tags.some((tag) => tag.id === tagFilter));
    }

    // Apply sorting
    docs.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "oldest":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "name":
          return a.original_name.localeCompare(b.original_name);
        case "size":
          return b.file_size - a.file_size;
        default:
          return 0;
      }
    });

    return docs;
  }, [currentDocuments, searchTerm, statusFilter, tagFilter, sortBy]);

  const stats = useMemo(() => {
    const docs = currentDocuments;
    const ready = docs.filter((d) => d.status === "completed").length;
    const processing = docs.filter(
      (d) => d.status === "processing" || d.status === "queued",
    ).length;
    const error = docs.filter((d) => d.status === "failed").length;
    const totalSize = docs.reduce((acc, d) => acc + d.file_size, 0);
    const totalPages = docs.reduce((acc, d) => acc + d.page_count, 0);

    return {
      ready,
      processing,
      error,
      totalSize,
      totalPages,
      total: docs.length,
    };
  }, [currentDocuments]);

  // Handle document selection — get a signed URL from the backend (cached)
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

  // Remove a document from local state after deletion
  const handleDocumentDeleted = useCallback(
    (documentId: string) => {
      setDocuments((prev) => prev.filter((d) => d.id !== documentId));
      if (selectedDocumentId === documentId) {
        setSelectedDocumentId(null);
        setSelectedFileUrl(null);
      }
    },
    [selectedDocumentId],
  );

  // Update a document in local state (e.g. after toggling global or changing tags)
  const handleDocumentUpdated = useCallback((updated: Document) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === updated.id ? updated : d)),
    );
  }, []);

  // Handle highlight clicks
  const handleHighlightClick = (highlight: PdfHighlight) => {
    console.log(
      "Highlight clicked:",
      highlight.label,
      "on page",
      highlight.pageNumber,
    );
  };

  if (isInitialLoad) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading documents...</p>
      </div>
    );
  }

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
              {/* Header Section */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <Badge
                    variant="secondary"
                    className="mb-4 gap-1.5 bg-primary/10 text-primary"
                  >
                    {activeTab === "library" ? (
                      <>
                        <IconLibrary className="h-3 w-3" />
                        My Library
                      </>
                    ) : (
                      <>
                        <IconWorld className="h-3 w-3" />
                        Global Documents
                      </>
                    )}
                  </Badge>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    {activeTab === "library"
                      ? "Document Library"
                      : "Global Documents"}
                  </h1>
                  <p className="mt-2 text-muted-foreground">
                    {activeTab === "library"
                      ? "Upload and manage your personal PDF files for AI-powered analysis."
                      : "Shared documents automatically available in all your projects."}
                  </p>
                </div>

                <Button
                  size="lg"
                  className="group gap-2 font-semibold"
                  onClick={() => setUploadDialogOpen(true)}
                >
                  <IconUpload className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
                  {activeTab === "library"
                    ? "Upload PDF"
                    : "Add Global Document"}
                </Button>
              </div>

              {/* Tabs */}
              <Tabs
                value={activeTab}
                onValueChange={(v) => {
                  setActiveTab(v as "library" | "global");
                  setStatusFilter("all");
                  setTagFilter("all");
                  setSearchTerm("");
                }}
              >
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="library" className="gap-2">
                    <IconLibrary className="h-4 w-4" />
                    My Library
                    <Badge
                      variant="secondary"
                      className="ml-1 h-5 px-1.5 text-xs"
                    >
                      {libraryDocuments.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="global" className="gap-2">
                    <IconWorld className="h-4 w-4" />
                    Global Docs
                    <Badge
                      variant="secondary"
                      className="ml-1 h-5 px-1.5 text-xs"
                    >
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
                  onClick={() => setStatusFilter("all")}
                  isActive={statusFilter === "all"}
                />
                <StatCard
                  icon={IconCheck}
                  label="Ready"
                  value={stats.ready}
                  subtext={`${stats.totalPages} total pages`}
                  onClick={() => setStatusFilter("completed")}
                  isActive={statusFilter === "completed"}
                />
                <StatCard
                  icon={IconClock}
                  label="Processing"
                  value={stats.processing}
                  onClick={() => setStatusFilter("processing")}
                  isActive={statusFilter === "processing"}
                />
                <StatCard
                  icon={IconAlertTriangle}
                  label="Failed"
                  value={stats.error}
                  onClick={() => setStatusFilter("failed")}
                  isActive={statusFilter === "failed"}
                />
              </div>
              <div className="space-y-5">
                {/* Search and Filters */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative flex-1 sm:max-w-md">
                    <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search documents or tags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
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

                    <Select value={tagFilter} onValueChange={setTagFilter}>
                      <SelectTrigger className="w-35">
                        <IconTag className="h-4 w-4" />
                        <SelectValue placeholder="Tag" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="all">All tags</SelectItem>
                        {userTags.map((tag) => (
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

                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-35">
                        <IconSortDescending className="h-4 w-4" />
                        <SelectValue placeholder="Sort by"></SelectValue>
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="newest">Newest first</SelectItem>
                        <SelectItem value="oldest">Oldest first</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="size">File size</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Documents List */}
                <div className="space-y-3">
                  {filteredDocuments.length === 0 ? (
                    searchTerm || statusFilter !== "all" || tagFilter !== "all" ? (
                      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-muted/20 py-12 text-center">
                        <IconSearch className="mb-3 h-8 w-8 text-muted-foreground" />
                        <h3 className="font-medium text-foreground">
                          No documents found
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Try adjusting your search or filters
                        </p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => {
                            setSearchTerm("");
                            setStatusFilter("all");
                            setTagFilter("all");
                          }}
                        >
                          Clear filters
                        </Button>
                      </div>
                    ) : (
                      <EmptyState
                        onUploadClick={() => setUploadDialogOpen(true)}
                        variant={activeTab}
                      />
                    )
                  ) : (
                    filteredDocuments.map((doc) => (
                      <DocumentRow
                        key={doc.id}
                        document={doc}
                        allTags={userTags}
                        onClick={() => handleDocumentSelect(doc)}
                        onDeleted={handleDocumentDeleted}
                        onUpdated={handleDocumentUpdated}
                        onTagCreated={handleTagCreated}
                        onTagDeleted={handleTagDeleted}
                      />
                    ))
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
    </div>
  );
}
