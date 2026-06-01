export const NSA_IDR_AGENT_TYPES = [
  'idr-intake',
  'idr-validation',
  'nsa-compliance',
  'nsa-dispute-resolution',
  'idr-case-management',
];

export const PIPELINE_STAGES = [
  { key: 'intake', label: 'IDR Intake', agentType: 'idr-intake' },
  { key: 'validation', label: 'IDR Validation', agentType: 'idr-validation' },
  { key: 'compliance', label: 'NSA Compliance', agentType: 'nsa-compliance' },
  { key: 'dispute', label: 'Dispute Resolution', agentType: 'nsa-dispute-resolution' },
  { key: 'case', label: 'Case Management', agentType: 'idr-case-management' },
];

/** Ordered flow — each agent hands off to the next */
export const NSA_IDR_AGENT_ORDER = PIPELINE_STAGES.map((s) => s.agentType);

/** High-priority disputes pinned to the top of every agent work queue. */
export const PRIORITY_WORK_QUEUE_CASE_IDS = ['IDR-2026-0061', 'IDR-2026-0031'];

export function disputeToIntakeForm(dispute) {
  if (!dispute) return { ...INTAKE_FORM_DEFAULTS };
  return {
    providerName: dispute.provider || '',
    npi: dispute.npi || '',
    tin: dispute.tin || '',
    memberId: dispute.memberId || '',
    serviceDate: dispute.serviceDate || '',
    placeOfService: dispute.placeOfService || INTAKE_FORM_DEFAULTS.placeOfService,
    disputeType: dispute.disputeType || '',
    billedAmount: dispute.billedAmount != null ? String(dispute.billedAmount) : '',
    planOffer: dispute.planOffer != null ? String(dispute.planOffer) : '',
    providerOffer: dispute.providerOffer != null ? String(dispute.providerOffer) : '',
  };
}

const INTAKE_DOC_NAMES = [
  'IDR Initiation Request',
  'EOB / Claim Remittance',
  'Provider Open Negotiation Notice',
  'QPA Documentation',
];

export function documentsToIntakeDocs(documents = []) {
  const out = {};
  INTAKE_DOC_NAMES.forEach((name) => {
    const found = documents.find((d) => d.name === name);
    out[name] = Boolean(found?.received);
  });
  return out;
}

export function sortDisputesWithPriorityFirst(disputes) {
  const pinned = PRIORITY_WORK_QUEUE_CASE_IDS.map((id) => disputes.find((d) => d.id === id)).filter(
    Boolean
  );
  const rest = disputes.filter((d) => !PRIORITY_WORK_QUEUE_CASE_IDS.includes(d.id));
  return [...pinned, ...rest];
}

export const STAGE_TO_AGENT = Object.fromEntries(
  PIPELINE_STAGES.map((s) => [s.key, s.agentType])
);

export const AGENT_TO_STAGE = Object.fromEntries(
  PIPELINE_STAGES.map((s) => [s.agentType, s.key])
);

export const getNextAgentType = (currentAgentType) => {
  const i = NSA_IDR_AGENT_ORDER.indexOf(currentAgentType);
  return i >= 0 && i < NSA_IDR_AGENT_ORDER.length - 1 ? NSA_IDR_AGENT_ORDER[i + 1] : null;
};

