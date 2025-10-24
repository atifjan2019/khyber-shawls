'use client'

import Link from "next/link"
import { useEffect, useRef } from "react"
import { useFormState } from "react-dom"

import { loginAction } from "@/app/(auth)/actions"
import { Button } from "@/components/ui/button"

const initialState = { error: undefined as string | undefined }

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, isPending] = useFormState(loginAction, initialState)

  useEffect(() => {
    if (!state.error) {
      formRef.current?.reset()
    }
  }, [state.error])

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      <input type="hidden" name="redirectTo" value={redirectTo ?? ""} />
      <div className="grid gap-3">
        <label className="text-sm font-medium" htmlFor="login-email">
          Email address
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
        />
      </div>
      <div className="grid gap-3">
        <label className="text-sm font-medium" htmlFor="login-password">
          Password
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          required
          placeholder="••••••••"
          className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
        />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Need an account?{' '}
        <Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
          Create one here
        </Link>
      </p>
    </form>
  )
}
