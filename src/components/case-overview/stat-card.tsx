import { motion } from "framer-motion";
import { IconTrendingUp } from "@tabler/icons-react";
import { itemVariants } from "./variants";

interface StatCardProps {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string | number;
  trend?: string;
  onClick?: () => void;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  onClick,
}: StatCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-colors hover:border-border ${
        onClick ? "cursor-pointer hover:bg-accent/5" : ""
      }`}
    >
      {/* Subtle gradient accent */}
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-muted opacity-50 blur-2xl transition-opacity group-hover:opacity-70" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          {trend && (
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <IconTrendingUp className="h-3 w-3" />
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/80 text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
          <Icon className="h-6 w-6" strokeWidth={1.5} />
        </div>
      </div>
    </motion.div>
  );
}
