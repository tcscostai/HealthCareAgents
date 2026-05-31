import { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import HubIcon from '@mui/icons-material/Hub';
import BoltIcon from '@mui/icons-material/Bolt';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';

const TOPIC = 'csnp.lifecycle';

function eventTone(type = '') {
  if (type.includes('rejected') || type.includes('failed') || type.includes('denied')) return 'error';
  if (
    type.includes('validated') ||
    type.includes('completed') ||
    type.includes('passed') ||
    type.includes('activated') ||
    type.includes('adjudicated') ||
    type.includes('sent') ||
    type.includes('created')
  ) {
    return 'success';
  }
  if (type.includes('determined') || type.includes('assigned') || type.includes('configured')) return 'info';
  return 'default';
}

const toneStyles = {
  error: {
    border: '1px solid rgba(255, 123, 114, 0.5)',
    bg: 'linear-gradient(135deg, rgba(255,59,48,0.12) 0%, rgba(20,10,10,0.9) 100%)',
    glow: 'rgba(255, 59, 48, 0.25)',
    dot: '#ff7b72',
  },
  success: {
    border: '1px solid rgba(63, 185, 80, 0.45)',
    bg: 'linear-gradient(135deg, rgba(63,185,80,0.14) 0%, rgba(10,20,12,0.92) 100%)',
    glow: 'rgba(63, 185, 80, 0.3)',
    dot: '#3fb950',
  },
  info: {
    border: '1px solid rgba(88, 166, 255, 0.45)',
    bg: 'linear-gradient(135deg, rgba(88,166,255,0.12) 0%, rgba(10,14,24,0.92) 100%)',
    glow: 'rgba(88, 166, 255, 0.28)',
    dot: '#58a6ff',
  },
  default: {
    border: '1px solid rgba(167, 139, 250, 0.35)',
    bg: 'linear-gradient(135deg, rgba(167,139,250,0.1) 0%, rgba(18,12,28,0.92) 100%)',
    glow: 'rgba(167, 139, 250, 0.22)',
    dot: '#a78bfa',
  },
};

function formatTime(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return String(iso).slice(11, 19) || iso;
  }
}

function FlowParticles({ active }) {
  if (!active) return null;
  return (
    <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <motion.div
          key={`dot-${i}`}
          initial={{ x: '-8%', y: `${8 + i * 11}%`, opacity: 0, scale: 0.5 }}
          animate={{ x: '108%', opacity: [0, 0.9, 0.6, 0], scale: [0.5, 1.2, 0.8] }}
          transition={{ duration: 1.8 + i * 0.22, repeat: Infinity, delay: i * 0.28, ease: 'linear' }}
          style={{
            position: 'absolute',
            width: i % 2 === 0 ? 5 : 8,
            height: i % 2 === 0 ? 5 : 8,
            borderRadius: '50%',
            background: i % 3 === 0 ? '#58a6ff' : '#a78bfa',
            boxShadow: `0 0 ${6 + (i % 3) * 4}px ${i % 3 === 0 ? '#58a6ff' : '#a78bfa'}`,
          }}
        />
      ))}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`trail-${i}`}
          initial={{ x: '-20%', opacity: 0 }}
          animate={{ x: '120%', opacity: [0, 0.35, 0] }}
          transition={{ duration: 3.5 + i * 0.5, repeat: Infinity, delay: i * 0.9, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: `${25 + i * 22}%`,
            width: '40%',
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.6), transparent)',
          }}
        />
      ))}
      <motion.div
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(88,166,255,0.25), transparent)',
          boxShadow: '0 0 12px rgba(88,166,255,0.4)',
        }}
      />
    </Box>
  );
}

