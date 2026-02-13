import {
  IconFileTypePdf,
  IconDownload,
  IconDots,
  IconTag,
  IconTrash,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Document } from "@/lib/types";
import { formatFileSize } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { DocumentStatusBadge } from "./document-status-badge";

export function DocumentRow({
  document,
  onClick,
}: {
  document: Document;
  onClick?: () => void;
}) {
  return (
    <div
      className="group flex items-center gap-4 rounded-xl border border-border/50 bg-card/30 p-4 backdrop-blur-sm transition-all hover:border-border hover:bg-card/60 cursor-pointer"
      onClick={onClick}
    >
      {/* Icon */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
        <IconFileTypePdf className="h-6 w-6" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-medium text-foreground">
            {document.original_name}
          </h3>
          <DocumentStatusBadge status={document.status} className="shrink-0" />
        </div>
        <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
          <span>{document.page_count} pages</span>
          <span>•</span>
          <span>{formatFileSize(document.file_size)}</span>
          <span>•</span>
          <span>
            {formatDistanceToNow(new Date(document.created_at), {
              addSuffix: true,
            })}
          </span>
        </div>
        {document.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {document.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs font-normal"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <IconDownload className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <IconDots className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <IconDownload className="mr-2 h-4 w-4" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem>
              <IconTag className="mr-2 h-4 w-4" />
              Edit tags
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <IconTrash className="mr-2 h-4 w-4 text-destructive" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
