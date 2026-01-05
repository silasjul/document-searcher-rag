import Link from "next/link";
import { ChatSession } from "@/lib/mock-data";
import { motion } from "framer-motion";
import { IconMessage, IconClock, IconChevronRight } from "@tabler/icons-react";
import { formatDistanceToNow, format } from "date-fns";

export function ConversationCard({
  chat,
  caseId,
  index,
}: {
  chat: ChatSession;
  caseId: string;
  index: number;
}) {
  const updatedDate = new Date(chat.updatedAt);

  return (
    <div>
      <Link
        href={`/dashboard/case/${caseId}?chatid=${chat.id}`}
        className="group block"
      >
        <motion.div
          whileHover={{
            scale: 1.015,
            boxShadow: "0 20px 40px -12px rgba(99, 102, 241, 0.15)",
          }}
          transition={{
            duration: 0.2,
            ease: "easeOut",
          }}
          className="relative overflow-hidden rounded-2xl border border-border/50 bg-linear-to-br from-card to-card/80 p-6 transition-colors hover:border-primary/30"
        >
          {/* Decorative gradient orb */}
          <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-linear-to-br from-primary/20 to-violet-500/20 blur-3xl transition-all group-hover:opacity-70" />

          {/* Chat index badge */}
          <div className="absolute right-4 top-4">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted/50 text-xs font-medium text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>

          <div className="relative space-y-4">
            {/* Icon with animated glow */}
            <div className="relative inline-flex">
              <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary to-violet-500 opacity-0 blur-xl transition-opacity group-hover:opacity-40" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-xl border border-primary/20 bg-linear-to-br from-primary/10 to-violet-500/10">
                <IconMessage
                  className="h-7 w-7 text-primary"
                  strokeWidth={1.5}
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                {chat.title}
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Last active{" "}
                {formatDistanceToNow(updatedDate, { addSuffix: true })}
              </p>
            </div>

            {/* Footer with date and arrow */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <IconClock className="h-3.5 w-3.5" />
                <span>{format(updatedDate, "MMM d, yyyy 'at' h:mm a")}</span>
              </div>

              <motion.div
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary opacity-0 transition-opacity group-hover:opacity-100"
                whileHover={{ scale: 1.1 }}
              >
                <IconChevronRight className="h-4 w-4" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </Link>
    </div>
  );
}
