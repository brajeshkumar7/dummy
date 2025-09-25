import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { worker } from './mocks/browser'
import { initializeDatabase } from './lib/db'

// We wrap the startup logic in an async function to use await.
async function prepareAndRender() {
  // First, initialize the in-browser database.
  await initializeDatabase()

  // Next, start the Mock Service Worker. This will now run
  // in both development and production.
  await worker.start({
    onUnhandledRequest: 'bypass',
    /**
     * This is the crucial line for production!
     * It tells MSW where to find the service worker file on your deployed server.
     */
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  })

  // Finally, render the React application.
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

// Call the function to run the app.
prepareAndRender()