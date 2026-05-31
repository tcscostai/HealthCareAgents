import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/ErrorOutline';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import { CSNP_AGENT_META } from '../../data/csnpAgentData';

const pulseKeyframes = {
  '@keyframes livePulse': {
    '0%, 100%': { opacity: 1, transform: 'scale(1)' },
    '50%': { opacity: 0.5, transform: 'scale(1.15)' },
  },
};

function StatusIcon({ status }) {
  if (status === 'running') {
    return (
      <motion.span
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
        style={{ display: 'inline-flex', color: '#FF9500' }}
      >
        <RadioButtonCheckedIcon sx={{ fontSize: 14 }} />
      </motion.span>
    );
  }
  if (status === 'error') {
    return <ErrorIcon sx={{ fontSize: 16, color: 'error.main' }} />;
  }
  return (
    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
      <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
    </motion.div>
  );
}

export default function CSNPAgentActivityStream({ activities, live, memberLabel }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activities, live]);

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: live ? 'primary.main' : 'divider',
        bgcolor: '#0d1117',
        color: '#e6edf3',
        minHeight: 280,
        maxHeight: 360,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: live ? '0 0 0 2px rgba(255,149,0,0.35), 0 8px 24px rgba(0,0,0,0.2)' : 1,
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
        ...pulseKeyframes,
      }}
    >
      <Box
        sx={{
          px: 1.25,
          py: 0.75,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {live && (
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: '#3fb950',
                animation: 'livePulse 1.2s ease-in-out infinite',
              }}
            />
          )}
          <Typography variant="caption" fontWeight={700} sx={{ color: '#8b949e', letterSpacing: '0.04em' }}>
            LIVE AGENT ACTIVITY
          </Typography>
        </Box>
        {memberLabel && (
          <Chip
            label={memberLabel}
            size="small"
            sx={{ height: 20, fontSize: '0.6rem', bgcolor: 'rgba(255,149,0,0.2)', color: '#FFBD2E' }}
          />
        )}
      </Box>

      {live && (
        <LinearProgress
          sx={{
            height: 2,
            bgcolor: 'rgba(255,255,255,0.06)',
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(90deg, #FF9500, #FFBD2E, #FF9500)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s linear infinite',
            },
            '@keyframes shimmer': {
              '0%': { backgroundPosition: '200% 0' },
              '100%': { backgroundPosition: '-200% 0' },
            },
          }}
        />
      )}

      <Box sx={{ flex: 1, overflow: 'auto', px: 1.25, py: 1, fontFamily: 'ui-monospace, monospace' }}>
        {activities.length === 0 && !live && (
          <Typography variant="caption" sx={{ color: '#6e7681', fontStyle: 'italic' }}>
            Execute an agent to stream real-time orchestration activity…
          </Typography>
        )}

        <AnimatePresence initial={false}>
          {activities.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -16, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{ marginBottom: 8 }}
            >
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Box sx={{ mt: 0.25, flexShrink: 0 }}>
                  <StatusIcon status={item.status} />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: item.status === 'running' ? '#FFBD2E' : item.status === 'error' ? '#ff7b72' : '#7ee787',
                      fontSize: '0.68rem',
                      lineHeight: 1.45,
                      display: 'block',
                    }}
                  >
                    {item.message}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.75, mt: 0.25, flexWrap: 'wrap' }}>
                    <Typography variant="caption" sx={{ color: '#6e7681', fontSize: '0.58rem' }}>
                      {item.timestamp}
                    </Typography>
                    {item.agentType && (
                      <Typography variant="caption" sx={{ color: '#58a6ff', fontSize: '0.58rem' }}>
                        {CSNP_AGENT_META[item.agentType]?.title ?? item.agentType}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </motion.div>
          ))}
        </AnimatePresence>

        {live && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ repeat: Infinity, duration: 0.8, repeatType: 'reverse' }}
          >
            <Typography variant="caption" sx={{ color: '#8b949e', fontSize: '0.65rem', mt: 1 }}>
              ▸ Processing…
            </Typography>
          </motion.div>
        )}
        <div ref={endRef} />
      </Box>
    </Box>
  );
}
