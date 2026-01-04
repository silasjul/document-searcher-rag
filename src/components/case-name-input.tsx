"use client";

import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { updateCaseName } from "@/utils/cases/cases-actions";
import { cn } from "@/lib/utils";

interface CaseNameInputProps {
  caseId: string;
  initialName: string;
  className?: string;
  onFinished?: () => void;
  autoFocus?: boolean;
  onRename?: (newName: string) => void;
}

export function CaseNameInput({
  caseId,
  initialName,
  className,
  onFinished,
  autoFocus = false,
  onRename,
}: CaseNameInputProps) {
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

    await updateCaseName(caseId, value);
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
        "h-8 border-none shadow-none focus-visible:ring-black focus-visible:ring-1 bg-transparent px-2 text-base font-medium hover:ring-black/20 hover:ring-1 transition-all duration-100 ease-linear",
        className
      )}
      placeholder="Untitled Case"
    />
  );
}
