"use client";

import { useState, useMemo, useCallback } from "react";
import type { Document } from "@/lib/types";

interface UseDocumentSelectionOptions {
  filteredDocuments: Document[];
  paginatedDocuments: Document[];
}

export function useDocumentSelection({
  filteredDocuments,
  paginatedDocuments,
}: UseDocumentSelectionOptions) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

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

  // Are all items on this page selected?
  const allPageSelected =
    paginatedDocuments.length > 0 &&
    paginatedDocuments.every((d) => selectedIds.has(d.id));
  const somePageSelected =
    !allPageSelected && paginatedDocuments.some((d) => selectedIds.has(d.id));

  const selectedDocuments = useMemo(
    () => filteredDocuments.filter((d) => selectedIds.has(d.id)),
    [filteredDocuments, selectedIds],
  );

  return {
    selectedIds,
    isBulkProcessing,
    setIsBulkProcessing,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    allPageSelected,
    somePageSelected,
    selectedDocuments,
  };
}
