"use client";

import { useState, useRef, useCallback } from "react";
import {
  IconUpload,
  IconFile,
  IconX,
  IconCheck,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn, formatFileSize } from "@/lib/utils";

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  status: "pending" | "uploading" | "complete" | "error";
  progress?: number;
}

interface FileUploadZoneProps {
  onFilesSelected: (files: UploadedFile[]) => void;
  selectedFiles: UploadedFile[];
  onRemoveFile: (id: string) => void;
  existingFileNames?: string[]; // For duplicate detection
  maxFiles?: number;
  accept?: string;
  className?: string;
  /** When true, the drop zone stays large even when files are selected (no compact mode). Good for standalone dialogs. */
  compact?: boolean;
}

export function FileUploadZone({
  onFilesSelected,
  selectedFiles,
  onRemoveFile,
  existingFileNames = [],
  maxFiles = 10,
  accept = ".pdf",
  className,
  compact = true,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string[] | null>(
    null
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    (fileList: FileList) => {
      const newFiles: UploadedFile[] = [];
      const duplicates: string[] = [];

      Array.from(fileList).forEach((file) => {
        // Check if file already exists in library
        const normalizedName = file.name.toLowerCase();
        const isDuplicate = existingFileNames.some(
          (name) => name.toLowerCase() === normalizedName
        );

        // Check if already selected
        const isAlreadySelected = selectedFiles.some(
          (f) => f.name.toLowerCase() === normalizedName
        );

        if (isDuplicate) {
          duplicates.push(file.name);
        } else if (!isAlreadySelected) {
          newFiles.push({
            id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            file,
            name: file.name,
            size: file.size,
            status: "pending",
          });
        }
      });

      if (duplicates.length > 0) {
        setDuplicateWarning(duplicates);
      }

      if (newFiles.length > 0) {
        const filesToAdd = newFiles.slice(0, maxFiles - selectedFiles.length);
        onFilesSelected([...selectedFiles, ...filesToAdd]);
      }
    },
    [existingFileNames, selectedFiles, maxFiles, onFilesSelected]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files?.length) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        processFiles(e.target.files);
      }
      // Reset input so the same file can be selected again
      e.target.value = "";
    },
    [processFiles]
  );

  const hasFiles = selectedFiles.length > 0;
  const hasWarning = duplicateWarning && duplicateWarning.length > 0;
  // Use compact mode only when explicitly requested AND there are files
  const showCompact = compact && hasFiles;

  return (
    <div className={cn("flex flex-col h-full gap-3", className)}>
      {/* Duplicate Warning - shown at the top, dismissible */}
      {hasWarning && (
        <div className="flex items-start gap-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2.5 text-sm shrink-0">
          <IconAlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-amber-600 dark:text-amber-400 text-xs">
              {duplicateWarning.length === 1
                ? "Duplicate file skipped"
                : `${duplicateWarning.length} duplicate files skipped`}
            </p>
            <p className="mt-0.5 text-xs text-amber-600/80 dark:text-amber-400/80 truncate">
              {duplicateWarning.length <= 2
                ? duplicateWarning.join(", ")
                : `${duplicateWarning.slice(0, 2).join(", ")} and ${duplicateWarning.length - 2} more`}
              {" "}already in your library
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 text-amber-600/60 hover:text-amber-600 dark:text-amber-400/60 dark:hover:text-amber-400 hover:bg-amber-500/10"
            onClick={(e) => {
              e.stopPropagation();
              setDuplicateWarning(null);
            }}
          >
            <IconX className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Drop Zone */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-lg border-2 border-dashed transition-all cursor-pointer",
          showCompact
            ? "shrink-0 px-4 py-3"
            : "flex-1 min-h-0 p-8",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/30",
          selectedFiles.length >= maxFiles && "opacity-50 pointer-events-none"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={handleInputChange}
          disabled={selectedFiles.length >= maxFiles}
        />

        {showCompact ? (
          /* Compact inline drop zone */
          <div className="flex items-center gap-3 text-sm w-full">
            <div
              className={cn(
                "rounded-full p-1.5 transition-colors shrink-0",
                isDragging ? "bg-primary/10" : "bg-muted"
              )}
            >
              <IconUpload
                className={cn(
                  "h-4 w-4",
                  isDragging ? "text-primary" : "text-muted-foreground"
                )}
              />
            </div>
            <span className="text-muted-foreground">
              {isDragging
                ? "Drop files here"
                : "Drop more files or click to browse"}
            </span>
            <span className="text-xs text-muted-foreground/60 ml-auto">
              {selectedFiles.length}/{maxFiles}
            </span>
          </div>
        ) : (
          /* Full-size drop zone */
          <div className="flex flex-col items-center text-center">
            <div
              className={cn(
                "mb-4 rounded-full p-3 transition-colors",
                isDragging ? "bg-primary/10" : "bg-muted"
              )}
            >
              <IconUpload
                className={cn(
                  "h-6 w-6",
                  isDragging ? "text-primary" : "text-muted-foreground"
                )}
              />
            </div>
            <p className="font-medium text-foreground">
              {isDragging ? "Drop files here" : "Drag & drop PDF files here"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              or click to browse from your computer
            </p>
            {!hasFiles && (
              <p className="mt-2 text-xs text-muted-foreground">
                PDF files only &bull; Max {maxFiles} files
              </p>
            )}
            {hasFiles && (
              <p className="mt-2 text-xs text-muted-foreground">
                {selectedFiles.length}/{maxFiles} files selected &bull; drop or click to add more
              </p>
            )}
          </div>
        )}
      </div>

      {/* Selected Files List - only shown in compact mode */}
      {showCompact && (
        <div className="flex flex-col flex-1 min-h-0">
          <p className="text-xs font-medium text-muted-foreground mb-2 shrink-0">
            {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""}{" "}
            ready to upload
          </p>
          <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0">
            {selectedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 shrink-0">
                  <IconFile className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                    {file.status === "complete" && (
                      <span className="ml-2 text-green-600">
                        <IconCheck className="inline h-3 w-3" /> Uploaded
                      </span>
                    )}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFile(file.id);
                  }}
                >
                  <IconX className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
