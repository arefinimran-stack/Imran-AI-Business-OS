import { redirect } from "next/navigation";
import Dashboard from "@/components/dashboard";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  if (!configured) return <Dashboard />;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership, error: membershipError } = await supabase
    .from("organization_members")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (membershipError || !membership) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f6f8] px-4">
        <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-soft">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#183b35] text-sm font-bold text-white">IA</div>
          <h1 className="mt-5 text-xl font-semibold text-slate-950">Workspace access is not provisioned</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Your account is authenticated, but it has not yet been assigned to the IMRAN AI workspace. Ask the workspace owner to complete the one-time owner or team-member provisioning step.</p>
          <form action="/auth/signout" method="post"><button className="mt-6 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Sign out</button></form>
        </section>
      </main>
    );
  }

  const orgId = membership.organization_id;
  const [ventureResult, taskResult, contactResult, matterResult, activeResult] = await Promise.all([
    supabase.from("ventures").select("id,name,category,status").eq("organization_id", orgId).order("name"),
    supabase.from("tasks").select("id,title,status,priority,due_at").eq("organization_id", orgId).not("status", "in", '("done","cancelled")').order("due_at", { ascending: true, nullsFirst: false }).limit(5),
    supabase.from("contacts").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
    ["owner", "admin", "lawyer"].includes(membership.role)
      ? supabase.from("legal_matters").select("id", { count: "exact", head: true }).eq("organization_id", orgId).in("status", ["open", "pending", "on_hold"])
      : Promise.resolve({ count: null, error: null }),
    supabase.from("ventures").select("id", { count: "exact", head: true }).eq("organization_id", orgId).eq("status", "active"),
  ]);

  return (
    <Dashboard
      organizationId={orgId}
      role={membership.role}
      ventureRecords={ventureResult.data ?? []}
      taskRecords={taskResult.data ?? []}
      metrics={{
        contacts: contactResult.error ? null : contactResult.count,
        matters: matterResult.error ? null : matterResult.count,
        activeVentures: activeResult.error ? 0 : activeResult.count ?? 0,
      }}
    />
  );
}
