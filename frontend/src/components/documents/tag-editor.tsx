"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Tag } from "@/lib/types";
import {
  TAG_COLOR_OPTIONS,
  TAG_DOT_COLORS,
  type TagColor,
} from "./tag-badge";
import {
  createTag,
  deleteTag,
  addTagToDocument,
  removeTagFromDocument,
} from "@/utils/documents/document-actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TagEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allTags: Tag[];
  documentTags: Tag[];
  fileId: string;
  documentName: string;
  /** Called after save with the new set of tags for this document */
  onSaved: (newTags: Tag[]) => void;
  /** Called when a brand-new tag is created */
  onTagCreated: (tag: Tag) => void;
  /** Called when a tag is permanently deleted */
  onTagDeleted?: (tagId: string) => void;
}

export function TagEditorDialog({
  open,
  onOpenChange,
  allTags,
  documentTags,
  fileId,
  documentName,
  onSaved,
  onTagCreated,
  onTagDeleted,
}: TagEditorDialogProps) {
  // Local toggle state: set of tag IDs that are "on" for this document
  const [enabledIds, setEnabledIds] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // "Create new tag" form state
  const [showCreate, setShowCreate] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState<TagColor>("gray");
  const [isCreating, setIsCreating] = useState(false);

  // Reset local state whenever the dialog opens
  useEffect(() => {
    if (open) {
      setEnabledIds(new Set(documentTags.map((t) => t.id)));
      setShowCreate(false);
      setNewTagName("");
      setNewTagColor("gray");
    }
  }, [open, documentTags]);

  // Compute what changed relative to the original document tags
  const originalIds = useMemo(
    () => new Set(documentTags.map((t) => t.id)),
    [documentTags],
  );

  const hasChanges = useMemo(() => {
    if (enabledIds.size !== originalIds.size) return true;
    for (const id of enabledIds) {
      if (!originalIds.has(id)) return true;
    }
    return false;
  }, [enabledIds, originalIds]);

  const handleToggle = useCallback((tagId: string, checked: boolean) => {
    setEnabledIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(tagId);
      } else {
        next.delete(tagId);
      }
      return next;
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);

    const toAdd = [...enabledIds].filter((id) => !originalIds.has(id));
    const toRemove = [...originalIds].filter((id) => !enabledIds.has(id));

    try {
      await Promise.all([
        ...toAdd.map((id) => addTagToDocument(fileId, id)),
        ...toRemove.map((id) => removeTagFromDocument(fileId, id)),
      ]);

      const newTags = allTags.filter((t) => enabledIds.has(t.id));
      onSaved(newTags);
      toast.success("Tags updated successfully");
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to save tags:", err);
      toast.error("Failed to save tag changes");
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, enabledIds, originalIds, allTags, fileId, onSaved, onOpenChange]);

  const handleCreateTag = useCallback(async () => {
    const trimmed = newTagName.trim();
    if (!trimmed || isCreating) return;

    // Check for duplicates
    if (allTags.some((t) => t.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("A tag with that name already exists");
      return;
    }

    setIsCreating(true);
    try {
      const newTag = await createTag(trimmed, newTagColor);
      onTagCreated(newTag);
      // Auto-enable the new tag
      setEnabledIds((prev) => new Set([...prev, newTag.id]));
      setNewTagName("");
      setShowCreate(false);
      toast.success(`Tag "${trimmed}" created`);
    } catch (err) {
      console.error("Failed to create tag:", err);
      toast.error("Failed to create tag");
    } finally {
      setIsCreating(false);
    }
  }, [newTagName, newTagColor, isCreating, allTags, onTagCreated]);

  const handleDeleteTag = useCallback(
    async (tag: Tag) => {
      try {
        await deleteTag(tag.id);
        // Remove from local toggle state
        setEnabledIds((prev) => {
          const next = new Set(prev);
          next.delete(tag.id);
          return next;
        });
        onTagDeleted?.(tag.id);
        toast.success(`Tag "${tag.name}" deleted`);
      } catch (err) {
        console.error("Failed to delete tag:", err);
        toast.error("Failed to delete tag");
      }
    },
    [onTagDeleted],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Edit tags</DialogTitle>
          <DialogDescription className="truncate">
            {documentName}
          </DialogDescription>
        </DialogHeader>

        {/* Tag rows */}
        <div className="space-y-1 max-h-72 overflow-y-auto -mx-1 px-1">
          {allTags.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No tags yet. Create your first one below.
            </p>
          )}
          {allTags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-colors"
            >
              {/* Color dot */}
              <span
                className={cn(
                  "h-3 w-3 shrink-0 rounded-full",
                  TAG_DOT_COLORS[tag.color] ?? TAG_DOT_COLORS.gray,
                )}
              />

              {/* Tag name */}
              <span className="flex-1 truncate text-sm font-medium">
                {tag.name}
              </span>

              {/* Toggle switch */}
              <Switch
                checked={enabledIds.has(tag.id)}
                onCheckedChange={(checked) => handleToggle(tag.id, checked)}
              />

              {/* Delete button with confirmation dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <IconTrash className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => handleDeleteTag(tag)}
                  >
                    <IconTrash className="size-4 text-destructive" />
                    Delete &quot;{tag.name}&quot;
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>

        {/* Create new tag */}
        {showCreate ? (
          <div className="rounded-lg border border-border p-3 space-y-3">
            <Input
              placeholder="Tag name"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateTag();
                if (e.key === "Escape") setShowCreate(false);
              }}
              autoFocus
            />
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Color:</span>
              <div className="flex items-center gap-1.5">
                {TAG_COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewTagColor(color)}
                    className={cn(
                      "h-5 w-5 rounded-full transition-all",
                      TAG_DOT_COLORS[color],
                      newTagColor === color
                        ? "ring-2 ring-offset-2 ring-offset-background ring-primary scale-110"
                        : "opacity-50 hover:opacity-80",
                    )}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleCreateTag}
                disabled={isCreating || !newTagName.trim()}
                className="flex-1 gap-1.5"
              >
                <IconPlus className="h-4 w-4" />
                {isCreating ? "Creating..." : "Create"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowCreate(false);
                  setNewTagName("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-1.5"
            onClick={() => setShowCreate(true)}
          >
            <IconPlus className="h-4 w-4" />
            New tag
          </Button>
        )}

        {/* Footer with save */}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
