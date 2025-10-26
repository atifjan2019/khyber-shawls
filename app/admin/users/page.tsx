import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserRoleForm } from "./_components/user-role-form";
import { CreateUserForm } from "./_components/create-user-form";
import { deleteUser } from "./actions";

export default async function AdminUsersPage() {
  const users: Array<{
    id: string;
    email: string;
    name: string | null;
    role: string;
    createdAt: Date;
    _count: { orders: number };
  }> = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      _count: {
        select: { orders: true }
      }
    }
  });

  // Count admins for safety checks
  const adminCount = users.filter(user => user.role === "ADMIN").length;

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-3xl font-semibold">Users</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage user accounts and permissions. At least one admin must remain.
        </p>
      </header>

      <CreateUserForm />

      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Orders</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b">
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.name || "—"}</td>
                  <td className="px-4 py-3">
                    <UserRoleForm 
                      userId={user.id} 
                      currentRole={user.role as "ADMIN" | "USER"}
                      disabled={user.role === "ADMIN" && adminCount === 1}
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    {user._count.orders > 0 ? (
                      <Link 
                        href={`/admin/orders?userId=${user.id}`}
                        className="text-amber-700 hover:underline"
                      >
                        {user._count.orders} orders
                      </Link>
                    ) : (
                      "No orders"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <form action={deleteUser.bind(null, user.id)}>
                      <Button 
                        type="submit"
                        variant="destructive"
                        size="sm"
                        disabled={user.role === "ADMIN" && adminCount === 1}
                      >
                        Delete
                      </Button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}