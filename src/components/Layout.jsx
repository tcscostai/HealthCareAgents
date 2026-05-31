import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { HEALTHCARE_CATEGORIES, PORTFOLIO_STATS } from '../data/agents';

const MARKETPLACE_DOMAINS = [
  'Claims & Payment Integrity',
  'Population & Clinical Care',
  'Government Programs',
  'NSA & IDR',
  'FWA & Investigations',
];

export default function Layout({ children }) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFF' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <Toolbar sx={{ gap: 2, flexWrap: { xs: 'wrap', md: 'nowrap' }, py: { xs: 1, md: 0 } }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #0066FF 0%, #00C6FF 100%)',
              color: 'white',
              boxShadow: '0 4px 14px rgba(0, 102, 255, 0.35)',
              flexShrink: 0,
            }}
          >
            <LocalHospitalIcon />
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #0066FF 0%, #5856D6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              flexShrink: 0,
            }}
          >
            Healthcare AI Marketplace
          </Typography>

          <Chip
            label="Marketplace"
            color="primary"
            size="small"
            sx={{ fontWeight: 600, flexShrink: 0 }}
          />

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexWrap: 'wrap',
              ml: { xs: 0, md: 1 },
              flex: 1,
              minWidth: 0,
            }}
          >
            <Chip
              label={`${PORTFOLIO_STATS.totalAgents} Agents`}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 600, borderColor: 'primary.main', color: 'primary.main' }}
            />
            <Chip
              label={`${HEALTHCARE_CATEGORIES.length} Categories`}
              size="small"
              variant="outlined"
            />
            {MARKETPLACE_DOMAINS.map((domain) => (
              <Chip
                key={domain}
                label={domain}
                size="small"
                variant="outlined"
                sx={{
                  display: { xs: 'none', lg: 'flex' },
                  maxWidth: 220,
                  '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' },
                }}
              />
            ))}
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: { xs: 'none', xl: 'block' },
              flexShrink: 0,
              maxWidth: 280,
              textAlign: 'right',
            }}
          >
            {PORTFOLIO_STATS.programs} · {PORTFOLIO_STATS.focusAreas}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ pt: { xs: '104px', md: '88px' }, pb: 6 }}>
        <Container maxWidth="xl">{children}</Container>
      </Box>
    </Box>
  );
}
