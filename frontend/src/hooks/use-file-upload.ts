"use client";

import { useState, useCallback } from "react";
import { apiPost } from "@/lib/api-client";
import { createClient } from "@/lib/supabase/client";
import type { UploadedFile } from "@/components/documents/file-upload-zone";

// ── Types matching the backend schemas ──────────────────────────────────────

interface SignedUploadTarget {
  file_id: string;
  storage_path: string;
  token: string;
}

interface InitiateUploadResponse {
  uploads: SignedUploadTarget[];
}

interface ConfirmUploadResponse {
  confirmed: string[];
}

// ── Constants ───────────────────────────────────────────────────────────────

const STORAGE_BUCKET = "pdfs";

// ── Hook ────────────────────────────────────────────────────────────────────

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Orchestrates the full 3-step signed upload flow:
   *
   *  1. POST /files/initiate-upload  → get tokens + file IDs
   *  2. Upload each file via Supabase JS client's uploadToSignedUrl
   *  3. POST /files/confirm-upload   → mark all as "uploaded"
   *
   * The `onProgress` callback lets callers update individual file statuses
   * in the UI as each file completes its upload.
   */
  const uploadFiles = useCallback(
    async (
      files: UploadedFile[],
      onProgress?: (fileId: string, status: UploadedFile["status"]) => void,
    ): Promise<string[]> => {
      setIsUploading(true);
      setError(null);

      try {
        // ── Step 1: Initiate ─────────────────────────────────────────
        const { uploads } = await apiPost<InitiateUploadResponse>(
          "/files/initiate-upload",
          {
            files: files.map((f) => ({
              name: f.name,
              size: f.size,
              mime_type: f.file.type || "application/pdf",
            })),
          },
        );

        // ── Step 2: Upload each file via Supabase Storage client ────
        // The uploads array is in the same order as the files we sent.
        const supabase = createClient();
        const uploadedFileIds: string[] = [];

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const target = uploads[i];
          if (!target) continue;

          onProgress?.(file.id, "uploading");

          try {
            const { error: uploadError } = await supabase.storage
              .from(STORAGE_BUCKET)
              .uploadToSignedUrl(target.storage_path, target.token, file.file, {
                upsert: true,
              });

            if (uploadError) {
              throw uploadError;
            }

            uploadedFileIds.push(target.file_id);
            onProgress?.(file.id, "complete");
          } catch (err) {
            console.error(`Failed to upload ${file.name}:`, err);
            onProgress?.(file.id, "error");
          }
        }

        // ── Step 3: Confirm ─────────────────────────────────────────
        if (uploadedFileIds.length > 0) {
          await apiPost<ConfirmUploadResponse>("/files/confirm-upload", {
            file_ids: uploadedFileIds,
          });
        }

        return uploadedFileIds;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Upload failed unexpectedly";
        setError(message);
        // Mark all files as errored
        files.forEach((f) => onProgress?.(f.id, "error"));
        return [];
      } finally {
        setIsUploading(false);
      }
    },
    [],
  );

  return { uploadFiles, isUploading, error };
}
