'use client'

import { useTransition } from "react"

import { logoutAction } from "@/app/(auth)/actions"
import { Button, type ButtonProps } from "@/components/ui/button"

type LogoutButtonProps = ButtonProps & {
  children?: React.ReactNode
}

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
