import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Scale, LogIn, UserPlus, Shield, CheckCircle2 } from 'lucide-react'

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
      alert('Connection error')
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
      alert('Connection error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#050714', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Left side: Form */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '2rem' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f8fafc', textDecoration: 'none', width: 'fit-content' }}>
          <Scale size={24} color="#e2e8f0" />
          <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>Hanka</span>
        </Link>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '400px', margin: '0 auto', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.5rem' }}>{isLogin ? 'Welcome back' : 'Create an account'}</h1>
            <p style={{ color: '#94a3b8' }}>{isLogin ? 'Enter your details to access your workspace.' : 'Sign up to request access to a tenant.'}</p>
          </div>

          <form onSubmit={isLogin ? handleLogin : handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={e => setUsername(e.target.value)}
                required
                style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }} 
              />
            </div>

            {!isLogin && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Email</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }} 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Tenant (Workspace) Name</label>
                  <input 
                    type="text" 
                    value={tenantName} 
                    onChange={e => setTenantName(e.target.value)}
                    required
                    style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }} 
                  />
                </div>
              </>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                required
                style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }} 
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              style={{ 
                marginTop: '1rem', padding: '0.85rem', borderRadius: '0.5rem', 
                background: '#3b82f6', color: '#fff', border: 'none', 
                fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem'
              }}
            >
              {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
              {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </button>
          </form>

          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: '#94a3b8' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              style={{ background: 'none', border: 'none', color: '#60a5fa', fontWeight: 500, cursor: 'pointer' }}
            >
              {isLogin ? 'Sign up here' : 'Sign in here'}
            </button>
          </div>
        </div>
      </div>

      {/* Right side: Branding/Visual */}
      <div className="hide-mobile" style={{ flex: 1.2, background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '4rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.4, backgroundImage: 'radial-gradient(circle at 50% 50%, #334155 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '400px' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
            <Shield size={48} color="#38bdf8" style={{ marginBottom: '1.5rem' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 400, marginBottom: '1rem' }}>Enterprise-Grade Security</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem', color: '#94a3b8' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} color="#10b981" /> Strict Data Isolation</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} color="#10b981" /> Role-Based Access Control</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} color="#10b981" /> Fully Encrypted Vectors</li>
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
        }
      `}</style>
    </div>
  )
}
