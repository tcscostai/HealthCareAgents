/** CSNP multi-agent pipeline configuration and reference data */

export const CSNP_AGENT_ORDER = [
  'diagnosis-validation',
  'eligibility',
  'plan-assignment',
  'enrollment',
  'benefits',
  'integration',
  'care-management',
  'claims',
  'provider-network',
  'compliance',
];

export const CSNP_PIPELINE_STAGES = [
  { key: 'diagnosis', label: 'Diagnosis', agentType: 'diagnosis-validation' },
  { key: 'eligibility', label: 'Eligibility', agentType: 'eligibility' },
  { key: 'plan', label: 'Plan Assignment', agentType: 'plan-assignment' },
  { key: 'enrollment', label: 'Enrollment', agentType: 'enrollment' },
  { key: 'benefits', label: 'Benefits', agentType: 'benefits' },
  { key: 'integration', label: 'Integration', agentType: 'integration' },
  { key: 'care', label: 'Care Mgmt', agentType: 'care-management' },
  { key: 'claims', label: 'Claims', agentType: 'claims' },
  { key: 'provider', label: 'Provider', agentType: 'provider-network' },
  { key: 'compliance', label: 'Compliance', agentType: 'compliance' },
];

export const AGENT_TO_STAGE = Object.fromEntries(
  CSNP_PIPELINE_STAGES.map((s) => [s.agentType, s.key])
);

export const getNextCsnpAgentType = (current) => {
  const i = CSNP_AGENT_ORDER.indexOf(current);
  return i >= 0 && i < CSNP_AGENT_ORDER.length - 1 ? CSNP_AGENT_ORDER[i + 1] : null;
};

export const CSNP_AGENT_META = {
  orchestrator: {
    title: 'CSNP Orchestrator Agent',
    subtitle: 'Supervisor — workflow, retries, state consistency',
    icon: 'supervisor',
  },
  'diagnosis-validation': {
    title: 'Diagnosis Validation Agent',
    subtitle: 'ICD-10 validation and chronic condition mapping',
    icon: 'factcheck',
  },
  eligibility: {
    title: 'Eligibility Agent',
    subtitle: 'ICD → condition → eligibility rule engine',
    icon: 'verified',
  },
  'plan-assignment': {
    title: 'Plan Assignment Agent',
    subtitle: 'CSNP plan selection with multi-condition priority',
    icon: 'assignment',
  },
  enrollment: {
    title: 'Enrollment Agent',
    subtitle: 'Activation, effective dates, retro eligibility',
    icon: 'how_to_reg',
  },
  benefits: {
    title: 'Benefits Agent',
    subtitle: 'Plan- and condition-specific benefit configuration',
    icon: 'card_giftcard',
  },
  integration: {
    title: 'Integration Agent',
    subtitle: 'Care management & external system connectivity',
    icon: 'hub',
  },
  'care-management': {
    title: 'Care Management Agent',
    subtitle: 'Care plans, managers, ADT & gap triggers',
    icon: 'medical_services',
  },
  claims: {
    title: 'Claims Agent',
    subtitle: 'CSNP adjudication, pricing, authorization',
    icon: 'receipt_long',
  },
  'provider-network': {
    title: 'Provider Network Agent',
    subtitle: 'Provider validation, referrals, PCP assignment',
    icon: 'local_hospital',
  },
  compliance: {
    title: 'Compliance Agent',
    subtitle: 'CMS rules, audit logs, regulatory reporting',
    icon: 'policy',
  },
};

export const getCsnpAgentLabel = (type) => CSNP_AGENT_META[type]?.title ?? type;

/** ICD-10 → chronic condition → eligible CSNP plan */
export const ICD_CHRONIC_MAP = {
  'E11.9': { condition: 'Diabetes Mellitus', planId: 'CSNP-DM-2026', priority: 2 },
  'E11.65': { condition: 'Diabetes Mellitus', planId: 'CSNP-DM-2026', priority: 2 },
  'I50.9': { condition: 'Chronic Heart Failure', planId: 'CSNP-CHF-2026', priority: 1 },
  I10: { condition: 'Hypertension', planId: 'CSNP-CVD-2026', priority: 4 },
  'J44.9': { condition: 'COPD', planId: 'CSNP-COPD-2026', priority: 3 },
  'N18.6': { condition: 'End Stage Renal Disease', planId: 'CSNP-ESRD-2026', priority: 1 },
  'F33.1': { condition: 'Major Depressive Disorder', planId: 'CSNP-BH-2026', priority: 3 },
};

