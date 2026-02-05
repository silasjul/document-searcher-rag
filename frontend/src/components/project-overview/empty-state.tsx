import Link from "next/link";
import { motion } from "framer-motion";
import { IconSparkles, IconPlus, IconBolt } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function EmptyState({ projectId }: { projectId: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative mx-auto"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-72 w-72 rounded-full bg-linear-to-br from-primary/10 to-violet-500/10 blur-3xl" />
      </div>

      <div className="flex flex-col items-center rounded-3xl border border-border/50 bg-card/50 px-8 py-20 text-center">
        {/* Animated icon container */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring" as const,
            stiffness: 200,
            damping: 15,
            delay: 0.2,
          }}
          className="relative mb-8"
        >
          {/* Pulsing rings */}
          <div
            className="absolute inset-0 rounded-3xl bg-primary/20"
            style={{
              animation: "ping-slow 2s infinite",
              animationDelay: "150ms",
            }}
          />
          <div
            className="absolute inset-0 rounded-3xl bg-primary/10"
            style={{
              animation: "ping-slow 2s infinite",
              animationDelay: "300ms",
            }}
          />

          <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-primary/20 bg-linear-to-br from-primary/10 to-violet-500/10 backdrop-blur-sm">
            <IconSparkles
              className="h-12 w-12 text-primary"
              strokeWidth={1.5}
            />
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-3 text-2xl font-bold text-foreground"
        >
          Start your first conversation
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8 max-w-sm text-muted-foreground"
        >
          Create a new AI-powered conversation to analyze your project documents,
          extract insights, and get instant answers.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            size="lg"
            className="group relative gap-2 overflow-hidden font-semibold"
            asChild
          >
            <Link href={`/dashboard/project/${projectId}?chatid=new`}>
              <IconPlus className="h-5 w-5 transition-transform group-hover:rotate-90" />
              New conversation
              <IconBolt className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>

        {/* Feature hints */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-3"
        >
          {["Document Analysis", "Insights", "Quick Answers"].map((feature) => (
            <Badge
              key={feature}
              variant="secondary"
              className="gap-1.5 bg-muted/50 px-3 py-1.5 text-muted-foreground"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {feature}
            </Badge>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
