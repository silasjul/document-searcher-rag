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
  cases: [
    {
      name: "M&A - Nordhavn Logistics A/S acquisition",
      url: "#",
      icon: IconFile,
    },
    {
      name: "Restructuring - Skagerrak Pharma turnaround",
      url: "#",
      icon: IconFile,
    },
    {
      name: "Litigation - Aarhus Kommune v Fjordbyg ApS",
      url: "#",
      icon: IconFile,
    },
    {
      name: "Real estate - Copenhagen Harbor Offices",
      url: "#",
      icon: IconFile,
    },
    {
      name: "Banking - Oresund Bank AML review",
      url: "#",
      icon: IconFile,
    },
    {
      name: "Employment - Collective bargaining update",
      url: "#",
      icon: IconFile,
    },
    {
      name: "Tech - Data breach at Zephyr IT",
      url: "#",
      icon: IconFile,
    },
    {
      name: "Energy - North Sea wind farm PPA",
      url: "#",
      icon: IconFile,
    },
    {
      name: "Competition - Jutland Cement dawn raid",
      url: "#",
      icon: IconFile,
    },
    {
      name: "IP - Trademark defence for Hygge Home",
      url: "#",
      icon: IconFile,
    },
    {
      name: "Insurance - Maritime claim Skagen Lines",
      url: "#",
      icon: IconFile,
    },
    {
      name: "Public procurement - Region Hovedstaden EMS",
      url: "#",
      icon: IconFile,
    },
    {
      name: "Construction - Belt Tunnel arbitration",
      url: "#",
      icon: IconFile,
    },
    {
      name: "Tax - Transfer pricing for Arctic Foods",
      url: "#",
      icon: IconFile,
    },
    {
      name: "Privacy - GDPR audit for FjordCredit",
      url: "#",
      icon: IconFile,
    },
    {
      name: "Shipping - Charterparty dispute Baltic Star",
      url: "#",
      icon: IconFile,
    },
    {
      name: "Insolvency - Falster Retail estate",
      url: "#",
      icon: IconFile,
    },
    {
      name: "Capital markets - Listing of NovaMed A/S",
      url: "#",
      icon: IconFile,
    },
    {
      name: "Environment - Aalborg biogas permit",
      url: "#",
      icon: IconFile,
    },
    {
      name: "Investigations - Whistleblower at Nordsteel",
      url: "#",
      icon: IconFile,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
        <NavDocuments items={sidebarData.cases} />
        <NavSecondary items={sidebarData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