function EventCard({ event, index, isNewest }) {
  const tone = eventTone(event.type);
  const style = toneStyles[tone];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 64, scale: 0.88, rotateY: -12 }}
      animate={{ opacity: 1, x: 0, scale: 1, rotateY: 0 }}
      exit={{ opacity: 0, x: -32, scale: 0.92, filter: 'blur(4px)' }}
      transition={{ type: 'spring', stiffness: 420, damping: 26, delay: Math.min(index * 0.05, 0.35) }}
      style={{ position: 'relative', marginBottom: 10, perspective: 800 }}
    >
      {isNewest && (
        <motion.div
          initial={{ opacity: 0.8, scale: 1 }}
          animate={{ opacity: 0, scale: 1.8 }}
          transition={{ duration: 1.2, repeat: Infinity }}
          style={{
            position: 'absolute',
            inset: -4,
            borderRadius: 12,
            border: `2px solid ${style.dot}`,
            pointerEvents: 'none',
          }}
        />
      )}
      <Box
        component={motion.div}
        animate={
          isNewest
            ? {
                boxShadow: [
                  `0 0 16px ${style.glow}`,
                  `0 0 28px ${style.glow}`,
                  `0 0 16px ${style.glow}`,
                ],
              }
            : {}
        }
        transition={{ repeat: isNewest ? Infinity : 0, duration: 1.8 }}
        sx={{
          position: 'relative',
          borderRadius: 2,
          border: style.border,
          background: style.bg,
          boxShadow: isNewest ? `0 0 20px ${style.glow}` : `0 4px 12px rgba(0,0,0,0.25)`,
          overflow: 'hidden',
        }}
      >
        {isNewest && (
          <motion.div
            initial={{ left: '-100%' }}
            animate={{ left: '200%' }}
            transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 0.6 }}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: '40%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        )}
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            bgcolor: style.dot,
            boxShadow: `0 0 12px ${style.dot}`,
          }}
        />
        <Box sx={{ pl: 1.5, pr: 1.25, py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
            <motion.div animate={isNewest ? { scale: [1, 1.04, 1] } : {}} transition={{ repeat: Infinity, duration: 1.5 }}>
              <Chip
                icon={<BoltIcon sx={{ fontSize: '12px !important' }} />}
                label={event.type}
                size="small"
                sx={{
                  height: 'auto',
                  minHeight: 22,
                  maxWidth: 220,
                  fontSize: '0.6rem',
                  fontFamily: 'ui-monospace, monospace',
                  bgcolor: 'rgba(0,0,0,0.35)',
                  color: style.dot,
                  border: `1px solid ${style.dot}44`,
                  '& .MuiChip-label': { whiteSpace: 'normal', py: 0.25 },
                  '& .MuiChip-icon': { color: style.dot },
                }}
              />
            </motion.div>
            <Typography variant="caption" sx={{ color: '#8b949e', fontSize: '0.58rem', fontFamily: 'monospace', flexShrink: 0 }}>
              {formatTime(event.at)}
            </Typography>
          </Box>
          {event.payload && Object.keys(event.payload).length > 0 && (
            <Typography
              variant="caption"
              component="pre"
              sx={{
                m: 0,
                p: 0.75,
                borderRadius: 1,
                bgcolor: 'rgba(0,0,0,0.35)',
                color: '#c9d1d9',
                fontSize: '0.58rem',
                fontFamily: 'ui-monospace, monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                maxHeight: 56,
                overflow: 'auto',
              }}
            >
              {JSON.stringify(event.payload, null, 0)}
            </Typography>
          )}
          {event.idempotencyKey && (
            <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#6e7681', fontSize: '0.55rem' }}>
              idempotency: {event.idempotencyKey}
            </Typography>
          )}
        </Box>
      </Box>
    </motion.div>
  );
}

