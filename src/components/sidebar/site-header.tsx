"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useParams, usePathname } from "next/navigation";

import { ProjectNameInput } from "@/components/project-overview/project-name-input";
import { useProjects } from "@/components/project-overview/projects-provider";

export function SiteHeader() {
  const { projects, updateProjectNameOptimistic } = useProjects();
  const params = useParams();
  const pathname = usePathname();
  const projectId = params?.projectId as string | undefined;
  const activeProject = projects.find((p) => p.id === projectId);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        {activeProject ? (
          <ProjectNameInput
            key={activeProject.id}
            projectId={activeProject.id}
            initialName={activeProject.name}
            className="w-50 sm:w-75"
            autoFocus={false}
            onRename={(newName) =>
              updateProjectNameOptimistic(activeProject.id, newName)
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
