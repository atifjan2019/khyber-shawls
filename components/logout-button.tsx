"use client";

import * as React from "react";
import { logoutAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

// Infer props from the Button component automatically
type LogoutButtonProps = React.ComponentProps<typeof Button> & {
  children?: React.ReactNode;
};

export function LogoutButton({ children, ...props }: LogoutButtonProps) {
  return (
    <form action={logoutAction}>
      <Button type="submit" {...props}>
        {children ?? "Log out"}
      </Button>
    </form>
  );
}
