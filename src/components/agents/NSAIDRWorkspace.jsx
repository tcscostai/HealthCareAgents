import { useCallback, useEffect, useMemo, useState } from 'react';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import BalanceIcon from '@mui/icons-material/Balance';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import GavelIcon from '@mui/icons-material/Gavel';
import HandshakeIcon from '@mui/icons-material/Handshake';
import HubIcon from '@mui/icons-material/Hub';
import PolicyIcon from '@mui/icons-material/Policy';
import BuildIcon from '@mui/icons-material/Build';
import RefreshIcon from '@mui/icons-material/Refresh';
import ReplayIcon from '@mui/icons-material/Replay';
import SendIcon from '@mui/icons-material/Send';
import UndoIcon from '@mui/icons-material/Undo';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import StorageIcon from '@mui/icons-material/Storage';
import TimelineIcon from '@mui/icons-material/Timeline';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import NSAAgentOutcomesPanel from './NSAAgentOutcomesPanel';
import NSANegotiationLogPanel from './NSANegotiationLogPanel';
import {
  AGENT_META,
  AGENT_TO_STAGE,
  COMPLIANCE_RESOLUTION_ACTIONS,
  COMPLIANCE_RULES,
  DEMO_STORY_CASE_IDS,
  DEMO_STORY_LABELS,
  DISPUTE_TYPE_OPTIONS,
  documentsToIntakeDocs,
  disputeToIntakeForm,
  getAgentLabel,
  getNextAgentType,
  INITIAL_DISPUTES,
  INTAKE_FORM_DEFAULTS,
  PIPELINE_STAGES,
  PLACE_OF_SERVICE_OPTIONS,
  REJECTION_REASONS,
  sortDisputesWithDemosFirst,
} from '../../data/nsaIdrData';

const compactTheme = createTheme({
  typography: {
    fontSize: 12,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    body1: { fontSize: '0.8125rem', lineHeight: 1.45 },
    body2: { fontSize: '0.75rem', lineHeight: 1.4 },
    caption: { fontSize: '0.6875rem', lineHeight: 1.35 },
    subtitle2: { fontSize: '0.75rem', lineHeight: 1.35 },
    subtitle1: { fontSize: '0.8125rem', lineHeight: 1.35 },
    h6: { fontSize: '0.875rem', lineHeight: 1.3 },
  },
  components: {
    MuiButton: {
      defaultProps: { size: 'small' },
      styleOverrides: { root: { fontSize: '0.75rem', padding: '4px 10px', minHeight: 30 } },
    },
    MuiTextField: { defaultProps: { size: 'small' } },
    MuiFormControl: { defaultProps: { size: 'small' } },
    MuiSelect: { defaultProps: { size: 'small' } },
    MuiChip: {
      defaultProps: { size: 'small' },
      styleOverrides: { label: { fontSize: '0.65rem' }, root: { height: 22 } },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { padding: '5px 8px', fontSize: '0.7rem' },
        head: { padding: '6px 8px', fontSize: '0.65rem', fontWeight: 600 },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { padding: '2px 8px', alignItems: 'center' },
        message: { padding: '4px 0', fontSize: '0.7rem' },
      },
    },
    MuiStepLabel: {
      styleOverrides: {
        label: { fontSize: '0.625rem !important' },
        iconContainer: { paddingRight: 4 },
      },
    },
    MuiStepIcon: {
      styleOverrides: { root: { width: 22, height: 22 }, text: { fontSize: '0.65rem' } },
    },
    MuiListItem: { styleOverrides: { root: { paddingTop: 2, paddingBottom: 2 } } },
    MuiListItemText: {
      styleOverrides: {
        primary: { fontSize: '0.75rem' },
        secondary: { fontSize: '0.65rem' },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiInputLabel: { styleOverrides: { root: { fontSize: '0.7rem' } } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { fontSize: '0.75rem' },
        input: { padding: '6px 10px' },
      },
    },
    MuiMenuItem: { styleOverrides: { root: { fontSize: '0.75rem', minHeight: 32, py: 0.5 } } },
    MuiFormControlLabel: {
      styleOverrides: {
        label: { fontSize: '0.7rem' },
        root: { marginLeft: -6, marginRight: 0 },
      },
    },
    MuiCheckbox: { styleOverrides: { root: { padding: 4 } } },
    MuiLinearProgress: { styleOverrides: { root: { borderRadius: 2 } } },
    MuiDivider: { styleOverrides: { root: { marginTop: 8, marginBottom: 8 } } },
  },
});

const HeaderBar = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 14px',
  flexShrink: 0,
  background: 'linear-gradient(135deg, #FF6482 0%, #FF375F 100%)',
  color: '#fff',
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(0.75, 1),
  borderRadius: 10,
  border: '1px solid rgba(0,0,0,0.06)',
}));

const DIALOG_PAPER_SX = {
  borderRadius: 3,
  overflow: 'hidden',
  height: '88vh',
  maxHeight: '88vh',
  display: 'flex',
  flexDirection: 'column',
  m: { xs: 1, sm: 2 },
  width: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 32px)' },
  maxWidth: '100%',
};

const AGENT_ICONS = {
  policy: PolicyIcon,
  gavel: GavelIcon,
  storage: StorageIcon,
  factcheck: FactCheckIcon,
  hub: HubIcon,
};

const AGENT_STAGE_MAP = {
  'idr-intake': 'intake',
  'idr-validation': 'validation',
  'nsa-compliance': 'compliance',
  'nsa-dispute-resolution': 'dispute',
  'idr-case-management': 'case',
};

const statusChipColor = (status) => {
  if (!status) return 'default';
  if (status.includes('New') || status.includes('Pending')) return 'warning';
  if (
    status.includes('Approved') ||
    status.includes('Resolved') ||
    status.includes('Compliant') ||
    status.includes('Settled')
  ) {
    return 'success';
  }
  if (status.includes('Incomplete') || status.includes('Rejected')) return 'error';
  if (status.includes('Arbitration') || status.includes('Review')) return 'info';
  return 'default';
};

const formatCurrency = (n) =>
  n == null || n === ''
    ? '—'
    : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(n));

function addTimeline(dispute, event, actor) {
  const date = new Date().toISOString().slice(0, 10);
  return {
    ...dispute,
    timeline: [...dispute.timeline, { date, event, actor }],
  };
}

function caseMatchesAgentStage(dispute, agentType) {
  const stage = AGENT_TO_STAGE[agentType];
  if (stage === 'case') {
    return (
      dispute.stage === 'case' ||
      dispute.status.includes('Arbitration') ||
      dispute.status.includes('Resolved') ||
      dispute.status.includes('decision recorded')
    );
  }
  if (stage === 'dispute') {
    return (
      dispute.stage === 'dispute' ||
      dispute.status.includes('Ready for Dispute') ||
      dispute.status.includes('Arbitration') ||
      dispute.status.includes('Settled in open negotiation')
    );
  }
  return dispute.stage === stage;
}

