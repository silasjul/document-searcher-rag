import { motion } from "framer-motion";
import { IconFileTypePdf, IconUpload, IconWorld } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onUploadClick?: () => void;
  variant?: "library" | "global";
}

export function EmptyState({ onUploadClick, variant = "library" }: EmptyStateProps) {
  const isGlobal = variant === "global";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-muted/20 py-16 text-center"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground">
        {isGlobal ? (
          <IconWorld className="h-8 w-8" strokeWidth={1.5} />
        ) : (
          <IconFileTypePdf className="h-8 w-8" strokeWidth={1.5} />
        )}
      </div>
      <h3 className="text-lg font-semibold text-foreground">
        {isGlobal ? "No global documents yet" : "No documents yet"}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {isGlobal
          ? "Upload PDFs as global documents to make them automatically available in all your projects."
          : "Upload PDF files to your document library. You can then use them to provide context for AI conversations in your projects."}
      </p>
      <Button className="mt-6 gap-2" onClick={onUploadClick}>
        <IconUpload className="h-4 w-4" />
        {isGlobal ? "Upload your first global document" : "Upload your first PDF"}
      </Button>
    </motion.div>
  );
}
