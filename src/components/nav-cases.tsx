"use client";

import { useState } from "react";

import Link from "next/link";

import { useCase } from "@/contexts/case-context";

import {
  IconChevronDown,
  IconChevronUp,
  IconDots,
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

export function NavCases({
  cases,
}: {
  cases: {
    title: string;
    id: number;
  }[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { caseData } = useCase();
  const { isMobile } = useSidebar();
  const normalizedSearch = searchTerm.toLowerCase().trim();
  const filteredItems = normalizedSearch
    ? cases.filter((c) => c.title.toLowerCase().includes(normalizedSearch))
    : cases;
  const visibleItems = isExpanded ? filteredItems : filteredItems.slice(0, 5);
  const canToggle = filteredItems.length > 5;

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
              <SidebarMenuButton asChild isActive={caseData?.id === c.id}>
                <Link href={`/dashboard/case/${c.id}`}>
                  <IconFile />
                  <span>{c.title}</span>
                </Link>
              </SidebarMenuButton>
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
                  <DropdownMenuItem>
                    <IconFolder />
                    <span>Open</span>
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
