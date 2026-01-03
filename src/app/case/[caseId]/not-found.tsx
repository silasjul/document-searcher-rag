import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md p-8 text-center">
        <h2 className="text-2xl font-bold mb-2">Case Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The case you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/">Return to Dashboard</Link>
        </Button>
      </Card>
    </div>
  );
}
