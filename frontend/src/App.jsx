import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'

export default function App() {
  const [theme, setTheme] = useState('dark')
  const [auth, setAuth]   = useState('login')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  if (auth === 'login')
    return <Login
      theme={theme}
      onLogin={() => setAuth('dashboard')}
      onSignup={() => setAuth('signup')}
    />

  if (auth === 'signup')
    return <Signup
      theme={theme}
      onSignup={() => setAuth('dashboard')}
      onLogin={() => setAuth('login')}
    />

  return <Dashboard
    theme={theme}
    setTheme={setTheme}
    onLogout={() => setAuth('login')}
  />
}