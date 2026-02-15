"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  IconSparkles,
  IconMessage,
  IconFileText,
} from "@tabler/icons-react";

interface QuickActionsFooterProps {
  projectId: string;
  hasReadyDocuments: boolean;
}

export function QuickActionsFooter({
  projectId,
  hasReadyDocuments,
}: QuickActionsFooterProps) {
  return (
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
            You can ask questions that span multiple documents. Try asking
            &quot;Compare the liability clauses across all contracts&quot;.
          </p>
        </div>
        {hasReadyDocuments ? (
          <Button variant="outline" className="gap-2 shrink-0" asChild>
            <Link href={`/dashboard/project/${projectId}?chatid=new`}>
              <IconMessage className="h-4 w-4" />
              Ask AI
            </Link>
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex shrink-0">
                <Button variant="outline" className="gap-2" disabled>
                  <IconMessage className="h-4 w-4" />
                  Ask AI
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
    </div>
  );
}
