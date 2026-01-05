import { IconCheck, IconClock, IconAlertTriangle } from "@tabler/icons-react";
import { Document } from "@/lib/mock-data";

export function getStatusConfig(status: Document["status"]) {
  switch (status) {
    case "ready":
      return {
        icon: IconCheck,
        label: "Ready",
        className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      };
    case "processing":
      return {
        icon: IconClock,
        label: "Processing",
        className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      };
    case "error":
      return {
        icon: IconAlertTriangle,
        label: "Error",
        className: "bg-red-500/10 text-red-600 border-red-500/20",
      };
  }
}
