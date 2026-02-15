"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconUpload, IconLibrary, IconWorld } from "@tabler/icons-react";

interface DocumentsPageHeaderProps {
  activeTab: "library" | "global";
  onUploadClick: () => void;
}

export function DocumentsPageHeader({
  activeTab,
  onUploadClick,
}: DocumentsPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <Badge
          variant="secondary"
          className="mb-4 gap-1.5 bg-primary/10 text-primary"
        >
          {activeTab === "library" ? (
            <>
              <IconLibrary className="h-3 w-3" />
              My Library
            </>
          ) : (
            <>
              <IconWorld className="h-3 w-3" />
              Global Documents
            </>
          )}
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {activeTab === "library" ? "Document Library" : "Global Documents"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {activeTab === "library"
            ? "Upload and manage your personal PDF files for AI-powered analysis."
            : "Shared documents automatically available in all your projects."}
        </p>
      </div>

      <Button
        size="lg"
        className="group gap-2 font-semibold"
        onClick={onUploadClick}
      >
        <IconUpload className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
        {activeTab === "library" ? "Upload PDF" : "Add Global Document"}
      </Button>
    </div>
  );
}
