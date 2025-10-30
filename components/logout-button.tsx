"use client";

import * as React from "react";
import { logout } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

// Infer props from the Button component automatically
type LogoutButtonProps = React.ComponentProps<typeof Button> & {
  children?: React.ReactNode;
};

export function LogoutButton({ children, ...props }: LogoutButtonProps) {
  return (
    <form action={logout}>
      <Button type="submit" {...props}>
        {children ?? "Log out"}
      </Button>
    </form>
  );
}
