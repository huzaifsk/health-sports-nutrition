import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { NavSidebar } from "@/components/nav-sidebar";
import { getSession } from "@/lib/session";

export default async function DashboardLayout({ children }: LayoutProps<"/">) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col border-r border-border">
        <div className="border-b border-border p-4">
          <span className="font-heading text-sm font-semibold tracking-tight">PeakProtein Admin</span>
        </div>
        <NavSidebar capabilities={session.capabilities} />
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border px-6">
          <div>
            <p className="text-sm font-medium">{session.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{session.roles.join(", ").replace(/_/g, " ")}</p>
          </div>
          <LogoutButton />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
