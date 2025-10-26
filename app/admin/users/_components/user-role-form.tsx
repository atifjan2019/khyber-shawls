"use client";

import { useState } from "react";
import { updateUserRole } from "../actions";
import { Button } from "@/components/ui/button";

type UserRoleFormProps = {
  userId: string;
  currentRole: "USER" | "ADMIN";
  disabled?: boolean;
};

export function UserRoleForm({ userId, currentRole, disabled }: UserRoleFormProps) {
  const [isPending, setIsPending] = useState(false);

  async function onSubmit(formData: FormData) {
    try {
      setIsPending(true);
      await updateUserRole(userId, formData);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form action={onSubmit}>
      <input type="hidden" name="userId" value={userId} />
      <select
        name="role"
        defaultValue={currentRole}
        className="rounded-md border bg-background px-2 py-1.5 text-sm outline-none focus-visible:border-primary"
        disabled={disabled || isPending}
      >
        <option value="USER">User</option>
        <option value="ADMIN">Admin</option>
      </select>
      {currentRole !== ((document.querySelector(`select[name="role"][value="${userId}"]`) as HTMLSelectElement)?.value) && (
        <Button type="submit" size="sm" className="ml-2" disabled={disabled || isPending}>
          Save
        </Button>
      )}
    </form>
  );
}