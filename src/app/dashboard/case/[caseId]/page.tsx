import { ChatInterface } from "@/components/chat-interface";
import casesData from "@/data/cases-data.json";
import NotFound from "./not-found";

interface CasePageProps {
  params: Promise<{
    caseId: string;
  }>;
  searchParams: Promise<{
    chatId?: string;
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

  const caseId = Number(resolvedParams?.caseId);
  const chatId =
    typeof resolvedSearchParams?.chatId === "string"
      ? resolvedSearchParams?.chatId
      : undefined;

  if (!Number.isFinite(caseId)) {
    return <NotFound />;
  }

  const caseData = casesData.find((c) => c.id === caseId);

  if (!caseData) {
    return <NotFound />;
  }

  return <ChatInterface initialCaseData={caseData} initialChatId={chatId} />;
}
