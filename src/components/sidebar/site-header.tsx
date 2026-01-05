"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useParams, usePathname } from "next/navigation";

import { CaseNameInput } from "@/components/case-overview/case-name-input";
import { useCases } from "@/components/case-overview/cases-provider";

export function SiteHeader() {
  const { cases, updateCaseNameOptimistic } = useCases();
  const params = useParams();
  const pathname = usePathname();
  const caseId = params?.caseId as string | undefined;
  const activeCase = cases.find((c) => c.id === caseId);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        {activeCase ? (
          <CaseNameInput
            key={activeCase.id}
            caseId={activeCase.id}
            initialName={activeCase.name}
            className="w-50 sm:w-75"
            autoFocus={false}
            onRename={(newName) =>
              updateCaseNameOptimistic(activeCase.id, newName)
            }
          />
        ) : (
          <h1 className="text-base font-medium px-2">
            {pathname === "/dashboard/documents" ? "Documents" : "Home"}
          </h1>
        )}
      </div>
    </header>
  );
}
