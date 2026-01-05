"use client";

import { useState, useMemo } from "react";
import {
  IconUpload,
  IconSearch,
  IconFileText,
  IconCheck,
  IconClock,
  IconAlertTriangle,
  IconFilter,
  IconSortDescending,
  IconLibrary,
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
import { MOCK_DOCUMENTS } from "@/lib/mock-data";
import { formatFileSize } from "@/lib/utils";
import { StatCard } from "@/components/documents/stat-card";
import { DocumentRow } from "@/components/documents/document-row";
import { EmptyState } from "@/components/documents/empty-state";

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    // 1. Start with a fresh copy of the source data
    let docs = [...MOCK_DOCUMENTS];

    // 2. Apply search filter
    const normalizedSearch = searchTerm.toLowerCase().trim();
    if (normalizedSearch) {
      docs = docs.filter(
        (doc) =>
          doc.name.toLowerCase().includes(normalizedSearch) ||
          doc.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch))
      );
    }

    // 3. Apply status filter
    if (statusFilter !== "all") {
      docs = docs.filter((doc) => doc.status === statusFilter);
    }

    // 4. Apply sorting
    docs.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
          );
        case "name":
          return a.name.localeCompare(b.name);
        case "size":
          return b.fileSize - a.fileSize;
        default:
          return 0;
      }
    });

    return docs;
  }, [searchTerm, statusFilter, sortBy]);

  const stats = useMemo(() => {
    const ready = MOCK_DOCUMENTS.filter((d) => d.status === "ready").length;
    const processing = MOCK_DOCUMENTS.filter(
      (d) => d.status === "processing"
    ).length;
    const error = MOCK_DOCUMENTS.filter((d) => d.status === "error").length;
    const totalSize = MOCK_DOCUMENTS.reduce((acc, d) => acc + d.fileSize, 0);
    const totalPages = MOCK_DOCUMENTS.reduce((acc, d) => acc + d.pageCount, 0);

    return { ready, processing, error, totalSize, totalPages };
  }, []);

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-linear-to-br from-primary/5 to-violet-500/5 blur-3xl" />
        <div className="absolute -right-40 top-1/3 h-80 w-80 rounded-full bg-linear-to-br from-violet-500/5 to-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-linear-to-br from-primary/5 to-muted/20 blur-3xl" />
      </div>

      <div className="relative flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-6 py-12 md:px-8 md:py-16">
          <div className="space-y-10">
            {/* Header Section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Badge
                  variant="secondary"
                  className="mb-4 gap-1.5 bg-primary/10 text-primary"
                >
                  <IconLibrary className="h-3 w-3" />
                  Document Library
                </Badge>
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Your Documents
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Upload and manage PDF files for AI-powered analysis across
                  your cases.
                </p>
              </div>

              <Button size="lg" className="group gap-2 font-semibold">
                <IconUpload className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
                Upload PDF
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={IconFileText}
                label="Total Documents"
                value={MOCK_DOCUMENTS.length}
                subtext={formatFileSize(stats.totalSize)}
                onClick={() => setStatusFilter("all")}
                isActive={statusFilter === "all"}
              />
              <StatCard
                icon={IconCheck}
                label="Ready"
                value={stats.ready}
                subtext={`${stats.totalPages} total pages`}
                onClick={() => setStatusFilter("ready")}
                isActive={statusFilter === "ready"}
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
                label="Errors"
                value={stats.error}
                onClick={() => setStatusFilter("error")}
                isActive={statusFilter === "error"}
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
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-35">
                      <IconFilter className="h-4 w-4" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="all">All status</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
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
                  searchTerm || statusFilter !== "all" ? (
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
                        }}
                      >
                        Clear filters
                      </Button>
                    </div>
                  ) : (
                    <EmptyState />
                  )
                ) : (
                  filteredDocuments.map((doc) => (
                    <DocumentRow key={doc.id} document={doc} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
