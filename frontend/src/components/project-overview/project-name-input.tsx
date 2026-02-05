"use client";

import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { updateProjectName } from "@/utils/projects/projects-actions";
import { cn } from "@/lib/utils";

interface ProjectNameInputProps {
  projectId: string;
  initialName: string;
  className?: string;
  onFinished?: () => void;
  autoFocus?: boolean;
  onRename?: (newName: string) => void;
}

export function ProjectNameInput({
  projectId,
  initialName,
  className,
  onFinished,
  autoFocus = false,
  onRename,
}: ProjectNameInputProps) {
  const [value, setValue] = useState(initialName);

  useEffect(() => {
    setValue(initialName);
  }, [initialName]);

  async function handleSave() {
    if (!value || value === initialName) {
      setValue(initialName);
      onFinished?.();
      return;
    }

    // Optimistic update
    onRename?.(value);
    onFinished?.();

    await updateProjectName(projectId, value);
  }

  return (
    <Input
      autoFocus={autoFocus}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleSave}
      onFocus={(e) => {
        if (autoFocus) {
          e.currentTarget.select();
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.currentTarget.blur();
        }
      }}
      className={cn(
        "h-8 border-none shadow-none focus-visible:ring-1 focus-visible:bg-muted/50 dark:focus-visible:bg-input bg-transparent dark:bg-transparent px-2 text-base font-medium hover:bg-transparent dark:hover:bg-transparent hover:ring-foreground/10 hover:ring-1 transition-all duration-100 ease-linear",
        className
      )}
      placeholder="Untitled Project"
    />
  );
}