/** Compact on-screen outcomes (marketplace cards + workspace panel). */
export const AGENT_META = {
  'idr-intake': {
    title: 'IDR Intake Agent',
    subtitle: 'Process provider dispute submissions and documentation',
    icon: 'storage',
    userOutcomes: {
      tagline: 'Index docs · route case · assign ID',
      signals: [
        { label: 'Doc ✓', tone: 'success' },
        { label: 'Pending Validation', tone: 'info' },
        { label: '→ Validation', tone: 'default' },
      ],
      success: 'Routed',
      blocked: 'Missing docs',
    },
  },
  'idr-validation': {
    title: 'IDR Validation Agent',
    subtitle: 'Validate IDR requests and required evidence packages',
    icon: 'factcheck',
    userOutcomes: {
      tagline: 'Score evidence · approve or reject',
      signals: [
        { label: 'N% complete', tone: 'info' },
        { label: '≥80% gate', tone: 'warn' },
        { label: '→ Compliance', tone: 'default' },
      ],
      success: 'Approved',
      blocked: 'Below 80%',
    },
  },
  'nsa-compliance': {
    title: 'NSA Compliance Agent',
    subtitle: 'Determine NSA applicability and compliance requirements',
    icon: 'policy',
    userOutcomes: {
      tagline: 'Run R1–R6 · Compliant or review',
      signals: [
        { label: 'Pass / Fail', tone: 'success' },
        { label: 'Compliant', tone: 'success' },
        { label: '→ Dispute', tone: 'default' },
      ],
      success: 'Ready for IDR',
      blocked: 'Exceptions',
    },
  },
  'nsa-dispute-resolution': {
    title: 'NSA Dispute Resolution Agent',
    subtitle: 'Independent Dispute Resolution and arbitration support',
    icon: 'gavel',
    userOutcomes: {
      tagline: 'Settle in negotiation or file IDR',
      signals: [
        { label: 'Avoid arbitration', tone: 'success' },
        { label: 'Negotiation log', tone: 'info' },
        { label: '→ Case mgmt', tone: 'default' },
      ],
      success: 'Settled or IDR filed',
      blocked: 'Missing amount',
    },
  },
  'idr-case-management': {
    title: 'IDR Case Management Agent',
    subtitle: 'End-to-end dispute lifecycle tracking and reporting',
    icon: 'hub',
    userOutcomes: {
      tagline: 'Timeline · alerts · close case',
      signals: [
        { label: 'Full audit trail', tone: 'info' },
        { label: 'Alerts sent', tone: 'default' },
        { label: 'Resolved', tone: 'success' },
      ],
      success: 'Case closed',
      blocked: 'Empty alert',
    },
  },
};

export const getAgentLabel = (agentType) => AGENT_META[agentType]?.title ?? agentType;

