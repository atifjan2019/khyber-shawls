'use client'

import * as React from "react"

import { logoutAction } from "@/app/(auth)/actions"
import { Button } from "@/components/ui/button"

type LogoutButtonProps = React.ComponentProps<typeof Button> & {
  children?: React.ReactNode
}

export function LogoutButton({ children, ...props }: LogoutButtonProps) {
  const [isPending, startTransition] = React.useTransition()

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
      {...props}
    >
      {children ?? (isPending ? "Signing out…" : "Sign out")}
    </Button>
  )
}
