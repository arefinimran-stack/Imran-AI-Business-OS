import LoginForm from "@/components/login-form";

export default function LoginPage() {
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f6f8] px-4 py-12">
      <div className="w-full max-w-[420px] rounded-3xl border border-slate-200 bg-white p-8 shadow-soft sm:p-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#183b35] text-sm font-bold text-white">IA</div>
          <div><div className="text-sm font-bold tracking-wide text-slate-900">IMRAN AI</div><div className="text-[10px] font-medium uppercase tracking-[.16em] text-slate-400">Founder workspace</div></div>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Welcome back.</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Sign in to access your private operating workspace.</p>
        {configured ? <LoginForm /> : <div className="mt-7 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-800">Authentication is not connected in this deployment yet. Add the Supabase project URL and publishable key to the encrypted environment settings to activate sign-in.</div>}
        <p className="mt-8 border-t border-slate-100 pt-5 text-center text-[10px] leading-5 text-slate-400">Private access · Role-controlled workspace · Secure session</p>
      </div>
    </main>
  );
}
