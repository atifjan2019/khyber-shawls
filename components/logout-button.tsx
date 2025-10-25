'use client'

import { useTransition } from "react"

import { logoutAction } from "@/app/(auth)/actions"
import { Button } from "@/components/ui/button"

type LogoutButtonProps = React.ComponentProps<typeof Button>

export function LogoutButton({ children, ...props }: LogoutButtonProps) {
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
      {...props}
    >
      {children ?? (isPending ? "Signing out…" : "Sign out")}
    </Button>
  )
}
