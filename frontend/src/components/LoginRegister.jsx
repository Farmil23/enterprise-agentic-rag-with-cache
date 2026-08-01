import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Scale, LogIn, UserPlus, Shield, ChevronLeft } from 'lucide-react'

export default function LoginRegister() {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [tenantName, setTenantName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('rag_jwt', data.access_token)
        localStorage.setItem('rag_role', data.role)
        localStorage.setItem('rag_tenant', data.tenant_id)
        localStorage.removeItem('rag_has_seen_onboarding')
        
        if (data.role === 'super_admin') navigate('/admin/super')
        else if (data.role === 'tenant_admin') navigate('/admin/tenant')
        else navigate('/chat')
      } else {
        const err = await response.json()
        alert(err.detail || 'Login failed')
      }
    } catch (err) {
      alert('Error connecting to server')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email, tenant_name: tenantName })
      })
      if (response.ok) {
        alert('Registration successful! Please wait for admin approval.')
        setIsLogin(true)
      } else {
        const err = await response.json()
        alert(err.detail || 'Registration failed')
      }
    } catch (err) {
      alert('Error connecting to server')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundImage: 'url(/hero_bg.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: '#fff', 
      fontFamily: "'Inter', sans-serif",
      position: 'relative'
    }}>
      
      {/* Dark overlay for readability */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,7,20,0.7)', backdropFilter: 'blur(8px)', zIndex: 0 }}></div>
      
      <div style={{ 
        position: 'relative', 
        zIndex: 10, 
        width: '100%', 
        maxWidth: '480px', 
        padding: '2rem' 
      }}>
        
        {/* Back to Home Link */}
        <Link to="/" style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          color: '#94a3b8', 
          textDecoration: 'none', 
          marginBottom: '2rem',
          fontSize: '0.9rem',
          transition: 'color 0.2s'
        }} onMouseOver={e=>e.currentTarget.style.color='#fff'} onMouseOut={e=>e.currentTarget.style.color='#94a3b8'}>
          <ChevronLeft size={16} /> Back to Home
        </Link>

        {/* Glassmorphism Card */}
        <div style={{ 
          background: 'rgba(15, 23, 42, 0.65)', 
          backdropFilter: 'blur(16px)', 
          border: '1px solid rgba(255,255,255,0.1)', 
          borderRadius: '16px', 
          padding: '3rem',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
        }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Scale size={32} color="#38bdf8" />
              </div>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.5rem', color: '#f8fafc' }}>
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
              {isLogin ? 'Enter your credentials to access your tenant.' : 'Sign up to request workspace access.'}
            </p>
          </div>

          <form onSubmit={isLogin ? handleLogin : handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.5rem', fontWeight: 500 }}>Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={e => setUsername(e.target.value)}
                required
                style={{ 
                  width: '100%', padding: '0.85rem 1rem', borderRadius: '8px', 
                  background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', 
                  color: '#fff', outline: 'none', transition: 'border 0.2s', fontSize: '0.95rem'
                }} 
                onFocus={e=>e.currentTarget.style.border='1px solid #38bdf8'}
                onBlur={e=>e.currentTarget.style.border='1px solid rgba(255,255,255,0.1)'}
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.5rem', fontWeight: 500 }}>Email Address</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={{ 
                      width: '100%', padding: '0.85rem 1rem', borderRadius: '8px', 
                      background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', 
                      color: '#fff', outline: 'none', transition: 'border 0.2s', fontSize: '0.95rem'
                    }} 
                    onFocus={e=>e.currentTarget.style.border='1px solid #38bdf8'}
                    onBlur={e=>e.currentTarget.style.border='1px solid rgba(255,255,255,0.1)'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.5rem', fontWeight: 500 }}>Workspace (Tenant) Name</label>
                  <input 
                    type="text" 
                    value={tenantName} 
                    onChange={e => setTenantName(e.target.value)}
                    required
                    style={{ 
                      width: '100%', padding: '0.85rem 1rem', borderRadius: '8px', 
                      background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', 
                      color: '#fff', outline: 'none', transition: 'border 0.2s', fontSize: '0.95rem'
                    }} 
                    onFocus={e=>e.currentTarget.style.border='1px solid #38bdf8'}
                    onBlur={e=>e.currentTarget.style.border='1px solid rgba(255,255,255,0.1)'}
                  />
                </div>
              </>
            )}

            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.5rem', fontWeight: 500 }}>
                <span>Password</span>
                {isLogin && <a href="#" style={{ color: '#38bdf8', textDecoration: 'none' }}>Forgot?</a>}
              </label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                required
                style={{ 
                  width: '100%', padding: '0.85rem 1rem', borderRadius: '8px', 
                  background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', 
                  color: '#fff', outline: 'none', transition: 'border 0.2s', fontSize: '0.95rem'
                }} 
                onFocus={e=>e.currentTarget.style.border='1px solid #38bdf8'}
                onBlur={e=>e.currentTarget.style.border='1px solid rgba(255,255,255,0.1)'}
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              style={{ 
                marginTop: '1rem', padding: '0.9rem', borderRadius: '8px', 
                background: '#2563eb', color: '#fff', border: 'none', 
                fontWeight: 600, fontSize: '1rem', cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
                transition: 'background 0.2s'
              }}
              onMouseOver={e=>{if(!isLoading) e.currentTarget.style.background='#1d4ed8'}}
              onMouseOut={e=>{if(!isLoading) e.currentTarget.style.background='#2563eb'}}
            >
              {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
              {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Request Access')}
            </button>
          </form>

          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: '#94a3b8' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              style={{ background: 'none', border: 'none', color: '#38bdf8', fontWeight: 600, cursor: 'pointer', padding: 0 }}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
          
        </div>
        
        {/* Security Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem', color: '#64748b', fontSize: '0.85rem' }}>
          <Shield size={16} /> Secured by Hanka Enterprise
        </div>
      </div>
    </div>
  )
}
