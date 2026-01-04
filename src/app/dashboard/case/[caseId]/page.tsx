import NotFound from "./not-found";
import { getCase } from "@/utils/cases/get-case-data";

interface CasePageProps {
  params: Promise<{
    caseId: string;
  }>;
}

export default async function DashboardCasePage({
  params,
}: CasePageProps) {
  const [resolvedParams] = await Promise.all([
    params,
  ]);

  const caseId = resolvedParams?.caseId as string;

  const caseData = await getCase(caseId);

  if (!caseData) {
    return <NotFound />;
  }

  return <div className="@container/main flex flex-1 flex-col"></div>;
}
