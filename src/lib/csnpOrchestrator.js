import {
  CSNP_PLANS,
  EVENT_TYPES,
  ICD_CHRONIC_MAP,
  CSNP_PIPELINE_STAGES,
  getNextCsnpAgentType,
} from '../data/csnpAgentData';

function now() {
  return new Date().toISOString();
}

function appendEvent(workflow, type, payload = {}) {
  return {
    ...workflow,
    events: [
      ...workflow.events,
      { type, at: now(), payload, idempotencyKey: `${workflow.memberId}-${type}` },
    ],
  };
}

function mapIcd(codes) {
  return (codes || []).map((c) => ICD_CHRONIC_MAP[c]).filter(Boolean);
}

/** 1. Diagnosis Validation Agent */
export function runDiagnosisValidationAgent(workflow) {
  const codes = workflow.icdCodes || [];
  if (!codes.length) {
    return appendEvent(
      {
        ...workflow,
        stage: 'diagnosis',
        status: 'Rejected — No diagnosis',
        rejectionReason: 'Missing ICD-10 diagnosis — enrollment must be rejected',
        failed: true,
        lastAgent: 'diagnosis-validation',
      },
      EVENT_TYPES.DIAGNOSIS_REJECTED,
      { reason: 'MISSING_ICD' }
    );
  }
  const mapped = mapIcd(codes);
  if (!mapped.length) {
    return appendEvent(
      {
        ...workflow,
        stage: 'diagnosis',
        status: 'Rejected — Non-chronic ICD',
        rejectionReason: 'ICD code(s) do not map to an approved chronic condition',
        failed: true,
        lastAgent: 'diagnosis-validation',
      },
      EVENT_TYPES.DIAGNOSIS_REJECTED,
      { codes }
    );
  }
  const primary = [...mapped].sort((a, b) => a.priority - b.priority)[0];
  return appendEvent(
    {
      ...workflow,
      stage: 'eligibility',
      status: 'Diagnosis Validated',
      validatedCondition: primary.condition,
      rejectionReason: null,
      failed: false,
      lastAgent: 'diagnosis-validation',
    },
    EVENT_TYPES.DIAGNOSIS_VALIDATED,
    { condition: primary.condition }
  );
}

/** 2. Eligibility Agent */
export function runEligibilityAgent(workflow) {
  if (workflow.failed) return workflow;
  const mapped = mapIcd(workflow.icdCodes);
  if (!mapped.length) {
    return appendEvent(
      {
        ...workflow,
        eligibilityResult: 'Ineligible',
        status: 'Enrollment Rejected',
        rejectionReason: 'No qualifying chronic condition',
        failed: true,
        lastAgent: 'eligibility',
      },
      EVENT_TYPES.ENROLLMENT_REJECTED
    );
  }
  return appendEvent(
    {
      ...workflow,
      stage: 'plan',
      status: 'Eligible for CSNP',
      eligibilityResult: 'Eligible',
      lastAgent: 'eligibility',
    },
    EVENT_TYPES.ELIGIBILITY_DETERMINED
  );
}

/** 3. Plan Assignment Agent */
export function runPlanAssignmentAgent(workflow) {
  if (workflow.failed) return workflow;
  const mapped = mapIcd(workflow.icdCodes);
  const winner = [...mapped].sort((a, b) => a.priority - b.priority)[0];
  const plan = CSNP_PLANS[winner.planId];
  return appendEvent(
    {
      ...workflow,
      stage: 'enrollment',
      status: 'Plan Assigned',
      assignedPlanId: winner.planId,
      assignedPlanName: plan?.name ?? winner.planId,
      lastAgent: 'plan-assignment',
    },
    EVENT_TYPES.PLAN_ASSIGNED,
    { planId: winner.planId }
  );
}

/** 4. Enrollment Agent */
export function runEnrollmentAgent(workflow) {
  if (workflow.failed) return workflow;
  const effectiveDate = workflow.retroDate || new Date().toISOString().slice(0, 10);
  return appendEvent(
    {
      ...workflow,
      stage: 'benefits',
      status: 'Enrolled',
      enrollment: { status: 'Active', effectiveDate, retro: Boolean(workflow.retroDate) },
      lastAgent: 'enrollment',
    },
    EVENT_TYPES.ENROLLMENT_ACTIVATED,
    { effectiveDate }
  );
}

