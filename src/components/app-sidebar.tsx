"use client";

import { IconFile, IconSettings, IconWorld } from "@tabler/icons-react";
import Image from "next/image";
import * as React from "react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import casesData from "@/data/cases-data.json";

const sidebarData = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navSecondary: [
    {
      title: "Global Documents",
      url: "#",
      icon: IconWorld,
    },
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Transform cases data to the format expected by NavDocuments
  const cases = casesData.map((caseItem) => ({
    name: caseItem.title,
    url: caseItem.id,
    icon: IconFile,
  }));

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5! h-auto! items-center overflow-visible!"
            >
              <a
                href="https://www.silab.dk/"
                target="_blank"
                className="flex min-w-0 items-center gap-4"
              >
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="size-6 shrink-0 rounded"
                />
                <div className="flex min-w-0 flex-col leading-tight">
                  <span className="text-base font-semibold leading-tight">
                    Document RAG
                  </span>
                  <span className="text-xs text-muted-foreground leading-tight">
                    Powered by Silab
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
        <NavDocuments items={cases} />
        <NavSecondary items={sidebarData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
