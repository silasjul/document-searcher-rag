"use client";

import {
  IconArrowUp,
  IconArrowDown,
  IconArrowsSort,
} from "@tabler/icons-react";
import { Checkbox } from "@/components/ui/checkbox";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { SortKey, SortDir } from "@/hooks/use-document-filtering";

interface DocumentTableHeaderProps {
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  allPageSelected: boolean;
  somePageSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  /** Extra column at the end (e.g. actions). Defaults to a narrow empty column. */
  extraColumnWidth?: string;
}

function SortIcon({ columnKey, sortKey, sortDir }: { columnKey: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (sortKey !== columnKey) {
    return <IconArrowsSort className="h-3.5 w-3.5 text-muted-foreground/50" />;
  }
  return sortDir === "asc" ? (
    <IconArrowUp className="h-3.5 w-3.5" />
  ) : (
    <IconArrowDown className="h-3.5 w-3.5" />
  );
}

export function DocumentTableHeader({
  sortKey,
  sortDir,
  onSort,
  allPageSelected,
  somePageSelected,
  onSelectAll,
  extraColumnWidth = "w-10",
}: DocumentTableHeaderProps) {
  return (
    <TableHeader className="bg-muted/50">
      <TableRow>
        <TableHead className="w-10 pr-0">
          <Checkbox
            checked={allPageSelected || (somePageSelected && "indeterminate")}
            onCheckedChange={(v) => onSelectAll(!!v)}
            aria-label="Select all"
          />
        </TableHead>
        <TableHead
          className="min-w-48 cursor-pointer select-none hover:text-foreground transition-colors"
          onClick={() => onSort("name")}
        >
          <div className="flex items-center gap-1.5">
            Name
            <SortIcon columnKey="name" sortKey={sortKey} sortDir={sortDir} />
          </div>
        </TableHead>
        <TableHead className="w-25">Status</TableHead>
        <TableHead className="w-50">Tags</TableHead>
        <TableHead
          className="w-17.5 cursor-pointer select-none hover:text-foreground transition-colors"
          onClick={() => onSort("pages")}
        >
          <div className="flex items-center gap-1.5">
            Pages
            <SortIcon columnKey="pages" sortKey={sortKey} sortDir={sortDir} />
          </div>
        </TableHead>
        <TableHead
          className="w-20 cursor-pointer select-none hover:text-foreground transition-colors"
          onClick={() => onSort("size")}
        >
          <div className="flex items-center gap-1.5">
            Size
            <SortIcon columnKey="size" sortKey={sortKey} sortDir={sortDir} />
          </div>
        </TableHead>
        <TableHead
          className="w-30 cursor-pointer select-none hover:text-foreground transition-colors"
          onClick={() => onSort("date")}
        >
          <div className="flex items-center gap-1.5">
            Uploaded
            <SortIcon columnKey="date" sortKey={sortKey} sortDir={sortDir} />
          </div>
        </TableHead>
        <TableHead className={extraColumnWidth} />
      </TableRow>
    </TableHeader>
  );
}