/** 5. Benefits Agent */
export function runBenefitsAgent(workflow) {
  if (workflow.failed) return workflow;
  const plan = CSNP_PLANS[workflow.assignedPlanId] || {};
  return appendEvent(
    {
      ...workflow,
      stage: 'integration',
      status: 'Benefits Configured',
      benefits: {
        configured: true,
        planId: workflow.assignedPlanId,
        copay: plan.copay,
        deductible: plan.deductible,
        coverage: plan.coverage,
        condition: workflow.validatedCondition,
      },
      lastAgent: 'benefits',
    },
    EVENT_TYPES.BENEFITS_CONFIGURED
  );
}

/** 6. Integration Agent */
export function runIntegrationAgent(workflow, options = {}) {
  if (workflow.failed) return workflow;
  const attempts = (workflow.integration?.attempts || 0) + 1;
  if (options.simulateIntegrationFailure && attempts < 3) {
    return appendEvent(
      {
        ...workflow,
        integration: { status: 'failed', attempts, lastError: 'HL7 ADT timeout' },
        status: 'Integration Failed — Retrying',
        lastAgent: 'integration',
      },
      EVENT_TYPES.INTEGRATION_FAILED,
      { attempt: attempts }
    );
  }
  return appendEvent(
    {
      ...workflow,
      stage: 'care',
      status: 'Integrated with Care Management',
      integration: {
        status: 'completed',
        attempts,
        externalId: `CM-${workflow.memberId.replace(/\D/g, '')}`,
        channel: 'HL7 ADT + REST',
      },
      lastAgent: 'integration',
    },
    EVENT_TYPES.INTEGRATION_SENT
  );
}

/** 7. Care Management Agent */
export function runCareManagementAgent(workflow, options = {}) {
  if (workflow.failed) return workflow;
  if (options.simulateCareFailure) {
    return appendEvent(
      {
        ...workflow,
        status: 'Care Trigger Failed — Alert queued for re-trigger',
        lastAgent: 'care-management',
      },
      EVENT_TYPES.CARE_TRIGGER_FAILED
    );
  }
  return appendEvent(
    {
      ...workflow,
      stage: 'claims',
      status: 'Care Plan Active',
      careCase: {
        caseId: `CASE-${workflow.memberId.replace(/\D/g, '')}`,
        manager: 'Lisa Tran',
        planId: `ICP-${new Date().getFullYear()}-042`,
        triggers: ['Enrollment', 'ADT', 'Care gaps'],
      },
      lastAgent: 'care-management',
    },
    EVENT_TYPES.CARE_CASE_CREATED
  );
}

/** 8. Claims Agent */
export function runClaimsAgent(workflow, options = {}) {
  if (workflow.failed) return workflow;
  const amount = options.claimAmount ?? 200;
  if (!workflow.benefits?.configured) {
    return appendEvent(
      {
        ...workflow,
        claim: { status: 'Denied', amount, rootCause: 'Benefits not active at DOS' },
        status: 'Claim Denied',
        lastAgent: 'claims',
      },
      EVENT_TYPES.CLAIM_DENIED
    );
  }
  return appendEvent(
    {
      ...workflow,
      stage: 'provider',
      status: 'Claim Adjudicated — Paid',
      claim: { status: 'Paid', amount, csnpRulesApplied: true },
      lastAgent: 'claims',
    },
    EVENT_TYPES.CLAIM_ADJUDICATED
  );
}

/** 9. Provider Network Agent */
export function runProviderNetworkAgent(workflow) {
  if (workflow.failed) return workflow;
  return appendEvent(
    {
      ...workflow,
      stage: 'compliance',
      status: 'Provider Validated',
      provider: { pcpValid: true, npi: '1234567890', pcpAssigned: true },
      lastAgent: 'provider-network',
    },
    EVENT_TYPES.PROVIDER_VALIDATED
  );
}

