"use client";

import { useState } from "react";
import { useStore, newId } from "@/lib/store";
import { Card, SectionTitle, Field, inputClass, buttonClass, EmptyState, DeleteButton } from "@/components/ui";
import { askAI } from "@/lib/ai/client";
import {
  generateSocialSVG,
  generatePDF,
  generateDocHTML,
  generateCSV,
  templateDraft,
  promptFor,
  type TextKind,
} from "@/lib/studio/generators";
import { downloadFile, svgToPng } from "@/lib/studio/download";

type Tool = "text" | "graphic" | "pdf" | "doc" | "sheet";

const TOOLS: { id: Tool; name: string; icon: string; desc: string }[] = [
  { id: "text", name: "AI Writer", icon: "✍️", desc: "Scripts, articles, proposals, legal drafts, LinkedIn posts" },
  { id: "graphic", name: "Social Graphic", icon: "🖼️", desc: "Branded navy/gold post graphics (SVG + PNG)" },
  { id: "pdf", name: "PDF Document", icon: "📄", desc: "Generate a real PDF from title and body" },
  { id: "doc", name: "Word Document", icon: "📝", desc: "Word-compatible document (.doc)" },
  { id: "sheet", name: "Spreadsheet", icon: "📊", desc: "Excel-compatible CSV export" },
];

const TEXT_KINDS: { id: TextKind; label: string }[] = [
  { id: "script", label: "Video script" },
  { id: "article", label: "Article" },
  { id: "proposal", label: "Business proposal" },
  { id: "legal-draft", label: "Legal draft (template)" },
  { id: "linkedin-posts", label: "5 LinkedIn posts" },
];

