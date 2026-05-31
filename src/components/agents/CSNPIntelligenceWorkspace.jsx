import { useCallback, useMemo, useState } from 'react';
import { styled } from '@mui/material/styles';
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
import LinearProgress from '@mui/material/LinearProgress';
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
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import PendingIcon from '@mui/icons-material/Pending';
import PhoneIcon from '@mui/icons-material/Phone';
import RefreshIcon from '@mui/icons-material/Refresh';
import SendIcon from '@mui/icons-material/Send';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  AI_INSIGHTS,
  CARE_TASKS,
  COMPLIANCE_ITEMS,
  CSNP_MEMBERS,
  CSNP_PLAN,
  ELIGIBILITY_CHECKS,
  OUTREACH_QUEUE,
} from '../../data/csnpData';

const HeaderBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(2, 3),
  background: 'linear-gradient(135deg, #FF9500 0%, #FFBD2E 100%)',
  color: '#fff',
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  border: '1px solid rgba(0,0,0,0.06)',
  height: '100%',
}));

const statusColor = (status) => {
  const map = {
    Active: 'success',
    'Pending Verification': 'warning',
    Open: 'warning',
    Closed: 'success',
    Compliant: 'success',
    'Action Required': 'error',
    'On Track': 'info',
    Critical: 'error',
    High: 'error',
    Medium: 'warning',
    Routine: 'default',
    Scheduled: 'info',
    'In Progress': 'warning',
    Pending: 'default',
    Completed: 'success',
  };
  return map[status] || 'default';
};

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function CSNPIntelligenceWorkspace({ open, onClose }) {
  const [tab, setTab] = useState(0);
  const [selectedMemberId, setSelectedMemberId] = useState('M-10482');
  const [memberSearch, setMemberSearch] = useState('');
  const [eligibilityRunning, setEligibilityRunning] = useState(false);
  const [eligibilityResults, setEligibilityResults] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState(AI_INSIGHTS.portfolio[0]);
  const [tasks, setTasks] = useState(CARE_TASKS);
  const [outreach, setOutreach] = useState(OUTREACH_QUEUE);
  const [contactNotes, setContactNotes] = useState({});
  const [snackbar, setSnackbar] = useState(null);

  const selectedMember = useMemo(
    () => CSNP_MEMBERS.find((m) => m.id === selectedMemberId) ?? CSNP_MEMBERS[0],
    [selectedMemberId]
  );

  const filteredMembers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    if (!q) return CSNP_MEMBERS;
    return CSNP_MEMBERS.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.mbi.toLowerCase().includes(q)
    );
  }, [memberSearch]);

  const portfolioStats = useMemo(
    () => ({
      enrolled: CSNP_MEMBERS.filter((m) => m.enrollmentStatus === 'Active').length,
      pending: CSNP_MEMBERS.filter((m) => m.enrollmentStatus === 'Pending Verification').length,
      openGaps: CSNP_MEMBERS.reduce((n, m) => n + m.careGaps.filter((g) => g.status === 'Open').length, 0),
      complianceAlerts: COMPLIANCE_ITEMS.filter((c) => c.status === 'Action Required').length,
      outreachDue: outreach.filter((o) => o.status !== 'Completed').length,
    }),
    [outreach]
  );

  const runEligibilityVerification = useCallback(() => {
    setEligibilityRunning(true);
    setEligibilityResults(null);
    setTimeout(() => {
      const isPending = selectedMember.enrollmentStatus === 'Pending Verification';
      setEligibilityResults({
        medicare: { pass: true, detail: 'Part A & B active — entitlement confirmed via HETS' },
        serviceArea: { pass: true, detail: `Resides in ${CSNP_PLAN.serviceArea} service area` },
        chronicCondition: {
          pass: !isPending,
          detail: isPending
            ? 'COPD documentation received; PCP attestation pending'
            : 'Qualifying chronic conditions verified in claims and clinical feed',
        },
        pcpAttestation: {
          pass: !isPending,
          detail: isPending ? 'Attestation not on file — due within 30 days of enrollment' : 'PCP attestation current',
        },
        esrdRule: {
          pass: selectedMember.qualifyingConditions.some((c) => c.code.startsWith('N18'))
            ? true
            : true,
          detail: selectedMember.qualifyingConditions.some((c) => c.code.startsWith('N18'))
            ? 'ESRD SNP pathway — dialysis coordination active'
            : 'ESRD exclusion rule N/A for condition set',
        },
        enrollmentPeriod: {
          pass: true,
          detail: 'Valid election period — IEP/SEP documented',
        },
        overall: isPending ? 'Conditional' : 'Eligible',
      });
      setEligibilityRunning(false);
    }, 2200);
  }, [selectedMember]);

  const runMemberAnalysis = useCallback(() => {
    setAiLoading(true);
    setTimeout(() => {
      setAiInsight(AI_INSIGHTS.member[selectedMember.id] || AI_INSIGHTS.portfolio[0]);
      setAiLoading(false);
    }, 1500);
  }, [selectedMember.id]);

  const completeTask = (taskId) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'Completed' } : t))
    );
    setSnackbar('Care task marked complete and synced to care management platform.');
  };

  const logOutreach = (outreachId) => {
    const notes = (contactNotes[outreachId] || '').trim();
    if (!notes) {
      setSnackbar('Enter contact notes before logging outreach.');
      return;
    }
    setOutreach((prev) =>
      prev.map((o) => (o.id === outreachId ? { ...o, status: 'Completed' } : o))
    );
    setContactNotes((prev) => ({ ...prev, [outreachId]: '' }));
    setSnackbar('Outreach logged. Care gap workflow updated and member timeline refreshed.');
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
        <HealthAndSafetyIcon sx={{ fontSize: 36 }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            CSNP Intelligence Agent
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.95 }}>
            {CSNP_PLAN.name} · {CSNP_PLAN.contractId} · {CSNP_PLAN.modelOfCare}
          </Typography>
        </Box>
        <Chip label="Production" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: '#fff' }} />
        <IconButton onClick={onClose} sx={{ color: '#fff' }} aria-label="Close">
          <CloseIcon />
        </IconButton>
      </HeaderBar>

      <Box sx={{ px: 3, pt: 2, bgcolor: '#F8FAFF' }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {[
            { label: 'Active CSNP Members', value: portfolioStats.enrolled, sub: `${portfolioStats.pending} pending verification` },
            { label: 'Open Care Gaps', value: portfolioStats.openGaps, sub: 'HEDIS & custom measures' },
            { label: 'Outreach Due', value: portfolioStats.outreachDue, sub: 'Next 7 days' },
            { label: 'Compliance Alerts', value: portfolioStats.complianceAlerts, sub: 'Requires action' },
          ].map((stat) => (
            <Grid key={stat.label} size={{ xs: 6, md: 3 }}>
              <StatCard elevation={0}>
                <Typography variant="caption" color="text.secondary">
                  {stat.label}
                </Typography>
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  {stat.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stat.sub}
                </Typography>
              </StatCard>
            </Grid>
          ))}
        </Grid>

        <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: 2,
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 56 },
            }}
          >
            <Tab label="Member 360" />
            <Tab label="Eligibility Verification" />
            <Tab label="Condition Management" />
            <Tab label="Care Coordination" />
            <Tab label="Member Outreach" />
            <Tab label="CMS Compliance" />
          </Tabs>

          <DialogContent sx={{ px: 3, pt: 0, minHeight: 420 }}>
            <TabPanel value={tab} index={0}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by name, ID, or MBI..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Paper variant="outlined" sx={{ maxHeight: 360, overflow: 'auto', borderRadius: 2 }}>
                    {filteredMembers.map((m) => (
                      <Box
                        key={m.id}
                        onClick={() => setSelectedMemberId(m.id)}
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          bgcolor: m.id === selectedMemberId ? 'rgba(0, 102, 255, 0.08)' : 'transparent',
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {m.name}
                          </Typography>
                          <Chip label={m.outreachPriority} size="small" color={statusColor(m.outreachPriority)} />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {m.id} · {m.age} yrs · RAF {m.riskScore}
                        </Typography>
                        <Chip
                          label={m.enrollmentStatus}
                          size="small"
                          color={statusColor(m.enrollmentStatus)}
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    ))}
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 8 }}>
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {selectedMember.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          MBI {selectedMember.mbi} · DOB {selectedMember.dob} · PCP {selectedMember.pcp}
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        startIcon={aiLoading ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon />}
                        onClick={runMemberAnalysis}
                        disabled={aiLoading}
                      >
                        Run AI Analysis
                      </Button>
                    </Box>
                    <Alert severity="info" icon={<AutoAwesomeIcon />} sx={{ mb: 2, borderRadius: 2 }}>
                      <Typography variant="body2">{aiInsight}</Typography>
                    </Alert>
                    <Grid container spacing={2}>
                      <Grid size={6}>
                        <Typography variant="caption" color="text.secondary">
                          Enrollment
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {selectedMember.enrollmentStatus} since {selectedMember.enrollmentDate}
                        </Typography>
                      </Grid>
                      <Grid size={6}>
                        <Typography variant="caption" color="text.secondary">
                          Last contact
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {selectedMember.lastContact}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Qualifying conditions
                    </Typography>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>ICD-10</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell>HCC</TableCell>
                          <TableCell>Verified</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedMember.qualifyingConditions.map((c) => (
                          <TableRow key={c.code}>
                            <TableCell>{c.code}</TableCell>
                            <TableCell>{c.description}</TableCell>
                            <TableCell>{c.hcc}</TableCell>
                            <TableCell>
                              {c.verified ? (
                                <CheckCircleIcon color="success" fontSize="small" />
                              ) : (
                                <PendingIcon color="warning" fontSize="small" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {selectedMember.complianceFlags.length > 0 && (
                      <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                        {selectedMember.complianceFlags.join(' · ')}
                      </Alert>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tab} index={1}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 5 }}>
                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel>Member</InputLabel>
                    <Select
                      value={selectedMemberId}
                      label="Member"
                      onChange={(e) => {
                        setSelectedMemberId(e.target.value);
                        setEligibilityResults(null);
                      }}
                    >
                      {CSNP_MEMBERS.map((m) => (
                        <MenuItem key={m.id} value={m.id}>
                          {m.name} ({m.id})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={eligibilityRunning ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon />}
                    onClick={runEligibilityVerification}
                    disabled={eligibilityRunning}
                    sx={{ mb: 2 }}
                  >
                    Run CMS Eligibility Verification
                  </Button>
                  <Typography variant="caption" color="text.secondary">
                    Validates Medicare entitlement, service area, chronic condition documentation, PCP
                    attestation, and enrollment period per CMS CSNP requirements.
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 7 }}>
                  {eligibilityRunning && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}
                  {!eligibilityResults && !eligibilityRunning && (
                    <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                      <Typography color="text.secondary">
                        Select a member and run verification to view results.
                      </Typography>
                    </Paper>
                  )}
                  {eligibilityResults && (
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        {eligibilityResults.overall === 'Eligible' ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <WarningAmberIcon color="warning" />
                        )}
                        <Typography variant="h6" fontWeight={600}>
                          Overall: {eligibilityResults.overall}
                        </Typography>
                      </Box>
                      <Stepper orientation="vertical" activeStep={ELIGIBILITY_CHECKS.length}>
                        {ELIGIBILITY_CHECKS.map((check) => {
                          const result = eligibilityResults[check.field];
                          return (
                            <Step key={check.field} completed={result?.pass}>
                              <StepLabel
                                optional={
                                  <Typography variant="caption" color="text.secondary">
                                    {result?.detail}
                                  </Typography>
                                }
                                error={result && !result.pass}
                              >
                                {check.step}
                                {result?.pass ? (
                                  <Chip label="Pass" size="small" color="success" sx={{ ml: 1 }} />
                                ) : result ? (
                                  <Chip label="Review" size="small" color="warning" sx={{ ml: 1 }} />
                                ) : null}
                              </StepLabel>
                            </Step>
                          );
                        })}
                      </Stepper>
                      {eligibilityResults.overall === 'Conditional' && (
                        <Button variant="outlined" sx={{ mt: 2 }} startIcon={<SendIcon />}>
                          Request PCP Attestation
                        </Button>
                      )}
                    </Paper>
                  )}
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tab} index={2}>
              <FormControl size="small" sx={{ minWidth: 280, mb: 2 }}>
                <InputLabel>Member</InputLabel>
                <Select
                  value={selectedMemberId}
                  label="Member"
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                >
                  {CSNP_MEMBERS.map((m) => (
                    <MenuItem key={m.id} value={m.id}>
                      {m.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Measure</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Due date</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedMember.careGaps.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography color="text.secondary" py={2}>
                          No open care gaps — member is current on all measures.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    selectedMember.careGaps.map((gap) => (
                      <TableRow key={gap.measure}>
                        <TableCell>{gap.measure}</TableCell>
                        <TableCell>
                          <Chip label={gap.status} size="small" color={statusColor(gap.status)} />
                        </TableCell>
                        <TableCell>{gap.dueDate}</TableCell>
                        <TableCell>
                          <Chip label={gap.priority} size="small" color={statusColor(gap.priority)} />
                        </TableCell>
                        <TableCell align="right">
                          {gap.status === 'Open' && (
                            <Button size="small" onClick={() => setTab(4)}>
                              Schedule outreach
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <Paper sx={{ p: 2, mt: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Condition registry
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedMember.qualifyingConditions.map((c) => (
                    <Chip
                      key={c.code}
                      label={`${c.code} — ${c.description}`}
                      variant="outlined"
                      color={c.verified ? 'success' : 'warning'}
                    />
                  ))}
                </Box>
              </Paper>
            </TabPanel>

            <TabPanel value={tab} index={3}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Care team — {selectedMember.name}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {selectedMember.careTeam.map((member) => (
                  <Chip key={member} label={member} />
                ))}
              </Box>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Task</TableCell>
                    <TableCell>Member</TableCell>
                    <TableCell>Assignee</TableCell>
                    <TableCell>Due</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right" />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {task.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {task.category}
                        </Typography>
                      </TableCell>
                      <TableCell>{task.memberName}</TableCell>
                      <TableCell>{task.assignee}</TableCell>
                      <TableCell>{task.dueDate}</TableCell>
                      <TableCell>
                        <Chip label={task.status} size="small" color={statusColor(task.status)} />
                      </TableCell>
                      <TableCell align="right">
                        {task.status !== 'Completed' && (
                          <Button
                            size="small"
                            startIcon={<TaskAltIcon />}
                            onClick={() => completeTask(task.id)}
                          >
                            Complete
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabPanel>

            <TabPanel value={tab} index={4}>
              {outreach.map((item) => (
                <Paper key={item.id} variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {item.memberName}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip icon={<PhoneIcon />} label={item.channel} size="small" />
                      <Chip label={item.status} size="small" color={statusColor(item.status)} />
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {item.reason} · Due {item.dueDate}
                  </Typography>
                  <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                    <Typography variant="body2">
                      <strong>Outreach script:</strong> {item.script}
                    </Typography>
                  </Alert>
                  {item.status !== 'Completed' && (
                    <>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        size="small"
                        placeholder="Contact notes — disposition, barriers, next steps..."
                        value={contactNotes[item.id] || ''}
                        onChange={(e) =>
                          setContactNotes((prev) => ({ ...prev, [item.id]: e.target.value }))
                        }
                        sx={{ mb: 1 }}
                      />
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<SendIcon />}
                        onClick={() => logOutreach(item.id)}
                      >
                        Log outreach & close
                      </Button>
                    </>
                  )}
                </Paper>
              ))}
            </TabPanel>

            <TabPanel value={tab} index={5}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Requirement</TableCell>
                    <TableCell>Regulation</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last review</TableCell>
                    <TableCell>Next due</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {COMPLIANCE_ITEMS.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {item.requirement}
                        </Typography>
                        {item.detail && (
                          <Typography variant="caption" color="error.main">
                            {item.detail}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{item.regulation}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.status}
                          size="small"
                          color={statusColor(item.status)}
                          icon={
                            item.status === 'Action Required' ? (
                              <ErrorOutlineIcon />
                            ) : (
                              <CheckCircleIcon />
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>{item.lastReview}</TableCell>
                      <TableCell>{item.nextDue}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabPanel>
          </DialogContent>
        </Paper>
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
