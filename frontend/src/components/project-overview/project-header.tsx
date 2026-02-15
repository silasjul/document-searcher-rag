"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  IconBolt,
  IconPlus,
  IconFileText,
} from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import type { ChatSession } from "@/lib/types";

interface ProjectHeaderProps {
  projectId: string;
  chatCount: number;
  documentCount: number;
  latestChat?: ChatSession;
  hasReadyDocuments: boolean;
}

export function ProjectHeader({
  projectId,
  chatCount,
  documentCount,
  latestChat,
  hasReadyDocuments,
}: ProjectHeaderProps) {
  return (
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
          {chatCount} conversation{chatCount !== 1 ? "s" : ""} •{" "}
          {documentCount} document{documentCount !== 1 ? "s" : ""}
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

      {hasReadyDocuments ? (
        <Button size="lg" className="group gap-2 font-semibold" asChild>
          <Link href={`/dashboard/project/${projectId}?chatid=new`}>
            <IconPlus className="h-5 w-5 transition-transform group-hover:rotate-90" />
            New conversation
          </Link>
        </Button>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <Button size="lg" className="gap-2 font-semibold" disabled>
                <IconPlus className="h-5 w-5" />
                New conversation
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex items-center gap-1.5">
              <IconFileText className="h-3.5 w-3.5" />
              At least one ready document is required to start a conversation
            </div>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
