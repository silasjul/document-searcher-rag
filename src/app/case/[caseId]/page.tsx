import { AppSidebar } from "@/components/app-sidebar";
import { ChatInterface } from "@/components/chat-interface";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import casesData from "@/data/cases-data.json";

interface CasePageProps {
  params: {
    caseId: string;
  };
}

export default function CasePage({ params }: CasePageProps) {
  const caseId = parseInt(params.caseId);
  let caseData = casesData.find((c) => c.id === caseId);

  // If case doesn't exist in data, create a new case object
  if (!caseData) {
    caseData = {
      id: caseId,
      title: `New Case ${caseId}`,
    };
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <ChatInterface caseData={caseData} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
