import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1c1c38',
            color: '#e2e8f0',
            border: '1px solid rgba(255,255,255,0.1)'
          }
        }}
      />
    </AuthProvider>
  </StrictMode>,
)
