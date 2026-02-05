import React from "react";

import { SiteHeader } from "@/components/sidebar/site-header";
import { getProjects } from "@/utils/projects/get-projects-data";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { ProjectsProvider } from "@/components/project-overview/projects-provider";
import { Toaster } from "@/components/ui/sonner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const projects = await getProjects();

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <ProjectsProvider projects={projects}>
        <AppSidebar variant="inset" />
        <SidebarInset className="max-h-svh overflow-hidden">
          <SiteHeader />
          <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
        </SidebarInset>
      </ProjectsProvider>
      <Toaster />
    </SidebarProvider>
  );
}
