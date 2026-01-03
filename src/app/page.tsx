import Link from "next/link";

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="max-w-lg space-y-6 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome to Document RAG
        </h1>
        <p className="text-muted-foreground">
          Log in to access your dashboard, explore cases, and search documents.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium"
          >
            Go to dashboard
          </Link>
          <Link
            href="/login"
            className="border-border hover:bg-muted rounded-md border px-4 py-2 text-sm font-medium"
          >
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}