export const CSNP_PLANS = {
  'CSNP-CHF-2026': {
    name: 'Summit CSNP — Chronic Heart Failure',
    copay: { pcp: 0, specialist: 25, er: 90 },
    deductible: 0,
    coverage: 'CHF model of care — cardiology CM',
  },
  'CSNP-DM-2026': {
    name: 'Summit CSNP — Diabetes',
    copay: { pcp: 0, specialist: 20, er: 90 },
    deductible: 0,
    coverage: 'DM supplies + MTM',
  },
  'CSNP-COPD-2026': {
    name: 'Summit CSNP — COPD',
    copay: { pcp: 0, specialist: 30, er: 90 },
    deductible: 0,
    coverage: 'Pulmonary rehab + spirometry',
  },
  'CSNP-ESRD-2026': {
    name: 'Summit CSNP — ESRD',
    copay: { pcp: 0, specialist: 0, er: 75 },
    deductible: 0,
    coverage: 'Dialysis coordination',
  },
  'CSNP-BH-2026': {
    name: 'Summit CSNP — Behavioral Health',
    copay: { pcp: 0, specialist: 15, er: 90 },
    deductible: 0,
    coverage: 'BH visits + care management',
  },
  'CSNP-CVD-2026': {
    name: 'Summit CSNP — Cardiovascular',
    copay: { pcp: 0, specialist: 25, er: 90 },
    deductible: 0,
    coverage: 'CVD prevention bundle',
  },
};

export const TEST_SCENARIOS = [
  {
    id: 'missing-diagnosis',
    name: 'Missing diagnosis → reject enrollment',
    memberId: 'M-NEW-001',
    icdCodes: [],
  },
  {
    id: 'multi-condition',
    name: 'Multiple chronic conditions → priority plan',
    memberId: 'M-10482',
    icdCodes: ['I50.9', 'E11.9'],
  },
  {
    id: 'retro-eligibility',
    name: 'Retro eligibility → backdated assignment',
    memberId: 'M-10891',
    icdCodes: ['J44.9'],
    retroDate: '2026-04-01',
  },
  {
    id: 'integration-failure',
    name: 'Integration failure → retry',
    memberId: 'M-10234',
    icdCodes: ['N18.6'],
    simulateIntegrationFailure: true,
  },
  {
    id: 'claims-denial',
    name: 'Claims denial → root cause validation',
    memberId: 'M-11102',
    icdCodes: ['F33.1', 'E11.65'],
    claimAmount: 450,
  },
  {
    id: 'care-trigger',
    name: 'Care trigger failure → alert & re-trigger',
    memberId: 'M-10482',
    icdCodes: ['I50.9'],
    simulateCareFailure: true,
  },
  {
    id: 'duplicate-member',
    name: 'Duplicate member → deduplication',
    memberId: 'M-10482',
    icdCodes: ['E11.9'],
    duplicateMbi: '1EG4-TE5-MK72',
  },
];

/** Event published to bus when each agent completes successfully */
export const AGENT_PUBLISH_EVENTS = {
  'diagnosis-validation': { success: 'csnp.diagnosis.validated', fail: 'csnp.diagnosis.rejected' },
  eligibility: { success: 'csnp.eligibility.determined', fail: 'csnp.enrollment.rejected' },
  'plan-assignment': { success: 'csnp.plan.assigned' },
  enrollment: { success: 'csnp.enrollment.activated', fail: 'csnp.enrollment.rejected' },
  benefits: { success: 'csnp.benefits.configured' },
  integration: { success: 'csnp.integration.sent', fail: 'csnp.integration.failed' },
  'care-management': { success: 'csnp.care.case_created', fail: 'csnp.care.trigger_failed' },
  claims: { success: 'csnp.claim.adjudicated', fail: 'csnp.claim.denied' },
  'provider-network': { success: 'csnp.provider.validated' },
  compliance: { success: 'csnp.compliance.passed', fail: 'csnp.workflow.failed' },
};