export const INITIAL_DISPUTES = [
  {
    id: 'IDR-2026-0042',
    provider: 'Metro Anesthesia Partners',
    npi: '1234567890',
    tin: '98-7654321',
    memberId: 'MBR-882104',
    serviceDate: '2026-03-15',
    placeOfService: 'Hospital — Outpatient',
    cptCodes: ['00840', '99100'],
    billedAmount: 12400,
    planOffer: 3200,
    providerOffer: 9800,
    qpa: 3100,
    disputeType: 'Out-of-network surprise bill — anesthesia',
    stage: 'compliance',
    status: 'Compliance Review',
    federalIdrEligible: true,
    intakeDate: '2026-05-10',
    assignedTo: 'Jordan Lee',
    documents: [
      { name: 'IDR Initiation Request', required: true, received: true },
      { name: 'EOB / Claim Remittance', required: true, received: true },
      { name: 'Provider Open Negotiation Notice', required: true, received: true },
      { name: 'QPA Documentation', required: true, received: true },
      { name: 'Clinical Records (if applicable)', required: false, received: false },
    ],
    compliance: null,
    validationScore: 92,
    validationStatus: 'Approved',
    negotiationDays: 32,
    timeline: [
      { date: '2026-05-10', event: 'IDR intake received', actor: 'System' },
      { date: '2026-05-11', event: 'Validation approved — 92% completeness', actor: 'IDR Validation Agent' },
      { date: '2026-05-12', event: 'Routed to NSA compliance review', actor: 'System' },
    ],
  },
  {
    id: 'IDR-2026-0048',
    provider: 'Summit Emergency Physicians',
    npi: '1987654321',
    tin: '12-3456789',
    memberId: 'MBR-771902',
    serviceDate: '2026-04-02',
    placeOfService: 'Emergency Department',
    cptCodes: ['99285', '93010'],
    billedAmount: 8900,
    planOffer: 2100,
    providerOffer: 7200,
    qpa: 2050,
    disputeType: 'Emergency services — OON facility',
    stage: 'validation',
    status: 'Pending Validation',
    federalIdrEligible: true,
    intakeDate: '2026-05-22',
    assignedTo: 'Aisha Khan',
    documents: [
      { name: 'IDR Initiation Request', required: true, received: true },
      { name: 'EOB / Claim Remittance', required: true, received: true },
      { name: 'Provider Open Negotiation Notice', required: true, received: false },
      { name: 'QPA Documentation', required: true, received: true },
      { name: 'Clinical Records (if applicable)', required: false, received: true },
    ],
    compliance: null,
    validationScore: 68,
    validationStatus: 'Incomplete',
    negotiationDays: 28,
    timeline: [
      { date: '2026-05-22', event: 'IDR intake received', actor: 'System' },
      { date: '2026-05-23', event: 'Validation in progress — missing open negotiation notice', actor: 'IDR Validation Agent' },
    ],
  },
  {
    id: 'IDR-2026-0031',
    provider: 'Coastal Imaging Center',
    npi: '1122334455',
    tin: '55-4433221',
    memberId: 'MBR-554301',
    serviceDate: '2026-01-20',
    placeOfService: 'Independent Diagnostic Testing Facility',
    cptCodes: ['70553'],
    billedAmount: 4200,
    planOffer: 980,
    providerOffer: 3500,
    qpa: 950,
    disputeType: 'Imaging — non-emergency OON',
    stage: 'dispute',
    status: 'Federal IDR — Arbitration',
    federalIdrEligible: true,
    intakeDate: '2026-03-05',
    assignedTo: 'Marcus Webb',
    documents: [
      { name: 'IDR Initiation Request', required: true, received: true },
      { name: 'EOB / Claim Remittance', required: true, received: true },
      { name: 'Provider Open Negotiation Notice', required: true, received: true },
      { name: 'QPA Documentation', required: true, received: true },
      { name: 'Clinical Records (if applicable)', required: false, received: true },
    ],
    compliance: { applicable: true, memberProtected: true, qpaCompliant: true },
    validationScore: 100,
    validationStatus: 'Approved',
    negotiationDays: 35,
    arbitrationSubmitted: '2026-05-18',
    timeline: [
      { date: '2026-03-05', event: 'IDR intake received', actor: 'System' },
      { date: '2026-03-06', event: 'Validation approved', actor: 'IDR Validation Agent' },
      { date: '2026-03-08', event: 'NSA compliance — applicable, member cost-sharing capped', actor: 'NSA Compliance Agent' },
      { date: '2026-04-10', event: 'Open negotiation period closed — IDR initiated', actor: 'NSA Dispute Resolution Agent' },
      { date: '2026-05-18', event: 'Submitted to federal IDR entity', actor: 'NSA Dispute Resolution Agent' },
    ],
  },
  {
    id: 'IDR-2026-0061',
    provider: 'Lakeside Radiology Group',
    npi: '1445566778',
    tin: '88-9900112',
    memberId: 'MBR-662401',
    serviceDate: '2026-02-14',
    placeOfService: 'Independent Diagnostic Testing Facility',
    cptCodes: ['74177'],
    billedAmount: 5100,
    planOffer: 1400,
    providerOffer: 3800,
    qpa: 1350,
    disputeType: 'Imaging — non-emergency OON',
    stage: 'dispute',
    status: 'Ready for Dispute Resolution',
    federalIdrEligible: true,
    intakeDate: '2026-04-20',
    assignedTo: 'Priya Nair',
    documents: [
      { name: 'IDR Initiation Request', required: true, received: true },
      { name: 'EOB / Claim Remittance', required: true, received: true },
      { name: 'Provider Open Negotiation Notice', required: true, received: true },
      { name: 'QPA Documentation', required: true, received: true },
      { name: 'Clinical Records (if applicable)', required: false, received: true },
    ],
    compliance: {
      applicable: true,
      memberProtected: true,
      qpaCompliant: true,
      overall: 'Compliant',
    },
    validationScore: 100,
    validationStatus: 'Approved',
    negotiationDays: 32,
    timeline: [
      { date: '2026-04-20', event: 'IDR intake received', actor: 'System' },
      { date: '2026-04-22', event: 'Validation approved — 100% completeness', actor: 'IDR Validation Agent' },
      { date: '2026-04-25', event: 'NSA compliance analysis — Compliant', actor: 'NSA Compliance Agent' },
      { date: '2026-05-28', event: 'Routed to dispute resolution — open negotiation in progress', actor: 'System' },
    ],
  },
  {
    id: 'IDR-2026-0055',
    provider: 'Valley Surgical Associates',
    npi: '5566778899',
    tin: '77-1122334',
    memberId: 'MBR-339012',
    serviceDate: '2026-05-08',
    placeOfService: 'Ambulatory Surgical Center',
    cptCodes: ['47562', '00811'],
    billedAmount: 15600,
    planOffer: 4800,
    providerOffer: 13200,
    qpa: 4650,
    disputeType: 'Surgical — assistant surgeon OON',
    stage: 'intake',
    status: 'New Intake',
    federalIdrEligible: null,
    intakeDate: '2026-05-28',
    assignedTo: 'Unassigned',
    documents: [
      { name: 'IDR Initiation Request', required: true, received: true },
      { name: 'EOB / Claim Remittance', required: true, received: true },
      { name: 'Provider Open Negotiation Notice', required: true, received: true },
      { name: 'QPA Documentation', required: true, received: false },
      { name: 'Clinical Records (if applicable)', required: false, received: false },
    ],
    compliance: null,
    validationScore: null,
    validationStatus: 'Not Started',
    negotiationDays: 5,
    timeline: [{ date: '2026-05-28', event: 'New provider submission — pending intake review', actor: 'System' }],
  },
];

