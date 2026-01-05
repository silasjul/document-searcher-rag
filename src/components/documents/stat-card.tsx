import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subtext?: string;
  onClick?: () => void;
  isActive?: boolean;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  onClick,
  isActive,
}: StatCardProps) {
  return (
    <motion.div
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm transition-all",
        onClick && "cursor-pointer",
        isActive && "border-primary/30 bg-primary/[0.02]",
        !isActive && "hover:border-border hover:bg-card/80"
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
          {subtext && (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtext}</p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}
