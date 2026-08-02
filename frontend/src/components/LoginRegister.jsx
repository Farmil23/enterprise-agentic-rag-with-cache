import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Scale, Check } from 'lucide-react'

export default function LoginRegister() {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [tenantName, setTenantName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { t } = useTranslation()

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

  const inputStyle = {
    width: '100%', 
    padding: '0.85rem 1rem', 
    borderRadius: '4px', 
    background: '#fff', 
    border: '1px solid #d1d5db', 
    color: '#111827', 
    outline: 'none', 
    fontSize: '0.95rem',
    transition: 'border 0.2s'
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif", background: '#fff' }}>
      
      {/* Left Side: Branding & Value Proposition */}
      <div className="hide-mobile" style={{ 
        flex: '0 0 45%', 
        position: 'relative',
        backgroundImage: 'url(/hero_bg.png)', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        padding: '3rem 4rem',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Soft dark overlay to make text pop against the background */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 100%)' }}></div>
        
        <div style={{ position: 'relative', zIndex: 10 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', textDecoration: 'none', marginBottom: '5rem' }}>
            <Scale size={28} />
            <span style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '0.5px' }}>Hanka</span>
          </Link>

          <h2 style={{ fontSize: '1.8rem', fontWeight: 300, marginBottom: '3rem', lineHeight: 1.4 }}>
            With your new <span style={{ fontWeight: 600 }}>Hanka Enterprise</span><br/>
            Account, you get:
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Check size={20} color="#38bdf8" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.35rem' }}>Absolute Data Isolation</h3>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, maxWidth: '90%' }}>
                  Multi-tenant Qdrant collections ensure your proprietary data never leaks across organizational boundaries.
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Check size={20} color="#38bdf8" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.35rem' }}>Agentic RAG Engine</h3>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, maxWidth: '90%' }}>
                  Dynamic LLM routing catches hallucinations, enforces guardrails, and repairs broken flows before they reach users.
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Check size={20} color="#38bdf8" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.35rem' }}>90% Faster Test Execution</h3>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, maxWidth: '90%' }}>
                  Semantic caching intercepts recurring questions to drastically cut API costs and latency compared to standard setups.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', padding: '2rem', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>
          
          <h2 style={{ fontSize: '1.4rem', fontWeight: 400, color: '#111827', textAlign: 'center', marginBottom: '2.5rem' }}>
            {isLogin ? 'Log In to' : 'Get Started For Free with'}<br/>
            <span style={{ fontWeight: 600 }}>Hanka Enterprise</span>
          </h2>

          <form onSubmit={isLogin ? handleLogin : handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#4b5563', marginBottom: '0.5rem' }}>Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={e => setUsername(e.target.value)}
                required
                placeholder="Enter your username"
                style={inputStyle} 
                onFocus={e=>e.currentTarget.style.border='1px solid #3b82f6'}
                onBlur={e=>e.currentTarget.style.border='1px solid #d1d5db'}
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#4b5563', marginBottom: '0.5rem' }}>Email Address</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    style={inputStyle} 
                    onFocus={e=>e.currentTarget.style.border='1px solid #3b82f6'}
                    onBlur={e=>e.currentTarget.style.border='1px solid #d1d5db'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#4b5563', marginBottom: '0.5rem' }}>Workspace (Tenant) Name</label>
                  <input 
                    type="text" 
                    value={tenantName} 
                    onChange={e => setTenantName(e.target.value)}
                    required
                    placeholder="e.g. Apple, Tesla"
                    style={inputStyle} 
                    onFocus={e=>e.currentTarget.style.border='1px solid #3b82f6'}
                    onBlur={e=>e.currentTarget.style.border='1px solid #d1d5db'}
                  />
                </div>
              </>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#4b5563', marginBottom: '0.5rem' }}>
                Password
              </label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                style={inputStyle} 
                onFocus={e=>e.currentTarget.style.border='1px solid #3b82f6'}
                onBlur={e=>e.currentTarget.style.border='1px solid #d1d5db'}
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              style={{ 
                marginTop: '1rem', padding: '0.85rem', borderRadius: '4px', 
                background: '#0f172a', color: '#fff', border: 'none', 
                fontWeight: 500, fontSize: '0.95rem', cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
                transition: 'background 0.2s'
              }}
              onMouseOver={e=>{if(!isLoading) e.currentTarget.style.background='#1e293b'}}
              onMouseOut={e=>{if(!isLoading) e.currentTarget.style.background='#0f172a'}}
            >
              {isLoading ? 'Processing...' : 'Continue'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
            <span style={{ margin: '0 1rem', fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase' }}>{t('login.or')}</span>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
          </div>

          <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#4b5563' }}>
            {isLogin ? t('login.no_account') : t('login.have_account')}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              style={{ background: 'none', border: 'none', color: '#000', fontWeight: 600, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
            >
              {isLogin ? t('login.sign_up') : t('login.log_in')}
            </button>
          </div>
          
          <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.7rem', color: '#9ca3af', lineHeight: 1.6 }}>
            {t('login.terms_agree')} <br/>
            <Link to="/terms" style={{color: '#4b5563', fontWeight: 500, textDecoration: 'none'}}>{t('legal.terms_title')} {t('legal.terms_title_highlight')}</Link> {t('login.terms_and')} <Link to="/privacy" style={{color: '#4b5563', fontWeight: 500, textDecoration: 'none'}}>{t('legal.privacy_title')} {t('legal.privacy_title_highlight')}</Link>.
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
