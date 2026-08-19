import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initSentry } from './sentry.ts'

// Initialize Sentry before React renders
initSentry();

console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
