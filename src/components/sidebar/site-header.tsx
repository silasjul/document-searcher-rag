"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useParams } from "next/navigation";
import { Case } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { updateCaseName } from "@/utils/cases/cases-actions";

interface SiteHeaderProps {
  cases?: Case[];
}

export function SiteHeader({ cases = [] }: SiteHeaderProps) {
  const params = useParams();
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
          />
        ) : (
          <h1 className="text-base font-medium">Home</h1>
        )}
      </div>
    </header>
  );
}

function CaseNameInput({
  caseId,
  initialName,
}: {
  caseId: string;
  initialName: string;
}) {
  const [value, setValue] = useState(initialName);

  async function handleSave() {
    if (!value || value === initialName) {
      setValue(initialName);
      return;
    }
    await updateCaseName(caseId, value);
  }

  return (
    <Input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleSave}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.currentTarget.blur();
        }
      }}
      className="h-8 w-75 border-none shadow-none focus-visible:ring-black focus-visible:ring-1 bg-transparent px-2 text-base font-medium hover:ring-black/20 hover:ring-1 transition-all duration-100 ease-linear"
      placeholder="Untitled Case"
    />
  );
}
