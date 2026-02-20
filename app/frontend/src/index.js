import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Enhanced Global Error Diagnostics for Production Deployment
window.addEventListener('error', e => {
  // Suppress Benign ResizeObserver Error Overlay
  if (e.message === 'ResizeObserver loop completed with undelivered notifications.' || e.message === 'ResizeObserver loop limit exceeded') {
    e.stopImmediatePropagation();
    const resizeObserverErr = document.getElementById('webpack-dev-server-client-overlay');
    if (resizeObserverErr) resizeObserverErr.style.display = 'none';
    return;
  }

  // Log other errors with more detail
  console.error('[Global Error Cache]', {
    message: e.message,
    filename: e.filename,
    lineno: e.lineno,
    colno: e.colno,
    error: e.error ? e.error.stack : 'No stack trace'
  });
});

window.addEventListener('unhandledrejection', e => {
  console.error('[Unhandled Rejection Cache]', {
    reason: e.reason ? e.reason.stack || e.reason : 'Unknown reason'
  });
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Enable PWA
serviceWorkerRegistration.register();
