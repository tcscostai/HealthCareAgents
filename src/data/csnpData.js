export const CSNP_PLAN = {
  name: 'Summit Health CSNP 2026',
  contractId: 'H1234-001',
  serviceArea: 'TX, FL, AZ',
  modelOfCare: 'MOC v4.2 — Chronic Condition Focus',
};

export const CSNP_MEMBERS = [
  {
    id: 'M-10482',
    name: 'Maria Rodriguez',
    dob: '1958-03-14',
    age: 67,
    mbi: '1EG4-TE5-MK72',
    enrollmentStatus: 'Active',
    enrollmentDate: '2024-01-01',
    pcp: 'Dr. Anita Patel',
    qualifyingConditions: [
      { code: 'I50.9', description: 'Heart failure, unspecified', hcc: 'HCC 85', verified: true },
      { code: 'E11.9', description: 'Type 2 diabetes mellitus', hcc: 'HCC 19', verified: true },
    ],
    riskScore: 2.14,
    careGaps: [
      { measure: 'HbA1c Control', status: 'Open', dueDate: '2026-06-15', priority: 'High' },
      { measure: 'Controlling High BP', status: 'Open', dueDate: '2026-05-30', priority: 'Medium' },
      { measure: 'Statin Therapy — Diabetes', status: 'Closed', dueDate: '2026-01-10', priority: 'Low' },
    ],
    lastContact: '2026-04-22',
    outreachPriority: 'High',
    complianceFlags: [],
    careTeam: ['Care Manager — Lisa Tran', 'Pharmacist — Mark Wu'],
    openTasks: 3,
  },
  {
    id: 'M-10891',
    name: 'James Chen',
    dob: '1952-11-02',
    age: 73,
    mbi: '3JH8-KR2-PL19',
    enrollmentStatus: 'Pending Verification',
    enrollmentDate: '2026-05-01',
    pcp: 'Dr. Robert Kim',
    qualifyingConditions: [
      { code: 'J44.9', description: 'COPD, unspecified', hcc: 'HCC 111', verified: false },
    ],
    riskScore: 1.87,
    careGaps: [
      { measure: 'Spirometry — COPD', status: 'Open', dueDate: '2026-06-01', priority: 'High' },
      { measure: 'Bronchodilator Review', status: 'Open', dueDate: '2026-06-20', priority: 'Medium' },
    ],
    lastContact: '2026-05-18',
    outreachPriority: 'Critical',
    complianceFlags: ['Chronic condition attestation due'],
    careTeam: ['Care Manager — David Ortiz'],
    openTasks: 5,
  },
  {
    id: 'M-10234',
    name: 'Patricia Williams',
    dob: '1949-07-28',
    age: 76,
    mbi: '7WQ3-NM8-XD44',
    enrollmentStatus: 'Active',
    enrollmentDate: '2023-06-15',
    pcp: 'Dr. Sarah Mitchell',
    qualifyingConditions: [
      { code: 'N18.6', description: 'End stage renal disease', hcc: 'HCC 136', verified: true },
      { code: 'I10', description: 'Essential hypertension', hcc: 'HCC —', verified: true },
    ],
    riskScore: 2.41,
    careGaps: [],
    lastContact: '2026-05-25',
    outreachPriority: 'Routine',
    complianceFlags: [],
    careTeam: ['Care Manager — Lisa Tran', 'Nephrologist — Dr. James Holt', 'Social Worker — Amy Cho'],
    openTasks: 1,
  },
  {
    id: 'M-11102',
    name: 'William Foster',
    dob: '1960-12-09',
    age: 65,
    mbi: '9PL2-BC7-YT88',
    enrollmentStatus: 'Active',
    enrollmentDate: '2025-09-01',
    pcp: 'Dr. Anita Patel',
    qualifyingConditions: [
      { code: 'F33.1', description: 'Major depressive disorder, recurrent', hcc: 'HCC 58', verified: true },
      { code: 'E11.65', description: 'Type 2 DM with hyperglycemia', hcc: 'HCC 18', verified: true },
    ],
    riskScore: 1.95,
    careGaps: [
      { measure: 'Depression Remission — PHQ-9', status: 'Open', dueDate: '2026-07-01', priority: 'High' },
    ],
    lastContact: '2026-05-10',
    outreachPriority: 'Medium',
    complianceFlags: ['Annual MOC care plan review due'],
    careTeam: ['Care Manager — David Ortiz', 'BH Specialist — Jen Park'],
    openTasks: 2,
  },
];

