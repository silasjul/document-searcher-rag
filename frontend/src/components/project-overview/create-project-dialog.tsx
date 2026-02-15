"use client";

import { useState, useMemo } from "react";
import {
  IconBriefcase,
  IconFiles,
  IconChevronLeft,
  IconUpload,
  IconLibrary,
  IconSearch,
  IconWorld,
} from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Document } from "@/lib/types";
import { DocumentStatusBadge } from "@/components/documents/document-status-badge";
import { TagBadge } from "@/components/documents/tag-badge";
import { formatFileSize, cn } from "@/lib/utils";
import {
  createProject,
  addDocumentsToProject,
} from "@/utils/projects/projects-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Textarea } from "../ui/textarea";
import {
  FileUploadZone,
  type UploadedFile,
} from "@/components/documents/file-upload-zone";
import { useFileUpload } from "@/hooks/use-file-upload";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allDocuments: Document[]; // All user documents (fetched from DB)
  projectId?: string; // If provided, dialog opens in "add documents" mode for existing project
  projectName?: string; // Name of the existing project (for display)
  existingDocumentIds?: string[]; // Document IDs already in the project (to filter out)
}

type Step = "info" | "documents";

export function CreateProjectDialog({
  open,
  onOpenChange,
  allDocuments,
  projectId,
  projectName: existingProjectName,
  existingDocumentIds = [],
}: CreateProjectDialogProps) {
  const router = useRouter();
  const { uploadFiles, isUploading } = useFileUpload();
  const isAddDocumentsMode = !!projectId;
  const [step, setStep] = useState<Step>(
    isAddDocumentsMode ? "documents" : "info"
  );
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [projectName, setProjectName] = useState(existingProjectName || "");
  const [description, setDescription] = useState("");
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<Set<string>>(
    new Set()
  );
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [documentTab, setDocumentTab] = useState<"upload" | "library">("upload");

  // Get existing document names for duplicate detection
  const existingDocumentNames = useMemo(() => {
    return allDocuments.map((doc) => doc.original_name);
  }, [allDocuments]);

  const handleReset = () => {
    setStep(isAddDocumentsMode ? "documents" : "info");
    setProjectName(existingProjectName || "");
    setDescription("");
    setSelectedDocumentIds(new Set());
    setUploadedFiles([]);
    setDocumentTab("upload");
    setIsCreating(false);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      // Reset after animation completes
      setTimeout(handleReset, 200);
    }
    onOpenChange(open);
  };

  const handleNextStep = () => {
    if (step === "info" && projectName.trim() && description.trim()) {
      setStep("documents");
    }
  };

  const handleBackStep = () => {
    setStep("info");
  };

  const toggleDocument = (docId: string) => {
    const newSelected = new Set(selectedDocumentIds);
    if (newSelected.has(docId)) {
      newSelected.delete(docId);
    } else {
      newSelected.add(docId);
    }
    setSelectedDocumentIds(newSelected);
  };

  const handleCreate = async () => {
    const totalDocuments = selectedDocumentIds.size + uploadedFiles.length;

    if (isAddDocumentsMode) {
      // Add documents to existing project
      if (totalDocuments === 0) {
        toast.error("Please select or upload at least one document");
        return;
      }

      setIsCreating(true);
      try {
        // Upload new files via the signed upload flow
        if (uploadedFiles.length > 0) {
          toast.info(
            `Uploading ${uploadedFiles.length} file(s) to your library...`
          );

          await uploadFiles(uploadedFiles, (fileId, status) => {
            setUploadedFiles((prev) =>
              prev.map((f) => (f.id === fileId ? { ...f, status } : f))
            );
          });
        }

        await addDocumentsToProject(
          projectId!,
          Array.from(selectedDocumentIds)
        );
        toast.success(
          `Added ${totalDocuments} document${totalDocuments !== 1 ? "s" : ""
          } to project`
        );
        handleClose(false);
        router.refresh();
      } catch (error) {
        toast.error("Failed to add documents");
        console.error(error);
      } finally {
        setIsCreating(false);
      }
    } else {
      // Create new project
      if (!projectName.trim() || !description.trim()) {
        toast.error("Please fill in all required fields");
        return;
      }

      setIsCreating(true);
      try {
        // Upload new files via the signed upload flow
        if (uploadedFiles.length > 0) {
          toast.info(
            `Uploading ${uploadedFiles.length} file(s) to your library...`
          );

          await uploadFiles(uploadedFiles, (fileId, status) => {
            setUploadedFiles((prev) =>
              prev.map((f) => (f.id === fileId ? { ...f, status } : f))
            );
          });
        }

        const newProjectId = await createProject({
          name: projectName.trim(),
          description: description.trim(),
          documentIds: Array.from(selectedDocumentIds),
        });

        toast.success("Project created successfully!");
        handleClose(false);

        // Navigate to the new project
        router.push(`/dashboard/project/${newProjectId}`);
      } catch (error) {
        toast.error("Failed to create project");
        console.error(error);
      } finally {
        setIsCreating(false);
      }
    }
  };

  const canProceed =
    step === "info" ? projectName.trim() && description.trim() : true; // Can create project without documents

  // Count global documents (ready ones)
  const globalDocumentCount = allDocuments.filter(
    (doc) => doc.is_global && (doc.status === "completed" || doc.status === "uploaded")
  ).length;

  // Get available documents (only ready/uploaded ones, exclude global docs and already added docs in add mode)
  const availableDocuments = allDocuments.filter((doc) => {
    if (doc.status !== "completed" && doc.status !== "uploaded") return false;
    if (doc.is_global) return false; // Global docs are auto-included in every project
    if (isAddDocumentsMode && existingDocumentIds.includes(doc.id))
      return false;
    return true;
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {isAddDocumentsMode ? (
                <>
                  <IconFiles className="h-5 w-5" />
                  Add Documents
                </>
              ) : (
                <>
                  <IconBriefcase className="h-5 w-5" />
                  Create New Project
                </>
              )}
            </div>
          </DialogTitle>
          <DialogDescription>
            {isAddDocumentsMode
              ? `Upload new documents or select from your library to add to "${existingProjectName}".`
              : step === "info"
                ? "Enter the basic information for your new project."
                : "Upload new documents or select from your library (optional)."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          {step === "info" ? (
            <StepInfo
              projectName={projectName}
              setProjectName={setProjectName}
              description={description || ""}
              setDescription={setDescription}
              onNext={handleNextStep}
            />
          ) : (
            <StepDocuments
              selectedDocumentIds={selectedDocumentIds}
              setSelectedDocumentIds={setSelectedDocumentIds}
              availableDocuments={availableDocuments}
              toggleDocument={toggleDocument}
              uploadedFiles={uploadedFiles}
              setUploadedFiles={setUploadedFiles}
              existingDocumentNames={existingDocumentNames}
              documentTab={documentTab}
              setDocumentTab={setDocumentTab}
              totalDocumentCount={allDocuments.length}
              globalDocumentCount={globalDocumentCount}
            />
          )}
        </div>

        <DialogFooter className={cn(step === "documents" && "border-t pt-4")}>
          {step === "documents" && !isAddDocumentsMode && (
            <Button
              variant="outline"
              onClick={handleBackStep}
              disabled={isCreating}
              className="mr-auto"
            >
              <IconChevronLeft className="h-4 w-4" />
              Back
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>

          {step === "info" ? (
            <Button onClick={handleNextStep} disabled={!canProceed}>
              Select Documents
            </Button>
          ) : (
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating
                ? isAddDocumentsMode
                  ? "Adding..."
                  : "Creating..."
                : isAddDocumentsMode
                  ? "Add Documents"
                  : "Create Project"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface StepInfoProps {
  projectName: string;
  setProjectName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  onNext: () => void;
}

function StepInfo({
  projectName,
  setProjectName,
  description,
  setDescription,
  onNext,
}: StepInfoProps) {
  const canProceed = projectName.trim() && description.trim();
  return (
    <div className="grid gap-6 py-2">
      <div className="grid gap-3">
        <Label htmlFor="project-name">Project Name</Label>
        <Input
          id="project-name"
          placeholder="e.g. Study Research"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && canProceed) {
              onNext();
            }
          }}
          autoFocus
        />
      </div>

      <div className="grid gap-3">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="e.g. Research on the impact of climate change on the ocean coral reefs."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && canProceed) {
              onNext();
            }
          }}
        />
      </div>
    </div>
  );
}

interface StepDocumentsProps {
  selectedDocumentIds: Set<string>;
  setSelectedDocumentIds: (ids: Set<string>) => void;
  availableDocuments: Document[];
  toggleDocument: (id: string) => void;
  uploadedFiles: UploadedFile[];
  setUploadedFiles: (files: UploadedFile[]) => void;
  existingDocumentNames: string[];
  documentTab: "upload" | "library";
  setDocumentTab: (tab: "upload" | "library") => void;
  totalDocumentCount: number;
  globalDocumentCount: number;
}

function StepDocuments({
  selectedDocumentIds,
  setSelectedDocumentIds,
  availableDocuments,
  toggleDocument,
  uploadedFiles,
  setUploadedFiles,
  existingDocumentNames,
  documentTab,
  setDocumentTab,
  totalDocumentCount,
}: StepDocumentsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const totalSelected = selectedDocumentIds.size + uploadedFiles.length;

  const handleRemoveFile = (id: string) => {
    setUploadedFiles(uploadedFiles.filter((f) => f.id !== id));
  };

  // Filter documents based on search term
  const filteredDocuments = availableDocuments.filter((doc) => {
    if (!searchTerm.trim()) return true;
    const search = searchTerm.toLowerCase();
    return (
      doc.original_name.toLowerCase().includes(search) ||
      doc.tags.some((tag) => tag.name.toLowerCase().includes(search))
    );
  });

  return (
    <div className="space-y-4 py-4">
      {/* Summary bar */}
      <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
        <div className="flex items-center gap-2 text-sm">
          <IconFiles className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {totalSelected} document
            {totalSelected !== 1 ? "s" : ""} selected
            {uploadedFiles.length > 0 && selectedDocumentIds.size > 0 && (
              <span className="text-muted-foreground ml-1">
                ({uploadedFiles.length} new, {selectedDocumentIds.size} from
                library)
              </span>
            )}
          </span>
        </div>
        {totalSelected > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedDocumentIds(new Set());
              setUploadedFiles([]);
            }}
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs
        value={documentTab}
        onValueChange={(v) => {
          setDocumentTab(v as "upload" | "library");
          setSearchTerm(""); // Clear search when switching tabs
        }}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="gap-2">
            <IconUpload className="h-4 w-4" />
            Upload New
            {uploadedFiles.length > 0 && (
              <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                {uploadedFiles.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="library" className="gap-2">
            <IconLibrary className="h-4 w-4" />
            From Library
            {selectedDocumentIds.size > 0 && (
              <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                {selectedDocumentIds.size}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Fixed height container for consistent tab content */}
        <div className="h-80 mt-4">
          <TabsContent value="upload" className="mt-0 h-full flex flex-col">
            <FileUploadZone
              onFilesSelected={setUploadedFiles}
              selectedFiles={uploadedFiles}
              onRemoveFile={handleRemoveFile}
              existingFileNames={existingDocumentNames}
              maxFiles={10}
              compact={false}
              className="flex-1 min-h-0"
            />
            <p className="mt-2 text-xs text-muted-foreground text-center shrink-0">
              Uploaded files will be automatically added to your personal library.
            </p>
          </TabsContent>

          <TabsContent value="library" className="mt-0 h-full">
            <div className="flex flex-col h-full">
              {availableDocuments.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/50 bg-muted/20 py-12 text-center flex-1">
                  <IconFiles className="mb-3 h-8 w-8 text-muted-foreground" />
                  <h3 className="font-medium text-foreground">
                    No documents available
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {totalDocumentCount === 0
                      ? "Upload documents first to add them to your project"
                      : "All available documents have already been added to this project"}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setDocumentTab("upload")}
                  >
                    <IconUpload className="mr-2 h-4 w-4" />
                    Upload New Documents
                  </Button>
                </div>
              ) : (
                <>
                  {/* Search input */}
                  <div className="relative mb-3">
                    <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or tag..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {/* Document list */}
                  <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
                    {filteredDocuments.length === 0 ? (
                      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/50 bg-muted/20 py-8 text-center">
                        <IconSearch className="mb-2 h-6 w-6 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          No documents match &quot;{searchTerm}&quot;
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2"
                          onClick={() => setSearchTerm("")}
                        >
                          Clear search
                        </Button>
                      </div>
                    ) : (
                      filteredDocuments.map((doc) => (
                        <DocumentSelectionRow
                          key={doc.id}
                          document={doc}
                          isSelected={selectedDocumentIds.has(doc.id)}
                          onToggle={() => toggleDocument(doc.id)}
                        />
                      ))
                    )}
                  </div>

                  {/* Results count */}
                  {searchTerm && filteredDocuments.length > 0 && (
                    <p className="mt-2 text-xs text-muted-foreground text-center">
                      Showing {filteredDocuments.length} of {availableDocuments.length} documents
                    </p>
                  )}
                </>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

interface DocumentSelectionRowProps {
  document: Document;
  isSelected: boolean;
  onToggle: () => void;
}

function DocumentSelectionRow({
  document,
  isSelected,
  onToggle,
}: DocumentSelectionRowProps) {
  return (
    <div
      className={`group flex items-start gap-3 rounded-lg border p-3 transition-all cursor-pointer hover:bg-muted/50 ${isSelected ? "border-primary bg-primary/5" : "border-border"
        }`}
      onClick={onToggle}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={onToggle}
        className="mt-0.5"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{document.original_name}</p>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatFileSize(document.file_size)}</span>
              <span>•</span>
              <span>{document.page_count} pages</span>
            </div>
          </div>
          <DocumentStatusBadge status={document.status} />
        </div>

        {document.tags?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {document.tags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