/** 10. Compliance Agent */
export function runComplianceAgent(workflow) {
  if (workflow.failed) {
    return appendEvent(
      {
        ...workflow,
        stage: 'compliance',
        status: 'Audit — Enrollment rejected',
        compliance: { cmsPass: false, auditId: `AUD-${Date.now()}` },
        lastAgent: 'compliance',
      },
      EVENT_TYPES.WORKFLOW_FAILED
    );
  }
  let w = appendEvent(
    {
      ...workflow,
      stage: 'compliance',
      status: 'CMS Compliant — Lifecycle complete',
      compliance: {
        cmsPass: true,
        auditId: `AUD-${workflow.memberId}-${new Date().getFullYear()}`,
      },
      completed: true,
      lastAgent: 'compliance',
    },
    EVENT_TYPES.COMPLIANCE_PASSED
  );
  return appendEvent(w, EVENT_TYPES.WORKFLOW_COMPLETED);
}

const AGENT_RUNNERS = {
  'diagnosis-validation': (w, o) => runDiagnosisValidationAgent(w),
  eligibility: (w) => runEligibilityAgent(w),
  'plan-assignment': (w) => runPlanAssignmentAgent(w),
  enrollment: (w) => runEnrollmentAgent(w),
  benefits: (w) => runBenefitsAgent(w),
  integration: (w, o) => runIntegrationAgent(w, o),
  'care-management': (w, o) => runCareManagementAgent(w, o),
  claims: (w, o) => runClaimsAgent(w, o),
  'provider-network': (w) => runProviderNetworkAgent(w),
  compliance: (w) => runComplianceAgent(w),
};

export function runAgent(agentType, workflow, options = {}) {
  const fn = AGENT_RUNNERS[agentType];
  return fn ? fn(workflow, options) : workflow;
}

export function agentTypeForStage(stageKey) {
  return CSNP_PIPELINE_STAGES.find((s) => s.key === stageKey)?.agentType ?? 'diagnosis-validation';
}

/** Orchestrator — single step from current stage */
export function runOrchestratorStep(workflow, options = {}) {
  const agentType = agentTypeForStage(workflow.stage);
  let w = runAgent(agentType, workflow, options);
  if (w.failed && agentType !== 'compliance') {
    w = runComplianceAgent(w);
    return { workflow: w, halted: true };
  }
  if (w.completed) return { workflow: w, halted: true };
  const nextType = getNextCsnpAgentType(agentType);
  if (!nextType) return { workflow: w, halted: true };
  const nextStage = CSNP_PIPELINE_STAGES.find((s) => s.agentType === nextType)?.key;
  return { workflow: { ...w, stage: nextStage }, halted: false };
}

/** Orchestrator — full lifecycle (idempotent per memberId) */
export function runFullLifecycle(initialWorkflow, options = {}) {
  let w = { ...initialWorkflow, events: [...(initialWorkflow.events || [])] };
  for (let i = 0; i < 12; i++) {
    if (w.completed || (w.failed && w.lastAgent === 'compliance')) break;
    const agentType = agentTypeForStage(w.stage);
    w = runAgent(agentType, w, options);
    if (w.failed) {
      w = runComplianceAgent(w);
      break;
    }
    if (w.completed) break;
    const next = getNextCsnpAgentType(agentType);
    if (!next) break;
    const nextStage = CSNP_PIPELINE_STAGES.find((s) => s.agentType === next)?.key;
    w = { ...w, stage: nextStage };
  }
  return w;
}

export function applyTestScenario(scenario, baseWorkflow) {
  let w = {
    ...baseWorkflow,
    memberId: scenario.memberId || baseWorkflow.memberId,
    icdCodes: [...(scenario.icdCodes ?? baseWorkflow.icdCodes ?? [])],
    retroDate: scenario.retroDate ?? null,
    failed: false,
    rejectionReason: null,
    completed: false,
    stage: 'diagnosis',
    status: 'Lifecycle started',
    events: [],
  };
  if (scenario.id === 'duplicate-member') {
    w = appendEvent(w, 'csnp.member.duplicate_detected', { mbi: scenario.duplicateMbi });
    w.status = 'Deduplication — golden record M-10482';
  }
  return runFullLifecycle(w, {
    simulateIntegrationFailure: scenario.simulateIntegrationFailure,
    simulateCareFailure: scenario.simulateCareFailure,
    claimAmount: scenario.claimAmount,
  });
}