export const COMPLIANCE_RULES = [
  { id: 'R1', rule: 'Emergency services — patient cannot be balance billed beyond in-network cost sharing', result: null },
  { id: 'R2', rule: 'Non-emergency — advance notice and consent documented (where applicable)', result: null },
  { id: 'R3', rule: 'Qualifying payment amount (QPA) applied per interim final rule methodology', result: null },
  { id: 'R4', rule: 'Open negotiation period — minimum 30 days before IDR initiation', result: null },
  { id: 'R5', rule: 'Air ambulance — separate NSA provisions reviewed', result: null },
  { id: 'R6', rule: 'State surprise billing law — no less favorable than federal protection', result: null },
];

/** Shown when compliance analysis returns Review Required — operator resolution paths. */
export const COMPLIANCE_RESOLUTION_ACTIONS = [
  {
    id: 'extend-negotiation',
    label: 'Certify 30-day open negotiation',
    description: 'Document full 30-day negotiation period (fixes R4 when days < 30).',
    ruleIds: ['R4'],
    visible: (d) => (d.negotiationDays ?? 0) < 30,
  },
  {
    id: 'index-negotiation-notice',
    label: 'Index open negotiation notice',
    description: 'Mark Provider Open Negotiation Notice as received in the evidence package.',
    ruleIds: [],
    visible: (d) =>
      d.documents?.some(
        (doc) => doc.name.toLowerCase().includes('negotiation') && doc.required && !doc.received
      ),
  },
  {
    id: 'request-corrected-qpa',
    label: 'Request corrected QPA from plan',
    description: 'Trigger actuarial rework task; case stays in compliance until QPA package returned.',
    ruleIds: ['R3'],
    visible: () => true,
  },
  {
    id: 'return-validation',
    label: 'Return to validation queue',
    description: 'Send case back to IDR Validation when evidence is incomplete.',
    ruleIds: [],
    visible: (d) =>
      d.validationStatus === 'Incomplete' ||
      d.documents?.some((doc) => doc.required && !doc.received),
  },
  {
    id: 'supervisor-override',
    label: 'Supervisor override — proceed to dispute',
    description: 'Compliance officer attestation: documented exception; route to Dispute Resolution.',
    ruleIds: [],
    visible: () => true,
  },
];

