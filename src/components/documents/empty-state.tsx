import { motion } from "framer-motion";
import { IconFileTypePdf, IconUpload } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-muted/20 py-16 text-center"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground">
        <IconFileTypePdf className="h-8 w-8" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-semibold text-foreground">
        No documents yet
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Upload PDF files to your document library. You can then use them to
        provide context for AI conversations in your cases.
      </p>
      <Button className="mt-6 gap-2">
        <IconUpload className="h-4 w-4" />
        Upload your first PDF
      </Button>
    </motion.div>
  );
}
