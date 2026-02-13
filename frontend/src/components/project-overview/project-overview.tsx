"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Project, ChatSession, Document } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconMessage,
  IconPlus,
  IconSparkles,
  IconFileText,
  IconBolt,
  IconUpload,
  IconFileTypePdf,
} from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { StatCard } from "./stat-card";
import { DocumentCard } from "./document-card";
import { ConversationCard } from "./conversation-card";
import { EmptyState } from "./empty-state";
import { CreateProjectDialog } from "./create-project-dialog";

interface ProjectOverviewProps {
  projectData: Project;
  chats: ChatSession[];
  documents: Document[];
  onDocumentClick?: (documentId: string) => void;
}

// Main Component
export function ProjectOverview({
  projectData,
  chats,
  documents,
  onDocumentClick,
}: ProjectOverviewProps) {
  const [isAddDocumentsOpen, setIsAddDocumentsOpen] = useState(false);
  const [allDocuments, setAllDocuments] = useState<Document[]>([]);

  // Fetch all user documents when the add-documents dialog opens
  useEffect(() => {
    if (!isAddDocumentsOpen) return;

    async function fetchDocs() {
      const supabase = createClient();
      const { data } = await supabase
        .from("files")
        .select("*")
        .order("created_at", { ascending: false });
      setAllDocuments(data ?? []);
    }
    fetchDocs();
  }, [isAddDocumentsOpen]);

  const sortedChats = [...chats].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  const sortedDocuments = [...documents].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const latestChat = sortedChats[0];
  const readyDocuments = documents.filter((d) => d.status === "completed").length;

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden h-full">
      <div className="relative h-full overflow-auto">
        <div className="mx-auto max-w-6xl px-6 py-12 md:px-8 md:py-16">
          <div className="space-y-10">
            {/* Header Section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Badge
                  variant="secondary"
                  className="mb-4 gap-1.5 bg-primary/10 text-primary"
                >
                  <IconBolt className="h-3 w-3" />
                  Active Project
                </Badge>
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Project Overview
                </h1>
                <p className="mt-2 text-muted-foreground">
                  {chats.length} conversation{chats.length !== 1 ? "s" : ""} •{" "}
                  {documents.length} document
                  {documents.length !== 1 ? "s" : ""}
                  {latestChat && (
                    <>
                      {" "}
                      • Last active{" "}
                      {formatDistanceToNow(new Date(latestChat.updated_at), {
                        addSuffix: true,
                      })}
                    </>
                  )}
                </p>
              </div>

              <Button size="lg" className="group gap-2 font-semibold" asChild>
                <Link href={`/dashboard/project/${projectData.id}?chatid=new`}>
                  <IconPlus className="h-5 w-5 transition-transform group-hover:rotate-90" />
                  New conversation
                </Link>
              </Button>
            </div>

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
            <div id="conversations" className="scroll-mt-24">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  Recent Conversations
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Continue where you left off or start something new
                </p>
              </div>

              {chats.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {sortedChats.map((chat, index) => (
                    <div key={chat.id}>
                      <ConversationCard
                        chat={chat}
                        projectId={projectData.id}
                        index={index}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState projectId={projectData.id} />
              )}
            </div>

            {/* Documents Section */}
            <div id="documents" className="scroll-mt-24">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Documents
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    PDF files uploaded to this project
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => setIsAddDocumentsOpen(true)}
                >
                  <IconUpload className="h-4 w-4" />
                  Add documents
                </Button>
              </div>

              {documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-muted/20 py-12 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground">
                    <IconFileTypePdf className="h-7 w-7" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-medium text-foreground">
                    No documents yet
                  </h3>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    Upload PDF files to analyze them with AI and extract
                    insights.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 gap-2"
                    onClick={() => setIsAddDocumentsOpen(true)}
                  >
                    <IconUpload className="h-4 w-4" />
                    Add your first PDF
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedDocuments.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      document={doc}
                      onClick={() => onDocumentClick?.(doc.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions Footer */}
            <div className="rounded-2xl border border-dashed border-border/50 bg-muted/20 p-6">
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
                <Button variant="outline" className="gap-2 shrink-0" asChild>
                  <Link
                    href={`/dashboard/project/${projectData.id}?chatid=new`}
                  >
                    <IconMessage className="h-4 w-4" />
                    Ask AI
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Documents Dialog */}
      <CreateProjectDialog
        open={isAddDocumentsOpen}
        onOpenChange={setIsAddDocumentsOpen}
        allDocuments={allDocuments}
        projectId={projectData.id}
        projectName={projectData.name}
        existingDocumentIds={documents.map((d) => d.id)}
      />
    </div>
  );
}
