import { useCallback, useState } from "react";
import { Document, Tag } from "@/lib/types";
import {
  IconFileTypePdf,
  IconDotsVertical,
  IconDownload,
  IconEye,
  IconPlus,
  IconTrash,
  IconWorld,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { TagBadge } from "@/components/documents/tag-badge";
import { TagEditorDialog } from "@/components/documents/tag-editor";
import {
  downloadDocument,
  removeDocumentFromProject,
} from "@/utils/documents/document-actions";
import { toast } from "sonner";
import { TableCell, TableRow } from "@/components/ui/table";

export function ProjectDocumentTableRow({
  document,
  projectId,
  allTags,
  selected,
  onSelectChange,
  onClick,
  onRemoved,
  onUpdated,
  onTagCreated,
  onTagDeleted,
}: {
  document: Document;
  projectId: string;
  allTags: Tag[];
  selected?: boolean;
  onSelectChange?: (checked: boolean) => void;
  onClick?: () => void;
  onRemoved?: (documentId: string) => void;
  onUpdated?: (document: Document) => void;
  onTagCreated?: (tag: Tag) => void;
  onTagDeleted?: (tagId: string) => void;
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tagEditorOpen, setTagEditorOpen] = useState(false);

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
      const toastId = toast.loading(
        `Removing ${document.original_name} from project...`,
      );
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

  const openTagEditor = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setTagEditorOpen(true);
    },
    [],
  );

  const handleTagsSaved = useCallback(
    (newTags: Tag[]) => {
      onUpdated?.({ ...document, tags: newTags });
    },
    [document, onUpdated],
  );

  return (
    <>
      <TableRow
        className="group hover:bg-muted/50"
        data-state={selected ? "selected" : undefined}
      >
        {/* Checkbox */}
        <TableCell className="w-10 pr-0">
          <Checkbox
            checked={selected}
            onCheckedChange={(v) => onSelectChange?.(!!v)}
            aria-label={`Select ${document.original_name}`}
          />
        </TableCell>

        {/* Name — clicking opens the document */}
        <TableCell
          className="max-w-62.5 cursor-pointer"
          onClick={onClick}
        >
          <div className="flex items-center gap-2.5 text-foreground/80 transition-colors hover:text-foreground">
            <IconFileTypePdf className="h-4 w-4 shrink-0 text-red-500" />
            <span className="truncate font-medium text-sm">
              {document.original_name}
            </span>
            {document.is_global && (
              <Badge
                variant="secondary"
                className="gap-1 shrink-0 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs px-1.5 py-0"
              >
                <IconWorld className="h-2.5 w-2.5" />
                Global
              </Badge>
            )}
          </div>
        </TableCell>

        {/* Status */}
        <TableCell>
          <DocumentStatusBadge status={document.status} />
        </TableCell>

        {/* Tags — entire cell is clickable to open tag editor */}
        <TableCell
          className="max-w-50 cursor-pointer group/tags"
          onClick={openTagEditor}
        >
          <div className="flex items-center gap-1 overflow-hidden">
            {document.tags.slice(0, 3).map((tag) => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
            {document.tags.length > 3 && (
              <span className="text-xs text-muted-foreground ml-1">
                +{document.tags.length - 3}
              </span>
            )}
            <IconPlus className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/tags:opacity-100" />
          </div>
        </TableCell>

        {/* Pages */}
        <TableCell className="text-muted-foreground text-sm tabular-nums">
          {document.page_count}
        </TableCell>

        {/* Size */}
        <TableCell className="text-muted-foreground text-sm">
          {formatFileSize(document.file_size)}
        </TableCell>

        {/* Uploaded */}
        <TableCell className="text-muted-foreground text-sm">
          {formatDistanceToNow(new Date(document.created_at), {
            addSuffix: true,
          })}
        </TableCell>

        {/* Actions */}
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <IconDotsVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onClick}>
                <IconEye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
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
        </TableCell>
      </TableRow>

      <TagEditorDialog
        open={tagEditorOpen}
        onOpenChange={setTagEditorOpen}
        allTags={allTags}
        documentTags={document.tags}
        fileId={document.id}
        documentName={document.original_name}
        onSaved={handleTagsSaved}
        onTagCreated={(tag) => onTagCreated?.(tag)}
        onTagDeleted={(tagId) => onTagDeleted?.(tagId)}
      />
    </>
  );
}
