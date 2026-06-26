import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import './Auth.css'
export default function Auth() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  async function handleSubmit(e) {
    e.preventDefault(); setError(null); setLoading(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { username } } })
        if (error) throw error
        await supabase.from('users').update({ username }).eq('id', (await supabase.auth.getUser()).data.user.id)
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
      navigate('/')
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><span className="auth-logo-icon">↗</span><span className="auth-logo-name">TradeFloor</span></div>
        <p className="auth-tagline">The social platform for futures traders.</p>
        <div className="auth-tabs">
          <button className={mode==='login'?'auth-tab active':'auth-tab'} onClick={()=>{setMode('login');setError(null)}}>Sign in</button>
          <button className={mode==='signup'?'auth-tab active':'auth-tab'} onClick={()=>{setMode('signup');setError(null)}}>Create account</button>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          {mode==='signup'&&<div className="auth-field"><label className="auth-label">Username</label><input className="auth-input" type="text" placeholder="alton_trades" value={username} onChange={e=>setUsername(e.target.value.toLowerCase().replace(/\s/g,'_'))} required minLength={3} maxLength={24}/></div>}
          <div className="auth-field"><label className="auth-label">Email</label><input className="auth-input" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
          <div className="auth-field"><label className="auth-label">Password</label><input className="auth-input" type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6}/></div>
          {error&&<div className="auth-error">{error}</div>}
          <button className="auth-submit" type="submit" disabled={loading}>{loading?'Loading...':mode==='login'?'Sign in':'Create account'}</button>
        </form>
      </div>
    </div>
  )
}
