import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Application error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#F8FAFF',
            p: 3,
          }}
        >
          <Paper sx={{ p: 4, maxWidth: 560, borderRadius: 3 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom color="error">
              Something went wrong
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {this.state.error?.message || String(this.state.error)}
            </Typography>
            <Button variant="contained" onClick={() => window.location.reload()}>
              Reload page
            </Button>
          </Paper>
        </Box>
      );
    }
    return this.props.children;
  }
}
