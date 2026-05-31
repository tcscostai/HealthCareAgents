import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline, ThemeProvider } from '@mui/material';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import theme from './theme';

const rootEl = document.getElementById('root');
if (!rootEl) {
  document.body.innerHTML =
    '<p style="font-family:sans-serif;padding:24px">Root element #root not found.</p>';
} else {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <ErrorBoundary>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}
