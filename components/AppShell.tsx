"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { inputClass, buttonClass } from "./ui";

const tabs = [
  { slug: "/", label: "Home", icon: "🏛️" },
  { slug: "/crm", label: "CRM", icon: "🤝" },
  { slug: "/legal", label: "Legal", icon: "⚖️" },
  { slug: "/finance", label: "Finance", icon: "💰" },
  { slug: "/more", label: "More", icon: "☰" },
];

const titles: Record<string, string> = {
  "/": "Executive Dashboard",
  "/legal": "Legal Chamber",
  "/crm": "CRM",
  "/business": "Business Development",
  "/youtube": "YouTube Studio",
  "/social": "Social Media Manager",
  "/creative": "Creative Studio",
  "/music": "Music Studio",
  "/finance": "Finance Manager",
  "/ai": "AI Control Centre",
  "/more": "All Departments",
};

function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const { data } = useStore();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const submit = (value: string) => {
    if (value === data.settings.pin) {
      onUnlock();
    } else {
      setError(true);
      setPin("");
      setTimeout(() => setError(false), 1200);
    }
  };

  const press = (digit: string) => {
    const next = pin + digit;
    setPin(next);
    if (next.length >= 4) submit(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg)] px-8">
      <p className="text-4xl">🏛️</p>
      <h1 className="mt-3 text-lg font-semibold">Imran AI Business OS</h1>
      <p className={`mt-6 text-sm ${error ? "text-rose-400" : "text-[var(--muted)]"}`}>
        {error ? "Incorrect PIN — try again" : "Enter PIN to unlock"}
      </p>
      <div className="mt-3 flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-3 w-3 rounded-full ${i < pin.length ? "bg-[var(--accent)]" : "bg-white/15"}`}
          />
        ))}
      </div>
      <div className="mt-8 grid grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map((k, i) =>
          k === "" ? (
            <span key={i} />
          ) : (
            <button
              key={i}
              onClick={() => (k === "⌫" ? setPin(pin.slice(0, -1)) : press(k))}
              className="h-16 w-16 rounded-2xl bg-[var(--surface)] text-xl font-medium active:bg-[var(--surface2)]"
            >
              {k}
            </button>
          )
        )}
      </div>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data, ready } = useStore();
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUnlocked(sessionStorage.getItem("app-unlocked") === "1");
    }
  }, []);

  useEffect(() => {
    if (unlocked) sessionStorage.setItem("app-unlocked", "1");
  }, [unlocked]);

  const title = titles[pathname] ?? "Imran AI Business OS";
  const locked = ready && data.settings.lockEnabled && data.settings.pin.length >= 4 && !unlocked;

  if (locked) return <LockScreen onUnlock={() => setUnlocked(true)} />;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <header className="sticky top-0 z-40 bg-[var(--bg)]/90 px-4 pt-[max(env(safe-area-inset-top),12px)] pb-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--accent)]">Imran AI</p>
            <h1 className="text-lg font-bold leading-tight">{title}</h1>
          </div>
          <Link href="/ai" className="rounded-full bg-[var(--surface)] border border-[var(--border)] px-3 py-1.5 text-lg" aria-label="AI Command Centre">
            🤖
          </Link>
        </div>
        <div className="gold-rule mt-2" />
      </header>
      <main className="flex-1 px-4 safe-bottom">{children}</main>
      <nav className="tabbar fixed bottom-0 left-0 right-0 z-40 mx-auto flex max-w-md justify-around border-t border-white/5 bg-[var(--surface)]/95 pt-2 backdrop-blur">
        {tabs.map((t) => {
          const active = pathname === t.slug;
          return (
            <Link
              key={t.slug}
              href={t.slug}
              className={`flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[10px] ${
                active ? "text-[var(--accent)] font-semibold" : "text-[var(--muted)]"
              }`}
            >
              <span className="text-lg leading-none">{t.icon}</span>
              {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
