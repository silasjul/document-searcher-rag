"use client";

import { Project } from "@/lib/mock-data";
import { createContext, useContext, useOptimistic, startTransition } from "react";

interface ProjectsContextType {
  projects: Project[];
  updateProjectNameOptimistic: (id: string, newName: string) => void;
}

const ProjectsContext = createContext<ProjectsContextType | null>(null);

export function ProjectsProvider({
  projects,
  children,
}: {
  projects: Project[];
  children: React.ReactNode;
}) {
  // Use optimistic state for immediate updates
  const [optimisticProjects, setOptimisticProjects] = useOptimistic(
    projects,
    (state, { id, newName }: { id: string; newName: string }) => {
      return state.map((p) => (p.id === id ? { ...p, name: newName } : p));
    }
  );

  const updateProjectNameOptimistic = (id: string, newName: string) => {
    startTransition(() => {
      setOptimisticProjects({ id, newName });
    });
  };

  return (
    <ProjectsContext.Provider
      value={{ projects: optimisticProjects, updateProjectNameOptimistic }}
    >
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error("useProjects must be used within a ProjectsProvider");
  }
  return context;
}
