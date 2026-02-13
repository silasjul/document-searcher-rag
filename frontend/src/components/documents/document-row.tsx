import { memo, useCallback, useState } from "react";
import {
  IconFileTypePdf,
  IconDownload,
  IconDots,
  IconPlus,
  IconTag,
  IconTrash,
  IconWorld,
  IconWorldOff,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
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

export const DocumentRow = memo(function DocumentRow({
  document,
  allTags,
  onClick,
  onDeleted,
  onUpdated,
  onTagCreated,
  onTagDeleted,
}: {
  document: Document;
  allTags: Tag[];
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

  // Tag editor callback — receives the full new tag set after save
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
            <DocumentStatusBadge
              status={document.status}
              className="shrink-0"
            />
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
          {/* Tags */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {document.tags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-md opacity-0 transition-opacity group-hover:opacity-100"
              onClick={openTagEditor}
            >
              <IconPlus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={isDownloading}
            onClick={handleDownload}
          >
            <IconDownload className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => e.stopPropagation()}
              >
                <IconDots className="h-4 w-4" />
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
      </div>

      {/* Tag editor dialog — rendered outside the row to avoid click propagation issues */}
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
