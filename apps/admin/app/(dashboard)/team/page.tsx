import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { can, getSession } from "@/lib/session";
import { getTeam } from "@/lib/team";
import { InviteDialog } from "./invite-dialog";
import { RoleSelect } from "./role-select";

export const metadata = { title: "Team" };

export default async function TeamPage() {
  const session = await getSession();
  if (!can(session, "list_users")) redirect("/");

  const canManageRoles = can(session, "promote_users");
  const canInvite = can(session, "create_users");
  const { users, assignableRoles } = await getTeam();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Team</h1>
          <p className="text-sm text-muted-foreground">{users.length} staff accounts</p>
        </div>
        {canInvite && <InviteDialog assignableRoles={assignableRoles} />}
      </div>

      <div className="rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell>
                  {canManageRoles && u.id !== session?.id ? (
                    <RoleSelect userId={u.id} role={u.roles[0] ?? ""} assignableRoles={assignableRoles} />
                  ) : (
                    <Badge variant="secondary" className="capitalize">
                      {(assignableRoles[u.roles[0] ?? ""] ?? u.roles.join(", ")).toString()}
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
