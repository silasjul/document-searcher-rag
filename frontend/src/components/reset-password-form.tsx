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
import { updatePassword } from "@/lib/supabase/actions"
import { toast } from "sonner"

type FieldKey = "password" | "general"

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({})
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await updatePassword(formData)

    if (result?.error) {
      if (result.field === "general") {
        toast.error(result.error)
        setErrors({ general: result.error })
      } else {
        setErrors({ [result.field]: result.error })
      }
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6 shadow-2xl", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Set new password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field data-invalid={!!(errors.password || errors.general) || undefined}>
                <FieldLabel htmlFor="password">New Password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="********"
                  required
                  aria-invalid={!!(errors.password || errors.general) || undefined}
                />
              </Field>
              <Field data-invalid={!!(errors.password || errors.general) || undefined}>
                <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  placeholder="********"
                  required
                  aria-invalid={!!(errors.password || errors.general) || undefined}
                />
                {errors.password ? (
                  <FieldError>{errors.password}</FieldError>
                ) : (
                  <FieldDescription>
                    Must be at least 8 characters long.
                  </FieldDescription>
                )}
              </Field>
              <Field>
                <Button type="submit" disabled={loading}>
                  {loading ? "Updating password..." : "Update password"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
