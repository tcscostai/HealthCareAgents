import { useCallback, useMemo, useState } from 'react';
import CSNPAgentActivityStream from './CSNPAgentActivityStream';
import CSNPEventBusStream from './CSNPEventBusStream';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CloseIcon from '@mui/icons-material/Close';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import ScienceIcon from '@mui/icons-material/Science';
import { CSNP_MEMBERS, CSNP_PLAN } from '../../data/csnpData';
import {
  CSNP_AGENT_META,
  CSNP_AGENT_ORDER,
  CSNP_PIPELINE_STAGES,
  AGENT_ACTIVITY_STEPS,
  AGENT_PUBLISH_EVENTS,
  INITIAL_WORKFLOWS,
  TEST_SCENARIOS,
  createInitialWorkflow,
  getCsnpAgentLabel,
  getNextCsnpAgentType,
} from '../../data/csnpAgentData';
import {
  agentTypeForStage,
  applyTestScenario,
  runAgent,
  runFullLifecycle,
  runOrchestratorStep,
} from '../../lib/csnpOrchestrator';

const compactTheme = createTheme({
  typography: { fontSize: 12 },
  components: {
    MuiButton: { defaultProps: { size: 'small' } },
    MuiTableCell: { styleOverrides: { root: { fontSize: '0.7rem', padding: '6px 8px' } } },
  },
  '@keyframes pulse': {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.65 },
  },
});

