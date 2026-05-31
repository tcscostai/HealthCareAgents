export const NSA_IDR_AGENT_TYPES = [
  'nsa-compliance',
  'nsa-dispute-resolution',
  'idr-intake',
  'idr-validation',
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

export const AGENT_META = {
  'nsa-compliance': {
    title: 'NSA Compliance Agent',
    subtitle: 'Determine NSA applicability and compliance requirements',
    icon: 'policy',
  },
  'nsa-dispute-resolution': {
    title: 'NSA Dispute Resolution Agent',
    subtitle: 'Independent Dispute Resolution and arbitration support',
    icon: 'gavel',
  },
  'idr-intake': {
    title: 'IDR Intake Agent',
    subtitle: 'Process provider dispute submissions and documentation',
    icon: 'storage',
  },
  'idr-validation': {
    title: 'IDR Validation Agent',
    subtitle: 'Validate IDR requests and required evidence packages',
    icon: 'factcheck',
  },
  'idr-case-management': {
    title: 'IDR Case Management Agent',
    subtitle: 'End-to-end dispute lifecycle tracking and reporting',
    icon: 'hub',
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
