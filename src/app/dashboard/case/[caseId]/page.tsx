import { ChatInterface } from "@/components/chat-interface";
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
  const chatId = Number(resolvedSearchParams?.chatId);

  if (!Number.isFinite(caseId)) {
    return <NotFound />;
  }

  return <ChatInterface caseId={caseId} chatId={chatId} />;
}
