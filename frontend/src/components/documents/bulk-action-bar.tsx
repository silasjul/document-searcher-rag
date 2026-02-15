import { ReactNode } from "react";
import { IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  children: ReactNode;
}

export function BulkActionBar({
  selectedCount,
  onClearSelection,
  children,
}: BulkActionBarProps) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transition-all duration-200 ease-out ${
        selectedCount > 0
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-2.5 shadow-lg">
        <div className="flex items-center gap-2 text-sm font-medium whitespace-nowrap">
          <span className="tabular-nums">{selectedCount}</span>
          <span className="text-muted-foreground">selected</span>
        </div>

        <div className="h-4 w-px bg-border" />

        <div className="flex items-center gap-1.5">{children}</div>

        <div className="h-4 w-px bg-border" />

        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-muted-foreground"
          onClick={onClearSelection}
        >
          <IconX className="h-3.5 w-3.5" />
          Clear
        </Button>
      </div>
    </div>
  );
}
