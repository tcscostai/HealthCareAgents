import { useCallback, useEffect, useMemo, useState } from 'react';
import { styled } from '@mui/material/styles';
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
import HubIcon from '@mui/icons-material/Hub';
import PolicyIcon from '@mui/icons-material/Policy';
import RefreshIcon from '@mui/icons-material/Refresh';
import SendIcon from '@mui/icons-material/Send';
import StorageIcon from '@mui/icons-material/Storage';
import TimelineIcon from '@mui/icons-material/Timeline';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  AGENT_META,
  COMPLIANCE_RULES,
  DISPUTE_TYPE_OPTIONS,
  INITIAL_DISPUTES,
  INTAKE_FORM_DEFAULTS,
  PIPELINE_STAGES,
  PLACE_OF_SERVICE_OPTIONS,
  REJECTION_REASONS,
} from '../../data/nsaIdrData';

const HeaderBar = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  padding: '16px 24px',
  background: 'linear-gradient(135deg, #FF6482 0%, #FF375F 100%)',
  color: '#fff',
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  border: '1px solid rgba(0,0,0,0.06)',
}));

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
  if (status.includes('Approved') || status.includes('Resolved') || status.includes('Compliant')) return 'success';
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

export default function NSAIDRWorkspace({ open, onClose, agentType = 'idr-intake' }) {
  const meta = AGENT_META[agentType] || AGENT_META['idr-intake'];
  const HeaderIcon = AGENT_ICONS[meta.icon] || BalanceIcon;

  const [disputes, setDisputes] = useState(INITIAL_DISPUTES);
  const [selectedId, setSelectedId] = useState(INITIAL_DISPUTES[0].id);
  const [snackbar, setSnackbar] = useState(null);
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
    setIntakeStep(0);
    if (agentType === 'idr-intake' && selected.stage === 'intake') {
      setSelectedId(selected.id);
    }
  }, [selectedId, agentType]);

  const updateDispute = useCallback((id, updater) => {
    setDisputes((prev) => prev.map((d) => (d.id === id ? updater(d) : d)));
  }, []);

  const notify = (message) => setSnackbar(message);

  const runComplianceAnalysis = () => {
    setLoading(true);
    setComplianceResults(null);
    setTimeout(() => {
      const applicable = selected.placeOfService.includes('Emergency') || selected.billedAmount > 1000;
      const results = COMPLIANCE_RULES.map((r) => ({
        ...r,
        result:
          r.id === 'R5' && !selected.disputeType.includes('ambulance')
            ? 'N/A'
            : r.id === 'R4'
              ? selected.negotiationDays >= 30
                ? 'Pass'
                : 'Fail'
              : 'Pass',
      }));
      const allPass = results.every((r) => r.result === 'Pass' || r.result === 'N/A');
      const compliance = {
        applicable,
        memberProtected: applicable,
        qpaCompliant: true,
        rules: results,
        overall: allPass ? 'Compliant' : 'Review Required',
      };
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
      notify('Compliance analysis complete. Case routed per NSA determination.');
    }, 2200);
  };

  const submitIntake = () => {
    const requiredFields = ['providerName', 'npi', 'memberId', 'serviceDate', 'disputeType', 'billedAmount'];
    const missing = requiredFields.filter((f) => !String(intakeForm[f] || '').trim());
    if (missing.length) {
      notify(`Complete required fields: ${missing.join(', ')}`);
      return;
    }
    const docCount = Object.values(intakeDocs).filter(Boolean).length;
    if (docCount < 3) {
      notify('Attach at least 3 required documents before submitting intake.');
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
    notify(`Intake complete. Case ${newId} routed to IDR Validation queue.`);
  };

  const approveValidation = () => {
    const score = validationScore;
    if (score < 80) {
      notify('Completeness below 80%. Request missing documents or reject case.');
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
    notify('Validation approved. Case forwarded to NSA Compliance.');
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
    notify('Rejection sent to provider with resubmission instructions.');
  };

  const submitToFederalIdr = () => {
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
      notify('Case submitted to federal IDR portal. Tracking ID generated.');
    }, 1800);
  };

  const recordArbitrationDecision = () => {
    if (!arbitrationOutcome || !finalAmount) {
      notify('Enter arbitration outcome and final allowed amount.');
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
    notify('Arbitration outcome recorded. Case management notified for payment.');
  };

  const sendStakeholderAlert = () => {
    if (!alertMessage.trim()) {
      notify('Enter alert message for stakeholders.');
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

  const queueForAgent = useMemo(() => {
    const stageFilter = activeStage;
    return disputes.filter((d) => d.stage === stageFilter || (stageFilter === 'case' && d.status.includes('Arbitration')));
  }, [disputes, activeStage]);

  const renderCaseList = () => (
    <Paper variant="outlined" sx={{ borderRadius: 2, maxHeight: 480, overflow: 'auto' }}>
      {(queueForAgent.length ? queueForAgent : disputes).map((d) => (
        <Box
          key={d.id}
          onClick={() => {
            setSelectedId(d.id);
            setComplianceResults(d.compliance);
          }}
          sx={{
            p: 2,
            cursor: 'pointer',
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: d.id === selectedId ? 'rgba(255, 55, 95, 0.08)' : 'transparent',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            {d.id}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            {d.provider}
          </Typography>
          <Chip label={d.status} size="small" color={statusChipColor(d.status)} sx={{ mt: 1 }} />
        </Box>
      ))}
    </Paper>
  );

  const completeQueuedIntake = () => {
    const score = selected.documents.filter((d) => d.required && d.received).length;
    const required = selected.documents.filter((d) => d.required).length;
    if (score < required) {
      notify('Mark all required documents as received before routing.');
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
    notify(`Case ${selected.id} routed to IDR Validation queue.`);
  };

  const renderIntakeFlow = () => {
    if (selected.stage === 'intake' && selected.id !== 'new') {
      return (
        <Box>
          <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
            Process provider submission <strong>{selected.id}</strong> — verify documents and route to
            validation.
          </Alert>
          <Table size="small" sx={{ mb: 2 }}>
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
          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            New provider submission
          </Typography>
        </Box>
      );
    }

    return (
    <Box>
      <Stepper activeStep={intakeStep} sx={{ mb: 3 }}>
        {['Provider & member', 'Service & amounts', 'Documents', 'Review & submit'].map((label, i) => (
          <Step key={label}>
            <StepButton onClick={() => setIntakeStep(i)}>{label}</StepButton>
          </Step>
        ))}
      </Stepper>
      {intakeStep === 0 && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Provider name *"
              value={intakeForm.providerName}
              onChange={(e) => setIntakeForm({ ...intakeForm, providerName: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="NPI *"
              value={intakeForm.npi}
              onChange={(e) => setIntakeForm({ ...intakeForm, npi: e.target.value })}
              sx={{ mb: 2 }}
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
              sx={{ mb: 2 }}
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
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
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
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Plan offer"
              type="number"
              value={intakeForm.planOffer}
              onChange={(e) => setIntakeForm({ ...intakeForm, planOffer: e.target.value })}
              sx={{ mb: 2 }}
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
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
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
        <Paper sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Submission summary
          </Typography>
          <Typography variant="body2">
            {intakeForm.providerName || '—'} · NPI {intakeForm.npi || '—'} · Member {intakeForm.memberId || '—'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {intakeForm.disputeType || '—'} · {intakeForm.serviceDate || '—'} · Billed{' '}
            {formatCurrency(intakeForm.billedAmount)}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            Documents attached: {Object.values(intakeDocs).filter(Boolean).length} of{' '}
            {Object.keys(intakeDocs).length}
          </Typography>
        </Paper>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
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
      <Alert severity={validationScore >= 80 ? 'success' : 'warning'} sx={{ mb: 2, borderRadius: 2 }}>
        Evidence completeness: <strong>{validationScore}%</strong> —{' '}
        {validationScore >= 80 ? 'Ready for approval' : 'Missing required items'}
      </Alert>
      <LinearProgress variant="determinate" value={validationScore} sx={{ mb: 3, height: 8, borderRadius: 1 }} />
      <Table size="small">
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
      <Divider sx={{ my: 3 }} />
      <Grid container spacing={2}>
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
      <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid size={4}>
            <Typography variant="caption" color="text.secondary">
              Billed
            </Typography>
            <Typography fontWeight={600}>{formatCurrency(selected.billedAmount)}</Typography>
          </Grid>
          <Grid size={4}>
            <Typography variant="caption" color="text.secondary">
              QPA
            </Typography>
            <Typography fontWeight={600}>{formatCurrency(selected.qpa)}</Typography>
          </Grid>
          <Grid size={4}>
            <Typography variant="caption" color="text.secondary">
              Negotiation days
            </Typography>
            <Typography fontWeight={600}>{selected.negotiationDays}</Typography>
          </Grid>
        </Grid>
      </Paper>
      <Button
        variant="contained"
        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon />}
        onClick={runComplianceAnalysis}
        disabled={loading}
        sx={{ mb: 2 }}
      >
        Run NSA applicability & compliance analysis
      </Button>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {complianceResults && (
        <>
          <Alert
            severity={complianceResults.overall === 'Compliant' ? 'success' : 'warning'}
            sx={{ mb: 2, borderRadius: 2 }}
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
            <Button variant="outlined" sx={{ mt: 2 }} startIcon={<DescriptionIcon />}>
              Generate compliance audit report
            </Button>
          )}
        </>
      )}
    </Box>
  );

  const renderDisputeFlow = () => (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Provider offer', value: selected.providerOffer, color: '#FF375F' },
          { label: 'Plan offer', value: selected.planOffer, color: '#007AFF' },
          { label: 'QPA', value: selected.qpa, color: '#34C759' },
        ].map((item) => (
          <Grid key={item.label} size={4}>
            <StatCard elevation={0}>
              <Typography variant="caption" color="text.secondary">
                {item.label}
              </Typography>
              <Typography variant="h6" fontWeight={700} sx={{ color: item.color }}>
                {formatCurrency(item.value)}
              </Typography>
            </StatCard>
          </Grid>
        ))}
      </Grid>
      <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Open negotiation log
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Day 1 — Plan initial offer {formatCurrency(selected.planOffer)} sent to provider.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Day 18 — Provider counter {formatCurrency(selected.providerOffer)}; plan maintained QPA-based offer.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Day {selected.negotiationDays} — Negotiation period closed without agreement. Federal IDR eligible.
        </Typography>
      </Paper>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <GavelIcon />}
          onClick={submitToFederalIdr}
          disabled={loading || selected.status.includes('Arbitration')}
        >
          Submit to federal IDR entity
        </Button>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        Record arbitration decision
      </Typography>
      <Grid container spacing={2}>
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
          <Button fullWidth variant="outlined" onClick={recordArbitrationDecision} sx={{ height: 40 }}>
            Save determination
          </Button>
        </Grid>
      </Grid>
    </Box>
  );

  const renderCaseManagementFlow = () => (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              <TimelineIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Case timeline — {selected.id}
            </Typography>
            <List dense>
              {selected.timeline.map((t, i) => (
                <ListItem key={`${t.date}-${i}`} alignItems="flex-start">
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Chip label={t.date} size="small" variant="outlined" />
                  </ListItemIcon>
                  <ListItemText primary={t.event} secondary={t.actor} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard elevation={0} sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Assigned analyst
            </Typography>
            <Typography fontWeight={600}>{selected.assignedTo}</Typography>
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
            rows={2}
            size="small"
            placeholder="Stakeholder alert message..."
            value={alertMessage}
            onChange={(e) => setAlertMessage(e.target.value)}
            sx={{ mb: 1 }}
          />
          <Button fullWidth variant="outlined" startIcon={<SendIcon />} onClick={sendStakeholderAlert} sx={{ mb: 2 }}>
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
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Case ID</TableCell>
            <TableCell>Provider</TableCell>
            <TableCell>Stage</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Amount at dispute</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {disputes.map((d) => (
            <TableRow
              key={d.id}
              hover
              selected={d.id === selectedId}
              onClick={() => setSelectedId(d.id)}
              sx={{ cursor: 'pointer' }}
            >
              <TableCell>{d.id}</TableCell>
              <TableCell>{d.provider}</TableCell>
              <TableCell sx={{ textTransform: 'capitalize' }}>{d.stage}</TableCell>
              <TableCell>
                <Chip label={d.status} size="small" color={statusChipColor(d.status)} />
              </TableCell>
              <TableCell>{formatCurrency(d.billedAmount)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden', maxHeight: '96vh' } }}
    >
      <HeaderBar>
        <HeaderIcon sx={{ fontSize: 36 }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            {meta.title}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.95 }}>
            {meta.subtitle} · No Surprises Act & IDR
          </Typography>
        </Box>
        <Chip label="Production" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: '#fff' }} />
        <IconButton onClick={onClose} sx={{ color: '#fff' }} aria-label="Close">
          <CloseIcon />
        </IconButton>
      </HeaderBar>

      <Box sx={{ px: 3, pt: 2, pb: 3, bgcolor: '#F8FAFF' }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {[
            { label: 'Open disputes', value: portfolioStats.open },
            { label: 'In intake', value: portfolioStats.intake },
            { label: 'In validation', value: portfolioStats.validation },
            { label: 'In arbitration', value: portfolioStats.arbitration },
          ].map((s) => (
            <Grid key={s.label} size={{ xs: 6, md: 3 }}>
              <StatCard elevation={0}>
                <Typography variant="caption" color="text.secondary">
                  {s.label}
                </Typography>
                <Typography variant="h5" fontWeight={700} color="primary.main">
                  {s.value}
                </Typography>
              </StatCard>
            </Grid>
          ))}
        </Grid>

        <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
            IDR pipeline
          </Typography>
          <Stepper activeStep={activeStageIndex} alternativeLabel>
            {PIPELINE_STAGES.map((stage) => (
              <Step key={stage.key} completed={PIPELINE_STAGES.findIndex((s) => s.key === selected.stage) >= PIPELINE_STAGES.findIndex((s) => s.key === stage.key)}>
                <StepLabel>{stage.label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        <Grid container spacing={3}>
          {agentType !== 'idr-intake' || intakeStep === 0 ? (
            <Grid size={{ xs: 12, md: agentType === 'idr-case-management' ? 12 : 4 }}>
              {agentType !== 'idr-case-management' && (
                <>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    {agentType === 'idr-intake' ? 'Recent cases' : 'Work queue'}
                  </Typography>
                  {renderCaseList()}
                </>
              )}
            </Grid>
          ) : null}
          <Grid size={{ xs: 12, md: agentType === 'idr-case-management' ? 12 : agentType === 'idr-intake' && intakeStep > 0 ? 12 : 8 }}>
            {agentType !== 'idr-intake' && selected && (
              <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {selected.id} — {selected.provider}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selected.disputeType} · Service {selected.serviceDate} · Member {selected.memberId}
                </Typography>
              </Paper>
            )}
            {renderAgentPanel()}
          </Grid>
        </Grid>
      </Box>

      {snackbar && (
        <Alert
          severity="success"
          onClose={() => setSnackbar(null)}
          sx={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1500,
            minWidth: 320,
            boxShadow: 4,
          }}
        >
          {snackbar}
        </Alert>
      )}
    </Dialog>
  );
}
