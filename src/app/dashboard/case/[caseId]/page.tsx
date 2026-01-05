import NotFound from "./not-found";
import { getCase } from "@/utils/cases/get-case-data";
import { getChatsForCase } from "@/utils/chat/get-chats";
import { getDocumentsForCase } from "@/utils/documents/get-documents";
import { CasePageWrapper } from "@/components/case-overview/case-page-wrapper";

interface CasePageProps {
  params: Promise<{
    caseId: string;
  }>;
  searchParams: Promise<{
    chatid?: string;
  }>;
}

export default async function DashboardCasePage({
  params,
  searchParams,
}: CasePageProps) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);

  const caseId = resolvedParams?.caseId as string;
  const chatId = resolvedSearchParams?.chatid as string;

  const [caseData, chats, documents] = await Promise.all([
    getCase(caseId),
    getChatsForCase(caseId),
    getDocumentsForCase(caseId),
  ]);

  if (!caseData) {
    return <NotFound />;
  }

  return (
    <CasePageWrapper
      caseData={caseData}
      chats={chats}
      documents={documents}
      chatId={chatId}
    />
  );
}
