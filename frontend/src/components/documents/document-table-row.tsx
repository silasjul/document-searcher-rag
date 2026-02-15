import { memo, useCallback, useState } from "react";
import {
  IconFileTypePdf,
  IconDownload,
  IconDots,
  IconEye,
  IconPlus,
  IconTag,
  IconTrash,
  IconWorld,
  IconWorldOff,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Document, Tag } from "@/lib/types";
import { formatFileSize } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { DocumentStatusBadge } from "./document-status-badge";
import {
  downloadDocument,
  deleteDocument,
  toggleDocumentGlobal,
} from "@/utils/documents/document-actions";
import { toast } from "sonner";
import { TagBadge } from "./tag-badge";
import { TagEditorDialog } from "./tag-editor";
import { TableCell, TableRow } from "@/components/ui/table";

export const DocumentTableRow = memo(function DocumentTableRow({
  document,
  allTags,
  selected,
  onSelectChange,
  onClick,
  onDeleted,
  onUpdated,
  onTagCreated,
  onTagDeleted,
}: {
  document: Document;
  allTags: Tag[];
  selected?: boolean;
  onSelectChange?: (checked: boolean) => void;
  onClick?: () => void;
  onDeleted?: (documentId: string) => void;
  onUpdated?: (document: Document) => void;
  onTagCreated?: (tag: Tag) => void;
  onTagDeleted?: (tagId: string) => void;
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingGlobal, setIsTogglingGlobal] = useState(false);
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

  const handleDelete = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isDeleting) return;
      setIsDeleting(true);
      const toastId = toast.loading(`Deleting ${document.original_name}...`);
      try {
        await deleteDocument(document.id);
        toast.dismiss(toastId);
        toast.success(`${document.original_name} deleted`);
        onDeleted?.(document.id);
      } catch (err) {
        console.error("Delete failed:", err);
        toast.dismiss(toastId);
        toast.error("Failed to delete document");
      } finally {
        setIsDeleting(false);
      }
    },
    [document.id, document.original_name, isDeleting, onDeleted],
  );

  const handleToggleGlobal = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isTogglingGlobal) return;
      setIsTogglingGlobal(true);
      const action = document.is_global ? "Removing from" : "Moving to";
      const toastId = toast.loading(`${action} global documents...`);
      try {
        const newValue = await toggleDocumentGlobal(
          document.id,
          !document.is_global,
        );
        toast.dismiss(toastId);
        toast.success(
          newValue
            ? `${document.original_name} moved to global documents`
            : `${document.original_name} removed from global documents`,
        );
        onUpdated?.({ ...document, is_global: newValue });
      } catch (err) {
        console.error("Toggle global failed:", err);
        toast.dismiss(toastId);
        toast.error("Failed to update document");
      } finally {
        setIsTogglingGlobal(false);
      }
    },
    [document, isTogglingGlobal, onUpdated],
  );

  const handleTagsSaved = useCallback(
    (newTags: Tag[]) => {
      onUpdated?.({ ...document, tags: newTags });
    },
    [document, onUpdated],
  );

  const openTagEditor = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setTagEditorOpen(true);
    },
    [],
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

        {/* Name — clicking opens the PDF viewer */}
        <TableCell
          className="max-w-75 cursor-pointer"
          onClick={onClick}
        >
          <div className="flex items-center gap-2.5 text-foreground/80 transition-colors hover:text-foreground">
            <IconFileTypePdf className="h-4 w-4 shrink-0 text-red-500" />
            <span className="truncate font-medium text-sm">
              {document.original_name}
            </span>
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
          <div className="flex items-center justify-end opacity-0 transition-opacity group-hover:opacity-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                >
                  <IconDots className="h-3.5 w-3.5" />
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
                <DropdownMenuItem onClick={openTagEditor}>
                  <IconTag className="mr-2 h-4 w-4" />
                  Edit tags
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={isTogglingGlobal}
                  onClick={handleToggleGlobal}
                >
                  {document.is_global ? (
                    <>
                      <IconWorldOff className="mr-2 h-4 w-4" />
                      Remove from global
                    </>
                  ) : (
                    <>
                      <IconWorld className="mr-2 h-4 w-4" />
                      Set as global
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  disabled={isDeleting}
                  onClick={handleDelete}
                >
                  <IconTrash className="mr-2 h-4 w-4 text-destructive" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
});
