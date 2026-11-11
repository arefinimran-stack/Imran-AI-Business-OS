export function formatBDT(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "−" : "";
  if (abs >= 10000000) return `${sign}৳${(abs / 10000000).toFixed(2)} crore`;
  if (abs >= 100000) return `${sign}৳${(abs / 100000).toFixed(2)} lakh`;
  return `${sign}৳${abs.toLocaleString("en-IN")}`;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function daysUntil(iso: string): number | null {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / 86400000);
}

export function relativeDay(iso: string): string {
  const n = daysUntil(iso);
  if (n === null) return "—";
  if (n === 0) return "Today";
  if (n === 1) return "Tomorrow";
  if (n < 0) return `${Math.abs(n)} day${Math.abs(n) === 1 ? "" : "s"} ago`;
  return `in ${n} day${n === 1 ? "" : "s"}`;
}
