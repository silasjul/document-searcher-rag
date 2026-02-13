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
import { ProjectNameInput } from "@/components/project-overview/project-name-input";
import { cn } from "@/lib/utils";
import { useProjects } from "@/components/project-overview/projects-provider";

export function NavProjects() {
  const { projects, updateProjectNameOptimistic } = useProjects();
  const [isExpanded, setIsExpanded] = useState(false);
  const [renamingProjectId, setRenamingProjectId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { isMobile } = useSidebar();

  const normalizedSearch = searchTerm.toLowerCase().trim();
  const filteredItems = normalizedSearch
    ? projects.filter((p) => p.name.toLowerCase().includes(normalizedSearch))
    : projects;
  const visibleItems = isExpanded ? filteredItems : filteredItems.slice(0, 5);
  const canToggle = filteredItems.length > 5;

  const params = useParams();
  const activeProjectId = params.projectId as string;

  if (projects.length === 0) return null;

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <div className="pb-2">
        <div className="relative">
          <IconSearch className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search projects..."
            aria-label="Search projects"
            className="pl-9 bg-background"
          />
        </div>
      </div>
      <SidebarMenu>
        {visibleItems.length === 0 ? (
          <SidebarMenuItem>
            <SidebarMenuButton className="text-sidebar-foreground/70" disabled>
              <span>No projects found</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : (
          visibleItems.map((p) => (
            <SidebarMenuItem key={p.id}>
              {renamingProjectId === p.id ? (
                <div className="flex items-center gap-2 w-full h-8 pl-2 rounded-md">
                  <IconFile className="size-4 shrink-0" />
                  <ProjectNameInput
                    projectId={p.id}
                    initialName={p.name}
                    onFinished={() => setRenamingProjectId(null)}
                    onRename={(newName) =>
                      updateProjectNameOptimistic(p.id, newName)
                    }
                    className={cn(
                      "h-6 w-full text-sm font-normal min-w-0",
                      activeProjectId === p.id &&
                      "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    )}
                    autoFocus
                  />
                </div>
              ) : (
                <SidebarMenuButton asChild isActive={activeProjectId === p.id}>
                  <Link href={`/dashboard/project/${p.id}`}>
                    <IconFile />
                    <span>{p.name}</span>
                  </Link>
                </SidebarMenuButton>
              )}
              {renamingProjectId !== p.id && (
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
                    className="w-24 rounded-lg data-[state=closed]:animate-none!"
                    side={isMobile ? "bottom" : "right"}
                    align={isMobile ? "end" : "start"}
                  >
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/project/${p.id}`}>
                        <IconFolder />
                        <span>Open</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRenamingProjectId(p.id)}>
                      <IconEdit />
                      <span>Rename</span>
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
