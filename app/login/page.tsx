import { redirect } from "next/navigation"

import { LoginForm } from "@/app/login/login-form"
import { getCurrentUser } from "@/lib/auth"

type PageProps = {
  searchParams: Promise<{ callbackUrl?: string }>
}

export default async function LoginPage({ searchParams }: PageProps) {
  const user = await getCurrentUser()
  if (user) {
    redirect(user.role === "ADMIN" ? "/admin" : "/dashboard")
  }

  const params = await searchParams
  const redirectTo = params?.callbackUrl

  return (
    <div className="mx-auto max-w-md space-y-8 rounded-3xl border bg-card p-10 shadow-sm">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Access your dashboard to track orders and manage the catalogue.
        </p>
      </div>
      <LoginForm redirectTo={redirectTo} />
    </div>
  )
}
