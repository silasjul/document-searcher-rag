import React from "react";

import Sidebar from "@/components/sidebar";
import { CaseProvider } from "@/contexts/case-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CaseProvider>
      <Sidebar>{children}</Sidebar>
    </CaseProvider>
  );
}
