"use client";

import { useState, useRef, useCallback } from "react";
import { IconUpload, IconFile, IconX, IconCheck } from "@tabler/icons-react";
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
}

export function FileUploadZone({
  onFilesSelected,
  selectedFiles,
  onRemoveFile,
  existingFileNames = [],
  maxFiles = 10,
  accept = ".pdf",
  className,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
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
        setDuplicateWarning(
          `${duplicates.length} file(s) already exist in your library: ${duplicates.join(", ")}`
        );
        setTimeout(() => setDuplicateWarning(null), 5000);
      }

      if (newFiles.length > 0) {
        const totalFiles = selectedFiles.length + newFiles.length;
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

  return (
    <div className={cn("space-y-4 h-full", className)}>
      {/* Drop Zone */}
      <div
        className={cn(
          "relative h-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-all cursor-pointer",
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
          <p className="mt-2 text-xs text-muted-foreground">
            PDF files only • Max {maxFiles} files
          </p>
        </div>
      </div>

      {/* Duplicate Warning */}
      {duplicateWarning && (
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-sm text-amber-600 dark:text-amber-400">
          <p className="font-medium">Duplicate files detected</p>
          <p className="mt-1 text-xs">{duplicateWarning}</p>
        </div>
      )}

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""}{" "}
            selected
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {selectedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 rounded-lg border bg-card p-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                  <IconFile className="h-5 w-5 text-primary" />
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
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
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