export default function StudioPage() {
  const { data, dispatch } = useStore();
  const [tool, setTool] = useState<Tool>("text");

  const [text, setText] = useState<{ kind: TextKind; title: string; points: string; tone: string }>({
    kind: "script",
    title: "",
    points: "",
    tone: "authoritative, executive",
  });
  const [textResult, setTextResult] = useState<{ content: string; source: "ai" | "template" } | null>(null);
  const [busy, setBusy] = useState(false);

  const [graphic, setGraphic] = useState({ headline: "", sub: "", org: "Arefin Legal & Corporate Group", tagline: "Think. Create. Execute. Grow." });
  const [graphicSvg, setGraphicSvg] = useState("");

  const [doc, setDoc] = useState({ title: "", body: "" });

  const [sheet, setSheet] = useState({ title: "Sheet", rows: "Item,Amount\nConsulting,100000\nFiling,25000" });

  const genText = async () => {
    if (!text.title.trim()) return;
    setBusy(true);
    const result = await askAI([{ role: "user", content: promptFor(text.kind, text.title, text.points, text.tone) }], () =>
      templateDraft(text.kind, text.title, text.points, text.tone)
    );
    setTextResult({ content: result.content, source: result.source === "provider" ? "ai" : "template" });
    setBusy(false);
  };

  const saveCreation = (kind: "text" | "graphic" | "pdf" | "doc" | "sheet", title: string, format: string, content: string, source: "ai" | "template") => {
    dispatch({
      type: "addCreation",
      item: { id: newId(), kind, title, format, content, createdAt: new Date().toISOString(), source },
    });
    dispatch({
      type: "addAudit",
      item: { id: newId(), ts: new Date().toISOString(), actor: "Founder", action: "creation_saved", detail: `${kind}: ${title}` },
    });
  };

  const genGraphic = () => {
    if (!graphic.headline.trim()) return;
    setGraphicSvg(generateSocialSVG(graphic));
  };

  const mime: Record<string, string> = {
    svg: "image/svg+xml",
    pdf: "application/pdf",
    doc: "application/msword",
    csv: "text/csv",
    md: "text/markdown",
  };

  const saveTextResult = () => {
    if (!textResult) return;
    saveCreation("text", text.title, "md", textResult.content, textResult.source);
  };

  return (
    <div>
      <SectionTitle>Generators</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        {TOOLS.map((t) => (
          <button key={t.id} onClick={() => setTool(t.id)} className="text-left">
            <Card className={`h-full active:bg-[var(--surface2)] ${tool === t.id ? "border-[var(--accent)]/60" : ""}`}>
              <p className="text-xl">{t.icon}</p>
              <p className="mt-1 text-sm font-semibold leading-tight">{t.name}</p>
              <p className="mt-0.5 text-[10px] text-[var(--muted)] leading-snug">{t.desc}</p>
            </Card>
          </button>
        ))}
        <Card className="opacity-60">
          <p className="text-xl">🎬🎵</p>
          <p className="mt-1 text-sm font-semibold leading-tight">Video · Audio · Music</p>
          <p className="mt-0.5 text-[10px] text-[var(--muted)] leading-snug">Requires a connected AI generation provider — planned</p>
        </Card>
      </div>

      {tool === "text" && (
        <>
          <SectionTitle>AI Writer</SectionTitle>
          <Card>
            <div className="space-y-2">
              <Field label="Type">
                <select className={inputClass} value={text.kind} onChange={(e) => setText({ ...text, kind: e.target.value as TextKind })}>
                  {TEXT_KINDS.map((k) => (
                    <option key={k.id} value={k.id}>{k.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Title / subject">
                <input className={inputClass} value={text.title} onChange={(e) => setText({ ...text, title: e.target.value })} placeholder="e.g. Corporate compliance for SMEs" />
              </Field>
              <Field label="Key points (one per line)">
                <textarea className={`${inputClass} min-h-20`} value={text.points} onChange={(e) => setText({ ...text, points: e.target.value })} placeholder={"Point one\nPoint two"} />
              </Field>
              <Field label="Tone">
                <input className={inputClass} value={text.tone} onChange={(e) => setText({ ...text, tone: e.target.value })} />
              </Field>
              <button className={buttonClass} onClick={genText} disabled={busy || !text.title.trim()}>
                {busy ? "Generating…" : "Generate"}
              </button>
            </div>
          </Card>
          {textResult && (
            <Card className="mt-2">
              <p className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
                {textResult.source === "ai" ? "generated by AI provider" : "template draft — no AI provider connected"}
              </p>
              <pre className="mt-2 max-h-72 overflow-y-auto whitespace-pre-wrap text-xs leading-snug">{textResult.content}</pre>
              <div className="mt-2 flex gap-2">
                <button className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-[#0a1428]" onClick={saveTextResult}>
                  Save to library
                </button>
                <button
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium"
                  onClick={() => downloadFile(`${text.title.slice(0, 40) || "draft"}.md`, textResult.content, mime.md)}
                >
                  Download .md
                </button>
              </div>
            </Card>
          )}
        </>
      )}

      {tool === "graphic" && (
        <>
          <SectionTitle>Social Graphic</SectionTitle>
          <Card>
            <div className="space-y-2">
              <Field label="Headline">
                <input className={inputClass} value={graphic.headline} onChange={(e) => setGraphic({ ...graphic, headline: e.target.value })} placeholder="e.g. 5 compliance steps for 2025" />
              </Field>
              <Field label="Sub-line (optional)">
                <input className={inputClass} value={graphic.sub} onChange={(e) => setGraphic({ ...graphic, sub: e.target.value })} />
              </Field>
              <div className="flex gap-2">
                <Field label="Organisation">
                  <input className={inputClass} value={graphic.org} onChange={(e) => setGraphic({ ...graphic, org: e.target.value })} />
                </Field>
                <Field label="Tagline">
                  <input className={inputClass} value={graphic.tagline} onChange={(e) => setGraphic({ ...graphic, tagline: e.target.value })} />
                </Field>
              </div>
              <button className={buttonClass} onClick={genGraphic} disabled={!graphic.headline.trim()}>
                Generate graphic
              </button>
            </div>
          </Card>
          {graphicSvg && (
            <Card className="mt-2">
              <div className="overflow-hidden rounded-xl border border-[var(--border)]" dangerouslySetInnerHTML={{ __html: graphicSvg.replace('width="1080" height="1350"', 'width="100%" style="display:block"') }} />
              <div className="mt-2 flex flex-wrap gap-2">
                <button className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-[#0a1428]" onClick={() => saveCreation("graphic", graphic.headline, "svg", graphicSvg, "template")}>
                  Save to library
                </button>
                <button className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium" onClick={() => downloadFile("graphic.svg", graphicSvg, mime.svg)}>
                  SVG
                </button>
                <button
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium"
                  onClick={async () => {
                    const png = await svgToPng(graphicSvg);
                    if (png) downloadFile("graphic.png", png, "image/png");
                  }}
                >
                  PNG
                </button>
              </div>
            </Card>
          )}
        </>
      )}

      {(tool === "pdf" || tool === "doc") && (
        <>
          <SectionTitle>{tool === "pdf" ? "PDF Document" : "Word Document"}</SectionTitle>
          <Card>
            <div className="space-y-2">
              <Field label="Title">
                <input className={inputClass} value={doc.title} onChange={(e) => setDoc({ ...doc, title: e.target.value })} placeholder="Document title" />
              </Field>
              <Field label="Body (blank line = new paragraph, # = heading)">
                <textarea className={`${inputClass} min-h-32`} value={doc.body} onChange={(e) => setDoc({ ...doc, body: e.target.value })} />
              </Field>
              <div className="flex gap-2">
                <button
                  className={buttonClass}
                  disabled={!doc.title.trim()}
                  onClick={() => {
                    if (tool === "pdf") {
                      const bytes = generatePDF(doc.title, doc.body);
                      downloadFile(`${doc.title.slice(0, 40)}.pdf`, bytes, mime.pdf);
                      const b64 = btoa(String.fromCharCode(...bytes));
                      saveCreation("pdf", doc.title, "pdf", b64, "template");
                    } else {
                      const html = generateDocHTML(doc.title, doc.body);
                      downloadFile(`${doc.title.slice(0, 40)}.doc`, html, mime.doc);
                      saveCreation("doc", doc.title, "doc", html, "template");
                    }
                  }}
                >
                  {tool === "pdf" ? "Generate & download PDF" : "Generate & download .doc"}
                </button>
              </div>
              <p className="text-[10px] leading-snug text-[var(--muted)]">
                Note: the PDF engine uses a standard Latin font; non-Latin scripts (e.g. Bangla) are transliterated to dashes — use the Word export for full Unicode.
              </p>
            </div>
          </Card>
        </>
      )}

      {tool === "sheet" && (
        <>
          <SectionTitle>Spreadsheet (CSV)</SectionTitle>
          <Card>
            <div className="space-y-2">
              <Field label="Sheet name">
                <input className={inputClass} value={sheet.title} onChange={(e) => setSheet({ ...sheet, title: e.target.value })} />
              </Field>
              <Field label="Rows (comma-separated, first line = header)">
                <textarea className={`${inputClass} min-h-32 font-mono text-xs`} value={sheet.rows} onChange={(e) => setSheet({ ...sheet, rows: e.target.value })} />
              </Field>
              <button
                className={buttonClass}
                onClick={() => {
                  const rows = sheet.rows.split("\n").map((l) => l.split(","));
                  const csv = generateCSV(sheet.title, rows);
                  downloadFile(`${sheet.title.slice(0, 40) || "sheet"}.csv`, csv, mime.csv);
                  saveCreation("sheet", sheet.title, "csv", csv, "template");
                }}
              >
                Generate & download CSV
              </button>
            </div>
          </Card>
        </>
      )}

      <SectionTitle>Library ({data.creations.length})</SectionTitle>
      <div className="space-y-2">
        {data.creations.length === 0 && <EmptyState text="Nothing generated yet." />}
        {data.creations.map((c) => (
          <Card key={c.id}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{c.title}</p>
                <p className="text-[11px] text-[var(--muted)]">
                  {c.kind} · {c.format} · {c.source === "ai" ? "AI" : "template"} · {new Date(c.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  className="rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-medium"
                  onClick={() => {
                    if (c.format === "pdf") {
                      const bin = atob(c.content);
                      const bytes = new Uint8Array(bin.length);
                      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
                      downloadFile(`${c.title.slice(0, 40)}.pdf`, bytes, mime.pdf);
                      return;
                    }
                    downloadFile(`${c.title.slice(0, 40)}.${c.format}`, c.content, mime[c.format] ?? "text/plain");
                  }}
                >
                  Download
                </button>
                <DeleteButton onDelete={() => dispatch({ type: "removeCreation", id: c.id })} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