function buildWorkQueue(disputes, agentType) {
  const demos = DEMO_STORY_CASE_IDS.map((id) => disputes.find((d) => d.id === id)).filter(Boolean);
  const others = disputes.filter(
    (d) => !DEMO_STORY_CASE_IDS.includes(d.id) && caseMatchesAgentStage(d, agentType)
  );
  return [...demos, ...others];
}

export default function NSAIDRWorkspace({
  open,
  onClose,
  agentType = 'idr-intake',
  disputes: disputesProp,
  onDisputesChange,
}) {
  const meta = AGENT_META[agentType] || AGENT_META['idr-intake'];
  const HeaderIcon = AGENT_ICONS[meta.icon] || BalanceIcon;

  const [disputesInternal, setDisputesInternal] = useState(INITIAL_DISPUTES);
  const disputes = disputesProp ?? disputesInternal;
  const setDisputes = onDisputesChange ?? setDisputesInternal;

  const [selectedId, setSelectedId] = useState(
    disputes.find((d) => d.id === 'IDR-2026-0061')?.id ?? disputes[0]?.id ?? INITIAL_DISPUTES[0].id
  );
  const [snackbar, setSnackbar] = useState(null); // { message, severity: 'success' | 'error' | 'warning' }
  const [loading, setLoading] = useState(false);

  const [complianceResults, setComplianceResults] = useState(null);
  const [intakeStep, setIntakeStep] = useState(0);
  const [intakeForm, setIntakeForm] = useState(INTAKE_FORM_DEFAULTS);
  const [intakeDocs, setIntakeDocs] = useState({
    'IDR Initiation Request': false,
    'EOB / Claim Remittance': false,
    'Provider Open Negotiation Notice': false,
    'QPA Documentation': false,
  });
  const [rejectReason, setRejectReason] = useState(REJECTION_REASONS[0]);
  const [rejectNotes, setRejectNotes] = useState('');
  const [arbitrationOutcome, setArbitrationOutcome] = useState('');
  const [finalAmount, setFinalAmount] = useState('');
  const [settlementAmount, setSettlementAmount] = useState('');
  const [settlementBasis, setSettlementBasis] = useState('Mutual agreement — QPA-informed');
  const [alertMessage, setAlertMessage] = useState('');
  const [closeOutcome, setCloseOutcome] = useState('Provider prevails');

  const selected = useMemo(
    () => disputes.find((d) => d.id === selectedId) ?? disputes[0],
    [disputes, selectedId]
  );

  const activeStage = AGENT_STAGE_MAP[agentType] || 'intake';
  const activeStageIndex = PIPELINE_STAGES.findIndex((s) => s.key === activeStage);

  const portfolioStats = useMemo(
    () => ({
      open: disputes.filter((d) => !d.status.includes('Resolved')).length,
      intake: disputes.filter((d) => d.stage === 'intake').length,
      validation: disputes.filter((d) => d.stage === 'validation').length,
      arbitration: disputes.filter((d) => d.status.includes('Arbitration')).length,
    }),
    [disputes]
  );

  const validationScore = useMemo(() => {
    if (!selected?.documents) return 0;
    const required = selected.documents.filter((d) => d.required);
    const received = required.filter((d) => d.received);
    return Math.round((received.length / required.length) * 100);
  }, [selected]);

  useEffect(() => {
    setComplianceResults(selected.compliance);
    if (agentType === 'idr-intake' && selected) {
      setIntakeForm(disputeToIntakeForm(selected));
      setIntakeDocs(documentsToIntakeDocs(selected.documents));
      if (DEMO_STORY_CASE_IDS.includes(selected.id)) {
        setIntakeStep(0);
      }
    }
    if (agentType === 'nsa-dispute-resolution' && selected) {
      const plan = Number(selected.planOffer) || 0;
      const prov = Number(selected.providerOffer) || 0;
      const suggested = plan && prov ? Math.round((plan + prov) / 2) : plan || prov;
      setSettlementAmount(suggested ? String(suggested) : '');
      if (selected.finalDetermination?.idrAvoided) {
        setSettlementAmount(String(selected.finalDetermination.amount ?? ''));
        setSettlementBasis(selected.finalDetermination.outcome || settlementBasis);
      }
    }
  }, [selectedId, agentType, selected?.planOffer, selected?.providerOffer]);

  const updateDispute = useCallback((id, updater) => {
    setDisputes((prev) => prev.map((d) => (d.id === id ? updater(d) : d)));
  }, []);

  const notify = (message, severity = 'success') => setSnackbar({ message, severity });

  const nextAgentType = getNextAgentType(agentType);
  const nextAgentLabel = nextAgentType ? getAgentLabel(nextAgentType) : null;

  /** Routes case to the next pipeline stage; user opens the next agent widget from the marketplace. */
  const routeToNextStage = (caseId, detailMessage) => {
    const id = caseId || selected.id;
    const msg =
      detailMessage ||
      (nextAgentLabel
        ? `Case ${id} updated. Open "${nextAgentLabel}" from the marketplace to continue the flow.`
        : `Case ${id} updated.`);
    notify(msg);
  };

  const renderNextStepHint = () => {
    if (!nextAgentLabel) return null;
    return (
      <Alert severity="success" sx={{ mt: 1, borderRadius: 1.5 }} icon={false}>
        <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
          Next: open <strong>{nextAgentLabel}</strong> on the marketplace for case {selected.id}.
        </Typography>
      </Alert>
    );
  };

  const renderSelectedCaseOutcome = () => {
    if (!selected || (agentType === 'idr-intake' && intakeStep > 0 && selected.id === 'new')) return null;
    const extras = [];
    if (agentType === 'idr-validation' && selected.documents?.length) extras.push(`${validationScore}%`);
    if (agentType === 'nsa-compliance' && selected.compliance?.overall) extras.push(selected.compliance.overall);
    if (agentType === 'nsa-dispute-resolution' && selected.finalDetermination) {
      extras.push(
        selected.finalDetermination.idrAvoided
          ? `Settled ${formatCurrency(selected.finalDetermination.amount)}`
          : formatCurrency(selected.finalDetermination.amount)
      );
    }
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          mb: 1,
          px: 0.75,
          py: 0.5,
          borderRadius: 1,
          bgcolor: 'grey.50',
          border: '1px solid',
          borderColor: 'divider',
          width: 'fit-content',
          maxWidth: '100%',
          flexWrap: 'wrap',
        }}
      >
        <Typography sx={{ fontSize: '0.58rem', fontWeight: 600, color: 'text.secondary' }}>
          Selected case
        </Typography>
        <Chip label={selected.status} size="small" color={statusChipColor(selected.status)} sx={{ height: 20 }} />
        {extras.map((x) => (
          <Chip key={x} label={x} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.58rem' }} />
        ))}
      </Box>
    );
  };

  const buildComplianceForDispute = useCallback((dispute, { supervisorOverride = false } = {}) => {
    const applicable =
      dispute.placeOfService?.includes('Emergency') || (dispute.billedAmount ?? 0) > 1000;
    const results = COMPLIANCE_RULES.map((r) => ({
      ...r,
      result: supervisorOverride
        ? 'Pass'
        : r.id === 'R5' && !dispute.disputeType?.includes('ambulance')
          ? 'N/A'
          : r.id === 'R4'
            ? (dispute.negotiationDays ?? 0) >= 30
              ? 'Pass'
              : 'Fail'
            : 'Pass',
    }));
    const allPass = results.every((r) => r.result === 'Pass' || r.result === 'N/A');
    return {
      applicable,
      memberProtected: applicable,
      qpaCompliant: true,
      rules: results,
      overall: allPass ? 'Compliant' : 'Review Required',
      supervisorOverride: supervisorOverride || undefined,
    };
  }, []);

  const runComplianceAnalysis = () => {
    setLoading(true);
    setComplianceResults(null);
    setTimeout(() => {
      const compliance = buildComplianceForDispute(selected);
      const allPass = compliance.overall === 'Compliant';
      setComplianceResults(compliance);
      updateDispute(selected.id, (d) =>
        addTimeline(
          {
            ...d,
            compliance,
            stage: allPass ? 'dispute' : 'compliance',
            status: allPass ? 'Ready for Dispute Resolution' : 'Compliance Review — exceptions',
          },
          `NSA compliance analysis — ${compliance.overall}`,
          'NSA Compliance Agent'
        )
      );
      setLoading(false);
      if (allPass) {
        routeToNextStage(selected.id, 'Compliance complete.');
      } else {
        const failed = compliance.rules.filter((r) => r.result === 'Fail').map((r) => r.id);
        notify(
          failed.length
            ? `Exceptions: ${failed.join(', ')}. Use resolution actions below, then re-run analysis.`
            : 'Review required. Use resolution actions below.',
          'error'
        );
      }
    }, 2200);
  };

  const applyComplianceResolution = (actionId) => {
    const action = COMPLIANCE_RESOLUTION_ACTIONS.find((a) => a.id === actionId);
    if (!action) return;

    updateDispute(selected.id, (d) => {
      let next = d;
      switch (actionId) {
        case 'extend-negotiation':
          next = addTimeline(
            { ...d, negotiationDays: 30 },
            'Open negotiation certified — 30 calendar days documented (R4 remediation)',
            'NSA Compliance Agent'
          );
          break;
        case 'index-negotiation-notice': {
          const documents = d.documents.map((doc) =>
            doc.name.toLowerCase().includes('negotiation') ? { ...doc, received: true } : doc
          );
          const required = documents.filter((doc) => doc.required);
          const score = required.length
            ? Math.round((required.filter((doc) => doc.received).length / required.length) * 100)
            : d.validationScore;
          next = addTimeline(
            {
              ...d,
              documents,
              validationScore: score,
              validationStatus: score >= 80 ? 'Approved' : d.validationStatus,
            },
            'Provider Open Negotiation Notice indexed — evidence updated',
            'NSA Compliance Agent'
          );
          break;
        }
        case 'request-corrected-qpa':
          next = addTimeline(
            { ...d, status: 'Compliance Review — QPA rework requested' },
            'Corrected QPA package requested from plan actuarial',
            'NSA Compliance Agent'
          );
          break;
        case 'return-validation':
          next = addTimeline(
            {
              ...d,
              stage: 'validation',
              status: 'Pending Validation',
              assignedTo: 'Validation Queue',
            },
            'Returned to validation — resolve evidence gaps before compliance re-review',
            'NSA Compliance Agent'
          );
          break;
        case 'supervisor-override':
          next = addTimeline(
            {
              ...d,
              stage: 'dispute',
              status: 'Ready for Dispute Resolution — supervisor attested',
            },
            'Supervisor override — documented exception; cleared for dispute resolution',
            'NSA Compliance Agent'
          );
          break;
        default:
          break;
      }

      const compliance =
        actionId === 'supervisor-override'
          ? buildComplianceForDispute(next, { supervisorOverride: true })
          : buildComplianceForDispute(next);

      if (actionId === 'supervisor-override') {
        next = { ...next, compliance };
      } else if (actionId !== 'return-validation') {
        next = { ...next, compliance };
      }

      queueMicrotask(() => setComplianceResults(compliance));
      return next;
    });

    const messages = {
      'extend-negotiation': 'Negotiation period updated to 30 days. Re-run compliance analysis.',
      'index-negotiation-notice': 'Open negotiation notice indexed. Re-run compliance analysis.',
      'request-corrected-qpa': 'QPA rework requested. Await package, then re-run analysis.',
      'return-validation': 'Case returned to validation. Open IDR Validation Agent on the marketplace.',
      'supervisor-override': 'Supervisor override recorded. Open NSA Dispute Resolution Agent.',
    };
    notify(messages[actionId] || 'Resolution applied.', 'success');
    if (actionId === 'return-validation') {
      routeToNextStage(selected.id, 'Case returned to validation queue.');
    } else if (actionId === 'supervisor-override') {
      routeToNextStage(selected.id, 'Override complete — proceed to dispute resolution.');
    }
  };

  const submitIntake = () => {
    const requiredFields = ['providerName', 'npi', 'memberId', 'serviceDate', 'disputeType', 'billedAmount'];
    const missing = requiredFields.filter((f) => !String(intakeForm[f] || '').trim());
    if (missing.length) {
      notify(`Complete required fields: ${missing.join(', ')}`, 'error');
      return;
    }
    const docCount = Object.values(intakeDocs).filter(Boolean).length;
    if (docCount < 3) {
      notify('Attach at least 3 required documents before submitting intake.', 'error');
      return;
    }
    const newId = `IDR-2026-${String(Math.floor(Math.random() * 900) + 100).padStart(4, '0')}`;
    const newCase = {
      id: newId,
      provider: intakeForm.providerName,
      npi: intakeForm.npi,
      tin: intakeForm.tin || 'Pending',
      memberId: intakeForm.memberId,
      serviceDate: intakeForm.serviceDate,
      placeOfService: intakeForm.placeOfService,
      cptCodes: ['Pending'],
      billedAmount: Number(intakeForm.billedAmount),
      planOffer: Number(intakeForm.planOffer) || 0,
      providerOffer: Number(intakeForm.providerOffer) || Number(intakeForm.billedAmount),
      qpa: Number(intakeForm.planOffer) * 0.95 || 0,
      disputeType: intakeForm.disputeType,
      stage: 'validation',
      status: 'Pending Validation',
      federalIdrEligible: true,
      intakeDate: new Date().toISOString().slice(0, 10),
      assignedTo: 'Intake Queue',
      documents: Object.entries(intakeDocs).map(([name, received]) => ({
        name,
        required: name !== 'Clinical Records (if applicable)',
        received,
      })),
      compliance: null,
      validationScore: null,
      validationStatus: 'Not Started',
      negotiationDays: 0,
      timeline: [
        {
          date: new Date().toISOString().slice(0, 10),
          event: 'IDR intake submitted and indexed',
          actor: 'IDR Intake Agent',
        },
      ],
    };
    setDisputes((prev) => [newCase, ...prev]);
    setSelectedId(newId);
    setIntakeForm(INTAKE_FORM_DEFAULTS);
    setIntakeDocs({
      'IDR Initiation Request': false,
      'EOB / Claim Remittance': false,
      'Provider Open Negotiation Notice': false,
      'QPA Documentation': false,
    });
    setIntakeStep(0);
    routeToNextStage(newId, `Intake complete. Case ${newId} is ready for validation.`);
  };

  const approveValidation = () => {
    const score = validationScore;
    if (score < 80) {
      notify('Completeness below 80%. Request missing documents or reject case.', 'error');
      return;
    }
    updateDispute(selected.id, (d) =>
      addTimeline(
        {
          ...d,
          validationScore: score,
          validationStatus: 'Approved',
          stage: 'compliance',
          status: 'Compliance Review',
          documents: d.documents.map((doc) => ({ ...doc, received: doc.required ? true : doc.received })),
        },
        `Validation approved — ${score}% evidence completeness`,
        'IDR Validation Agent'
      )
    );
    routeToNextStage(selected.id, 'Validation approved.');
  };

  const rejectValidation = () => {
    updateDispute(selected.id, (d) =>
      addTimeline(
        {
          ...d,
          validationStatus: 'Rejected',
          status: 'Rejected — resubmission required',
          stage: 'intake',
        },
        `Validation rejected: ${rejectReason}. ${rejectNotes}`,
        'IDR Validation Agent'
      )
    );
    notify(
      `Rejection sent. Case ${selected.id} returned to intake — open IDR Intake Agent from the marketplace.`
    );
  };

  const idrAvoided =
    selected?.status?.includes('Settled in open negotiation') || selected?.finalDetermination?.idrAvoided;
  const arbitrationFiled = selected?.status?.includes('Arbitration') && selected?.arbitrationSubmitted;

  const recordOpenNegotiationSettlement = () => {
    if (!String(settlementAmount || '').trim()) {
      notify('Enter agreed settlement amount.', 'error');
      return;
    }
    const amount = Number(settlementAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      notify('Enter a valid settlement amount.', 'error');
      return;
    }
    updateDispute(selected.id, (d) =>
      addTimeline(
        {
          ...d,
          stage: 'case',
          status: 'Settled in open negotiation — IDR avoided',
          finalDetermination: {
            outcome: settlementBasis,
            amount,
            idrAvoided: true,
          },
        },
        `Open negotiation settlement — ${formatCurrency(amount)} (${settlementBasis}); federal IDR not initiated`,
        'NSA Dispute Resolution Agent'
      )
    );
    routeToNextStage(
      selected.id,
      `Settlement recorded for ${selected.id}. Federal IDR avoided — open IDR Case Management to alert stakeholders and close.`
    );
  };

  const submitToFederalIdr = () => {
    if (idrAvoided) {
      notify('Case already settled in open negotiation. IDR was avoided.', 'error');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      updateDispute(selected.id, (d) =>
        addTimeline(
          {
            ...d,
            stage: 'case',
            status: 'Federal IDR — Arbitration',
            arbitrationSubmitted: new Date().toISOString().slice(0, 10),
          },
          'Submitted to federal IDR entity — fee paid, certified entity assigned',
          'NSA Dispute Resolution Agent'
        )
      );
      setLoading(false);
      routeToNextStage(selected.id, 'Submitted to federal IDR.');
    }, 1800);
  };

  const recordArbitrationDecision = () => {
    if (!arbitrationOutcome || !finalAmount) {
      notify('Enter arbitration outcome and final allowed amount.', 'error');
      return;
    }
    updateDispute(selected.id, (d) =>
      addTimeline(
        {
          ...d,
          status: 'Arbitration decision recorded',
          finalDetermination: { outcome: arbitrationOutcome, amount: Number(finalAmount) },
        },
        `Arbitration decision: ${arbitrationOutcome} — ${formatCurrency(finalAmount)}`,
        'NSA Dispute Resolution Agent'
      )
    );
    routeToNextStage(selected.id, 'Arbitration decision recorded.');
  };

  const sendStakeholderAlert = () => {
    if (!alertMessage.trim()) {
      notify('Enter alert message for stakeholders.', 'error');
      return;
    }
    updateDispute(selected.id, (d) =>
      addTimeline(d, `Alert sent: ${alertMessage}`, 'IDR Case Management Agent')
    );
    setAlertMessage('');
    notify('Stakeholder alert sent to provider, plan counsel, and finance.');
  };

  const closeCase = () => {
    updateDispute(selected.id, (d) =>
      addTimeline(
        {
          ...d,
          stage: 'case',
          status: 'Resolved',
          closeOutcome,
        },
        `Case closed — ${closeOutcome}`,
        'IDR Case Management Agent'
      )
    );
    notify(`Case ${selected.id} closed and archived.`);
  };

  const queueForAgent = useMemo(() => buildWorkQueue(disputes, agentType), [disputes, agentType]);

  useEffect(() => {
    if (queueForAgent.length > 0 && !queueForAgent.some((d) => d.id === selectedId)) {
      setSelectedId(queueForAgent[0].id);
    }
  }, [agentType, queueForAgent, selectedId]);

  const renderCaseList = () => (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        flex: 1,
        minHeight: 0,
        overflow: 'auto',
      }}
    >
      {queueForAgent.map((d) => (
        <Box
          key={d.id}
          onClick={() => {
            setSelectedId(d.id);
            setComplianceResults(d.compliance);
          }}
          sx={{
            p: 1,
            cursor: 'pointer',
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: d.id === selectedId ? 'rgba(255, 55, 95, 0.08)' : 'transparent',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
            <Typography variant="caption" fontWeight={600}>
              {d.id}
            </Typography>
            {DEMO_STORY_LABELS[d.id] && (
              <Chip
                label={DEMO_STORY_LABELS[d.id]}
                size="small"
                color={d.id === 'IDR-2026-0061' ? 'success' : 'info'}
                sx={{ height: 18, fontSize: '0.55rem' }}
              />
            )}
          </Box>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.6rem' }}>
            {d.provider}
          </Typography>
          <Chip label={d.status} color={statusChipColor(d.status)} sx={{ mt: 0.5 }} />
        </Box>
      ))}
    </Paper>
  );

  const completeQueuedIntake = () => {
    const score = selected.documents.filter((d) => d.required && d.received).length;
    const required = selected.documents.filter((d) => d.required).length;
    if (score < required) {
      notify('Mark all required documents as received before routing.', 'error');
      return;
    }
    updateDispute(selected.id, (d) =>
      addTimeline(
        {
          ...d,
          stage: 'validation',
          status: 'Pending Validation',
          assignedTo: 'Validation Queue',
        },
        'Intake review complete — indexed and routed to validation',
        'IDR Intake Agent'
      )
    );
    routeToNextStage(selected.id, `Intake review complete for ${selected.id}.`);
  };

  const renderIntakeFlow = () => {
    const isDemoCase = DEMO_STORY_CASE_IDS.includes(selected.id);

    if (selected.stage === 'intake' && selected.id !== 'new' && !isDemoCase) {
      return (
        <Box>
          <Alert severity="info" sx={{ mb: 1, borderRadius: 1.5 }}>
            Process provider submission <strong>{selected.id}</strong> — verify documents and route to
            validation.
          </Alert>
          <Table size="small" sx={{ mb: 1 }}>
            <TableHead>
              <TableRow>
                <TableCell>Document</TableCell>
                <TableCell>Received</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {selected.documents.map((doc) => (
                <TableRow key={doc.name}>
                  <TableCell>{doc.name}</TableCell>
                  <TableCell>
                    {doc.received ? (
                      <CheckCircleIcon color="success" fontSize="small" />
                    ) : (
                      <WarningAmberIcon color="warning" fontSize="small" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {!doc.received && (
                      <Button
                        size="small"
                        onClick={() =>
                          updateDispute(selected.id, (d) => ({
                            ...d,
                            documents: d.documents.map((x) =>
                              x.name === doc.name ? { ...x, received: true } : x
                            ),
                          }))
                        }
                      >
                        Index document
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button variant="contained" startIcon={<SendIcon />} onClick={completeQueuedIntake}>
            Complete intake & route to validation
          </Button>
          <Divider sx={{ my: 1 }} />
          <Typography variant="caption" fontWeight={600} display="block" sx={{ mb: 0.5 }}>
            New provider submission
          </Typography>
        </Box>
      );
    }

    return (
    <Box>
      {isDemoCase && (
        <Alert severity="success" sx={{ mb: 1, borderRadius: 1.5, py: 0 }}>
          <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.65rem', display: 'block' }}>
            {DEMO_STORY_LABELS[selected.id]}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: '0.62rem' }}>
            Provider, member, service, amounts, and documents auto-loaded — use steps 1–4 or jump to{' '}
            <strong>Review</strong>.
          </Typography>
        </Alert>
      )}
      <Stepper
        activeStep={intakeStep}
        alternativeLabel
        sx={{ mb: 1, '& .MuiStepLabel-label': { fontSize: '0.65rem' } }}
      >
        {['Provider & member', 'Service & amounts', 'Documents', 'Review'].map((label, i) => (
          <Step key={label}>
            <StepButton onClick={() => setIntakeStep(i)}>{label}</StepButton>
          </Step>
        ))}
      </Stepper>
      {intakeStep === 0 && (
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Provider name *"
              value={intakeForm.providerName}
              onChange={(e) => setIntakeForm({ ...intakeForm, providerName: e.target.value })}
              sx={{ mb: 1 }}
            />
            <TextField
              fullWidth
              label="NPI *"
              value={intakeForm.npi}
              onChange={(e) => setIntakeForm({ ...intakeForm, npi: e.target.value })}
              sx={{ mb: 1 }}
            />
            <TextField
              fullWidth
              label="TIN"
              value={intakeForm.tin}
              onChange={(e) => setIntakeForm({ ...intakeForm, tin: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Member ID *"
              value={intakeForm.memberId}
              onChange={(e) => setIntakeForm({ ...intakeForm, memberId: e.target.value })}
              sx={{ mb: 1 }}
            />
            <TextField
              fullWidth
              type="date"
              label="Service date *"
              InputLabelProps={{ shrink: true }}
              value={intakeForm.serviceDate}
              onChange={(e) => setIntakeForm({ ...intakeForm, serviceDate: e.target.value })}
            />
          </Grid>
        </Grid>
      )}
      {intakeStep === 1 && (
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth sx={{ mb: 1 }}>
              <InputLabel>Place of service</InputLabel>
              <Select
                value={intakeForm.placeOfService}
                label="Place of service"
                onChange={(e) => setIntakeForm({ ...intakeForm, placeOfService: e.target.value })}
              >
                {PLACE_OF_SERVICE_OPTIONS.map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Dispute type *</InputLabel>
              <Select
                value={intakeForm.disputeType}
                label="Dispute type *"
                onChange={(e) => setIntakeForm({ ...intakeForm, disputeType: e.target.value })}
              >
                {DISPUTE_TYPE_OPTIONS.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Billed amount *"
              type="number"
              value={intakeForm.billedAmount}
              onChange={(e) => setIntakeForm({ ...intakeForm, billedAmount: e.target.value })}
              sx={{ mb: 1 }}
            />
            <TextField
              fullWidth
              label="Plan offer"
              type="number"
              value={intakeForm.planOffer}
              onChange={(e) => setIntakeForm({ ...intakeForm, planOffer: e.target.value })}
              sx={{ mb: 1 }}
            />
            <TextField
              fullWidth
              label="Provider offer"
              type="number"
              value={intakeForm.providerOffer}
              onChange={(e) => setIntakeForm({ ...intakeForm, providerOffer: e.target.value })}
            />
          </Grid>
        </Grid>
      )}
      {intakeStep === 2 && (
        <Paper variant="outlined" sx={{ p: 1, borderRadius: 1.5 }}>
          <Typography variant="caption" fontWeight={600} display="block" sx={{ mb: 0.5 }}>
            Required documentation
          </Typography>
          {Object.keys(intakeDocs).map((doc) => (
            <FormControlLabel
              key={doc}
              control={
                <Checkbox
                  checked={intakeDocs[doc]}
                  onChange={(e) => setIntakeDocs({ ...intakeDocs, [doc]: e.target.checked })}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <UploadFileIcon fontSize="small" color="action" />
                  {doc}
                </Box>
              }
            />
          ))}
        </Paper>
      )}
      {intakeStep === 3 && (
        <Paper sx={{ p: 1, bgcolor: 'grey.50', borderRadius: 1.5 }}>
          <Typography variant="caption" fontWeight={600} display="block" sx={{ mb: 0.5 }}>
            Submission summary
          </Typography>
          <Typography variant="caption" display="block">
            {intakeForm.providerName || '—'} · NPI {intakeForm.npi || '—'} · Member {intakeForm.memberId || '—'}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            {intakeForm.disputeType || '—'} · {intakeForm.serviceDate || '—'} · Billed{' '}
            {formatCurrency(intakeForm.billedAmount)}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            Documents attached: {Object.values(intakeDocs).filter(Boolean).length} of{' '}
            {Object.keys(intakeDocs).length}
          </Typography>
        </Paper>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5, gap: 1 }}>
        <Button disabled={intakeStep === 0} onClick={() => setIntakeStep((s) => s - 1)}>
          Back
        </Button>
        {intakeStep < 3 ? (
          <Button variant="contained" onClick={() => setIntakeStep((s) => s + 1)}>
            Continue
          </Button>
        ) : (
          <Button variant="contained" startIcon={<SendIcon />} onClick={submitIntake}>
            Submit to validation queue
          </Button>
        )}
      </Box>
    </Box>
    );
  };

  const renderValidationFlow = () => (
    <Box>
      <Alert severity={validationScore >= 80 ? 'success' : 'warning'} sx={{ mb: 1, borderRadius: 1.5 }}>
        Evidence completeness: <strong>{validationScore}%</strong> —{' '}
        {validationScore >= 80 ? 'Ready for approval' : 'Missing required items'}
      </Alert>
      <LinearProgress variant="determinate" value={validationScore} sx={{ mb: 1, height: 4, borderRadius: 1 }} />
      <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 160, mb: 1, borderRadius: 1.5 }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Document</TableCell>
            <TableCell>Required</TableCell>
            <TableCell>Received</TableCell>
            <TableCell align="right">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {selected.documents.map((doc) => (
            <TableRow key={doc.name}>
              <TableCell>{doc.name}</TableCell>
              <TableCell>{doc.required ? 'Yes' : 'No'}</TableCell>
              <TableCell>
                {doc.received ? (
                  <CheckCircleIcon color="success" fontSize="small" />
                ) : (
                  <ErrorOutlineIcon color="error" fontSize="small" />
                )}
              </TableCell>
              <TableCell align="right">
                {!doc.received && (
                  <Button
                    size="small"
                    onClick={() =>
                      updateDispute(selected.id, (d) => ({
                        ...d,
                        documents: d.documents.map((x) =>
                          x.name === doc.name ? { ...x, received: true } : x
                        ),
                      }))
                    }
                  >
                    Mark received
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </TableContainer>
      <Divider sx={{ my: 1 }} />
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Button fullWidth variant="contained" color="success" onClick={approveValidation}>
            Approve & route to compliance
          </Button>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth size="small" sx={{ mb: 1 }}>
            <InputLabel>Rejection reason</InputLabel>
            <Select value={rejectReason} label="Rejection reason" onChange={(e) => setRejectReason(e.target.value)}>
              {REJECTION_REASONS.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            size="small"
            placeholder="Rejection notes to provider"
            value={rejectNotes}
            onChange={(e) => setRejectNotes(e.target.value)}
            sx={{ mb: 1 }}
          />
          <Button fullWidth variant="outlined" color="error" onClick={rejectValidation}>
            Reject & request resubmission
          </Button>
        </Grid>
      </Grid>
    </Box>
  );

  const renderComplianceFlow = () => (
    <Box>
      <Paper variant="outlined" sx={{ p: 1, mb: 1, borderRadius: 1.5 }}>
        <Grid container spacing={1}>
          <Grid size={4}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
              Billed
            </Typography>
            <Typography variant="caption" fontWeight={600} display="block">
              {formatCurrency(selected.billedAmount)}
            </Typography>
          </Grid>
          <Grid size={4}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
              QPA
            </Typography>
            <Typography variant="caption" fontWeight={600} display="block">
              {formatCurrency(selected.qpa)}
            </Typography>
          </Grid>
          <Grid size={4}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
              Negotiation days
            </Typography>
            <Typography variant="caption" fontWeight={600} display="block">
              {selected.negotiationDays}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      <Button
        variant="contained"
        startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <RefreshIcon fontSize="small" />}
        onClick={runComplianceAnalysis}
        disabled={loading}
        sx={{ mb: 1 }}
      >
        Run NSA applicability & compliance analysis
      </Button>
      {loading && <LinearProgress sx={{ mb: 1, height: 3 }} />}
      {complianceResults && (
        <>
          <Alert
            severity={complianceResults.overall === 'Compliant' ? 'success' : 'warning'}
            sx={{ mb: 1, borderRadius: 1.5 }}
          >
            Overall determination: <strong>{complianceResults.overall}</strong> — Member protections{' '}
            {complianceResults.memberProtected ? 'apply' : 'under review'}
          </Alert>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Rule</TableCell>
                <TableCell>Result</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {complianceResults.rules.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.rule}</TableCell>
                  <TableCell>
                    <Chip
                      label={r.result}
                      size="small"
                      color={r.result === 'Pass' || r.result === 'N/A' ? 'success' : 'error'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {complianceResults.overall === 'Compliant' && (
            <>
              <Button variant="outlined" sx={{ mt: 1 }} startIcon={<DescriptionIcon fontSize="small" />}>
                Generate compliance audit report
              </Button>
            </>
          )}
          {complianceResults.overall !== 'Compliant' && (
            <Box sx={{ mt: 1.25 }}>
              <Alert severity="error" sx={{ mb: 1, borderRadius: 1.5 }} icon={false}>
                <Typography variant="caption" fontWeight={700} display="block" sx={{ fontSize: '0.65rem', mb: 0.5 }}>
                  Resolution required
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.62rem' }}>
                  {complianceResults.rules
                    .filter((r) => r.result === 'Fail')
                    .map((r) => `${r.id}: ${r.rule.split('—')[0].trim()}`)
                    .join(' · ') || 'Address exceptions below, then re-run analysis.'}
                </Typography>
              </Alert>
              <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.62rem', display: 'block', mb: 0.75 }}>
                Resolution actions
              </Typography>
              <Grid container spacing={0.75}>
                {COMPLIANCE_RESOLUTION_ACTIONS.filter((a) => a.visible(selected)).map((action) => (
                  <Grid key={action.id} size={{ xs: 12, sm: 6 }}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1,
                        borderRadius: 1.5,
                        height: '100%',
                        borderColor: 'rgba(255, 149, 0, 0.45)',
                        bgcolor: 'rgba(255, 149, 0, 0.04)',
                      }}
                    >
                      <Typography variant="caption" fontWeight={700} display="block" sx={{ fontSize: '0.65rem' }}>
                        {action.label}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: '0.58rem', display: 'block', mb: 0.75, minHeight: 28 }}
                      >
                        {action.description}
                      </Typography>
                      <Button
                        fullWidth
                        size="small"
                        variant="contained"
                        color={action.id === 'supervisor-override' ? 'warning' : 'primary'}
                        startIcon={
                          action.id === 'extend-negotiation' ? (
                            <BuildIcon fontSize="small" />
                          ) : action.id === 'return-validation' ? (
                            <UndoIcon fontSize="small" />
                          ) : action.id === 'supervisor-override' ? (
                            <VerifiedUserIcon fontSize="small" />
                          ) : (
                            <SendIcon fontSize="small" />
                          )
                        }
                        onClick={() => applyComplianceResolution(action.id)}
                      >
                        Apply
                      </Button>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
              <Button
                fullWidth
                variant="outlined"
                sx={{ mt: 1 }}
                startIcon={<ReplayIcon fontSize="small" />}
                onClick={runComplianceAnalysis}
                disabled={loading}
              >
                Re-run compliance analysis
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );

  const renderDisputeFlow = () => (
    <Box>
      <Grid container spacing={0.75} sx={{ mb: 1 }}>
        {[
          { label: 'Provider offer', value: selected.providerOffer, color: '#FF375F' },
          { label: 'Plan offer', value: selected.planOffer, color: '#007AFF' },
          { label: 'QPA', value: selected.qpa, color: '#34C759' },
        ].map((item) => (
          <Grid key={item.label} size={4}>
            <StatCard elevation={0}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                {item.label}
              </Typography>
              <Typography variant="caption" fontWeight={700} sx={{ color: item.color, fontSize: '0.8rem' }}>
                {formatCurrency(item.value)}
              </Typography>
            </StatCard>
          </Grid>
        ))}
      </Grid>
      <NSANegotiationLogPanel dispute={selected} />

      <Paper
        variant="outlined"
        sx={{
          p: 1,
          mb: 1,
          borderRadius: 1.5,
          borderColor: idrAvoided ? 'success.light' : 'divider',
          bgcolor: idrAvoided ? 'rgba(52, 199, 89, 0.04)' : 'grey.50',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
          <HandshakeIcon sx={{ fontSize: 18, color: idrAvoided ? 'success.main' : 'text.secondary' }} />
          <Box>
            <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.68rem', display: 'block' }}>
              Avoid federal IDR — settle in open negotiation
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.58rem' }}>
              When plan and provider agree during the negotiation period, record settlement here — no arbitration
              filing or IDR entity fees.
            </Typography>
          </Box>
        </Box>
        {idrAvoided ? (
          <Alert severity="success" sx={{ borderRadius: 1.25, py: 0 }}>
            <Typography variant="caption" sx={{ fontSize: '0.62rem' }}>
              Settlement on file: <strong>{formatCurrency(selected.finalDetermination?.amount)}</strong> —{' '}
              {selected.finalDetermination?.outcome}. Federal IDR was not required.
            </Typography>
          </Alert>
        ) : arbitrationFiled ? (
          <Alert severity="info" sx={{ borderRadius: 1.25, py: 0 }}>
            <Typography variant="caption" sx={{ fontSize: '0.62rem', display: 'block' }}>
              <strong>{selected.id}</strong> already has federal IDR filed
              {selected.arbitrationSubmitted ? ` (${selected.arbitrationSubmitted})` : ''}. Settlement to avoid IDR is
              not available for this case — use <strong>Record arbitration decision</strong> below.
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.6rem', display: 'block', mt: 0.5, color: 'text.secondary' }}>
              To demo <strong>avoiding IDR</strong>, select <strong>IDR-2026-0061</strong> (Ready for Dispute
              Resolution) or run Compliance on <strong>IDR-2026-0042</strong> first, then return here.
            </Typography>
          </Alert>
        ) : (
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Agreed settlement amount"
                type="number"
                value={settlementAmount}
                onChange={(e) => setSettlementAmount(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Settlement basis</InputLabel>
                <Select
                  value={settlementBasis}
                  label="Settlement basis"
                  onChange={(e) => setSettlementBasis(e.target.value)}
                >
                  <MenuItem value="Mutual agreement — QPA-informed">Mutual agreement — QPA-informed</MenuItem>
                  <MenuItem value="Plan offer accepted by provider">Plan offer accepted by provider</MenuItem>
                  <MenuItem value="Split between plan and provider offers">Split between plan and provider offers</MenuItem>
                  <MenuItem value="Provider accepted plan QPA plus uplift">Provider accepted plan QPA plus uplift</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Button
                fullWidth
                variant="contained"
                color="success"
                startIcon={<HandshakeIcon fontSize="small" />}
                onClick={recordOpenNegotiationSettlement}
                disabled={loading || arbitrationFiled}
                sx={{ height: '100%', minHeight: 36 }}
              >
                Record settlement
              </Button>
            </Grid>
          </Grid>
        )}
      </Paper>

      <Divider sx={{ my: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.58rem', px: 1 }}>
          Or proceed to federal IDR
        </Typography>
      </Divider>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <GavelIcon fontSize="small" />}
          onClick={submitToFederalIdr}
          disabled={loading || arbitrationFiled || idrAvoided}
        >
          Submit to federal IDR entity
        </Button>
        {idrAvoided && (
          <Chip label="IDR avoided" size="small" color="success" variant="outlined" sx={{ alignSelf: 'center' }} />
        )}
        {arbitrationFiled && !idrAvoided && (
          <Chip
            label={`IDR filed ${selected.arbitrationSubmitted || ''}`.trim()}
            size="small"
            color="info"
            variant="outlined"
            sx={{ alignSelf: 'center' }}
          />
        )}
      </Box>
      <Divider sx={{ my: 1 }} />
      <Typography variant="caption" fontWeight={600} display="block" sx={{ mb: 0.5 }}>
        Record arbitration decision
        <Typography component="span" color="text.secondary" sx={{ fontSize: '0.58rem', ml: 0.5 }}>
          (only if federal IDR was filed)
        </Typography>
      </Typography>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Outcome</InputLabel>
            <Select
              value={arbitrationOutcome}
              label="Outcome"
              onChange={(e) => setArbitrationOutcome(e.target.value)}
            >
              <MenuItem value="Provider prevails">Provider prevails</MenuItem>
              <MenuItem value="Plan prevails">Plan prevails</MenuItem>
              <MenuItem value="Split determination">Split determination</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            label="Final allowed amount"
            type="number"
            value={finalAmount}
            onChange={(e) => setFinalAmount(e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={recordArbitrationDecision}
            disabled={idrAvoided && !arbitrationFiled}
          >
            Save determination
          </Button>
        </Grid>
      </Grid>
    </Box>
  );

  const renderCaseManagementFlow = () => (
    <Box>
      <Grid container spacing={1} sx={{ mb: 1 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper variant="outlined" sx={{ p: 1, borderRadius: 1.5, maxHeight: 140, overflow: 'auto' }}>
            <Typography variant="caption" fontWeight={600} display="block" sx={{ mb: 0.5 }}>
              <TimelineIcon sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: 14 }} />
              Case timeline — {selected.id}
            </Typography>
            <List dense disablePadding>
              {selected.timeline.map((t, i) => (
                <ListItem key={`${t.date}-${i}`} alignItems="flex-start">
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <Chip label={t.date} size="small" variant="outlined" sx={{ height: 20, '& .MuiChip-label': { px: 0.5, fontSize: '0.6rem' } }} />
                  </ListItemIcon>
                  <ListItemText primary={t.event} secondary={t.actor} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard elevation={0} sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Assigned analyst
            </Typography>
            <Typography variant="caption" fontWeight={600} display="block">
              {selected.assignedTo}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              Intake {selected.intakeDate}
            </Typography>
            {selected.arbitrationSubmitted && (
              <Typography variant="caption" display="block">
                IDR submitted {selected.arbitrationSubmitted}
              </Typography>
            )}
          </StatCard>
          <TextField
            fullWidth
            multiline
            rows={1}
            minRows={1}
            size="small"
            placeholder="Stakeholder alert message..."
            value={alertMessage}
            onChange={(e) => setAlertMessage(e.target.value)}
            sx={{ mb: 1 }}
          />
          <Button fullWidth variant="outlined" startIcon={<SendIcon fontSize="small" />} onClick={sendStakeholderAlert} sx={{ mb: 1 }}>
            Send stakeholder alert
          </Button>
          <FormControl fullWidth size="small" sx={{ mb: 1 }}>
            <InputLabel>Close outcome</InputLabel>
            <Select value={closeOutcome} label="Close outcome" onChange={(e) => setCloseOutcome(e.target.value)}>
              <MenuItem value="Provider prevails">Provider prevails</MenuItem>
              <MenuItem value="Plan prevails">Plan prevails</MenuItem>
              <MenuItem value="Withdrawn">Withdrawn</MenuItem>
              <MenuItem value="Settled in negotiation">Settled in negotiation</MenuItem>
            </Select>
          </FormControl>
          <Button fullWidth variant="contained" color="success" onClick={closeCase} disabled={selected.status === 'Resolved'}>
            Close case
          </Button>
        </Grid>
      </Grid>
      <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 180, borderRadius: 1.5 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Case ID</TableCell>
              <TableCell>Provider</TableCell>
              <TableCell>Stage</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortDisputesWithDemosFirst(disputes).map((d) => (
              <TableRow
                key={d.id}
                hover
                selected={d.id === selectedId}
                onClick={() => setSelectedId(d.id)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                    {d.id}
                    {DEMO_STORY_LABELS[d.id] && (
                      <Chip label={DEMO_STORY_LABELS[d.id]} size="small" sx={{ height: 18, fontSize: '0.55rem' }} />
                    )}
                  </Box>
                </TableCell>
                <TableCell sx={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {d.provider}
                </TableCell>
                <TableCell sx={{ textTransform: 'capitalize' }}>{d.stage}</TableCell>
                <TableCell>
                  <Chip label={d.status} size="small" color={statusChipColor(d.status)} />
                </TableCell>
                <TableCell>{formatCurrency(d.billedAmount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderAgentPanel = () => {
    switch (agentType) {
      case 'idr-intake':
        return renderIntakeFlow();
      case 'idr-validation':
        return renderValidationFlow();
      case 'nsa-compliance':
        return renderComplianceFlow();
      case 'nsa-dispute-resolution':
        return renderDisputeFlow();
      case 'idr-case-management':
        return renderCaseManagementFlow();
      default:
        return renderIntakeFlow();
    }
  };

  const showSidebar = agentType !== 'idr-case-management' && !(agentType === 'idr-intake' && intakeStep > 0);
  const mainColSize = agentType === 'idr-case-management' ? 12 : agentType === 'idr-intake' && intakeStep > 0 ? 12 : 8;
  const sidebarColSize = agentType === 'idr-case-management' ? 0 : 4;

  return (
    <ThemeProvider theme={compactTheme}>
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      scroll="paper"
      PaperProps={{ sx: DIALOG_PAPER_SX }}
    >
      <HeaderBar>
        <HeaderIcon sx={{ fontSize: 22 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={700} noWrap sx={{ fontSize: '0.8125rem', lineHeight: 1.2 }}>
            {meta.title}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.92, fontSize: '0.65rem' }} noWrap>
            {meta.subtitle}
          </Typography>
        </Box>
        <Chip label="Production" sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: '#fff', display: { xs: 'none', sm: 'flex' }, height: 20, '& .MuiChip-label': { px: 0.75, fontSize: '0.6rem' } }} />
        <IconButton onClick={onClose} sx={{ color: '#fff' }} aria-label="Close" size="small">
          <CloseIcon />
        </IconButton>
      </HeaderBar>

      <DialogContent
        dividers
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          p: 0,
          bgcolor: '#F8FAFF',
        }}
      >
        <Box sx={{ flexShrink: 0, px: 1.5, pt: 1, pb: 0.75 }}>
          <Alert severity="info" sx={{ mb: 1, borderRadius: 1.5 }}>
            <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
              One of 5 NSA/IDR agents · shared cases across marketplace cards
            </Typography>
          </Alert>

          <NSAAgentOutcomesPanel outcomes={meta.userOutcomes} variant="workspace" />

          <Grid container spacing={0.75} sx={{ mb: 0.75 }}>
            {[
              { label: 'Open disputes', value: portfolioStats.open },
              { label: 'In intake', value: portfolioStats.intake },
              { label: 'In validation', value: portfolioStats.validation },
              { label: 'In arbitration', value: portfolioStats.arbitration },
            ].map((s) => (
              <Grid key={s.label} size={{ xs: 6, md: 3 }}>
                <StatCard elevation={0}>
                  <Typography variant="caption" color="text.secondary" display="block" noWrap>
                    {s.label}
                  </Typography>
                  <Typography variant="caption" fontWeight={700} color="primary.main" sx={{ fontSize: '0.8rem' }}>
                    {s.value}
                  </Typography>
                </StatCard>
              </Grid>
            ))}
          </Grid>

          <Paper
            elevation={0}
            sx={{
              p: 0.75,
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              overflowX: 'auto',
            }}
          >
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.25, fontSize: '0.6rem' }}>
              IDR flow (read-only)
            </Typography>
            <Stepper
              activeStep={activeStageIndex}
              alternativeLabel
              sx={{
                minWidth: 440,
                py: 0.5,
                '& .MuiStepConnector-line': { minHeight: 2 },
              }}
            >
              {PIPELINE_STAGES.map((stage, idx) => (
                <Step
                  key={stage.key}
                  completed={
                    PIPELINE_STAGES.findIndex((s) => s.key === selected.stage) >= idx
                  }
                >
                  <StepLabel
                    sx={{
                      '& .MuiStepLabel-label': {
                        fontWeight: stage.agentType === agentType ? 700 : 400,
                      },
                    }}
                  >
                    {stage.label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            px: 1.5,
            pb: 1.5,
          }}
        >
          <Grid container spacing={1} sx={{ height: showSidebar ? { md: '100%' } : 'auto', minHeight: { md: 240 } }}>
            {showSidebar && (
              <Grid
                size={{ xs: 12, md: sidebarColSize }}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: { xs: 160, md: 0 },
                  maxHeight: { xs: 180, md: 'none' },
                }}
              >
                <Typography variant="caption" fontWeight={600} sx={{ mb: 0.5, fontSize: '0.65rem' }}>
                  {agentType === 'idr-intake' ? 'Recent cases' : 'Work queue'}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.55rem', display: 'block', mb: 0.5 }}>
                  Story A & B always listed for demo
                </Typography>
                {renderCaseList()}
              </Grid>
            )}
            <Grid
              size={{ xs: 12, md: mainColSize }}
              sx={{ minWidth: 0 }}
            >
              {agentType !== 'idr-intake' && selected && (
                <Paper variant="outlined" sx={{ p: 1, mb: 1, borderRadius: 1.5 }}>
                  <Typography variant="caption" fontWeight={600} noWrap display="block">
                    {selected.id} — {selected.provider}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                    {selected.disputeType} · {selected.serviceDate}
                  </Typography>
                </Paper>
              )}
              {renderSelectedCaseOutcome()}
              {renderAgentPanel()}
              {renderNextStepHint()}
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      {snackbar && (
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(null)}
          sx={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1500,
            minWidth: 260,
            maxWidth: '90vw',
            boxShadow: 4,
            py: 0.5,
            '& .MuiAlert-message': { fontSize: '0.7rem' },
          }}
        >
          {snackbar.message}
        </Alert>
      )}
    </Dialog>
    </ThemeProvider>
  );
}
