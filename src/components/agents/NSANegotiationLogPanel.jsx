import { useEffect, useState } from 'react';
import PsychologyIcon from '@mui/icons-material/Psychology';
import RefreshIcon from '@mui/icons-material/Refresh';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { buildNegotiationIntel } from '../../data/nsaIdrData';

const interventionTone = {
  extraction: { label: 'Extraction', color: '#1565C0', bg: '#F3F7FC' },
  analysis: { label: 'Analysis', color: '#5E35B1', bg: '#F5F3FA' },
  eligibility: { label: 'Eligibility', color: '#2E7D32', bg: '#F1F8F4' },
};

function InterventionChip({ type }) {
  const t = interventionTone[type] || interventionTone.analysis;
  return (
    <Chip
      size="small"
      label={t.label}
      sx={{
        height: 18,
        fontSize: '0.55rem',
        fontWeight: 600,
        bgcolor: t.bg,
        color: t.color,
        border: `1px solid ${t.color}33`,
      }}
    />
  );
}

export default function NSANegotiationLogPanel({ dispute }) {
  const [intel, setIntel] = useState(null);
  const [loading, setLoading] = useState(false);

  const runIntel = () => {
    if (!dispute) return;
    setLoading(true);
    setIntel(null);
    window.setTimeout(() => {
      setIntel(buildNegotiationIntel(dispute));
      setLoading(false);
    }, 1100);
  };

  useEffect(() => {
    runIntel();
  }, [dispute?.id, dispute?.negotiationDays, dispute?.planOffer, dispute?.providerOffer, dispute?.qpa]);

  if (!dispute) return null;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1,
        mb: 1,
        borderRadius: 1.5,
        bgcolor: '#FAFBFC',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 0.75 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, minWidth: 0 }}>
          <PsychologyIcon sx={{ fontSize: 16, color: 'text.secondary', mt: 0.15 }} />
          <Box>
            <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.68rem', display: 'block' }}>
              Open negotiation log
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.58rem' }}>
              Agentic reconstruction · {intel?.agent ?? 'NSA Dispute Resolution Agent'}
            </Typography>
          </Box>
        </Box>
        <Button
          size="small"
          variant="text"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={12} /> : <RefreshIcon sx={{ fontSize: 14 }} />}
          onClick={runIntel}
          sx={{ fontSize: '0.6rem', minWidth: 0, flexShrink: 0 }}
        >
          Refresh
        </Button>
      </Box>

      {loading && <LinearProgress sx={{ mb: 1, height: 2, borderRadius: 1 }} />}

      {intel && !loading && (
        <>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.85 }}>
            {intel.entries.map((entry, i) => (
              <Box
                key={`${entry.day}-${i}`}
                sx={{
                  display: 'flex',
                  gap: 0.75,
                  pl: 0.5,
                  borderLeft: '2px solid',
                  borderColor: i === intel.entries.length - 1 ? 'success.light' : 'divider',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.58rem',
                    fontWeight: 700,
                    color: 'text.secondary',
                    minWidth: 36,
                    pt: 0.1,
                  }}
                >
                  Day {entry.day}
                </Typography>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="caption" sx={{ fontSize: '0.65rem', display: 'block', lineHeight: 1.35 }}>
                    {entry.narrative}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.35, flexWrap: 'wrap' }}>
                    <InterventionChip type={entry.interventionType} />
                    <Typography variant="caption" sx={{ fontSize: '0.58rem', color: 'text.secondary', lineHeight: 1.3 }}>
                      {entry.intervention}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>

          {intel.insights?.length > 0 && (
            <>
              <Divider sx={{ my: 0.85, opacity: 0.7 }} />
              <Typography
                variant="caption"
                sx={{ fontSize: '0.58rem', fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.4 }}
              >
                Agent summary
              </Typography>
              {intel.insights.map((line) => (
                <Typography
                  key={line}
                  variant="caption"
                  sx={{ fontSize: '0.6rem', color: 'text.secondary', display: 'block', lineHeight: 1.35 }}
                >
                  · {line}
                </Typography>
              ))}
            </>
          )}
        </>
      )}
    </Paper>
  );
}
