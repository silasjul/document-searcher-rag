import { Document } from "@/lib/mock-data";
import {
  IconFileTypePdf,
  IconLoader2,
  IconCheck,
  IconDotsVertical,
  IconDownload,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { formatFileSize } from "@/lib/utils";

export function DocumentCard({ document }: { document: Document }) {
  const uploadedDate = new Date(document.uploadedAt);

  return (
    <div className="group flex items-center gap-4 rounded-xl border border-border/50 bg-card p-4 transition-colors hover:border-border hover:bg-accent/30">
      {/* PDF Icon */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
        <IconFileTypePdf className="h-6 w-6" strokeWidth={1.5} />
      </div>

      {/* Document Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="truncate font-medium text-foreground">
            {document.name}
          </h4>
          {document.status === "processing" && (
            <Badge
              variant="secondary"
              className="gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400"
            >
              <IconLoader2 className="h-3 w-3 animate-spin" />
              Processing
            </Badge>
          )}
          {document.status === "ready" && (
            <Badge
              variant="secondary"
              className="gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            >
              <IconCheck className="h-3 w-3" />
              Ready
            </Badge>
          )}
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <span>{formatFileSize(document.fileSize)}</span>
          <span>•</span>
          <span>{document.pageCount} pages</span>
          <span>•</span>
          <span>
            Uploaded {formatDistanceToNow(uploadedDate, { addSuffix: true })}
          </span>
        </div>
      </div>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <IconDotsVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <IconDownload className="mr-2 h-4 w-4" />
            Download
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
