"use client";

import * as React from "react";
// Update the import to match the actual export from the actions module
// For example, if the export is default:
// import logoutAction from "@/app/(auth)/actions";
// Or, if the export is named differently, update accordingly:
// import { correctExportName } from "@/app/(auth)/actions";
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
