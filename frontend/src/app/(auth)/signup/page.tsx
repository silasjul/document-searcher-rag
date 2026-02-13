import { SignupForm } from "@/components/signup-form"

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const { code } = await searchParams

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <SignupForm code={code} />
    </div>
  )
}
