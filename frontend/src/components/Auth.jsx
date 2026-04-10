import { useState } from 'react'
import { supabase } from '../supabase'

export default function Auth() {
  const [mode, setMode] = useState('login') // login | signup
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleEmail(e) {
    e.preventDefault()
    setLoading(true); setError(''); setMessage('')
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setMessage('Check your email for a confirmation link!')
    }
    setLoading(false)
  }

  async function handleGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
    if (error) setError(error.message)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ width: 400, padding: 40, background: 'rgba(255,255,255,0.03)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#7C6FFB,#FC5185)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⬡</div>
          <span style={{ fontWeight: 700, fontSize: 20, color: '#fff' }}>Universal Skill-Swap</span>
        </div>

        <h2 style={{ color: '#fff', margin: '0 0 6px', fontSize: 22, fontWeight: 700 }}>
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h2>
        <p style={{ color: '#555', margin: '0 0 28px', fontSize: 14 }}>
          {mode === 'login' ? 'Log in to access your career profile' : 'Start mapping your career journey'}
        </p>

        {/* Google button */}
        <button onClick={handleGoogle} style={{
          width: '100%', padding: '12px 0', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)',
          background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 14, fontWeight: 500,
          cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 10, marginBottom: 20
        }}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
            <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
          </svg>
          Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }}/>
          <span style={{ color: '#444', fontSize: 12 }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }}/>
        </div>

        {/* Email form */}
        <form onSubmit={handleEmail}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: 6, letterSpacing: '0.05em' }}>EMAIL</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="you@example.com"
              style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 14, fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }}/>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: 6, letterSpacing: '0.05em' }}>PASSWORD</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="••••••••"
              style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 14, fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }}/>
          </div>

          {error && <div style={{ color: '#FC5185', fontSize: 13, marginBottom: 14, padding: '10px 14px', background: 'rgba(252,81,133,0.08)', borderRadius: 8 }}>{error}</div>}
          {message && <div style={{ color: '#00C9A7', fontSize: 13, marginBottom: 14, padding: '10px 14px', background: 'rgba(0,201,167,0.08)', borderRadius: 8 }}>{message}</div>}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px 0', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg,#7C6FFB,#FC5185)', color: '#fff',
            fontSize: 14, fontWeight: 600, cursor: loading ? 'default' : 'pointer',
            fontFamily: 'DM Sans, sans-serif', opacity: loading ? 0.7 : 1
          }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#555' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage('') }}
            style={{ color: '#7C6FFB', cursor: 'pointer', fontWeight: 600 }}>
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </span>
        </p>
      </div>
    </div>
  )
}