import { cn } from "@/lib/utils";
import type { Tag } from "@/lib/types";

export const TAG_COLORS: Record<string, string> = {
  gray: "bg-gray-500/15 text-gray-700 dark:text-gray-300",
  red: "bg-red-500/15 text-red-700 dark:text-red-300",
  orange: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
  yellow: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300",
  green: "bg-green-500/15 text-green-700 dark:text-green-300",
  blue: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  purple: "bg-purple-500/15 text-purple-700 dark:text-purple-300",
  pink: "bg-pink-500/15 text-pink-700 dark:text-pink-300",
};

export const TAG_DOT_COLORS: Record<string, string> = {
  gray: "bg-gray-500",
  red: "bg-red-500",
  orange: "bg-orange-500",
  yellow: "bg-yellow-500",
  green: "bg-green-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
};

export const TAG_COLOR_OPTIONS = [
  "gray",
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "pink",
] as const;

export type TagColor = (typeof TAG_COLOR_OPTIONS)[number];

export function TagBadge({
  tag,
  className,
}: {
  tag: Tag;
  className?: string;
}) {
  const colorClasses = TAG_COLORS[tag.color] ?? TAG_COLORS.gray;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
        colorClasses,
        className,
      )}
    >
      {tag.name}
    </span>
  );
}