export default function CSNPEventBusStream({ events = [], live, memberLabel }) {
  const endRef = useRef(null);

  const sorted = useMemo(
    () => [...events].sort((a, b) => String(b.at).localeCompare(String(a.at))),
    [events]
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sorted.length, live]);

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: live ? '#a78bfa' : 'divider',
        bgcolor: '#0a0e14',
        minHeight: 320,
        maxHeight: 400,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: live
          ? '0 0 0 2px rgba(167,139,250,0.4), 0 0 40px rgba(88,166,255,0.15), 0 12px 32px rgba(0,0,0,0.35)'
          : '0 8px 24px rgba(0,0,0,0.2)',
        transition: 'box-shadow 0.4s ease, border-color 0.4s ease',
      }}
    >
      <FlowParticles active={live} />

      <Box
        sx={{
          px: 1.5,
          py: 1,
          borderBottom: '1px solid rgba(167,139,250,0.2)',
          background: 'linear-gradient(90deg, rgba(88,166,255,0.15) 0%, rgba(167,139,250,0.2) 50%, rgba(88,166,255,0.15) 100%)',
          backgroundSize: live ? '200% 100%' : '100% 100%',
          animation: live ? 'busShimmer 2.5s linear infinite' : 'none',
          '@keyframes busShimmer': {
            '0%': { backgroundPosition: '200% 0' },
            '100%': { backgroundPosition: '-200% 0' },
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {live && (
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#58a6ff', boxShadow: '0 0 10px #58a6ff' }} />
              </motion.div>
            )}
            <CloudQueueIcon sx={{ fontSize: 18, color: '#a78bfa' }} />
            <Box>
              <Typography variant="caption" fontWeight={700} sx={{ color: '#e6edf3', letterSpacing: '0.06em', fontSize: '0.65rem' }}>
                EVENT BUS
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', color: '#8b949e', fontSize: '0.55rem', fontFamily: 'monospace' }}>
                {TOPIC} · Kafka / Azure Service Bus
              </Typography>
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            {memberLabel && (
              <Chip label={memberLabel} size="small" sx={{ height: 20, fontSize: '0.6rem', mb: 0.25, bgcolor: 'rgba(88,166,255,0.2)', color: '#79c0ff' }} />
            )}
            <Typography variant="caption" sx={{ display: 'block', color: '#a78bfa', fontWeight: 700, fontSize: '0.7rem' }}>
              {sorted.length} events
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
          {['partition-0', 'partition-1', 'partition-2'].map((p, i) => (
            <motion.div
              key={p}
              animate={live ? { opacity: [0.4, 1, 0.4] } : { opacity: 0.6 }}
              transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
            >
              <Chip label={p} size="small" sx={{ height: 18, fontSize: '0.55rem', bgcolor: 'rgba(0,0,0,0.4)', color: '#8b949e' }} />
            </motion.div>
          ))}
          {live && (
            <Chip
              icon={<HubIcon sx={{ fontSize: 12 }} />}
              label="Consuming…"
              size="small"
              sx={{ height: 18, fontSize: '0.55rem', bgcolor: 'rgba(63,185,80,0.2)', color: '#3fb950' }}
            />
          )}
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', px: 1.25, py: 1.25, position: 'relative' }}>
        {sorted.length === 0 && !live && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Typography variant="caption" sx={{ color: '#6e7681', fontStyle: 'italic', textAlign: 'center', display: 'block', py: 4 }}>
              No events yet — run an agent to publish to the bus
            </Typography>
          </motion.div>
        )}

        {live && sorted.length === 0 && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            style={{ textAlign: 'center', padding: '24px 0' }}
          >
            <Typography variant="caption" sx={{ color: '#a78bfa' }}>
              ▸ Streaming events from agents…
            </Typography>
          </motion.div>
        )}

        <AnimatePresence mode="popLayout" initial={false}>
          {sorted.map((ev, i) => (
            <EventCard
              key={ev.idempotencyKey || `${ev.type}-${ev.at}-${i}`}
              event={ev}
              index={i}
              isNewest={i === 0 && (live || sorted.length <= 3)}
            />
          ))}
        </AnimatePresence>
        <div ref={endRef} />
      </Box>
    </Box>
  );
}
