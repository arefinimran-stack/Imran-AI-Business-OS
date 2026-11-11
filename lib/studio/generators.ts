export interface GraphicOptions {
  headline: string;
  sub?: string;
  org: string;
  tagline?: string;
}

function wrap(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > maxChars) {
      if (line) lines.push(line.trim());
      line = w;
    } else {
      line = (line + " " + w).trim();
    }
  }
  if (line) lines.push(line.trim());
  return lines.slice(0, 8);
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function generateSocialSVG(opts: GraphicOptions): string {
  const W = 1080;
  const H = 1350;
  const headlineLines = wrap(opts.headline.toUpperCase(), 20);
  const subLines = opts.sub ? wrap(opts.sub, 38) : [];
  const headlineSize = headlineLines.length > 4 ? 72 : 88;
  const startY = 200 + headlineLines.length * headlineSize * 0.5;

  const headlineEls = headlineLines
    .map(
      (l, i) =>
        `<text x="90" y="${210 + i * (headlineSize + 14)}" font-family="Georgia, 'Times New Roman', serif" font-size="${headlineSize}" font-weight="bold" fill="#f5f0e6">${esc(l)}</text>`
    )
    .join("\n    ");

  const subEls = subLines
    .map(
      (l, i) =>
        `<text x="90" y="${startY + 40 + i * 44}" font-family="Helvetica, Arial, sans-serif" font-size="38" fill="#c8d2e8">${esc(l)}</text>`
    )
    .join("\n    ");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0a1428"/>
      <stop offset="1" stop-color="#16294a"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#c9a227"/>
      <stop offset="1" stop-color="#e3c35a"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect x="90" y="120" width="120" height="8" fill="url(#gold)"/>
  ${headlineEls}
  ${subEls}
  <rect x="90" y="${H - 210}" width="900" height="2" fill="#c9a227" opacity="0.5"/>
  <text x="90" y="${H - 150}" font-family="Georgia, serif" font-size="40" font-weight="bold" fill="#e3c35a">${esc(opts.org)}</text>
  ${opts.tagline ? `<text x="90" y="${H - 100}" font-family="Helvetica, Arial, sans-serif" font-size="28" fill="#8c9ab5">${esc(opts.tagline)}</text>` : ""}
</svg>`;
}

function pdfEscape(s: string): string {
  return s
    .replace(/[^\x20-\x7E]/g, "-")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrapPlain(text: string, maxChars: number): string[] {
  const out: string[] = [];
  for (const raw of text.split("\n")) {
    if (raw.length <= maxChars) {
      out.push(raw);
      continue;
    }
    const words = raw.split(/\s+/);
    let line = "";
    for (const w of words) {
      if ((line + " " + w).trim().length > maxChars) {
        out.push(line.trim());
        line = w;
      } else {
        line = (line + " " + w).trim();
      }
    }
    if (line.trim()) out.push(line.trim());
  }
  return out;
}

export function generatePDF(title: string, body: string): Uint8Array {
  const pageW = 595;
  const pageH = 842;
  const margin = 56;
  const lineH = 16;
  const maxLines = Math.floor((pageH - 2 * margin - 40) / lineH);
  const all = wrapPlain(body, 88);
  const pages: string[][] = [];
  for (let i = 0; i < all.length; i += maxLines) pages.push(all.slice(i, i + maxLines));
  if (pages.length === 0) pages.push([""]);

  const contents = pages.map((lines) => {
    const bodyOps = lines.map((l, i) => `${i === 0 ? "" : "T* "}(${pdfEscape(l)}) Tj`).join("\n");
    return `BT /F1 16 Tf ${margin} ${pageH - margin} Td (${pdfEscape(title)}) Tj ET
BT /F1 11 Tf ${margin} ${pageH - margin - 34} Td ${lineH} TL
${bodyOps}
ET`;
  });

  const objects: string[] = [];
  const pageIds = pages.map((_, i) => 4 + i * 2);
  objects.push(`<< /Type /Catalog /Pages 2 0 R >>`);
  objects.push(`<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`);
  objects.push(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`);
  pages.forEach((_, i) => {
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Contents ${5 + i * 2} 0 R /Resources << /Font << /F1 3 0 R >> >> >>`
    );
    const stream = contents[i];
    objects.push(`<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`);
  });

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((obj, i) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xrefPos = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) pdf += `${off.toString().padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
  return new Uint8Array(Buffer.from(pdf, "latin1"));
}

export function generateDocHTML(title: string, body: string): string {
  const paras = body
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => (l.startsWith("# ") ? `<h1>${esc(l.slice(2))}</h1>` : l.startsWith("## ") ? `<h2>${esc(l.slice(3))}</h2>` : `<p>${esc(l)}</p>`))
    .join("\n");
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head><meta charset="utf-8"><title>${esc(title)}</title>
<style>body{font-family:Georgia,serif;color:#1a1a2e;margin:56px;line-height:1.6}h1{color:#0a1428;border-bottom:2px solid #c9a227;padding-bottom:8px}h2{color:#0a1428}</style>
</head><body><h1>${esc(title)}</h1>${paras}</body></html>`;
}

export function generateCSV(title: string, rows: string[][]): string {
  const cell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return [rows.map((r) => r.map(cell).join(",")).join("\n"), ""].join("\n");
}

export type TextKind = "script" | "article" | "proposal" | "legal-draft" | "linkedin-posts";

export function templateDraft(kind: TextKind, title: string, points: string, tone: string): string {
  const bullets = points
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);
  const bulletList = bullets.map((b) => `- ${b}`).join("\n");
  const numbered = bullets.map((b, i) => `${i + 1}. ${b}`).join("\n");

  switch (kind) {
    case "script":
      return `# ${title}\nTone: ${tone}\n\n## Cold open (0:00-0:15)\nHook: "${bullets[0] ?? title}" — state the problem your audience feels.\n\n## Main sections\n${numbered}\n\nFor each section: 1) claim, 2) practical example, 3) takeaway.\n\n## Close (final 30s)\nRecap the takeaways. Call to action: subscribe / book a consultation.\n\n---\nTemplate draft — connect an AI provider for a fully written script.`;
    case "article":
      return `# ${title}\nTone: ${tone}\n\n## Introduction\nFrame why ${title.toLowerCase()} matters now.\n\n## Key points\n${bulletList}\n\n## Analysis\nExpand each point with practice context and implications.\n\n## Conclusion\nSummarise and state the recommended action.\n\n---\nTemplate draft — connect an AI provider for full prose.`;
    case "proposal":
      return `# BUSINESS PROPOSAL\n## ${title}\nPrepared by: Arefin Legal & Corporate Group\nTone: ${tone}\n\n## 1. Executive summary\nState the objective and expected outcome in two sentences.\n\n## 2. Scope of work\n${bulletList}\n\n## 3. Deliverables and timeline\nDefine deliverables, milestones and dates.\n\n## 4. Commercial terms\nFees, payment schedule, validity.\n\n## 5. Acceptance\nSignature blocks for both parties.\n\n---\nTemplate draft — connect an AI provider for a tailored proposal.`;
    case "legal-draft":
      return `# DRAFT — ${title.toUpperCase()}\nStatus: TEMPLATE — requires review by a qualified advocate before use.\n\n## Parties\n1. ______________ (the "Client")\n2. ______________ (the "Service Provider")\n\n## Recitals\nWhereas the parties wish to record the terms of ${title.toLowerCase()}.\n\n## Clauses\n${numbered}\n\n## Governing law\nThis agreement shall be governed by the laws of Bangladesh.\n\n## Signatures\nClient: ______________  Date: ______\nService Provider: ______________  Date: ______\n\n---\nTemplate only. Never file or send without professional review and source verification.`;
    case "linkedin-posts":
      return bullets
        .map(
          (b, i) =>
            `## Post ${i + 1}\n${b}\n\nWhat this means for your business — and the one step to take today.\n\n#CorporateLaw #Business #Bangladesh`
        )
        .join("\n\n");
  }
}

export function promptFor(kind: TextKind, title: string, points: string, tone: string): string {
  const briefs: Record<TextKind, string> = {
    script: `Write a YouTube video script titled "${title}". Tone: ${tone}. Cover these points: ${points}. Include timestamps, a hook, and a call to action.`,
    article: `Write a professional article titled "${title}". Tone: ${tone}. Cover these points with practical depth: ${points}.`,
    proposal: `Write a business proposal for "${title}". Tone: ${tone}. Scope points: ${points}. Include executive summary, scope, deliverables, timeline, commercial terms.`,
    "legal-draft": `Draft a professional legal document skeleton for "${title}" under Bangladesh law. Tone: ${tone}. Include clauses covering: ${points}. Add a clear note that it requires review by a qualified advocate and must not be filed without verification.`,
    "linkedin-posts": `Write 5 LinkedIn posts about "${title}". Tone: ${tone}. Themes to cover: ${points}. Each post: hook, insight, call to action, 3 hashtags.`,
  };
  return briefs[kind];
}
