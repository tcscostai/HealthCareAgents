import { Suspense, lazy, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import AgentDetailDialog from '../components/AgentDetailDialog';
import NSAAgentOutcomesPanel from '../components/agents/NSAAgentOutcomesPanel';
import { AGENT_META, INITIAL_DISPUTES, NSA_IDR_AGENT_ORDER, NSA_IDR_AGENT_TYPES } from '../data/nsaIdrData';

const CSNPIntelligenceWorkspace = lazy(() => import('../components/agents/CSNPIntelligenceWorkspace'));
const NSAIDRWorkspace = lazy(() => import('../components/agents/NSAIDRWorkspace'));
import { HEALTHCARE_CATEGORIES, PORTFOLIO_STATS } from '../data/agents';

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(0, 0, 0, 0.05)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.3s ease-in-out',
}));

const AgentCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(0, 0, 0, 0.05)',
  cursor: 'pointer',
  minHeight: 200,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
  },
}));

const HeroPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.08) 0%, rgba(88, 86, 214, 0.08) 50%, rgba(0, 198, 255, 0.06) 100%)',
  border: '1px solid rgba(0, 102, 255, 0.12)',
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -80,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,198,255,0.2) 0%, transparent 70%)',
  },
}));

function StatBlock({ value, label }) {
  return (
    <Box sx={{ textAlign: { xs: 'left', sm: 'center' } }}>
      <Typography variant="h4" fontWeight={700} color="primary.main">
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}

export default function AgentMarketplace() {
  const [collapsedSections, setCollapsedSections] = useState(() =>
    HEALTHCARE_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.value]: true }), {})
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [csnpWorkspaceOpen, setCsnpWorkspaceOpen] = useState(false);
  const [nsaIdrWorkspaceOpen, setNsaIdrWorkspaceOpen] = useState(false);
  const [nsaIdrAgentType, setNsaIdrAgentType] = useState('idr-intake');
  const [nsaDisputes, setNsaDisputes] = useState(INITIAL_DISPUTES);

  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return HEALTHCARE_CATEGORIES;

    return HEALTHCARE_CATEGORIES.map((cat) => ({
      ...cat,
      subAgents: cat.subAgents.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          (a.features || []).some((f) => f.toLowerCase().includes(q)) ||
          cat.label.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.subAgents.length > 0);
  }, [searchQuery]);

  const toggleSection = (value) => {
    setCollapsedSections((prev) => ({ ...prev, [value]: !prev[value] }));
  };

  const expandAll = () => {
    setCollapsedSections(
      HEALTHCARE_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.value]: false }), {})
    );
  };

  const collapseAll = () => {
    setCollapsedSections(
      HEALTHCARE_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.value]: true }), {})
    );
  };

  const handleAgentSelect = (agent, category) => {
    if (agent.type === 'csnp-intelligence') {
      setCsnpWorkspaceOpen(true);
      return;
    }
    if (NSA_IDR_AGENT_TYPES.includes(agent.type)) {
      setNsaIdrAgentType(agent.type);
      setNsaIdrWorkspaceOpen(true);
      return;
    }
    setSelectedAgent(agent);
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  return (
    <Box>
      <HeroPaper elevation={0} sx={{ mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 7 }}>
            <Chip
              label="Healthcare AI Agent Portfolio"
              size="small"
              sx={{
                mb: 2,
                fontWeight: 600,
                bgcolor: 'rgba(0, 102, 255, 0.1)',
                color: 'primary.main',
              }}
            />
            <Typography variant="h3" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
              Agent Marketplace
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560, mb: 2 }}>
              Browse {PORTFOLIO_STATS.totalAgents} production-ready healthcare AI agents across
              cost management, claims, clinical operations, government programs, FWA, and NSA/IDR —
              organized by business category.
            </Typography>
            <TextField
              placeholder="Search agents, capabilities, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              fullWidth
              sx={{ maxWidth: 480 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 3,
                  bgcolor: 'rgba(255,255,255,0.9)',
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Grid container spacing={2}>
              <Grid size={6}>
                <StatBlock value={PORTFOLIO_STATS.totalAgents} label="Healthcare AI Agents" />
              </Grid>
              <Grid size={6}>
                <StatBlock value={PORTFOLIO_STATS.businessTowers} label="Business Towers" />
              </Grid>
              <Grid size={12}>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  Programs: {PORTFOLIO_STATS.programs}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Focus: {PORTFOLIO_STATS.focusAreas}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </HeroPaper>

      <Box
        sx={{
          display: 'flex',
          gap: 1,
          mb: 2,
          justifyContent: 'flex-end',
        }}
      >
        <Button size="small" startIcon={<UnfoldMoreIcon />} onClick={expandAll}>
          Expand all
        </Button>
        <Button size="small" startIcon={<UnfoldLessIcon />} onClick={collapseAll}>
          Collapse all
        </Button>
      </Box>

      {filteredCategories.length === 0 && (
        <StyledCard>
          <Typography color="text.secondary" align="center" py={4}>
            No agents match &quot;{searchQuery}&quot;. Try a different search term.
          </Typography>
        </StyledCard>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <AnimatePresence>
          {filteredCategories.map((category, index) => {
            const CategoryIcon = category.icon;
            const isCollapsed = collapsedSections[category.value];

            return (
              <motion.div
                key={category.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <StyledCard elevation={0}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 2,
                      cursor: 'pointer',
                    }}
                    onClick={() => toggleSection(category.value)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && toggleSection(category.value)}
                  >
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        bgcolor: `${category.color}15`,
                        color: category.color,
                        display: 'flex',
                      }}
                    >
                      <CategoryIcon fontSize="large" />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="h6" fontWeight={600}>
                          {category.label}
                        </Typography>
                        <Chip
                          label={`${category.subAgents.length} agents`}
                          size="small"
                          sx={{ height: 22, fontSize: '0.7rem' }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {category.description}
                      </Typography>
                      {category.subcategories?.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                          {category.subcategories.map((sub) => (
                            <Chip
                              key={sub}
                              label={sub}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.65rem', height: 22 }}
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                    <IconButton
                      aria-label={isCollapsed ? 'Expand' : 'Collapse'}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSection(category.value);
                      }}
                      sx={{
                        transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
                        transition: 'transform 0.3s',
                      }}
                    >
                      <ExpandMoreIcon />
                    </IconButton>
                  </Box>

                  <Collapse in={!isCollapsed} timeout="auto">
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      {(category.value === 'no_surprises_act'
                        ? [...category.subAgents].sort(
                            (a, b) =>
                              NSA_IDR_AGENT_ORDER.indexOf(a.type) - NSA_IDR_AGENT_ORDER.indexOf(b.type)
                          )
                        : category.subAgents
                      ).map((agent) => {
                        const AgentIcon = agent.icon;
                        const nsaOutcomes =
                          category.value === 'no_surprises_act' ? AGENT_META[agent.type]?.userOutcomes : null;
                        return (
                          <Grid key={agent.id} size={{ xs: 12, sm: 6, md: 4 }}>
                            <AgentCard
                              elevation={0}
                              onClick={() => handleAgentSelect(agent, category)}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1 }}>
                                <Box
                                  sx={{
                                    p: 0.75,
                                    borderRadius: 1.5,
                                    bgcolor: `${category.color}15`,
                                    color: category.color,
                                    display: 'flex',
                                  }}
                                >
                                  <AgentIcon fontSize="small" />
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      gap: 1,
                                    }}
                                  >
                                    <Typography variant="subtitle1" fontWeight={600} noWrap>
                                      {agent.name}
                                    </Typography>
                                    {agent.status && (
                                      <Chip
                                        label={agent.status}
                                        size="small"
                                        color={agent.status === 'stable' ? 'success' : 'warning'}
                                        sx={{ height: 20, fontSize: '0.65rem', textTransform: 'capitalize' }}
                                      />
                                    )}
                                  </Box>
                                </Box>
                              </Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  mb: nsaOutcomes ? 1 : 2,
                                  flex: 1,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {agent.description}
                              </Typography>
                              {nsaOutcomes && (
                                <NSAAgentOutcomesPanel
                                  outcomes={nsaOutcomes}
                                  variant="card"
                                  accent={category.color}
                                />
                              )}
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                                {(agent.features || []).slice(0, 3).map((feature) => (
                                  <Chip
                                    key={feature}
                                    label={feature}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: '0.7rem' }}
                                  />
                                ))}
                                {(agent.features || []).length > 3 && (
                                  <Chip
                                    label={`+${agent.features.length - 3}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: '0.7rem' }}
                                  />
                                )}
                              </Box>
                            </AgentCard>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Collapse>
                </StyledCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </Box>

      <AgentDetailDialog
        open={dialogOpen}
        agent={selectedAgent}
        category={selectedCategory}
        onClose={() => setDialogOpen(false)}
      />

      <Suspense fallback={null}>
        {csnpWorkspaceOpen && (
          <CSNPIntelligenceWorkspace
            open={csnpWorkspaceOpen}
            onClose={() => setCsnpWorkspaceOpen(false)}
          />
        )}
        {nsaIdrWorkspaceOpen && (
          <NSAIDRWorkspace
            open={nsaIdrWorkspaceOpen}
            onClose={() => setNsaIdrWorkspaceOpen(false)}
            agentType={nsaIdrAgentType}
            disputes={nsaDisputes}
            onDisputesChange={setNsaDisputes}
          />
        )}
      </Suspense>
    </Box>
  );
}
