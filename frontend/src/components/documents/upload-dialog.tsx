"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconUpload } from "@tabler/icons-react";
import {
  FileUploadZone,
  type UploadedFile,
} from "@/components/documents/file-upload-zone";
import { useFileUpload } from "@/hooks/use-file-upload";
import { toast } from "sonner";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isGlobal?: boolean;
  existingFileNames?: string[];
  onUploadComplete?: (fileIds: string[]) => void;
}

export function UploadDialog({
  open,
  onOpenChange,
  isGlobal = false,
  existingFileNames = [],
  onUploadComplete,
}: UploadDialogProps) {
  const [selectedFiles, setSelectedFiles] = useState<UploadedFile[]>([]);
  const { uploadFiles, isUploading } = useFileUpload();

  const handleRemoveFile = useCallback((fileId: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    // Store files before clearing state
    const filesToUpload = [...selectedFiles];
    const fileCount = filesToUpload.length;
    const fileWord = fileCount === 1 ? "file" : "files";

    // Close dialog immediately
    setSelectedFiles([]);
    onOpenChange(false);

    // Show loading toast
    const toastId = toast.loading(`Uploading ${fileCount} ${fileWord}...`);

    try {
      // Upload files with the isGlobal flag
      const uploadedIds = await uploadFiles(
        filesToUpload,
        undefined, // No progress callback needed since dialog is closed
        isGlobal
      );

      // Dismiss loading toast and show success
      toast.dismiss(toastId);
      
      if (uploadedIds.length > 0) {
        toast.success(
          `Successfully uploaded ${uploadedIds.length} ${uploadedIds.length === 1 ? "file" : "files"}`
        );
        onUploadComplete?.(uploadedIds);
      } else {
        toast.error("Failed to upload files. Please try again.");
      }
    } catch (error) {
      // Dismiss loading toast and show error
      toast.dismiss(toastId);
      toast.error("An error occurred during upload. Please try again.");
    }
  };

  const handleCancel = () => {
    setSelectedFiles([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isGlobal ? "Add Global Document" : "Upload PDF"}
          </DialogTitle>
          <DialogDescription>
            {isGlobal
              ? "Upload documents that will be automatically available in all your projects."
              : "Upload PDF files to your personal library for AI-powered analysis."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-auto py-4">
          <FileUploadZone
            onFilesSelected={setSelectedFiles}
            selectedFiles={selectedFiles}
            onRemoveFile={handleRemoveFile}
            existingFileNames={existingFileNames}
            maxFiles={10}
            accept=".pdf"
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || isUploading}
            className="gap-2"
          >
            <IconUpload className="h-4 w-4" />
            {isUploading
              ? "Uploading..."
              : `Upload ${selectedFiles.length} file${selectedFiles.length !== 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
