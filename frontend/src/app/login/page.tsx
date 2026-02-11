import { LoginForm } from "@/components/login-form"
import Image from "next/image"

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="https://www.silab.dk/" className="flex items-center gap-2 self-center font-medium">
            <Image src="/sl_logo.png" alt="Logo" width={735} height={485} className="w-auto h-10 rounded-sm shadow-lg" />
        </a>
        <LoginForm />
      </div>
    </div>
  )
}
