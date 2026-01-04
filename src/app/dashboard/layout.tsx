import React from "react";

import { SiteHeader } from "@/components/sidebar/site-header";
import { getCases } from "@/utils/cases/get-cases-data";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { CasesProvider } from "@/components/cases-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cases = await getCases();

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <CasesProvider cases={cases}>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">{children}</div>
        </SidebarInset>
      </CasesProvider>
    </SidebarProvider>
  );
}
