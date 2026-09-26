import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from './components/auth/AuthContext.tsx';
import SplashScreen from './components/ui/SplashScreen.tsx';
import './style/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <SplashScreen />
      <App />
    </AuthProvider>
  </StrictMode>,
)
