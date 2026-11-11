"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, SectionTitle, Field, inputClass, buttonClass } from "@/components/ui";
import { DEPARTMENTS } from "@/lib/types";

export default function MorePage() {
  const { data, dispatch } = useStore();
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");

  const enableLock = () => {
    if (pin.length < 4) {
      setMessage("PIN must be at least 4 digits.");
      return;
    }
    dispatch({ type: "setLock", lockEnabled: true, pin });
    setPin("");
    setMessage("App lock enabled.");
  };

  const disableLock = () => {
    dispatch({ type: "setLock", lockEnabled: false, pin: "" });
    setMessage("App lock disabled.");
  };

  const resetData = () => {
    if (window.confirm("Reset all data back to the demo dataset? This cannot be undone.")) {
      dispatch({ type: "reset" });
      setMessage("Data reset to demo dataset.");
    }
  };

  return (
    <div>
      <SectionTitle>Departments</SectionTitle>
      <div className="space-y-2">
        {DEPARTMENTS.filter((d) => d.slug !== "/").map((d) => (
          <Link key={d.slug} href={d.slug}>
            <Card className="flex items-center gap-3 active:bg-[var(--surface2)]">
              <span className="text-2xl">{d.icon}</span>
              <span className="flex-1 text-sm font-medium">{d.name}</span>
              <span className="text-[var(--muted)]">›</span>
            </Card>
          </Link>
        ))}
      </div>

      <SectionTitle>Security</SectionTitle>
      <Card>
        {data.settings.lockEnabled ? (
          <div className="space-y-2">
            <p className="text-sm">App lock is <span className="text-emerald-400 font-medium">enabled</span>.</p>
            <button className={`${buttonClass} bg-rose-500/80`} onClick={disableLock}>
              Disable app lock
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Field label="Set a 4+ digit PIN">
              <input
                className={inputClass}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="PIN"
                inputMode="numeric"
                type="password"
              />
            </Field>
            <button className={buttonClass} onClick={enableLock}>
              Enable app lock
            </button>
          </div>
        )}
        {message && <p className="mt-2 text-xs text-[var(--muted)]">{message}</p>}
      </Card>

      <SectionTitle>Data</SectionTitle>
      <Card>
        <p className="text-xs leading-relaxed text-[var(--muted)]">
          All data is stored on this device. When you are ready, connect Supabase for secure cloud sync across devices — the data layer is structured for a drop-in swap.
        </p>
        <button className={`${buttonClass} mt-3 bg-white/10`} onClick={resetData}>
          Reset to demo data
        </button>
      </Card>

      <p className="mt-6 text-center text-[11px] text-[var(--muted)]">
        Imran AI Business OS · v0.1.0<br />
        Founder: Imran Arefin
      </p>
    </div>
  );
}
