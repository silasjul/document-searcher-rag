"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Project, ChatSession, Document, Tag } from "@/lib/types";
import { useUserTags } from "@/hooks/use-documents";
import { useDocumentFiltering } from "@/hooks/use-document-filtering";
import { useDocumentSelection } from "@/hooks/use-document-selection";
import { Button } from "@/components/ui/button";
import {
  IconMessage,
  IconFileText,
  IconDownload,
  IconTrash,
} from "@tabler/icons-react";
import { StatCard } from "./stat-card";
import { ProjectHeader } from "./project-header";
import { ConversationsSection } from "./conversations-section";
import { ProjectDocumentsSection } from "./project-documents-section";
import { QuickActionsFooter } from "./quick-actions-footer";
import { AddFromLibraryDialog } from "./add-from-library-dialog";
import { UploadDialog } from "@/components/documents/upload-dialog";
import { BulkActionBar } from "@/components/documents/bulk-action-bar";
import {
  downloadDocument,
  bulkDownloadDocuments,
  removeDocumentFromProject,
} from "@/utils/documents/document-actions";
import { addDocumentsToProject } from "@/utils/projects/projects-actions";
import { toast } from "sonner";

interface ProjectOverviewProps {
  projectData: Project;
  chats: ChatSession[];
  documents: Document[];
  onDocumentClick?: (documentId: string) => void;
}

