import { Document } from "@/lib/mock-data";
import {
  IconFileTypePdf,
  IconDotsVertical,
  IconDownload,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { formatFileSize } from "@/lib/utils";
import { DocumentStatusBadge } from "@/components/documents/document-status-badge";

export function DocumentCard({
  document,
  onClick,
}: {
  document: Document;
  onClick?: () => void;
}) {
  const uploadedDate = new Date(document.uploadedAt);

  return (
    <div
      className="group flex items-center gap-4 rounded-xl border border-border/50 bg-card/30 p-4 backdrop-blur-sm transition-all hover:border-border hover:bg-card/60 cursor-pointer"
      onClick={onClick}
    >
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
          <DocumentStatusBadge status={document.status} />
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
