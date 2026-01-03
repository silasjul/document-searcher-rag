"use client";

import { useState } from "react";

import {
  IconChevronDown,
  IconChevronUp,
  IconDots,
  IconFolder,
  IconSearch,
  IconShare3,
  IconTrash,
  type Icon,
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

export function NavDocuments({
  items,
}: {
  items: {
    name: string;
    url: string;
    icon: Icon;
  }[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { isMobile } = useSidebar();
  const normalizedSearch = searchTerm.toLowerCase().trim();
  const filteredItems = normalizedSearch
    ? items.filter((item) => item.name.toLowerCase().includes(normalizedSearch))
    : items;
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
          visibleItems.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild>
                <a href={item.url}>
                  <item.icon />
                  <span>{item.name}</span>
                </a>
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