// Main Component
export function ProjectOverview({
  projectData,
  chats,
  documents,
  onDocumentClick,
}: ProjectOverviewProps) {
  const router = useRouter();
  const { tags: userTags, mutate: mutateTags } = useUserTags();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAddFromLibraryOpen, setIsAddFromLibraryOpen] = useState(false);
  const [localDocs, setLocalDocs] = useState<Document[]>(documents);

  // Sync local docs when the prop changes (e.g. after router.refresh)
  useEffect(() => {
    setLocalDocs(documents);
  }, [documents]);

  // ── Filtering & sorting (shared hook) ────────────────────────────────────
  const filtering = useDocumentFiltering({
    documents: localDocs,
    defaultPageSize: 25,
  });

  // ── Selection (shared hook) ──────────────────────────────────────────────
  const selection = useDocumentSelection({
    filteredDocuments: filtering.filteredDocuments,
    paginatedDocuments: filtering.paginatedDocuments,
  });

  // ── Derived state ────────────────────────────────────────────────────────
  const sortedChats = [...chats].sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  );
  const latestChat = sortedChats[0];
  const readyDocuments = localDocs.filter(
    (d) => d.status === "completed",
  ).length;
  const hasReadyDocuments = readyDocuments > 0;

  // ── Callbacks ────────────────────────────────────────────────────────────

  const handleDocumentRemoved = useCallback(() => {
    router.refresh();
  }, [router]);

  const handleDocumentUpdated = useCallback((updated: Document) => {
    setLocalDocs((prev) =>
      prev.map((d) => (d.id === updated.id ? updated : d)),
    );
  }, []);

  const handleTagCreated = useCallback(
    (tag: Tag) => {
      mutateTags(
        (prev) => {
          if (!prev) return [tag];
          if (prev.some((t) => t.id === tag.id)) return prev;
          return [...prev, tag].sort((a, b) => a.name.localeCompare(b.name));
        },
        { revalidate: false },
      );
    },
    [mutateTags],
  );

  const handleTagDeleted = useCallback(
    (tagId: string) => {
      mutateTags(
        (prev) => (prev ?? []).filter((t) => t.id !== tagId),
        { revalidate: false },
      );
      setLocalDocs((prev) =>
        prev.map((doc) => ({
          ...doc,
          tags: doc.tags.filter((t) => t.id !== tagId),
        })),
      );
    },
    [mutateTags],
  );

  const handleUploadComplete = useCallback(
    async (fileIds: string[]) => {
      if (fileIds.length > 0) {
        try {
          await addDocumentsToProject(projectData.id, fileIds);
          toast.success(
            `Uploaded and added ${fileIds.length} document${fileIds.length !== 1 ? "s" : ""} to project`,
          );
        } catch (error) {
          console.error(
            "Failed to add uploaded documents to project:",
            error,
          );
          toast.error(
            "Files uploaded to library but failed to add to project",
          );
        }
      }
      router.refresh();
    },
    [router, projectData.id],
  );

  // ── Bulk actions ─────────────────────────────────────────────────────────

  const handleBulkDownload = useCallback(async () => {
    if (selection.isBulkProcessing) return;
    selection.setIsBulkProcessing(true);
    const toastId = toast.loading(
      `Preparing ${selection.selectedDocuments.length} documents for download...`,
    );
    try {
      if (selection.selectedDocuments.length === 1) {
        await downloadDocument(selection.selectedDocuments[0]);
      } else {
        await bulkDownloadDocuments(selection.selectedDocuments);
      }
      toast.dismiss(toastId);
      toast.success(
        `Downloaded ${selection.selectedDocuments.length} document${selection.selectedDocuments.length !== 1 ? "s" : ""}`,
      );
    } catch {
      toast.dismiss(toastId);
      toast.error("Failed to download documents");
    }
    selection.setIsBulkProcessing(false);
  }, [selection]);

  const handleBulkRemove = useCallback(async () => {
    if (selection.isBulkProcessing) return;
    selection.setIsBulkProcessing(true);
    const removable = selection.selectedDocuments.filter((d) => !d.is_global);
    const toastId = toast.loading(
      `Removing ${removable.length} documents from project...`,
    );
    let count = 0;
    for (const doc of removable) {
      try {
        await removeDocumentFromProject(doc.id, projectData.id);
        count++;
      } catch {
        console.error(`Failed to remove ${doc.original_name}`);
      }
    }
    toast.dismiss(toastId);
    toast.success(
      `Removed ${count} document${count !== 1 ? "s" : ""} from project`,
    );
    selection.clearSelection();
    selection.setIsBulkProcessing(false);
    router.refresh();
  }, [selection, projectData.id, router]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden h-full">
      <div className="relative h-full overflow-auto">
        <div className="mx-auto max-w-6xl px-6 py-12 md:px-8 md:py-16">
          <div className="space-y-10">
            <ProjectHeader
              projectId={projectData.id}
              chatCount={chats.length}
              documentCount={localDocs.length}
              latestChat={latestChat}
              hasReadyDocuments={hasReadyDocuments}
            />

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard
                icon={IconMessage}
                label="Total Conversations"
                value={chats.length}
                onClick={() => scrollToSection("conversations")}
              />
              <StatCard
                icon={IconFileText}
                label="Documents"
                value={`${readyDocuments}/${localDocs.length}`}
                trend={
                  localDocs.length - readyDocuments > 0
                    ? `${localDocs.length - readyDocuments} processing`
                    : undefined
                }
                onClick={() => scrollToSection("documents")}
              />
            </div>

            {/* Conversations */}
            {hasReadyDocuments && (
              <ConversationsSection
                chats={chats}
                projectId={projectData.id}
              />
            )}

            {/* Documents */}
            <ProjectDocumentsSection
              documents={localDocs}
              projectId={projectData.id}
              userTags={userTags}
              filtering={filtering}
              selection={selection}
              onUploadClick={() => setIsUploadOpen(true)}
              onAddFromLibraryClick={() => setIsAddFromLibraryOpen(true)}
              onDocumentClick={onDocumentClick}
              onDocumentRemoved={handleDocumentRemoved}
              onDocumentUpdated={handleDocumentUpdated}
              onTagCreated={handleTagCreated}
              onTagDeleted={handleTagDeleted}
            />

            {/* Quick Actions Footer */}
            <QuickActionsFooter
              projectId={projectData.id}
              hasReadyDocuments={hasReadyDocuments}
            />
          </div>
        </div>
      </div>

      <UploadDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        existingFileNames={localDocs.map((d) => d.original_name)}
        onUploadComplete={handleUploadComplete}
      />

      <AddFromLibraryDialog
        open={isAddFromLibraryOpen}
        onOpenChange={setIsAddFromLibraryOpen}
        projectId={projectData.id}
        projectName={projectData.name}
        existingDocumentIds={localDocs.map((d) => d.id)}
      />

      <BulkActionBar
        selectedCount={selection.selectedIds.size}
        onClearSelection={selection.clearSelection}
      >
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1.5"
          disabled={selection.isBulkProcessing}
          onClick={handleBulkDownload}
        >
          <IconDownload className="h-3.5 w-3.5" />
          Download
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 text-destructive hover:text-destructive"
          disabled={selection.isBulkProcessing}
          onClick={handleBulkRemove}
        >
          <IconTrash className="h-3.5 w-3.5" />
          Remove from project
        </Button>
      </BulkActionBar>
    </div>
  );
}
