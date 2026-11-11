"use client";

import { useState } from "react";
import { useStore, newId } from "@/lib/store";
import { Card, SectionTitle, Badge, EmptyState, DeleteButton, Field, inputClass, buttonClass } from "@/components/ui";
import { formatDate } from "@/lib/format";
import type { Post, Platform, PostStatus } from "@/lib/types";

const platforms: Platform[] = ["YouTube", "Facebook", "LinkedIn", "Instagram", "X"];
const statuses: PostStatus[] = ["draft", "scheduled", "posted"];

export default function SocialPage() {
  const { data, dispatch } = useStore();
  const [form, setForm] = useState({ platform: "LinkedIn" as Platform, content: "", scheduledDate: "" });

  const add = () => {
    if (!form.content.trim()) return;
    const item: Post = {
      id: newId(),
      createdAt: new Date().toISOString().slice(0, 10),
      platform: form.platform,
      content: form.content.trim(),
      scheduledDate: form.scheduledDate,
      status: form.scheduledDate ? "scheduled" : "draft",
    };
    dispatch({ type: "addPost", item });
    setForm({ platform: form.platform, content: "", scheduledDate: "" });
  };

  return (
    <div>
      <SectionTitle>Compose post</SectionTitle>
      <Card>
        <div className="space-y-2">
          <Field label="Platform">
            <select className={inputClass} value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value as Platform })}>
              {platforms.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </Field>
          <Field label="Content">
            <textarea className={`${inputClass} min-h-20`} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Post text…" />
          </Field>
          <Field label="Schedule for">
            <input type="date" className={inputClass} value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} />
          </Field>
          <button className={buttonClass} onClick={add} disabled={!form.content.trim()}>
            Save post
          </button>
        </div>
      </Card>

      <SectionTitle>Content calendar ({data.posts.length})</SectionTitle>
      <div className="space-y-2">
        {data.posts.length === 0 && <EmptyState text="No posts yet." />}
        {data.posts.map((p) => (
          <Card key={p.id}>
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm leading-snug">{p.content}</p>
              <DeleteButton onDelete={() => dispatch({ type: "removePost", id: p.id })} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge value={p.status} />
              <span className="text-xs text-[var(--muted)]">{p.platform}</span>
              {p.scheduledDate && <span className="text-xs text-[var(--muted)]">📅 {formatDate(p.scheduledDate)}</span>}
            </div>
            <div className="mt-2 flex gap-1.5">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => dispatch({ type: "updatePost", item: { ...p, status: s } })}
                  className={`rounded-lg px-2 py-1 text-[11px] capitalize ${
                    p.status === s ? "bg-[var(--accent)] text-white" : "bg-white/5 text-[var(--muted)]"
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
