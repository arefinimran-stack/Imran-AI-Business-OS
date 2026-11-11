import type { AppData } from "./types";

const today = new Date();
const iso = (offsetDays: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

const id = (n: number) => `seed-${n}`;

export function seedData(): AppData {
  return {
    contacts: [
      { id: id(1), createdAt: iso(-30), name: "Rahim Uddin", company: "Uddin Textiles Ltd", phone: "+880 1711 000001", email: "rahim@uddintex.com", status: "client", value: 250000, note: "Corporate retainer, quarterly billing." },
      { id: id(2), createdAt: iso(-12), name: "Nusrat Jahan", company: "Jahan Exports", phone: "+880 1811 000002", email: "nusrat@jahanex.com", status: "lead", value: 120000, note: "Needs proposal for import compliance." },
      { id: id(3), createdAt: iso(-6), name: "Tanvir Hasan", company: "Bold Cotton supplier", phone: "+880 1911 000003", email: "tanvir@supplier.bd", status: "active", value: 45000, note: "Cotton supply agreement renewal." },
    ],
    cases: [
      { id: id(4), createdAt: iso(-45), title: "Uddin Textiles vs. Customs Authority", client: "Rahim Uddin", court: "High Court Division", nextHearing: iso(3), status: "open", fee: 300000, feePaid: 150000, notes: "Challenge to duty assessment order." },
      { id: id(5), createdAt: iso(-20), title: "Jahan Exports incorporation filings", client: "Nusrat Jahan", court: "Registrar of Joint Stock", nextHearing: iso(10), status: "pending", fee: 80000, feePaid: 0, notes: "Awaiting client documents." },
    ],
    opportunities: [
      { id: id(6), createdAt: iso(-8), title: "Legal retainer — Jahan Exports", entity: "Arefin Legal & Corporate Group", value: 120000, stage: "negotiation", note: "Proposal sent, awaiting response." },
      { id: id(7), createdAt: iso(-15), title: "C3 Lifestyle Q3 drop", entity: "C3 Lifestyle", value: 350000, stage: "prospect", note: "Product line expansion." },
      { id: id(8), createdAt: iso(-60), title: "Bold Cotton wholesale contract", entity: "Bold Cotton", value: 500000, stage: "won", note: "Signed annual agreement." },
    ],
    videos: [
      { id: id(9), createdAt: iso(-5), title: "How to register a company in Bangladesh", status: "scripting", plannedDate: iso(14), note: "Flagship explainer for channel." },
      { id: id(10), createdAt: iso(-25), title: "Legal mistakes startups make", status: "published", plannedDate: iso(-25), note: "12k views, strong retention." },
    ],
    posts: [
      { id: id(11), createdAt: iso(-2), platform: "LinkedIn", content: "New article: corporate compliance checklist for SMEs.", scheduledDate: iso(1), status: "scheduled" },
      { id: id(12), createdAt: iso(-1), platform: "Facebook", content: "Bold Cotton — new collection teaser.", scheduledDate: iso(4), status: "draft" },
    ],
    projects: [
      { id: id(13), createdAt: iso(-9), name: "IA² Holdings brand identity", type: "Branding", status: "design", note: "Logo concepts in review." },
      { id: id(14), createdAt: iso(-18), name: "Chamber website redesign", type: "Web", status: "brief", note: "Collecting requirements." },
    ],
    tracks: [
      { id: id(15), createdAt: iso(-4), title: "Midnight Court", genre: "Lo-fi", status: "recording", note: "Background score for videos." },
    ],
    transactions: [
      { id: id(16), createdAt: iso(-30), label: "Legal retainer — Uddin Textiles", amount: 150000, category: "Legal fees", date: iso(-30), entity: "Arefin Legal & Corporate Group" },
      { id: id(17), createdAt: iso(-20), label: "Bold Cotton wholesale", amount: 500000, category: "Sales", date: iso(-20), entity: "Bold Cotton" },
      { id: id(18), createdAt: iso(-15), label: "Office rent", amount: -35000, category: "Operations", date: iso(-15), entity: "Independent" },
      { id: id(19), createdAt: iso(-10), label: "YouTube ad revenue", amount: 18500, category: "Media", date: iso(-10), entity: "Independent" },
      { id: id(20), createdAt: iso(-5), label: "Studio equipment", amount: -42000, category: "Investment", date: iso(-5), entity: "IA² Holdings" },
    ],
    tasks: [
      { id: id(21), createdAt: iso(-1), title: "Prepare hearing brief — Uddin Textiles", department: "Legal Chamber", due: iso(2), done: false },
      { id: id(22), createdAt: iso(-1), title: "Follow up with Nusrat Jahan", department: "CRM", due: iso(1), done: false },
      { id: id(23), createdAt: iso(-3), title: "Approve IA² logo concepts", department: "Creative Studio", due: iso(5), done: false },
      { id: id(24), createdAt: iso(-7), title: "Publish compliance article", department: "Social Media", due: iso(-1), done: true },
    ],
    workflows: [],
    runs: [],
    approvals: [],
    audit: [],
    settings: { lockEnabled: false, pin: "", onboarded: false, lastVisit: new Date().toISOString() },
  };
}
