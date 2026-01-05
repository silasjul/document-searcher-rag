"use client";

import { Case } from "@/lib/mock-data";
import { createContext, useContext, useOptimistic, startTransition } from "react";

interface CasesContextType {
  cases: Case[];
  updateCaseNameOptimistic: (id: string, newName: string) => void;
}

const CasesContext = createContext<CasesContextType | null>(null);

export function CasesProvider({
  cases: initialCases,
  children,
}: {
  cases: Case[];
  children: React.ReactNode;
}) {
  // Use optimistic state for immediate updates
  const [optimisticCases, setOptimisticCases] = useOptimistic(
    initialCases,
    (state, { id, newName }: { id: string; newName: string }) => {
      return state.map((c) => (c.id === id ? { ...c, name: newName } : c));
    }
  );

  const updateCaseNameOptimistic = (id: string, newName: string) => {
    startTransition(() => {
      setOptimisticCases({ id, newName });
    });
  };

  return (
    <CasesContext.Provider
      value={{ cases: optimisticCases, updateCaseNameOptimistic }}
    >
      {children}
    </CasesContext.Provider>
  );
}

export function useCases() {
  const context = useContext(CasesContext);
  if (!context) {
    throw new Error("useCases must be used within a CasesProvider");
  }
  return context;
}
