"use client";

import { useState, useMemo, useCallback } from "react";
import type { Document, Tag } from "@/lib/types";

export type SortKey = "name" | "pages" | "size" | "date";
export type SortDir = "asc" | "desc";

interface UseDocumentFilteringOptions {
  documents: Document[];
  defaultPageSize?: number;
}

export function useDocumentFiltering({
  documents,
  defaultPageSize = 50,
}: UseDocumentFilteringOptions) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    let docs = [...documents];

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
  }, [documents, searchTerm, statusFilter, tagFilter, sortKey, sortDir]);

  // Pagination
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

  // Wrappers that also reset pagination
  const updateSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setPageIndex(0);
  }, []);

  const updateStatusFilter = useCallback((value: string) => {
    setStatusFilter(value);
    setPageIndex(0);
  }, []);

  const updateTagFilter = useCallback((value: string) => {
    setTagFilter(value);
    setPageIndex(0);
  }, []);

  // Toggle sort: if same key, flip direction; if new key, default to desc (except name → asc)
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
    [sortKey],
  );

  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("all");
    setTagFilter("all");
    setPageIndex(0);
  }, []);

  const updatePageSize = useCallback((size: number) => {
    setPageSize(size);
    setPageIndex(0);
  }, []);

  return {
    // State
    searchTerm,
    statusFilter,
    tagFilter,
    sortKey,
    sortDir,
    pageIndex,
    pageSize,
    pageCount,
    safePageIndex,

    // Computed
    filteredDocuments,
    paginatedDocuments,

    // Actions
    updateSearch,
    updateStatusFilter,
    updateTagFilter,
    handleSort,
    resetFilters,
    setPageIndex,
    updatePageSize,
  };
}
