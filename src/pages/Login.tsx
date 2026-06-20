import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Eye, EyeOff, Mail, Lock, User, Globe, AlertCircle } from 'lucide-react'
import { signIn, signUp, signInWithGoogle } from '../services/supabase'
import toast from 'react-hot-toast'

export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        if (!name.trim()) { setError('Please enter your name'); setLoading(false); return }
        const { error } = await signUp(email, password, name)
        if (error) throw error
        toast.success('Account created! Check your email to verify.')
        setMode('signin')
      } else {
        const { error } = await signIn(email, password)
        if (error) throw error
        toast.success('Welcome back!')
        navigate('/')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
    const { error } = await signInWithGoogle()
    if (error) {
      toast.error(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 hero-bg"
      style={{ background: 'radial-gradient(ellipse 100% 60% at 50% -10%, rgba(99,102,241,0.25), transparent 70%), #07070f' }}>

      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 animate-glow-pulse"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 0 30px rgba(99,102,241,0.5)' }}>
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">Scam Shield</h1>
          <p style={{ color: 'rgba(148,163,184,0.8)', fontSize: '0.9rem', marginTop: 8 }}>
            AI Powered Multi-Source Fraud Detection
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          {/* Toggle */}
          <div className="flex rounded-xl mb-6 p-1" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {(['signin', 'signup'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
                style={{
                  background: mode === m ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'transparent',
                  color: mode === m ? 'white' : 'rgba(148,163,184,0.8)',
                  boxShadow: mode === m ? '0 4px 12px rgba(79,70,229,0.4)' : 'none',
                }}>
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl mb-4"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p style={{ color: '#f87171', fontSize: '0.85rem' }}>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: 'rgba(148,163,184,0.6)' }} />
                <input
                  id="name-input"
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="cyber-input pl-11"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: 'rgba(148,163,184,0.6)' }} />
              <input
                id="email-input"
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="cyber-input pl-11"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: 'rgba(148,163,184,0.6)' }} />
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="cyber-input pl-11 pr-11"
                required
                minLength={6}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors hover:text-white"
                style={{ color: 'rgba(148,163,184,0.6)' }}>
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-glow w-full flex items-center justify-center gap-2"
              style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? <div className="spinner" /> : null}
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-5">
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.8rem' }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Google */}
          <button
            id="google-auth-btn"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-medium text-sm transition-all duration-300"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#e2e8f0',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}>
            <Globe className="w-5 h-5" style={{ color: '#4285f4' }} />
            Continue with Google
          </button>
        </div>

        <p className="text-center mt-6" style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.8rem' }}>
          Scam Shield — Detect. Analyze. Protect.
        </p>
      </div>
    </div>
  )
}
