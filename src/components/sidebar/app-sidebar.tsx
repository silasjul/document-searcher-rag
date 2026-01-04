"use client";

import { IconSettings, IconWorld } from "@tabler/icons-react";
import Image from "next/image";
import * as React from "react";

import { NavCases } from "@/components/sidebar/nav-cases";
import { NavMain } from "@/components/sidebar/nav-main";
import { NavSecondary } from "@/components/sidebar/nav-secondary";
import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Case } from "@/lib/mock-data";

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

export function AppSidebar({
  cases,
  ...props
}: React.ComponentProps<typeof Sidebar> & { cases: Case[] }) {
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
        <NavCases cases={cases} />
        <NavSecondary items={sidebarData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
