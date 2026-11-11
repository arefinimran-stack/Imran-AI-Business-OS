"use client";

import { useState } from "react";
import { useStore, newId } from "@/lib/store";
import { Card, SectionTitle, Badge, EmptyState, DeleteButton, Field, inputClass, buttonClass } from "@/components/ui";
import type { Track, TrackStatus } from "@/lib/types";

const statuses: TrackStatus[] = ["idea", "recording", "mixing", "released"];

export default function MusicPage() {
  const { data, dispatch } = useStore();
  const [form, setForm] = useState({ title: "", genre: "", note: "" });

  const add = () => {
    if (!form.title.trim()) return;
    const item: Track = {
      id: newId(),
      createdAt: new Date().toISOString().slice(0, 10),
      title: form.title.trim(),
      genre: form.genre.trim() || "Unsorted",
      status: "idea",
      note: form.note.trim(),
    };
    dispatch({ type: "addTrack", item });
    setForm({ title: "", genre: "", note: "" });
  };

  return (
    <div>
      <SectionTitle>New track</SectionTitle>
      <Card>
        <div className="space-y-2">
          <Field label="Title">
            <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Track title" />
          </Field>
          <Field label="Genre">
            <input className={inputClass} value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} placeholder="Lo-fi, classical…" />
          </Field>
          <button className={buttonClass} onClick={add} disabled={!form.title.trim()}>
            Add track
          </button>
        </div>
      </Card>

      <SectionTitle>Tracks ({data.tracks.length})</SectionTitle>
      <div className="space-y-2">
        {data.tracks.length === 0 && <EmptyState text="No tracks yet." />}
        {data.tracks.map((t) => (
          <Card key={t.id}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium leading-tight">🎵 {t.title}</p>
                <p className="text-xs text-[var(--muted)]">{t.genre}</p>
              </div>
              <DeleteButton onDelete={() => dispatch({ type: "removeTrack", id: t.id })} />
            </div>
            <div className="mt-2">
              <Badge value={t.status} />
            </div>
            {t.note && <p className="mt-1 text-xs text-[var(--muted)]">{t.note}</p>}
            <div className="mt-2 flex gap-1.5">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => dispatch({ type: "updateTrack", item: { ...t, status: s } })}
                  className={`rounded-lg px-2 py-1 text-[11px] capitalize ${
                    t.status === s ? "bg-[var(--accent)] text-white" : "bg-white/5 text-[var(--muted)]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
