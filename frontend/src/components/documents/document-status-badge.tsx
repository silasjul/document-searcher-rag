import {
  IconCheck,
  IconClock,
  IconAlertTriangle,
  IconUpload,
  IconLoader2,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FileStatus } from "@/lib/types";

interface DocumentStatusBadgeProps {
  status: FileStatus;
  className?: string;
}

export function DocumentStatusBadge({
  status,
  className,
}: DocumentStatusBadgeProps) {
  switch (status) {
    case "completed":
      return (
        <Badge
          variant="secondary"
          className={cn(
            "gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
            className
          )}
        >
          <IconCheck className="h-3.5 w-3.5" />
          Ready
        </Badge>
      );

    case "processing":
      return (
        <Badge
          variant="secondary"
          className={cn(
            "gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400",
            className
          )}
        >
          <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
          Processing
        </Badge>
      );

    case "queued":
      return (
        <Badge
          variant="secondary"
          className={cn(
            "gap-1.5 bg-violet-500/10 text-violet-600 dark:text-violet-400",
            className
          )}
        >
          <IconClock className="h-3.5 w-3.5" />
          Queued
        </Badge>
      );

    case "uploaded":
      return (
        <Badge
          variant="secondary"
          className={cn(
            "gap-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400",
            className
          )}
        >
          <IconUpload className="h-3.5 w-3.5" />
          Uploaded
        </Badge>
      );

    case "pending_upload":
      return (
        <Badge
          variant="secondary"
          className={cn(
            "gap-1.5 bg-slate-500/10 text-slate-600 dark:text-slate-400",
            className
          )}
        >
          <IconClock className="h-3.5 w-3.5" />
          Pending
        </Badge>
      );

    case "failed":
      return (
        <Badge
          variant="secondary"
          className={cn(
            "gap-1.5 bg-red-500/10 text-red-600 dark:text-red-400",
            className
          )}
        >
          <IconAlertTriangle className="h-3.5 w-3.5" />
          Failed
        </Badge>
      );

    default:
      return null;
  }
}
