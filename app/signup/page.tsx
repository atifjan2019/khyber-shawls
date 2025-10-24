import { redirect } from "next/navigation"

import { SignupForm } from "@/app/signup/signup-form"
import { getCurrentUser } from "@/lib/auth"

type PageProps = {
  searchParams: Promise<{ callbackUrl?: string }>
}

export default async function SignupPage({ searchParams }: PageProps) {
  const user = await getCurrentUser()
  if (user) {
    redirect(user.role === "ADMIN" ? "/admin" : "/dashboard")
  }

  const params = await searchParams
  const redirectTo = params?.callbackUrl

  return (
    <div className="mx-auto max-w-md space-y-8 rounded-3xl border bg-card p-10 shadow-sm">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
        <p className="text-sm text-muted-foreground">
          Stay in the loop with new releases and track your bespoke orders.
        </p>
      </div>
      <SignupForm redirectTo={redirectTo} />
    </div>
  )
}
