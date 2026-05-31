import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

export default function AgentDetailDialog({ open, agent, category, onClose }) {
  if (!agent) return null;

  const Icon = agent.icon;
  const CategoryIcon = category?.icon;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, overflow: 'hidden', maxHeight: '92vh' },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: `${category?.color || '#007AFF'}15`,
              color: category?.color || 'primary.main',
              display: 'flex',
            }}
          >
            <Icon />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              {agent.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {category?.label} · AI for Business
            </Typography>
          </Box>
          {agent.status && (
            <Chip
              label={agent.status === 'stable' ? 'Production' : 'Beta'}
              color={agent.status === 'stable' ? 'success' : 'warning'}
              size="small"
            />
          )}
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body1" color="text.secondary" paragraph>
          {agent.description}
        </Typography>

        {agent.businessValue && (
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            <strong>Business value:</strong> {agent.businessValue}
          </Alert>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 2,
            mb: 3,
          }}
        >
          {agent.businessTower && (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Business Tower
              </Typography>
              <Typography variant="subtitle2" fontWeight={600}>
                {agent.businessTower}
              </Typography>
            </Paper>
          )}
          {category && (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Category
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                {CategoryIcon && <CategoryIcon sx={{ fontSize: 18, color: category.color }} />}
                <Typography variant="subtitle2" fontWeight={600}>
                  {category.label}
                </Typography>
              </Box>
            </Paper>
          )}
        </Box>

        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Capabilities
        </Typography>
        <List dense disablePadding>
          {(agent.features || []).map((feature) => (
            <ListItem key={feature} disableGutters>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleOutlineIcon color="primary" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={feature} />
            </ListItem>
          ))}
        </List>

      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={onClose}>
          Launch Agent
        </Button>
      </DialogActions>
    </Dialog>
  );
}