export const EVENT_TYPES = {
  DIAGNOSIS_VALIDATED: 'csnp.diagnosis.validated',
  DIAGNOSIS_REJECTED: 'csnp.diagnosis.rejected',
  ELIGIBILITY_DETERMINED: 'csnp.eligibility.determined',
  PLAN_ASSIGNED: 'csnp.plan.assigned',
  ENROLLMENT_ACTIVATED: 'csnp.enrollment.activated',
  ENROLLMENT_REJECTED: 'csnp.enrollment.rejected',
  BENEFITS_CONFIGURED: 'csnp.benefits.configured',
  INTEGRATION_SENT: 'csnp.integration.sent',
  INTEGRATION_FAILED: 'csnp.integration.failed',
  CARE_CASE_CREATED: 'csnp.care.case_created',
  CARE_TRIGGER_FAILED: 'csnp.care.trigger_failed',
  CLAIM_ADJUDICATED: 'csnp.claim.adjudicated',
  CLAIM_DENIED: 'csnp.claim.denied',
  PROVIDER_VALIDATED: 'csnp.provider.validated',
  COMPLIANCE_PASSED: 'csnp.compliance.passed',
  WORKFLOW_COMPLETED: 'csnp.workflow.completed',
  WORKFLOW_FAILED: 'csnp.workflow.failed',
};

/** Simulated real-time activity steps per agent (Agent console feed) */
export const AGENT_ACTIVITY_STEPS = {
  'diagnosis-validation': [
    { message: 'Spawning diagnosis validation worker…', duration: 420 },
    { message: 'Connecting to clinical & claims ICD-10 feed', duration: 520 },
    { message: 'Validating codes against CMS chronic condition taxonomy', duration: 680 },
    { message: 'Publishing event → csnp.diagnosis.validated', duration: 380 },
  ],
  eligibility: [
    { message: 'Loading eligibility rule engine (Drools)', duration: 450 },
    { message: 'Evaluating Medicare Part A/B via HETS interface', duration: 620 },
    { message: 'Applying CSNP chronic-condition eligibility rules', duration: 540 },
    { message: 'Publishing event → csnp.eligibility.determined', duration: 360 },
  ],
  'plan-assignment': [
    { message: 'Fetching plan catalog CSNP 2026', duration: 400 },
    { message: 'Resolving multi-condition priority matrix', duration: 580 },
    { message: 'Assigning plan benefit package & contract segment', duration: 500 },
    { message: 'Publishing event → csnp.plan.assigned', duration: 340 },
  ],
  enrollment: [
    { message: 'Opening enrollment transaction (ACID)', duration: 380 },
    { message: 'Calculating effective & retroactive dates', duration: 480 },
    { message: 'Activating member enrollment record', duration: 620 },
    { message: 'Publishing event → csnp.enrollment.activated', duration: 360 },
  ],
  benefits: [
    { message: 'Loading plan-specific benefit configuration', duration: 440 },
    { message: 'Applying copay, deductible & coverage riders', duration: 560 },
    { message: 'Syncing condition-specific supplemental benefits', duration: 480 },
    { message: 'Publishing event → csnp.benefits.configured', duration: 350 },
  ],
  integration: [
    { message: 'Handshaking care management REST endpoint', duration: 450 },
    { message: 'Transmitting HL7 ADT enrollment notification', duration: 640 },
    { message: 'Awaiting CM platform ACK…', duration: 720 },
    { message: 'Publishing event → csnp.integration.sent', duration: 380 },
  ],
  'care-management': [
    { message: 'Creating care management case shell', duration: 420 },
    { message: 'Auto-assigning care manager by condition cohort', duration: 550 },
    { message: 'Generating individualized care plan (ICP)', duration: 680 },
    { message: 'Registering ADT & care-gap trigger subscriptions', duration: 480 },
    { message: 'Publishing event → csnp.care.case_created', duration: 360 },
  ],
  claims: [
    { message: 'Loading CSNP adjudication rule set', duration: 430 },
    { message: 'Applying pricing, benefits & authorization logic', duration: 610 },
    { message: 'Running root-cause check on denial paths', duration: 520 },
    { message: 'Publishing event → csnp.claim.adjudicated', duration: 370 },
  ],
  'provider-network': [
    { message: 'Querying NPPES provider registry', duration: 480 },
    { message: 'Validating in-network PCP & referral rules', duration: 540 },
    { message: 'Publishing event → csnp.provider.validated', duration: 360 },
  ],
  compliance: [
    { message: 'Running CMS MOC & SNP compliance rule pack', duration: 520 },
    { message: 'Writing immutable audit log entry', duration: 450 },
    { message: 'Generating HPMS reporting snapshot', duration: 580 },
    { message: 'Publishing event → csnp.workflow.completed', duration: 400 },
  ],
};

