/**
 * IMRAN AI operating model.
 *
 * Central Command coordinates the four business divisions and shared services.
 * This is configuration only: it does not create fabricated records, publish
 * content, contact clients, spend money, or change production data.
 */

export const DIVISIONS = [
  {
    id: 'legal-corporate',
    name: 'Arefin Legal & Corporate Group',
    priority: 1,
    executionStage: 'active-build',
    queueLabel: 'Active build',
    purpose: 'First commercial priority: legal practice, corporate advisory and client growth.',
    workstreams: [
      'Legal Research AI',
      'Legal Writing AI (advocate-reviewed drafts)',
      'Legal Operations AI',
      'CRM & Client Growth',
      'Legal Technology',
    ],
    modules: ['legal-matters', 'documents', 'contacts', 'business-development', 'content-studio'],
    safeguards: [
      'All legal outputs remain drafts until reviewed and approved by the Advocate.',
      'Confidential client and matter data stays inside restricted legal workflows.',
      'No client contact, filing, submission or legal advice is sent automatically.',
    ],
  },
  {
    id: 'ia2-holdings',
    name: 'IA² Holdings',
    priority: 2,
    executionStage: 'next',
    queueLabel: 'Next after Legal & Corporate',
    purpose: 'Investment intelligence, opportunity assessment and venture development.',
    workstreams: ['Research & Intelligence', 'Investment Analysis', 'Portfolio Oversight', 'Finance & Risk'],
    modules: ['projects', 'business-development', 'finance', 'documents'],
    safeguards: ['Investment decisions and commitments require founder approval.'],
  },
  {
    id: 'c3-lifestyle',
    name: 'C3 Lifestyle',
    priority: 3,
    executionStage: 'deferred',
    queueLabel: 'Deferred queue',
    purpose: 'Build and operate the consumer lifestyle business.',
    workstreams: ['Brand Strategy', 'Product & Operations', 'Marketing & Content', 'Sales & CRM'],
    modules: ['projects', 'content-studio', 'business-development', 'finance'],
    safeguards: ['Commercial claims, pricing and public campaigns require verification and approval.'],
  },
  {
    id: 'bold-cotton',
    name: 'Bold Cotton',
    priority: 3,
    executionStage: 'deferred',
    queueLabel: 'Deferred queue',
    purpose: 'Build and operate the apparel brand.',
    workstreams: ['Brand & Product', 'Sourcing & Operations', 'Creative & Campaigns', 'Sales & CRM'],
    modules: ['projects', 'content-studio', 'business-development', 'finance'],
    safeguards: ['Product claims, pricing, inventory and public campaigns require verification and approval.'],
  },
];

export const CENTRAL_FUNCTIONS = [
  { id: 'technology', name: 'Technology & Product Engineering', capabilities: ['Application development', 'Integrations', 'Infrastructure', 'QA'] },
  { id: 'research', name: 'Research & Intelligence', capabilities: ['Legal research', 'Market research', 'Competitor intelligence', 'Source verification'] },
  { id: 'creative-studio', name: 'Creative Studio', capabilities: ['Editorial planning', 'Writing', 'Scripts', 'Images & design', 'Video & voice'] },
  { id: 'crm-growth', name: 'CRM & Growth', capabilities: ['Lead capture', 'Pipeline management', 'Audience growth', 'Conversion tracking'] },
  { id: 'finance', name: 'Finance & Revenue', capabilities: ['Income and expense ledger', 'Cash-flow visibility', 'Revenue attribution', 'Budget controls'] },
  { id: 'business-intelligence', name: 'Business Intelligence', capabilities: ['Division KPIs', 'Content analytics', 'Lead analytics', 'Executive reporting'] },
  { id: 'security-operations', name: 'Security & Operations', capabilities: ['Access control', 'Audit trail', 'Data protection', 'Operational QA'] },
  { id: 'automation', name: 'Automation', capabilities: ['Workflow orchestration', 'Scheduled jobs', 'Notifications', 'Exception handling'] },
];

export const CONTENT_PIPELINE = [
  'Research',
  'Editorial brief',
  'Writing',
  'Script & creative',
  'Founder / Advocate review',
  'Approval',
  'Scheduling',
  'Publishing',
  'Analytics',
  'Lead attribution',
];

export const EXECUTION_GUARDRAILS = {
  approvalRequiredFor: [
    'production deployments and merges',
    'production database or security changes',
    'spending and paid subscriptions',
    'publishing or scheduling public content',
    'client contact or external commitments',
    'legal filings, submissions and final legal advice',
  ],
  evidenceRequired: [
    'task completion',
    'verified financial figures',
    'published content URLs',
    'lead and revenue attribution',
    'integration health',
  ],
  taskContractFields: [
    'stable task ID',
    'division',
    'workstream',
    'module',
    'accountable owner',
    'assigned executor',
    'tool',
    'deadline',
    'blocker',
    'dependency',
    'deliverable and acceptance criteria',
    'next action',
    'evidence',
    'verification status',
  ],
};
