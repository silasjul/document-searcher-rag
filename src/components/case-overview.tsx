"use client";

import Link from "next/link";
import { Case, ChatSession, Document } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconMessage,
  IconPlus,
  IconSparkles,
  IconClock,
  IconFileText,
  IconTrendingUp,
  IconChevronRight,
  IconBolt,
  IconFileTypePdf,
  IconUpload,
  IconLoader2,
  IconCheck,
  IconDownload,
  IconDotsVertical,
} from "@tabler/icons-react";
import { formatDistanceToNow, format } from "date-fns";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CaseOverviewProps {
  caseData: Case;
  chats: ChatSession[];
  documents: Document[];
}

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.15,
      ease: "easeOut",
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.15,
      ease: "easeOut",
    },
  },
};

const cardHoverVariants: Variants = {
  visible: {
    scale: 1,
    boxShadow: "0 0 0 0 rgba(99, 102, 241, 0)",
  },
  hover: {
    scale: 1.02,
    boxShadow: "0 20px 40px -12px rgba(99, 102, 241, 0.15)",
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25,
    },
  },
};

// Format file size helper
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Stat Card Component
function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string | number;
  trend?: string;
  onClick?: () => void;
}) {
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

// Document Card Component
function DocumentCard({ document }: { document: Document }) {
  const uploadedDate = new Date(document.uploadedAt);

  return (
    <div className="group flex items-center gap-4 rounded-xl border border-border/50 bg-card p-4 transition-colors hover:border-border hover:bg-accent/30">
      {/* PDF Icon */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
        <IconFileTypePdf className="h-6 w-6" strokeWidth={1.5} />
      </div>

      {/* Document Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="truncate font-medium text-foreground">
            {document.name}
          </h4>
          {document.status === "processing" && (
            <Badge
              variant="secondary"
              className="gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400"
            >
              <IconLoader2 className="h-3 w-3 animate-spin" />
              Processing
            </Badge>
          )}
          {document.status === "ready" && (
            <Badge
              variant="secondary"
              className="gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            >
              <IconCheck className="h-3 w-3" />
              Ready
            </Badge>
          )}
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <span>{formatFileSize(document.fileSize)}</span>
          <span>•</span>
          <span>{document.pageCount} pages</span>
          <span>•</span>
          <span>
            Uploaded {formatDistanceToNow(uploadedDate, { addSuffix: true })}
          </span>
        </div>
      </div>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <IconDotsVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <IconDownload className="mr-2 h-4 w-4" />
            Download
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Conversation Card Component
function ConversationCard({
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
          variants={cardHoverVariants}
          initial="visible"
          whileHover="hover"
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

// Empty State Component
function EmptyState({ caseId }: { caseId: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative mx-auto max-w-lg"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-72 w-72 rounded-full bg-linear-to-br from-primary/10 to-violet-500/10 blur-3xl" />
      </div>

      <div className="flex flex-col items-center py-20 text-center">
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
          <div className="absolute inset-0 animate-ping rounded-3xl bg-primary/20 delay-150" />
          <div
            className="absolute inset-0 animate-ping rounded-3xl bg-primary/10"
            style={{ animationDelay: "300ms" }}
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
          Create a new AI-powered conversation to analyze your case documents,
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
            <Link href={`/dashboard/case/${caseId}?chatid=new`}>
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

// Main Component
export function CaseOverview({
  caseData,
  chats,
  documents,
}: CaseOverviewProps) {
  const sortedChats = [...chats].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const sortedDocuments = [...documents].sort(
    (a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );

  const latestChat = sortedChats[0];
  const readyDocuments = documents.filter((d) => d.status === "ready").length;

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-linear-to-br from-primary/5 to-violet-500/5 blur-3xl" />
        <div className="absolute -right-40 top-1/3 h-80 w-80 rounded-full bg-linear-to-br from-violet-500/5 to-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-linear-to-br from-primary/5 to-muted/20 blur-3xl" />
      </div>

      <div className="relative flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-6 py-12 md:px-8 md:py-16">
          <AnimatePresence mode="wait">
            {chats.length === 0 && documents.length === 0 ? (
              <EmptyState caseId={caseData.id} />
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-10"
              >
                {/* Header Section */}
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
                >
                  <div>
                    <Badge
                      variant="secondary"
                      className="mb-4 gap-1.5 bg-primary/10 text-primary"
                    >
                      <IconBolt className="h-3 w-3" />
                      Active Case
                    </Badge>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                      Case Overview
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                      {chats.length} conversation{chats.length !== 1 ? "s" : ""}{" "}
                      • {documents.length} document
                      {documents.length !== 1 ? "s" : ""}
                      {latestChat && (
                        <>
                          {" "}
                          • Last active{" "}
                          {formatDistanceToNow(new Date(latestChat.updatedAt), {
                            addSuffix: true,
                          })}
                        </>
                      )}
                    </p>
                  </div>

                  <Button
                    size="lg"
                    className="group gap-2 font-semibold"
                    asChild
                  >
                    <Link href={`/dashboard/case/${caseData.id}?chatid=new`}>
                      <IconPlus className="h-5 w-5 transition-transform group-hover:rotate-90" />
                      New conversation
                    </Link>
                  </Button>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <StatCard
                    icon={IconMessage}
                    label="Total Conversations"
                    value={chats.length}
                    onClick={() => scrollToSection("conversations")}
                  />
                  <StatCard
                    icon={IconFileText}
                    label="Documents"
                    value={`${readyDocuments}/${documents.length}`}
                    trend={
                      documents.length - readyDocuments > 0
                        ? `${documents.length - readyDocuments} processing`
                        : undefined
                    }
                    onClick={() => scrollToSection("documents")}
                  />
                </div>

                {/* Conversations Grid */}
                {chats.length > 0 && (
                  <div id="conversations" className="scroll-mt-24">
                    <motion.div variants={itemVariants} className="mb-6">
                      <h2 className="text-xl font-semibold text-foreground">
                        Recent Conversations
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Continue where you left off or start something new
                      </p>
                    </motion.div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {sortedChats.map((chat, index) => (
                        <motion.div key={chat.id} variants={itemVariants}>
                          <ConversationCard
                            chat={chat}
                            caseId={caseData.id}
                            index={index}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Documents Section */}
                <div id="documents" className="scroll-mt-24">
                  <motion.div
                    variants={itemVariants}
                    className="mb-6 flex items-center justify-between"
                  >
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">
                        Documents
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        PDF files uploaded to this case
                      </p>
                    </div>
                    <Button variant="outline" className="gap-2">
                      <IconUpload className="h-4 w-4" />
                      Upload PDF
                    </Button>
                  </motion.div>

                  {documents.length === 0 ? (
                    <motion.div
                      variants={itemVariants}
                      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-muted/20 py-12 text-center"
                    >
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground">
                        <IconFileTypePdf
                          className="h-7 w-7"
                          strokeWidth={1.5}
                        />
                      </div>
                      <h3 className="font-medium text-foreground">
                        No documents yet
                      </h3>
                      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                        Upload PDF files to analyze them with AI and extract
                        insights.
                      </p>
                      <Button variant="outline" className="mt-4 gap-2">
                        <IconUpload className="h-4 w-4" />
                        Upload your first PDF
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div variants={itemVariants} className="space-y-2">
                      {sortedDocuments.map((doc) => (
                        <DocumentCard key={doc.id} document={doc} />
                      ))}
                    </motion.div>
                  )}
                </div>

                {/* Quick Actions Footer */}
                <motion.div
                  variants={itemVariants}
                  className="rounded-2xl border border-dashed border-border/50 bg-muted/20 p-6"
                >
                  <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                      <IconSparkles className="h-7 w-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        Need a specific analysis?
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        You can ask questions that span multiple documents. Try
                        asking &quot;Compare the liability clauses across all
                        contracts&quot;.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="gap-2 shrink-0"
                      asChild
                    >
                      <Link href={`/dashboard/case/${caseData.id}?chatid=new`}>
                        <IconMessage className="h-4 w-4" />
                        Ask AI
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