const HeaderBar = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 16px',
  background: 'linear-gradient(135deg, #FF9500 0%, #FFBD2E 100%)',
  color: '#fff',
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  borderRadius: 10,
  border: '1px solid rgba(0,0,0,0.06)',
}));

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ py: 1.5 }}>{children}</Box> : null;
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const formatActivityTime = () =>
  new Date().toLocaleTimeString(undefined, { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

const statusChip = (w) => {
  if (w.failed) return 'error';
  if (w.completed) return 'success';
  if (w.status?.includes('Rejected')) return 'error';
  return 'warning';
};

export default function CSNPIntelligenceWorkspace({ open, onClose }) {
  const [tab, setTab] = useState(0);
  const [workflows, setWorkflows] = useState(INITIAL_WORKFLOWS);
  const [selectedId, setSelectedId] = useState(INITIAL_WORKFLOWS[0]?.memberId ?? 'M-10482');
  const [selectedAgent, setSelectedAgent] = useState('diagnosis-validation');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState(null);
  const [icdInput, setIcdInput] = useState('I50.9,E11.9');
  const [activityLog, setActivityLog] = useState([]);
  const [activityLive, setActivityLive] = useState(false);
  const [liveBusEvents, setLiveBusEvents] = useState([]);

  const notify = (message, severity = 'success') => setSnackbar({ message, severity });

  const selected = useMemo(
    () => workflows.find((w) => w.memberId === selectedId) ?? workflows[0],
    [workflows, selectedId]
  );

  const updateWorkflow = useCallback((memberId, updater) => {
    setWorkflows((prev) => prev.map((w) => (w.memberId === memberId ? updater(w) : w)));
  }, []);

  const activeStageIndex = CSNP_PIPELINE_STAGES.findIndex((s) => s.key === selected?.stage);

  const nextStep = useMemo(() => {
    if (!selected) return null;
    if (selected.completed) {
      return {
        severity: 'success',
        nextAgent: null,
        text: `Lifecycle complete for ${selected.memberName}. Open the Event bus tab to review all published events and the compliance audit trail.`,
      };
    }
    if (selected.failed) {
      return {
        severity: 'error',
        nextAgent: 'diagnosis-validation',
        text: `Workflow stopped for ${selected.memberId}. Next: correct ICD-10 / diagnosis on Agent console, or review rejection in Event bus. Run Compliance Agent if audit is required.`,
      };
    }
    const nextAgent =
      (selected.lastAgent && getNextCsnpAgentType(selected.lastAgent)) ||
      agentTypeForStage(selected.stage);
    if (!nextAgent) {
      return {
        severity: 'info',
        nextAgent: 'compliance',
        text: `Next: run ${getCsnpAgentLabel('compliance')} on the Agent console tab for ${selected.memberId}.`,
      };
    }
    return {
      severity: 'success',
      nextAgent,
      text: `Next: open the Agent console tab and run ${getCsnpAgentLabel(nextAgent)} for ${selected.memberId} (current stage: ${selected.stage}).`,
    };
  }, [selected]);

  const goToNextAgent = useCallback(() => {
    if (!nextStep?.nextAgent) return;
    setSelectedAgent(nextStep.nextAgent);
    setTab(1);
  }, [nextStep]);

  const renderNextStepHint = () => {
    if (!nextStep) return null;
    return (
      <Alert
        severity={nextStep.severity}
        sx={{ mt: 1, borderRadius: 1.5, py: 0 }}
        icon={false}
        action={
          nextStep.nextAgent && !selected?.completed ? (
            <Button color="inherit" size="small" onClick={goToNextAgent}>
              Open agent
            </Button>
          ) : null
        }
      >
        <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
          {nextStep.text}
        </Typography>
      </Alert>
    );
  };

  const upsertActivity = useCallback((entry) => {
    setActivityLog((prev) => {
      const idx = prev.findIndex((a) => a.id === entry.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...entry };
        return next;
      }
      return [...prev, { ...entry, timestamp: entry.timestamp ?? formatActivityTime() }];
    });
  }, []);

  const publishBusEvent = useCallback((agentType, failed = false) => {
    const map = AGENT_PUBLISH_EVENTS[agentType];
    if (!map) return;
    const type = failed && map.fail ? map.fail : map.success;
    if (!type) return;
    const at = new Date().toISOString();
    setLiveBusEvents((prev) => [
      ...prev,
      {
        type,
        at,
        payload: { memberId: selectedId, agent: agentType },
        idempotencyKey: `${selectedId}-${type}-${at}`,
      },
    ]);
  }, [selectedId]);

  const busEvents = useMemo(() => {
    const persisted = selected?.events || [];
    const merged = [...persisted, ...liveBusEvents];
    return merged.sort((a, b) => String(b.at).localeCompare(String(a.at)));
  }, [selected?.events, liveBusEvents]);

  const simulateAgentActivities = useCallback(
    async (agentTypes) => {
      const speed = agentTypes.length > 1 ? 0.4 : 1;
      let seq = 0;
      for (const agentType of agentTypes) {
        const steps = AGENT_ACTIVITY_STEPS[agentType] || [
          { message: `Executing ${getCsnpAgentLabel(agentType)}…`, duration: 600 },
        ];
        for (const step of steps) {
          const id = `${agentType}-${seq++}`;
          upsertActivity({ id, message: step.message, status: 'running', agentType });
          await delay(Math.max(180, step.duration * speed));
          upsertActivity({ id, message: step.message, status: 'success', agentType });
          const pubMatch = step.message.match(/→\s*([\w.]+)/);
          if (pubMatch) {
            const at = new Date().toISOString();
            setLiveBusEvents((prev) => [
              ...prev,
              {
                type: pubMatch[1],
                at,
                payload: { memberId: selectedId, agent: agentType },
                idempotencyKey: `${selectedId}-${pubMatch[1]}-${id}`,
              },
            ]);
          }
        }
      }
    },
    [upsertActivity, selectedId]
  );

  const portfolioStats = useMemo(
    () => ({
      active: workflows.filter((w) => w.completed).length,
      inFlight: workflows.filter((w) => !w.completed && !w.failed).length,
      rejected: workflows.filter((w) => w.failed).length,
      events: workflows.reduce((n, w) => n + (w.events?.length || 0), 0),
    }),
    [workflows]
  );

  const runLifecycle = async () => {
    if (!selected) return;
    setTab(1);
    setLoading(true);
    setActivityLive(true);
    setActivityLog([]);
    setLiveBusEvents([]);
    upsertActivity({
      id: 'orch-start',
      message: `Orchestrator dispatching full CSNP lifecycle for ${selected.memberId}…`,
      status: 'running',
      agentType: 'orchestrator',
    });
    await delay(400);
    upsertActivity({ id: 'orch-start', message: `Orchestrator dispatching full CSNP lifecycle for ${selected.memberId}…`, status: 'success', agentType: 'orchestrator' });
    try {
      await simulateAgentActivities(CSNP_AGENT_ORDER);
      const result = runFullLifecycle(selected);
      updateWorkflow(selected.memberId, () => result);
      if (result.failed && result.lastAgent) {
        publishBusEvent(result.lastAgent, true);
      }
      if (result.failed) {
        upsertActivity({
          id: 'final',
          message: result.rejectionReason || result.status,
          status: 'error',
          agentType: result.lastAgent,
        });
        notify(`Lifecycle halted: ${result.rejectionReason || result.status}`, 'error');
      } else if (result.completed) {
        upsertActivity({
          id: 'final',
          message: `Workflow completed — ${result.status}`,
          status: 'success',
          agentType: 'compliance',
        });
        notify(`Lifecycle complete for ${result.memberName}. See Event bus for audit trail.`, 'success');
      } else {
        const next = result.lastAgent && getNextCsnpAgentType(result.lastAgent);
        notify(
          next
            ? `Step complete. Next: run ${getCsnpAgentLabel(next)} on Agent console.`
            : `Lifecycle advanced for ${result.memberName}.`,
          'success'
        );
      }
    } finally {
      setActivityLive(false);
      setLoading(false);
      setTimeout(() => setLiveBusEvents([]), 800);
    }
  };

  const runSingleAgent = async () => {
    if (!selected) return;
    setTab(1);
    setLoading(true);
    setActivityLive(true);
    setActivityLog([]);
    setLiveBusEvents([]);
    try {
      await simulateAgentActivities([selectedAgent]);
      const stageKey = CSNP_PIPELINE_STAGES.find((s) => s.agentType === selectedAgent)?.key ?? selected.stage;
      const w = runAgent(selectedAgent, { ...selected, stage: stageKey });
      updateWorkflow(selected.memberId, () => w);
      if (w.failed) {
        publishBusEvent(selectedAgent, true);
        upsertActivity({
          id: 'agent-fail',
          message: w.rejectionReason || w.status,
          status: 'error',
          agentType: selectedAgent,
        });
        notify(w.rejectionReason || w.status, 'error');
      } else {
        const next = getNextCsnpAgentType(selectedAgent);
        notify(
          next
            ? `${getCsnpAgentLabel(selectedAgent)} complete. Next: run ${getCsnpAgentLabel(next)}.`
            : `${getCsnpAgentLabel(selectedAgent)} complete.`,
          'success'
        );
      }
    } finally {
      setActivityLive(false);
      setLoading(false);
      setTimeout(() => setLiveBusEvents([]), 800);
    }
  };

  const runOrchestratorOnce = async () => {
    if (!selected) return;
    const agentType = agentTypeForStage(selected.stage);
    setTab(1);
    setLoading(true);
    setActivityLive(true);
    setActivityLog([]);
    setLiveBusEvents([]);
    try {
      await simulateAgentActivities([agentType]);
      const { workflow, halted } = runOrchestratorStep(selected);
      updateWorkflow(selected.memberId, () => workflow);
      if (workflow.failed) {
        publishBusEvent(agentType, true);
        upsertActivity({
          id: 'orch-fail',
          message: workflow.rejectionReason || workflow.status,
          status: 'error',
          agentType,
        });
        notify(`Orchestrator halted: ${workflow.rejectionReason || workflow.status}`, 'error');
      } else if (halted && workflow.completed) {
        notify('Orchestrator complete — lifecycle finished.', 'success');
      } else {
        const next = workflow.lastAgent && getNextCsnpAgentType(workflow.lastAgent);
        notify(
          next
            ? `Orchestrator step complete. Next: run ${getCsnpAgentLabel(next)} on Agent console.`
            : 'Orchestrator advanced to next stage.',
          'success'
        );
      }
    } finally {
      setActivityLive(false);
      setLoading(false);
      setTimeout(() => setLiveBusEvents([]), 800);
    }
  };

  const runScenario = async (scenarioId) => {
    const scenario = TEST_SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario) return;
    const member = CSNP_MEMBERS.find((m) => m.id === scenario.memberId) || CSNP_MEMBERS[0];
    const base = workflows.find((w) => w.memberId === member.id) || createInitialWorkflow(member);
    setTab(1);
    setLoading(true);
    setActivityLive(true);
    setActivityLog([]);
    setLiveBusEvents([]);
    upsertActivity({
      id: 'scenario',
      message: `Running test scenario: ${scenario.name}`,
      status: 'running',
    });
    await delay(350);
    upsertActivity({ id: 'scenario', message: `Running test scenario: ${scenario.name}`, status: 'success' });
    try {
      const agentsToShow =
        scenario.icdCodes?.length === 0
          ? ['diagnosis-validation', 'compliance']
          : CSNP_AGENT_ORDER;
      await simulateAgentActivities(agentsToShow);
      const result = applyTestScenario(scenario, base);
      setWorkflows((prev) => {
        const exists = prev.some((w) => w.memberId === result.memberId);
        if (exists) return prev.map((w) => (w.memberId === result.memberId ? result : w));
        return [result, ...prev];
      });
      setSelectedId(result.memberId);
      if (result.failed) {
        if (result.lastAgent) publishBusEvent(result.lastAgent, true);
        upsertActivity({ id: 'sc-fail', message: result.rejectionReason || 'Scenario failed', status: 'error' });
        notify(`Scenario failed: ${scenario.name}`, 'error');
      } else {
        upsertActivity({ id: 'sc-ok', message: `Scenario complete — ${result.status}`, status: 'success' });
        notify(`Scenario complete: ${scenario.name}. See Event bus.`, 'success');
      }
    } finally {
      setActivityLive(false);
      setLoading(false);
      setTimeout(() => setLiveBusEvents([]), 800);
    }
  };

  const startNewMemberWorkflow = () => {
    const codes = icdInput.split(/[\s,]+/).filter(Boolean);
    const id = `M-NEW-${Date.now().toString().slice(-4)}`;
    const w = {
      ...createInitialWorkflow({ id, name: 'New Enrollment', mbi: 'PENDING', qualifyingConditions: codes.map((code) => ({ code })) }),
      memberId: id,
      memberName: 'New Enrollment',
      icdCodes: codes,
    };
    setWorkflows((prev) => [w, ...prev]);
    setSelectedId(id);
    notify('Workflow created. Next: run Diagnosis Validation Agent or Run full lifecycle.', 'success');
  };

  return (
    <ThemeProvider theme={compactTheme}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden', height: '88vh', maxHeight: '88vh', display: 'flex', flexDirection: 'column' } }}
      >
        <HeaderBar>
          <HealthAndSafetyIcon sx={{ fontSize: 28 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700} noWrap>
              CSNP Agentic System
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.95 }} noWrap>
              Orchestrator + 10 lifecycle agents · {CSNP_PLAN.name}
            </Typography>
          </Box>
          <Chip label="Production" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: '#fff', height: 20 }} />
          <IconButton onClick={onClose} sx={{ color: '#fff' }} size="small" aria-label="Close">
            <CloseIcon />
          </IconButton>
        </HeaderBar>

        <Box sx={{ flexShrink: 0, px: 1.5, pt: 1, bgcolor: '#FFFBF5' }}>
          <Grid container spacing={0.75} sx={{ mb: 1 }}>
            {[
              { label: 'Completed lifecycles', value: portfolioStats.active },
              { label: 'In progress', value: portfolioStats.inFlight },
              { label: 'Rejected / failed', value: portfolioStats.rejected },
              { label: 'Events published', value: portfolioStats.events },
            ].map((s) => (
              <Grid key={s.label} size={3}>
                <StatCard elevation={0}>
                  <Typography variant="caption" color="text.secondary" display="block" noWrap>
                    {s.label}
                  </Typography>
                  <Typography variant="caption" fontWeight={700} color="primary.main">
                    {s.value}
                  </Typography>
                </StatCard>
              </Grid>
            ))}
          </Grid>

          <Alert severity="info" sx={{ mb: 1, borderRadius: 1.5, py: 0 }}>
            <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
              Follow the <strong>Next step</strong> message after each action — use Agent console to run the next lifecycle agent.
            </Typography>
          </Alert>

          <Paper variant="outlined" sx={{ p: 1, mb: 1, borderRadius: 1.5, overflowX: 'auto' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
              CSNP lifecycle (event-driven)
            </Typography>
            <Stepper activeStep={activeStageIndex >= 0 ? activeStageIndex : 0} alternativeLabel sx={{ minWidth: 720, py: 0.5 }}>
              {CSNP_PIPELINE_STAGES.map((stage) => (
                <Step key={stage.key} completed={activeStageIndex > CSNP_PIPELINE_STAGES.indexOf(stage)}>
                  <StepLabel sx={{ '& .MuiStepLabel-label': { fontSize: '0.6rem' } }}>{stage.label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
        </Box>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 1.5, minHeight: 40, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}
        >
          <Tab label="Orchestrator" sx={{ textTransform: 'none', minHeight: 40, fontSize: '0.75rem' }} />
          <Tab label="Agent console" sx={{ textTransform: 'none', minHeight: 40, fontSize: '0.75rem' }} />
          <Tab label="Event bus" sx={{ textTransform: 'none', minHeight: 40, fontSize: '0.75rem' }} />
          <Tab label="Test scenarios" sx={{ textTransform: 'none', minHeight: 40, fontSize: '0.75rem' }} />
          <Tab label="Member 360" sx={{ textTransform: 'none', minHeight: 40, fontSize: '0.75rem' }} />
        </Tabs>

        <DialogContent sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: 1.5, py: 1, bgcolor: '#F8FAFF' }}>
          <TabPanel value={tab} index={0}>
            <Grid container spacing={1}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="caption" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                  Member workflows
                </Typography>
                <Paper variant="outlined" sx={{ maxHeight: 280, overflow: 'auto' }}>
                  {workflows.map((w) => (
                    <Box
                      key={w.memberId}
                      onClick={() => setSelectedId(w.memberId)}
                      sx={{
                        p: 1,
                        cursor: 'pointer',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        bgcolor: w.memberId === selectedId ? 'rgba(255,149,0,0.1)' : 'transparent',
                      }}
                    >
                      <Typography variant="caption" fontWeight={600}>
                        {w.memberName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {w.memberId}
                      </Typography>
                      <Chip label={w.status} size="small" color={statusChip(w)} sx={{ mt: 0.5, height: 20 }} />
                    </Box>
                  ))}
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 8 }}>
                {selected && (
                  <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <AccountTreeIcon color="primary" fontSize="small" />
                      <Typography variant="caption" fontWeight={700}>
                        Orchestrator Agent (Supervisor)
                      </Typography>
                    </Box>
                    <Typography variant="caption" display="block" gutterBottom>
                      {selected.memberName} · Stage: <strong>{selected.stage}</strong> · Plan:{' '}
                      {selected.assignedPlanName || '—'}
                    </Typography>
                    {selected.rejectionReason && (
                      <Alert severity="error" sx={{ mb: 1, py: 0 }}>
                        {selected.rejectionReason}
                      </Alert>
                    )}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      <Button
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <PlayArrowIcon />}
                        onClick={runLifecycle}
                        disabled={loading}
                      >
                        Run full lifecycle
                      </Button>
                      <Button variant="outlined" startIcon={<RefreshIcon />} onClick={runOrchestratorOnce} disabled={loading}>
                        Single orchestrator step
                      </Button>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" fontWeight={600}>
                      New enrollment (ICD-10)
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="I50.9, E11.9"
                      value={icdInput}
                      onChange={(e) => setIcdInput(e.target.value)}
                      sx={{ my: 0.5 }}
                    />
                    <Button size="small" onClick={startNewMemberWorkflow}>
                      Create workflow
                    </Button>
                    {renderNextStepHint()}
                  </Paper>
                )}
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tab} index={1}>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, md: 5 }}>
                <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                  <InputLabel>Agent</InputLabel>
                  <Select value={selectedAgent} label="Agent" onChange={(e) => setSelectedAgent(e.target.value)}>
                    {CSNP_AGENT_ORDER.map((t) => (
                      <MenuItem key={t} value={t}>
                        {CSNP_AGENT_META[t]?.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  {CSNP_AGENT_META[selectedAgent]?.subtitle}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                  <Button
                    variant="contained"
                    onClick={runSingleAgent}
                    disabled={loading || !selected}
                    startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <PlayArrowIcon />}
                  >
                    Execute agent
                  </Button>
                  <Button size="small" variant="text" onClick={() => setActivityLog([])} disabled={activityLive}>
                    Clear log
                  </Button>
                  <Button
                    size="small"
                    variant={activityLive ? 'contained' : 'outlined'}
                    color="secondary"
                    onClick={() => setTab(2)}
                    sx={activityLive ? { animation: 'pulse 1.2s ease-in-out infinite' } : {}}
                  >
                    View Event bus
                  </Button>
                </Box>
                {selected && renderNextStepHint()}
                <TableContainer component={Paper} variant="outlined" sx={{ mt: 1.5, maxHeight: 140 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Agent</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {CSNP_AGENT_ORDER.map((t) => (
                        <TableRow
                          key={t}
                          selected={t === selectedAgent}
                          hover
                          onClick={() => setSelectedAgent(t)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell sx={{ fontSize: '0.65rem' }}>{CSNP_AGENT_META[t]?.title}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid size={{ xs: 12, md: 7 }}>
                <CSNPAgentActivityStream
                  activities={activityLog}
                  live={activityLive}
                  memberLabel={selected ? `${selected.memberId}` : undefined}
                />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tab} index={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Events stream as agents publish to <strong>csnp.lifecycle</strong>
              </Typography>
              {activityLive && (
                <Chip label="LIVE" size="small" color="primary" sx={{ height: 20, animation: 'pulse 1s infinite' }} />
              )}
              <Button size="small" variant="text" onClick={() => setTab(1)} disabled={activityLive}>
                Agent console
              </Button>
            </Box>
            <CSNPEventBusStream
              events={busEvents}
              live={activityLive}
              memberLabel={selected ? selected.memberId : undefined}
            />
          </TabPanel>

          <TabPanel value={tab} index={3}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Production test scenarios — idempotent execution per member
            </Typography>
            <List dense>
              {TEST_SCENARIOS.map((s) => (
                <ListItem
                  key={s.id}
                  secondaryAction={
                    <Button size="small" startIcon={<ScienceIcon />} onClick={() => runScenario(s.id)} disabled={loading}>
                      Run
                    </Button>
                  }
                >
                  <ListItemText primary={s.name} secondary={s.memberId} primaryTypographyProps={{ variant: 'caption', fontWeight: 600 }} />
                </ListItem>
              ))}
            </List>
          </TabPanel>

          <TabPanel value={tab} index={4}>
            <Grid container spacing={1}>
              {CSNP_MEMBERS.map((m) => (
                <Grid key={m.id} size={{ xs: 12, md: 6 }}>
                  <Paper variant="outlined" sx={{ p: 1 }}>
                    <Typography variant="caption" fontWeight={600}>
                      {m.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {m.id} · MBI {m.mbi} · {m.enrollmentStatus}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                      ICD: {(m.qualifyingConditions || []).map((c) => c.code).join(', ')}
                    </Typography>
                    <Button
                      size="small"
                      sx={{ mt: 0.5 }}
                      onClick={() => {
                        if (!workflows.some((w) => w.memberId === m.id)) {
                          setWorkflows((prev) => [createInitialWorkflow(m), ...prev]);
                        }
                        setSelectedId(m.id);
                        setTab(0);
                      }}
                    >
                      Select workflow
                    </Button>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </TabPanel>
        </DialogContent>

        {snackbar && (
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar(null)}
            sx={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 1500, minWidth: 260 }}
          >
            {snackbar.message}
          </Alert>
        )}
      </Dialog>
    </ThemeProvider>
  );
}
