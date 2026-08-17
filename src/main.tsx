import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Service Worker for offline support
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('[Service Worker] Registered successfully with scope:', registration.scope);
      },
      (err) => {
        console.warn('[Service Worker] Registration failed:', err);
      }
    );
  });
} else if ('serviceWorker' in navigator) {
  // Always attempt registration for offline preview capabilities
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('[Service Worker] Dev registration attempt:', err);
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

