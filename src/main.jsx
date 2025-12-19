import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Minimal entry - avoids importing CSS and App to isolate Vite import-analysis problem
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Dev isolation: main.jsx minimal</h1>
      <p>If this renders, the issue is tied to an import removed above.</p>
    </div>
  </StrictMode>,
)
