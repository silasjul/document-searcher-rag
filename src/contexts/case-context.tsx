"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

export interface CaseData {
  id: number;
  title: string;
}

interface CaseContextValue {
  caseData: CaseData | null;
  chatId?: string;
  setChatId: (chatId?: string) => void;
  setCaseData: (caseData: CaseData | null) => void;
}

const CaseContext = createContext<CaseContextValue | undefined>(undefined);

interface CaseProviderProps {
  children: React.ReactNode;
}

export function CaseProvider({ children }: CaseProviderProps) {
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [chatId, setChatId] = useState<string | undefined>(undefined);

  const value = useMemo(
    () => ({
      caseData,
      chatId,
      setChatId,
      setCaseData,
    }),
    [caseData, chatId]
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
