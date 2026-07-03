import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeSafeFetch } from './lib/safeFetch.ts';

// Initialize the global safeFetch interceptor to support clean fallbacks for static deployments (GitHub, Vercel)
initializeSafeFetch();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

