import {
  IconCheck,
  IconClock,
  IconAlertTriangle,
  IconLoader2,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Document } from "@/lib/mock-data";

interface DocumentStatusBadgeProps {
  status: Document["status"];
  className?: string;
}

export function DocumentStatusBadge({
  status,
  className,
}: DocumentStatusBadgeProps) {
  if (status === "processing") {
    return (
      <Badge
        variant="secondary"
        className={cn(
          "gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20",
          className
        )}
      >
        <IconClock className="h-3.5 w-3.5" />
        Processing
      </Badge>
    );
  }

  if (status === "ready") {
    return (
      <Badge
        variant="secondary"
        className={cn(
          "gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20",
          className
        )}
      >
        <IconCheck className="h-3.5 w-3.5" />
        Ready
      </Badge>
    );
  }

  if (status === "error") {
    return (
      <Badge
        variant="secondary"
        className={cn(
          "gap-1.5 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20",
          className
        )}
      >
        <IconAlertTriangle className="h-3.5 w-3.5" />
        Error
      </Badge>
    );
  }

  return null;
}
