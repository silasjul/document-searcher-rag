"use client";

import { useState } from "react";

import Link from "next/link";

import {
  IconChevronDown,
  IconChevronUp,
  IconDots,
  IconEdit,
  IconFile,
  IconFolder,
  IconSearch,
  IconShare3,
  IconTrash,
} from "@tabler/icons-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useParams } from "next/navigation";
import { CaseNameInput } from "@/components/case-name-input";
import { cn } from "@/lib/utils";
import { useCases } from "@/components/cases-provider";

export function NavCases() {
  const { cases, updateCaseNameOptimistic } = useCases();
  const [isExpanded, setIsExpanded] = useState(false);
  const [renamingCaseId, setRenamingCaseId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { isMobile } = useSidebar();

  const normalizedSearch = searchTerm.toLowerCase().trim();
  const filteredItems = normalizedSearch
    ? cases.filter((c) => c.name.toLowerCase().includes(normalizedSearch))
    : cases;
  const visibleItems = isExpanded ? filteredItems : filteredItems.slice(0, 5);
  const canToggle = filteredItems.length > 5;

  const params = useParams();
  const activeCaseId = params.caseId as string;

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Cases</SidebarGroupLabel>
      <div className="px-2 pb-2">
        <div className="relative">
          <IconSearch className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search cases..."
            aria-label="Search cases"
            className="pl-9 bg-background"
          />
        </div>
      </div>
      <SidebarMenu>
        {visibleItems.length === 0 ? (
          <SidebarMenuItem>
            <SidebarMenuButton className="text-sidebar-foreground/70" disabled>
              <span>No cases found</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : (
          visibleItems.map((c) => (
            <SidebarMenuItem key={c.id}>
              {renamingCaseId === c.id ? (
                <div className="flex items-center gap-2 w-full h-8 px-2 rounded-md">
                  <IconFile className="size-4 shrink-0" />
                  <CaseNameInput
                    caseId={c.id}
                    initialName={c.name}
                    onFinished={() => setRenamingCaseId(null)}
                    onRename={(newName) =>
                      updateCaseNameOptimistic(c.id, newName)
                    }
                    className={cn(
                      "h-6 w-full text-sm font-normal min-w-0",
                      activeCaseId === c.id &&
                        "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    )}
                    autoFocus
                  />
                </div>
              ) : (
                <SidebarMenuButton asChild isActive={activeCaseId === c.id}>
                  <Link href={`/dashboard/case/${c.id}`}>
                    <IconFile />
                    <span>{c.name}</span>
                  </Link>
                </SidebarMenuButton>
              )}
              {renamingCaseId !== c.id && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuAction
                      showOnHover
                      className="data-[state=open]:bg-accent rounded-sm"
                    >
                      <IconDots />
                      <span className="sr-only">More</span>
                    </SidebarMenuAction>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-24 rounded-lg"
                    side={isMobile ? "bottom" : "right"}
                    align={isMobile ? "end" : "start"}
                  >
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/case/${c.id}`}>
                        <IconFolder />
                        <span>Open</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRenamingCaseId(c.id)}>
                      <IconEdit />
                      <span>Rename</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                      <IconShare3 />
                      <span>Share</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive">
                      <IconTrash />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </SidebarMenuItem>
          ))
        )}
        {canToggle && (
          <SidebarMenuItem>
            <SidebarMenuButton
              className="text-sidebar-foreground/70"
              onClick={() => setIsExpanded((prev) => !prev)}
            >
              {isExpanded ? (
                <IconChevronUp className="text-sidebar-foreground/70" />
              ) : (
                <IconChevronDown className="text-sidebar-foreground/70" />
              )}
              <span>{isExpanded ? "Show less" : "Show more"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
