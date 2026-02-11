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
import { signup } from "@/lib/supabase/actions"

type FieldKey = "secret" | "email" | "password" | "general"

export function SignupForm({
  className,
  code,
  ...props
}: React.ComponentProps<"div"> & { code?: string }) {
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({})
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await signup(formData)

    if (result?.error) {
      setErrors({ [result.field]: result.error })
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Enter your email below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {errors.general && (
                <FieldError>{errors.general}</FieldError>
              )}
              <Field data-invalid={!!errors.secret || undefined}>
                <FieldLabel htmlFor="secret">Signup Secret</FieldLabel>
                <Input
                  id="secret"
                  name="secret"
                  type="password"
                  placeholder="Enter the secret key"
                  defaultValue={code}
                  required
                />
                {errors.secret ? (
                  <FieldError>{errors.secret}</FieldError>
                ) : (
                  <FieldDescription>
                    You need an invite secret to create an account.
                  </FieldDescription>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input id="name" name="name" type="text" placeholder="John Doe" required />
              </Field>
              <Field data-invalid={!!errors.email || undefined}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
                {errors.email && (
                  <FieldError>{errors.email}</FieldError>
                )}
              </Field>
              <Field data-invalid={!!errors.password || undefined}>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input id="password" name="password" type="password" required />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Confirm Password
                    </FieldLabel>
                    <Input id="confirm-password" name="confirm-password" type="password" required />
                  </Field>
                </Field>
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
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
                <FieldDescription className="text-center">
                  Already have an account? <Link href="/login">Login</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
