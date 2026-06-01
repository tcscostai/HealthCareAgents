import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

const toneStyles = {
  success: { color: '#2E7D32', bg: '#F1F8F4', border: '#C8E6C9' },
  info: { color: '#1565C0', bg: '#F3F7FC', border: '#BBDEFB' },
  warn: { color: '#E65100', bg: '#FFF8F0', border: '#FFE0B2' },
  default: { color: '#5C4D52', bg: '#FAF8F9', border: '#E8E0E3' },
};

function SignalPill({ label, tone = 'default' }) {
  const s = toneStyles[tone] || toneStyles.default;
  return (
    <Box
      sx={{
        px: 0.75,
        py: 0.25,
        borderRadius: 0.75,
        fontSize: '0.6rem',
        fontWeight: 500,
        bgcolor: s.bg,
        border: `1px solid ${s.border}`,
        color: s.color,
        lineHeight: 1.35,
      }}
    >
      {label}
    </Box>
  );
}

export default function NSAAgentOutcomesPanel({ outcomes, variant = 'workspace', accent = '#FF6482' }) {
  if (!outcomes) return null;

  const compact = variant === 'card';

  return (
    <Box
      sx={{
        mb: compact ? 1.5 : 1,
        borderRadius: 1.5,
        bgcolor: '#FFFFFF',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'stretch',
          borderLeft: `3px solid ${accent}`,
        }}
      >
        <Box sx={{ flex: 1, p: compact ? 0.9 : 1.1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, mb: 0.75 }}>
            <InfoOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary', mt: 0.1, flexShrink: 0 }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: '0.6rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: 'text.secondary',
                  lineHeight: 1.2,
                }}
              >
                Expected outcomes
              </Typography>
              <Typography
                sx={{
                  fontSize: compact ? '0.68rem' : '0.72rem',
                  fontWeight: 500,
                  color: 'text.primary',
                  lineHeight: 1.35,
                  mt: 0.2,
                }}
              >
                {outcomes.tagline}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.4, mb: 0.85 }}>
            {outcomes.signals.map((sig) => (
              <SignalPill key={sig.label} label={sig.label} tone={sig.tone} />
            ))}
          </Box>

          <Divider sx={{ mb: 0.75, opacity: 0.6 }} />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 0.75,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 14, color: '#2E7D32', flexShrink: 0 }} />
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: '0.55rem', color: 'text.secondary', lineHeight: 1.2 }}>
                  On success
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.62rem',
                    fontWeight: 600,
                    color: 'text.primary',
                    lineHeight: 1.25,
                  }}
                >
                  {outcomes.success}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
              <RemoveCircleOutlineIcon sx={{ fontSize: 14, color: '#C62828', flexShrink: 0 }} />
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: '0.55rem', color: 'text.secondary', lineHeight: 1.2 }}>
                  If blocked
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.62rem',
                    fontWeight: 600,
                    color: 'text.primary',
                    lineHeight: 1.25,
                  }}
                >
                  {outcomes.blocked}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
