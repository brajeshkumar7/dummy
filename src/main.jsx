import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { worker } from './mocks/browser'
import { initializeDatabase } from './lib/db'

// Start MSW in development
if (import.meta.env.DEV) {
  worker.start({
    onUnhandledRequest: 'bypass',
  }).then(async () => {
    // Initialize database after MSW is ready
    await initializeDatabase()
    
    // Render the app
    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })
} else {
  // In production, just initialize database and render
  initializeDatabase().then(() => {
    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })
}
