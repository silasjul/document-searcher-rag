import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md p-8 text-center">
        <h2 className="mb-2 text-2xl font-bold">Project Not Found</h2>
        <p className="mb-6 text-muted-foreground">
          The project you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </Card>
    </div>
  );
}

