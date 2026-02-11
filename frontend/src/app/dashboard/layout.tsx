import React from "react";

import { SiteHeader } from "@/components/sidebar/site-header";
import { getProjects } from "@/utils/projects/get-projects-data";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { ProjectsProvider } from "@/components/project-overview/projects-provider";
import { Toaster } from "@/components/ui/sonner";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [projects, supabase] = await Promise.all([
    getProjects(),
    createClient(),
  ]);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userData = {
    name: user?.user_metadata?.full_name ?? "",
    email: user?.email ?? "",
    avatar: user?.user_metadata?.avatar_url ?? "",
  };

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
        <AppSidebar variant="inset" user={userData} />
        <SidebarInset className="max-h-svh overflow-hidden">
          <SiteHeader />
          <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
        </SidebarInset>
      </ProjectsProvider>
      <Toaster />
    </SidebarProvider>
  );
}