export function createInitialWorkflow(member) {
  const icdCodes = (member.qualifyingConditions || []).map((c) => c.code);
  return {
    memberId: member.id,
    memberName: member.name,
    mbi: member.mbi,
    stage: 'diagnosis',
    status: 'Pending Diagnosis Validation',
    icdCodes,
    validatedCondition: null,
    rejectionReason: null,
    assignedPlanId: null,
    assignedPlanName: null,
    eligibilityResult: null,
    enrollment: null,
    benefits: null,
    integration: { status: 'pending', attempts: 0 },
    careCase: null,
    claim: null,
    provider: null,
    compliance: null,
    retroDate: null,
    events: [],
    lastAgent: null,
    completed: false,
    failed: false,
  };
}

export const INITIAL_WORKFLOWS = [
  {
    memberId: 'M-10482',
    memberName: 'Maria Rodriguez',
    mbi: '1EG4-TE5-MK72',
    stage: 'care',
    status: 'Care Management Active',
    icdCodes: ['I50.9', 'E11.9'],
    validatedCondition: 'Chronic Heart Failure',
    rejectionReason: null,
    assignedPlanId: 'CSNP-CHF-2026',
    assignedPlanName: 'Summit CSNP — Chronic Heart Failure',
    eligibilityResult: 'Eligible',
    enrollment: { status: 'Active', effectiveDate: '2024-01-01', retro: false },
    benefits: { configured: true, copayPcp: 0 },
    integration: { status: 'completed', attempts: 1, externalId: 'CM-8821' },
    careCase: { caseId: 'CASE-10482', manager: 'Lisa Tran', planId: 'ICP-2026-042' },
    claim: { lastStatus: 'Paid', amount: 120 },
    provider: { pcpValid: true, npi: '1234567890' },
    compliance: { cmsPass: true, auditId: 'AUD-2026-10482' },
    retroDate: null,
    events: [
      { type: EVENT_TYPES.DIAGNOSIS_VALIDATED, at: '2026-01-01T10:00:00Z' },
      { type: EVENT_TYPES.WORKFLOW_COMPLETED, at: '2026-01-02T14:00:00Z' },
    ],
    lastAgent: 'care-management',
    completed: true,
    failed: false,
  },
  {
    memberId: 'M-10891',
    memberName: 'James Chen',
    mbi: '3JH8-KR2-PL19',
    stage: 'eligibility',
    status: 'Eligibility Review',
    icdCodes: ['J44.9'],
    validatedCondition: 'COPD',
    rejectionReason: null,
    assignedPlanId: null,
    assignedPlanName: null,
    eligibilityResult: null,
    enrollment: null,
    benefits: null,
    integration: { status: 'pending', attempts: 0 },
    careCase: null,
    claim: null,
    provider: null,
    compliance: null,
    retroDate: null,
    events: [{ type: EVENT_TYPES.DIAGNOSIS_VALIDATED, at: '2026-05-28T09:00:00Z' }],
    lastAgent: 'diagnosis-validation',
    completed: false,
    failed: false,
  },
];
