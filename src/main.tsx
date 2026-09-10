/**
 * File: src/main.tsx
 * Role: Application entry point initializing the root React component tree.
 * Architecture: Strict mode container rendering with root DOM node resolution.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement: HTMLElement | null = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element to mount the application.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);