"use client";

import { useState, useEffect } from "react";
import { IconCirclePlusFilled, IconLibrary, IconHome } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { CreateProjectDialog } from "@/components/project-overview/create-project-dialog";
import { createClient } from "@/lib/supabase/client";
import type { Document, Tag } from "@/lib/types";

export function NavMain() {
  const pathname = usePathname();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [allDocuments, setAllDocuments] = useState<Document[]>([]);

  // Fetch documents (with tags) when dialog opens
  useEffect(() => {
    if (!isCreateDialogOpen) return;

    async function fetchDocs() {
      const supabase = createClient();
      const { data } = await supabase
        .from("files")
        .select("*, file_tags(tag_id, tags(*))")
        .order("created_at", { ascending: false });

      const parsed = (data ?? []).map((d) => {
        const raw = d as unknown as Record<string, unknown>;
        const fileTags = (raw.file_tags ?? []) as Array<{
          tag_id: string;
          tags: Tag | null;
        }>;
        const tags: Tag[] = fileTags
          .map((ft) => ft.tags)
          .filter((t): t is Tag => t !== null);
        const { file_tags: _unused, ...rest } = raw;
        return { ...rest, tags } as Document;
      });

      setAllDocuments(parsed);
    }
    fetchDocs();
  }, [isCreateDialogOpen]);

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent className="flex flex-col gap-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Home"
                isActive={pathname === "/dashboard"}
              >
                <Link href="/dashboard">
                  <IconHome />
                  <span>Home</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="My Library"
                isActive={pathname === "/dashboard/documents"}
              >
                <Link href="/dashboard/documents">
                  <IconLibrary />
                  <span>My Library</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem className="flex items-center gap-2">
              <SidebarMenuButton
                tooltip="Quick Create"
                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <IconCirclePlusFilled />
                <span>New Project</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <CreateProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        allDocuments={allDocuments}
      />
    </>
  );
}
