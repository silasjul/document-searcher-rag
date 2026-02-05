import NotFound from "./not-found";
import { getProject } from "@/utils/projects/get-project-data";
import { getChatsForProject } from "@/utils/chat/get-chats";
import { getDocumentsForProject } from "@/utils/documents/get-documents";
import { ProjectPageWrapper } from "@/components/project-overview/project-page-wrapper";

interface ProjectPageProps {
  params: Promise<{
    projectId: string;
  }>;
  searchParams: Promise<{
    chatid?: string;
  }>;
}

export default async function DashboardProjectPage({
  params,
  searchParams,
}: ProjectPageProps) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);

  const projectId = resolvedParams?.projectId as string;
  const chatId = resolvedSearchParams?.chatid as string;

  const [projectData, chats, documents] = await Promise.all([
    getProject(projectId),
    getChatsForProject(projectId),
    getDocumentsForProject(projectId),
  ]);

  if (!projectData) {
    return <NotFound />;
  }

  return (
    <ProjectPageWrapper
      projectData={projectData}
      chats={chats}
      documents={documents}
      chatId={chatId}
    />
  );
}
