import NotFound from "./not-found";
import { getCase } from "@/utils/cases/get-case-data";
import { getChatsForCase } from "@/utils/chat/get-chats";
import { getDocumentsForCase } from "@/utils/documents/get-documents";
import { Chat } from "@/components/chat";
import { CaseOverview } from "@/components/case-overview/case-overview";

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

  if (!chatId) {
    return (
      <div className="@container/main flex flex-1 flex-col">
        <CaseOverview caseData={caseData} chats={chats} documents={documents} />
      </div>
    );
  }

  return (
    <div className="@container/main flex flex-1 flex-col">
      <Chat chatId={chatId} caseData={caseData} />
    </div>
  );
}
