import { useCallback, useState } from "react";
import { Document } from "@/lib/types";
import {
  IconFileTypePdf,
  IconDotsVertical,
  IconDownload,
  IconTrash,
  IconWorld,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { formatFileSize } from "@/lib/utils";
import { DocumentStatusBadge } from "@/components/documents/document-status-badge";
import {
  downloadDocument,
  removeDocumentFromProject,
} from "@/utils/documents/document-actions";
import { toast } from "sonner";

export function DocumentCard({
  document,
  projectId,
  onClick,
  onRemoved,
}: {
  document: Document;
  projectId: string;
  onClick?: () => void;
  onRemoved?: (documentId: string) => void;
}) {
  const uploadedDate = new Date(document.created_at);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDownload = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isDownloading) return;
      setIsDownloading(true);
      const toastId = toast.loading(`Downloading ${document.original_name}...`);
      try {
        await downloadDocument(document);
        toast.dismiss(toastId);
      } catch (err) {
        console.error("Download failed:", err);
        toast.dismiss(toastId);
        toast.error("Failed to download document");
      } finally {
        setIsDownloading(false);
      }
    },
    [document, isDownloading],
  );

  const handleRemove = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isDeleting) return;
      setIsDeleting(true);
      const toastId = toast.loading(`Removing ${document.original_name} from project...`);
      try {
        await removeDocumentFromProject(document.id, projectId);
        toast.dismiss(toastId);
        toast.success(`${document.original_name} removed from project`);
        onRemoved?.(document.id);
      } catch (err) {
        console.error("Remove failed:", err);
        toast.dismiss(toastId);
        toast.error("Failed to remove document from project");
      } finally {
        setIsDeleting(false);
      }
    },
    [document.id, document.original_name, projectId, isDeleting, onRemoved],
  );

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
            {document.original_name}
          </h4>
          {document.is_global && (
            <Badge variant="secondary" className="gap-1.5 shrink-0 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <IconWorld className="h-3 w-3" />
              Global
            </Badge>
          )}
          <DocumentStatusBadge status={document.status} />
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <span>{formatFileSize(document.file_size)}</span>
          <span>•</span>
          <span>{document.page_count} pages</span>
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
            onClick={(e) => e.stopPropagation()}
          >
            <IconDotsVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            disabled={isDownloading}
            onClick={handleDownload}
          >
            <IconDownload className="mr-2 h-4 w-4" />
            Download
          </DropdownMenuItem>
          {!document.is_global && (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              disabled={isDeleting}
              onClick={handleRemove}
            >
              <IconTrash className="mr-2 h-4 w-4" />
              Remove
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
