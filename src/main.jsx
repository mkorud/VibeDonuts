import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

/**
 * Titik masuk aplikasi.
 * Semua provider state sudah digabung di dalam <App /> (AppProviders),
 * jadi file ini sengaja dibuat sesederhana mungkin.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
