"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { forgotPassword } from "@/lib/supabase/actions"
import { toast } from "sonner"

type FieldKey = "email" | "general"

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await forgotPassword(formData)

    if (result?.error) {
      if (result.field === "email") {
        setErrors({ email: result.error })
      } else {
        toast.error(result.error)
        setErrors({ general: result.error })
      }
      setLoading(false)
    } else if (result?.success) {
      setSubmitted(true)
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6 shadow-2xl", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Reset your password</CardTitle>
          <CardDescription>
            {submitted
              ? "Check your email for a reset link"
              : "Enter your email to receive a password reset link"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="flex flex-col gap-4 text-center">
              <p className="text-sm text-muted-foreground">
                If an account exists with that email, we&apos;ve sent a password
                reset link. Please check your inbox and spam folder.
              </p>
              <Button variant="outline" asChild>
                <Link href="/login">Back to login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field data-invalid={!!(errors.email || errors.general) || undefined}>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@example.com"
                    required
                    aria-invalid={!!(errors.email || errors.general) || undefined}
                  />
                  {errors.email && (
                    <FieldError>{errors.email}</FieldError>
                  )}
                </Field>
                <Field>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Sending reset link..." : "Send reset link"}
                  </Button>
                  <FieldDescription className="text-center">
                    Remember your password? <Link href="/login">Login</Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
