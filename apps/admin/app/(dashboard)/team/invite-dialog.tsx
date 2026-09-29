"use client";

import { UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { inviteAction } from "./actions";

export function InviteDialog({ assignableRoles }: { assignableRoles: Record<string, string> }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>(Object.keys(assignableRoles).find((r) => r !== "administrator") ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ tempPassword: string; email: string } | null>(null);

  async function handleInvite() {
    setSubmitting(true);
    try {
      const res = await inviteAction(email, name, role);
      setResult({ tempPassword: res.temp_password, email });
      toast.success("Staff account created.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to invite.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setName("");
      setEmail("");
      setResult(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button size="sm">
            <UserPlus />
            Invite Staff
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a staff member</DialogTitle>
        </DialogHeader>

        {result ? (
          <div className="flex flex-col gap-3 py-2">
            <p className="text-sm text-muted-foreground">
              Account created for <span className="font-medium text-foreground">{result.email}</span>. Share this
              temporary password with them out of band — it won&apos;t be shown again.
            </p>
            <code className="rounded-lg bg-muted px-3 py-2 text-sm">{result.tempPassword}</code>
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-name">Name</Label>
              <Input id="invite-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-email">Email</Label>
              <Input id="invite-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => v && setRole(v)}>
                <SelectTrigger>
                  <SelectValue>{assignableRoles[role] ?? role}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(assignableRoles)
                    .filter(([slug]) => slug !== "administrator")
                    .map(([slug, label]) => (
                      <SelectItem key={slug} value={slug}>
                        {label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DialogFooter>
          {result ? (
            <Button onClick={() => handleOpenChange(false)}>Done</Button>
          ) : (
            <Button onClick={handleInvite} disabled={submitting || !name || !email || !role}>
              {submitting ? "Creating…" : "Create Account"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
