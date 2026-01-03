"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import casesData from "@/data/cases-data.json";

export interface CaseData {
  id: number;
  title: string;
}

interface CaseContextValue {
  caseId: number | undefined;
  setCaseId: (caseId: number) => void;
  caseData: CaseData | null;
  chatId?: string;
  setChatId: (chatId?: string) => void;
}

const CaseContext = createContext<CaseContextValue | undefined>(undefined);

interface CaseProviderProps {
  children: React.ReactNode;
}

export function CaseProvider({ children }: CaseProviderProps) {
  const [caseId, setCaseId] = useState<number | undefined>(undefined);
  const [chatId, setChatId] = useState<string | undefined>(undefined);

  const caseData = useMemo(() => {
    if (!caseId) return null;
    return casesData.find((c) => c.id === caseId) || null;
  }, [caseId]);

  const value = useMemo(
    () => ({
      caseData,
      caseId,
      chatId,
      setCaseId,
      setChatId,
    }),
    [caseData, caseId, chatId]
  );

  return <CaseContext.Provider value={value}>{children}</CaseContext.Provider>;
}

export function useCase() {
  const context = useContext(CaseContext);

  if (!context) {
    throw new Error("useCase must be used within a CaseProvider");
  }

  return context;
}