export const REJECTION_REASONS = [
  'Missing open negotiation notice',
  'Incomplete QPA documentation',
  'Invalid federal IDR initiation form',
  'Service date outside eligible window',
  'Duplicate IDR submission',
  'Provider not party to dispute',
];

export const INTAKE_FORM_DEFAULTS = {
  providerName: '',
  npi: '',
  tin: '',
  memberId: '',
  serviceDate: '',
  placeOfService: 'Hospital — Outpatient',
  disputeType: '',
  billedAmount: '',
  planOffer: '',
  providerOffer: '',
};

const fmtUsd = (n) =>
  n == null || Number.isNaN(Number(n))
    ? '—'
    : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(n));

/** Agentic open-negotiation timeline for Dispute Resolution workspace. */
export function buildNegotiationIntel(dispute) {
  const days = Math.max(1, Number(dispute.negotiationDays) || 30);
  const counterDay = Math.min(days - 1, Math.max(2, Math.round(days * 0.52)));
  const planOffer = Number(dispute.planOffer) || 0;
  const providerOffer = Number(dispute.providerOffer) || 0;
  const qpa = Number(dispute.qpa) || 0;
  const offerSpreadPct =
    planOffer > 0 ? Math.round(((providerOffer - planOffer) / planOffer) * 100) : null;

  return {
    agent: 'NSA Dispute Resolution Agent',
    entries: [
      {
        day: 1,
        narrative: `Plan initial offer ${fmtUsd(planOffer)} sent to provider.`,
        intervention: 'Extracted plan offer from EOB, remittance, and open-negotiation notice (LLM + rules).',
        interventionType: 'extraction',
      },
      {
        day: counterDay,
        narrative: `Provider counter ${fmtUsd(providerOffer)}; plan maintained QPA-based offer ${fmtUsd(planOffer)}.`,
        intervention: 'Matched counter-offer to negotiation thread; validated against QPA methodology.',
        interventionType: 'analysis',
      },
      {
        day: days,
        narrative:
          days >= 30
            ? 'Negotiation closed. Federal IDR eligible.'
            : `Negotiation period ${days} days — IDR eligibility requires compliance review (30-day rule).`,
        intervention:
          days >= 30
            ? 'Confirmed 30-day open negotiation under NSA; IDR initiation criteria satisfied.'
            : 'Flagged short negotiation window — cross-check with Compliance Agent (R4).',
        interventionType: days >= 30 ? 'eligibility' : 'analysis',
      },
    ],
    insights: [
      offerSpreadPct != null
        ? `Provider counter ${offerSpreadPct}% above plan offer; gap analysis stored on case.`
        : null,
      qpa > 0 ? `QPA reference ${fmtUsd(qpa)} — plan offer within QPA-aligned band.` : null,
      dispute.disputeType ? `Dispute type: ${dispute.disputeType}.` : null,
      planOffer > 0 && providerOffer > 0 && (providerOffer - planOffer) / planOffer <= 2.5
        ? 'Agent recommendation: parties may settle in open negotiation — federal IDR can be avoided.'
        : null,
    ].filter(Boolean),
  };
}

export const PLACE_OF_SERVICE_OPTIONS = [
  'Emergency Department',
  'Hospital — Inpatient',
  'Hospital — Outpatient',
  'Ambulatory Surgical Center',
  'Independent Diagnostic Testing Facility',
  'Office',
];

export const DISPUTE_TYPE_OPTIONS = [
  'Out-of-network surprise bill — anesthesia',
  'Emergency services — OON facility',
  'Imaging — non-emergency OON',
  'Surgical — assistant surgeon OON',
  'Air ambulance',
  'Post-stabilization services',
];
