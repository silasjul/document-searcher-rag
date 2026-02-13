import { VantaBackground } from "@/components/VantaFog"
import { Toaster } from "@/components/ui/sonner"
import Image from "next/image"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-svh">
      <VantaBackground />
      <a href="https://www.silab.dk/" target="_blank" className="absolute top-6 left-6 z-20 md:top-9 md:left-8">
        <Image
          className="rounded-md opacity-90 w-12 sm:w-15"
          src={'/sl_logo.png'}
          alt={'logo'}
          width={735}
          height={485}
        />
      </a>
      <div className="relative z-10 flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        {children}
      </div>
      <Toaster />
    </div>
  )
}
