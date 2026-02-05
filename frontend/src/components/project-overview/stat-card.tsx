import { motion } from "framer-motion";
import { IconTrendingUp } from "@tabler/icons-react";

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
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all ${
        onClick ? "cursor-pointer hover:border-border hover:bg-card/80" : ""
      }`}
    >
      <div className="flex items-start justify-between">
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
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" strokeWidth={1.5} />
        </div>
      </div>
    </motion.div>
  );
}