export const OUTREACH_QUEUE = [
  {
    id: 'OUT-301',
    memberId: 'M-10891',
    memberName: 'James Chen',
    reason: 'Chronic condition verification — COPD attestation',
    channel: 'Phone',
    dueDate: '2026-05-31',
    status: 'Scheduled',
    script:
      'Confirm COPD diagnosis with PCP attestation; review recent spirometry or clinical notes per CMS CSNP requirements.',
  },
  {
    id: 'OUT-298',
    memberId: 'M-10482',
    memberName: 'Maria Rodriguez',
    reason: 'HbA1c care gap — lab reminder',
    channel: 'SMS + Portal',
    dueDate: '2026-05-30',
    status: 'In Progress',
    script:
      'Remind member of overdue HbA1c; offer lab scheduling at in-network facility; confirm medication adherence.',
  },
  {
    id: 'OUT-295',
    memberId: 'M-11102',
    memberName: 'William Foster',
    reason: 'PHQ-9 follow-up — depression measure',
    channel: 'Phone',
    dueDate: '2026-06-02',
    status: 'Pending',
    script:
      'Conduct PHQ-9 screening; coordinate BH visit if score elevated; document in care plan per STARS depression measure.',
  },
];

export const CARE_TASKS = [
  {
    id: 'TASK-8821',
    memberId: 'M-10482',
    memberName: 'Maria Rodriguez',
    title: 'Schedule PCP visit — BP control',
    assignee: 'Lisa Tran',
    dueDate: '2026-06-05',
    status: 'Open',
    category: 'Care Coordination',
  },
  {
    id: 'TASK-8819',
    memberId: 'M-10891',
    memberName: 'James Chen',
    title: 'Obtain PCP attestation for COPD',
    assignee: 'David Ortiz',
    dueDate: '2026-05-31',
    status: 'In Progress',
    category: 'Eligibility',
  },
  {
    id: 'TASK-8815',
    memberId: 'M-10234',
    memberName: 'Patricia Williams',
    title: 'Nephrology care plan annual review',
    assignee: 'Lisa Tran',
    dueDate: '2026-06-15',
    status: 'Open',
    category: 'Care Coordination',
  },
];

export const COMPLIANCE_ITEMS = [
  {
    id: 'CMP-01',
    requirement: 'Model of Care — annual submission',
    regulation: '42 CFR § 422.504(f)',
    status: 'Compliant',
    lastReview: '2026-03-15',
    nextDue: '2027-03-15',
  },
  {
    id: 'CMP-02',
    requirement: 'Chronic condition verification — new enrollments',
    regulation: 'CMS CSNP Guidance 2026',
    status: 'Action Required',
    lastReview: '2026-05-28',
    nextDue: '2026-06-15',
    detail: '2 members pending PCP attestation within 30-day window',
  },
  {
    id: 'CMP-03',
    requirement: 'Individualized care plan documentation',
    regulation: 'MOC § 4.3.2',
    status: 'Compliant',
    lastReview: '2026-05-20',
    nextDue: '2026-08-20',
  },
  {
    id: 'CMP-04',
    requirement: 'SNP care management — monthly reporting',
    regulation: 'CMS HPMS',
    status: 'On Track',
    lastReview: '2026-05-01',
    nextDue: '2026-06-01',
  },
];

export const ELIGIBILITY_CHECKS = [
  { step: 'Medicare entitlement (Part A & B)', field: 'medicare' },
  { step: 'Residence in plan service area', field: 'serviceArea' },
  { step: 'Chronic condition — clinical documentation', field: 'chronicCondition' },
  { step: 'PCP attestation on file', field: 'pcpAttestation' },
  { step: 'No ESRD (unless plan accepts ESRD SNP)', field: 'esrdRule' },
  { step: 'Enrollment period validation', field: 'enrollmentPeriod' },
];

export const AI_INSIGHTS = {
  portfolio: [
    '12 members require chronic condition re-verification before 6/15 CMS window.',
    'HbA1c gap closure rate improved 8% QoQ — prioritize SMS outreach for overdue labs.',
    'COPD cohort shows 3 pending spirometry gaps; recommend provider bulletin to PCP network.',
  ],
  member: {
    'M-10482':
      'Dual HCC conditions (CHF + DM) elevate readmission risk. Recommend MTM review and home BP monitoring enrollment.',
    'M-10891':
      'Enrollment at risk without COPD attestation by 6/15. Escalate to provider relations for same-day PCP outreach.',
    'M-10234': 'Stable ESRD member — maintain quarterly nephrology touchpoint; no open HEDIS gaps.',
    'M-11102':
      'PHQ-9 gap open 45 days — schedule BH warm handoff; document remission measure for STARS.',
  },
};
