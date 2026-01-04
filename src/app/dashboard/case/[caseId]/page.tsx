import NotFound from "./not-found";
import { getCase } from "@/utils/cases/get-case-data";

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

  const caseData = await getCase(caseId);

  if (!caseData) {
    return <NotFound />;
  }

  return (
    <div className="@container/main flex flex-1 flex-col">
      {chatId && (
        <div className="p-4 bg-muted rounded-lg mb-4">
          <p className="text-sm text-muted-foreground">
            Chat ID: <span className="font-mono">{chatId}</span>
          </p>
        </div>
      )}
    </div>
  );
}
