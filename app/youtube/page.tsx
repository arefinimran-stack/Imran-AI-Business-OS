"use client";

import { useState } from "react";
import { useStore, newId } from "@/lib/store";
import { Card, SectionTitle, Badge, EmptyState, DeleteButton, Field, inputClass, buttonClass } from "@/components/ui";
import { formatDate } from "@/lib/format";
import type { Video, VideoStatus } from "@/lib/types";

const statuses: VideoStatus[] = ["idea", "scripting", "filming", "editing", "published"];

export default function YouTubePage() {
  const { data, dispatch } = useStore();
  const [form, setForm] = useState({ title: "", plannedDate: "", note: "" });

  const add = () => {
    if (!form.title.trim()) return;
    const item: Video = {
      id: newId(),
      createdAt: new Date().toISOString().slice(0, 10),
      title: form.title.trim(),
      status: "idea",
      plannedDate: form.plannedDate,
      note: form.note.trim(),
    };
    dispatch({ type: "addVideo", item });
    setForm({ title: "", plannedDate: "", note: "" });
  };

  return (
    <div>
      <SectionTitle>New video</SectionTitle>
      <Card>
        <div className="space-y-2">
          <Field label="Title">
            <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Video title" />
          </Field>
          <Field label="Target date">
            <input type="date" className={inputClass} value={form.plannedDate} onChange={(e) => setForm({ ...form, plannedDate: e.target.value })} />
          </Field>
          <button className={buttonClass} onClick={add} disabled={!form.title.trim()}>
            Add to pipeline
          </button>
        </div>
      </Card>

      <SectionTitle>Pipeline ({data.videos.length})</SectionTitle>
      <div className="space-y-2">
        {data.videos.length === 0 && <EmptyState text="No videos yet." />}
        {data.videos.map((v) => (
          <Card key={v.id}>
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium leading-tight">{v.title}</p>
              <DeleteButton onDelete={() => dispatch({ type: "removeVideo", id: v.id })} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge value={v.status} />
              {v.plannedDate && <span className="text-xs text-[var(--muted)]">🎯 {formatDate(v.plannedDate)}</span>}
            </div>
            {v.note && <p className="mt-1 text-xs text-[var(--muted)]">{v.note}</p>}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => dispatch({ type: "updateVideo", item: { ...v, status: s } })}
                  className={`rounded-lg px-2 py-1 text-[11px] capitalize ${
                    v.status === s ? "bg-[var(--accent)] text-white" : "bg-white/5 text-[var(--muted)]"
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
