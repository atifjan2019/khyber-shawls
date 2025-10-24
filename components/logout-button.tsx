'use client'

import { useTransition } from "react"

import { logoutAction } from "@/app/(auth)/actions"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        startTransition(async () => {
          await logoutAction()
        })
      }}
      disabled={isPending}
    >
      {isPending ? "Signing out…" : "Sign out"}
    </Button>
  )
}
