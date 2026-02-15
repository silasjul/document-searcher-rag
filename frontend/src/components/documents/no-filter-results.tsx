"use client";

import { IconSearch } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface NoFilterResultsProps {
  onClearFilters: () => void;
}

export function NoFilterResults({ onClearFilters }: NoFilterResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-muted/20 py-12 text-center">
      <IconSearch className="mb-3 h-8 w-8 text-muted-foreground" />
      <h3 className="font-medium text-foreground">No documents found</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Try adjusting your search or filters
      </p>
      <Button variant="outline" className="mt-4" onClick={onClearFilters}>
        Clear filters
      </Button>
    </div>
  );
}
