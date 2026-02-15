import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import type { Document, Tag } from "@/lib/types";

// ── SWR cache keys ──────────────────────────────────────────────────────────
export const SWR_KEYS = {
  documents: "documents",
  userTags: "user-tags",
  libraryDocuments: "library-documents",
} as const;

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Supabase returns file_tags as nested objects; normalise them into Tag[]. */
function parseDocumentWithTags(raw: Record<string, unknown>): Document {
  const fileTags = (raw.file_tags ?? []) as Array<{
    tag_id: string;
    tags: Tag | null;
  }>;

  const tags: Tag[] = fileTags
    .map((ft) => ft.tags)
    .filter((t): t is Tag => t !== null);

  const { file_tags: _unused, ...rest } = raw;
  return { ...rest, tags } as Document;
}

// ── Fetchers ────────────────────────────────────────────────────────────────

async function fetchDocuments(): Promise<Document[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("files")
    .select("*, file_tags(tag_id, tags(*))")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch documents:", error.message);
    throw error;
  }

  return (data ?? []).map((d) =>
    parseDocumentWithTags(d as unknown as Record<string, unknown>),
  );
}

async function fetchUserTags(): Promise<Tag[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to fetch tags:", error.message);
    throw error;
  }

  return data ?? [];
}

async function fetchLibraryDocuments(): Promise<Document[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("files")
    .select("*, file_tags(tag_id, tags(*))")
    .in("status", ["completed", "uploaded"])
    .eq("is_global", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch library documents:", error.message);
    throw error;
  }

  return (data ?? []).map((d) =>
    parseDocumentWithTags(d as unknown as Record<string, unknown>),
  );
}

// ── Hooks ───────────────────────────────────────────────────────────────────

/**
 * Fetch all documents (library + global) with their tags.
 * Cached and deduplicated via SWR — safe to call from multiple components.
 */
export function useDocuments() {
  const { data, error, isLoading, mutate } = useSWR(
    SWR_KEYS.documents,
    fetchDocuments,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10_000, // 10s dedup window
    },
  );

  return {
    documents: data ?? [],
    isLoading,
    error,
    mutate,
  };
}

/**
 * Fetch the current user's tags.
 * Cached and deduplicated via SWR.
 */
export function useUserTags() {
  const { data, error, isLoading, mutate } = useSWR(
    SWR_KEYS.userTags,
    fetchUserTags,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10_000,
    },
  );

  return {
    tags: data ?? [],
    isLoading,
    error,
    mutate,
  };
}

/**
 * Fetch non-global, ready/uploaded documents for the "add from library" dialog.
 * Only fetches when `enabled` is true (i.e. when the dialog opens).
 */
export function useLibraryDocuments(enabled: boolean) {
  const { data, error, isLoading, mutate } = useSWR(
    enabled ? SWR_KEYS.libraryDocuments : null,
    fetchLibraryDocuments,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30_000, // 30s — dialog data changes less often
    },
  );

  return {
    documents: data ?? [],
    isLoading,
    error,
    mutate,
  };
}
