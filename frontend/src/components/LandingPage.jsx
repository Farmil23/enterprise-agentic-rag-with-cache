import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Scale, ShieldCheck, Database, BarChart3, ChevronRight, Globe, Lock, Workflow, Network, Layers, CheckCircle2, Play, Plus, X, MessageSquare, Heart, Menu } from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()
  const [isDemoLoading, setIsDemoLoading] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { t, i18n } = useTranslation()

  useEffect(() => {
    // Show popup after 10 seconds
    const timer = setTimeout(() => setShowPopup(true), 10000)
    return () => clearTimeout(timer)
  }, [])

  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const handleDemoLogin = async () => {
    setIsDemoLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'demo@enterprise.com', password: 'demo' })
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('rag_jwt', data.access_token)
        localStorage.setItem('rag_role', data.role)
        localStorage.setItem('rag_tenant', data.tenant_id)
        localStorage.removeItem('rag_has_seen_onboarding')
        navigate('/chat')
      } else {
        alert(t('landing.alert_demo_not_ready'))
      }
    } catch (error) {
      console.error(error)
      alert(t('landing.alert_error_server'))
    } finally {
      setIsDemoLoading(false)
    }
  }

  const toggleFaq = (idx) => {
      if (openFaq === idx) setOpenFaq(null)
      else setOpenFaq(idx)
  }

  const faqs = [
      { q: t('landing.faq_q1'), a: t('landing.faq_a1') },
      { q: t('landing.faq_q2'), a: t('landing.faq_a2') },
      { q: t('landing.faq_q3'), a: t('landing.faq_a3') },
      { q: t('landing.faq_q4'), a: t('landing.faq_a4') }
  ]

  return (
    <div style={{ position: 'relative', width: '100vw', minHeight: '100vh', backgroundColor: '#050714', color: '#f8fafc', fontFamily: "'Inter', sans-serif", overflowX: 'hidden' }}>
      
      {/* Navbar */}
      <nav className="navbar" style={{ position: 'sticky', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 4rem', zIndex: 100, background: 'rgba(5, 7, 20, 0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', zIndex: 101 }} onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <Scale size={28} color="#e2e8f0" />
          <span style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '0.5px', color: '#f8fafc' }}>Hanka</span>
        </div>
        
        {/* Desktop Links */}
        <div className="nav-links hide-mobile" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <button onClick={() => scrollToSection('features')} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e=>e.currentTarget.style.color='#fff'} onMouseOut={e=>e.currentTarget.style.color='#94a3b8'}>{t('landing.nav_features')}</button>
          <button onClick={() => scrollToSection('faq')} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e=>e.currentTarget.style.color='#fff'} onMouseOut={e=>e.currentTarget.style.color='#94a3b8'}>{t('landing.faq_title')}</button>
          <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontWeight: 500, padding: '0.5rem 1.25rem', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.05)'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
            {t('landing.hero_btn_book')}
          </button>
        </div>

        {/* Right Action & Mobile Menu Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 101 }}>
          <button 
              onClick={() => i18n.changeLanguage(i18n.language.startsWith('id') ? 'en' : 'id')}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '4px', padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s' }}
              onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.05)'} 
              onMouseOut={e=>e.currentTarget.style.background='transparent'}
          >
              {i18n.language.startsWith('id') ? 'EN' : 'ID'}
          </button>
          <Link to="/login" className="get-started-btn" style={{ textDecoration: 'none', background: '#e2e8f0', color: '#0f172a', fontWeight: 600, padding: '0.55rem 1.5rem', borderRadius: '4px', transition: 'all 0.2s' }} onMouseOver={e=>{e.currentTarget.style.background='#fff'}} onMouseOut={e=>{e.currentTarget.style.background='#e2e8f0'}}>
            {t('landing.nav_get_started')}
          </Link>
          <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={{ background: 'none', border: 'none', color: '#f8fafc', cursor: 'pointer', display: 'none', alignItems: 'center', justifyContent: 'center' }}>
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="mobile-menu" style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'rgba(5, 7, 20, 0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button onClick={() => { scrollToSection('features'); setIsMobileMenuOpen(false); }} style={{ background: 'none', border: 'none', color: '#f8fafc', fontSize: '1.2rem', fontWeight: 500, cursor: 'pointer', textAlign: 'left' }}>{t('landing.mobile_solutions')}</button>
            <button onClick={() => { scrollToSection('faq'); setIsMobileMenuOpen(false); }} style={{ background: 'none', border: 'none', color: '#f8fafc', fontSize: '1.2rem', fontWeight: 500, cursor: 'pointer', textAlign: 'left' }}>{t('landing.mobile_faq')}</button>
            <button onClick={() => setIsMobileMenuOpen(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontWeight: 500, padding: '0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '1.1rem', textAlign: 'center', marginTop: '1rem' }}>
              {t('landing.mobile_book')}
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <main className="hero-section" style={{ 
          position: 'relative', 
          padding: '6rem 4rem 8rem', 
          display: 'flex', 
          alignItems: 'center', 
          minHeight: '85vh',
          backgroundImage: 'url(/hero_bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
      }}>
        {/* Dark overlay for readability */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(5,7,20,0.95) 0%, rgba(5,7,20,0.4) 60%, transparent 100%)', zIndex: 0 }}></div>
        
        <div className="hero-container" style={{ position: 'relative', zIndex: 10, display: 'flex', width: '100%', maxWidth: '1400px', margin: '0 auto', gap: '4rem' }}>
            <div className="hero-text" style={{ flex: '1', maxWidth: '650px', animation: 'fadeInUp 0.6s ease-out' }}>
                <h1 className="hero-title" style={{ fontSize: '4.5rem', fontWeight: 300, lineHeight: 1.1, margin: '0 0 1.5rem 0', letterSpacing: '-1.5px', color: '#fff' }}>
                  {t('landing.hero_title_1')}<br/>
                  <span style={{ fontWeight: 600 }}>{t('landing.hero_title_2')}</span>
              </h1>
              <p className="hero-subtitle" style={{ fontSize: '1.15rem', color: '#94a3b8', lineHeight: 1.6, margin: '0 0 2.5rem 0', maxWidth: '500px' }}>
                  {t('landing.hero_subtitle')}
              </p>
              
              <div className="hero-buttons" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <button 
                      onClick={handleDemoLogin} 
                      disabled={isDemoLoading}
                      style={{ 
                          background: '#2563eb', color: '#fff', border: 'none', padding: '0.85rem 1.75rem', 
                          borderRadius: '4px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', 
                          cursor: isDemoLoading ? 'wait' : 'pointer', transition: 'all 0.2s' 
                      }} 
                      onMouseOver={e=>{if(!isDemoLoading){e.currentTarget.style.background='#1d4ed8'}}} 
                      onMouseOut={e=>{if(!isDemoLoading){e.currentTarget.style.background='#2563eb'}}}
                  >
                      {isDemoLoading ? t('landing.btn_loading') : t('landing.hero_btn_demo')} 
                      <ChevronRight size={16} />
                  </button>
                  <Link to="/login" style={{ textDecoration: 'none', background: '#fff', color: '#0f172a', fontWeight: 500, padding: '0.85rem 1.75rem', borderRadius: '4px', fontSize: '1rem', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }} onMouseOver={e=>{e.currentTarget.style.background='#f1f5f9'}} onMouseOut={e=>{e.currentTarget.style.background='#fff'}}>
                      {t('landing.hero_btn_email')}
                  </Link>
              </div>
            </div>

            {/* Right side floating UI */}
            <div className="hero-mockup" style={{ flex: '1', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 1s ease-out' }}>
                <div style={{ 
                    background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '600px',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', transform: 'perspective(1000px) rotateY(-5deg)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>{t('landing.stats_avg_latency')}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#38bdf8' }}>1350 <span style={{ fontSize: '0.8rem', color: '#64748b' }}>ms</span></div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>{t('landing.stats_acc_score')}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#10b981' }}>99.8 <span style={{ fontSize: '0.8rem', color: '#64748b' }}>%</span></div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>{t('landing.stats_cache_hit')}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#a855f7' }}>93 <span style={{ fontSize: '0.8rem', color: '#64748b' }}>%</span></div>
                        </div>
                    </div>
                    
                    <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#e2e8f0' }}>{t('landing.stats_quality')}</div>
                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                                <span>{t('landing.stats_bias')}</span> <span style={{ color: '#10b981' }}>{t('landing.stats_passed')}</span>
                            </div>
                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                                <span>{t('landing.stats_hallucination')}</span> <span style={{ color: '#10b981' }}>{t('landing.stats_passed')}</span>
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#e2e8f0' }}>{t('landing.stats_understanding')}</div>
                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                                <span>{t('landing.stats_completeness')}</span> <span style={{ color: '#38bdf8' }}>{t('landing.stats_high')}</span>
                            </div>
                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                                <span>{t('landing.stats_context')}</span> <span style={{ color: '#38bdf8' }}>{t('landing.stats_high')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </main>

      {/* Features Grid */}
      <section id="features" className="section-padding" style={{ padding: '6rem 4rem', background: '#0a0d1c', position: 'relative', zIndex: 10 }}>
        <h2 className="section-title" style={{ textAlign: 'center', fontSize: '2.8rem', fontWeight: 400, marginBottom: '4rem', color: '#f8fafc' }}>
            {t('landing.features_main_title')}
        </h2>
        
        <div className="features-grid" style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)' }}>
            
            <div style={{ background: '#0a0d1c', padding: '3rem 2rem', transition: 'background 0.3s' }} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'} onMouseOut={e=>e.currentTarget.style.background='#0a0d1c'}>
                <Database size={24} color="#64748b" style={{ marginBottom: '1.5rem' }} />
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: 400 }}>{t('landing.f1_t')}</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>{t('landing.f1_d')}</p>
            </div>
            
            <div style={{ background: '#0a0d1c', padding: '3rem 2rem', transition: 'background 0.3s' }} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'} onMouseOut={e=>e.currentTarget.style.background='#0a0d1c'}>
                <Layers size={24} color="#64748b" style={{ marginBottom: '1.5rem' }} />
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: 400 }}>{t('landing.f2_t')}</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>{t('landing.f2_d')}</p>
            </div>
            
            <div style={{ background: '#0a0d1c', padding: '3rem 2rem', transition: 'background 0.3s' }} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'} onMouseOut={e=>e.currentTarget.style.background='#0a0d1c'}>
                <ShieldCheck size={24} color="#64748b" style={{ marginBottom: '1.5rem' }} />
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: 400 }}>{t('landing.f3_t')}</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>{t('landing.f3_d')}</p>
            </div>
            
            <div style={{ background: '#0a0d1c', padding: '3rem 2rem', transition: 'background 0.3s' }} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'} onMouseOut={e=>e.currentTarget.style.background='#0a0d1c'}>
                <Lock size={24} color="#64748b" style={{ marginBottom: '1.5rem' }} />
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: 400 }}>{t('landing.f4_t')}</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>{t('landing.f4_d')}</p>
            </div>
            
            <div style={{ background: '#0a0d1c', padding: '3rem 2rem', transition: 'background 0.3s' }} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'} onMouseOut={e=>e.currentTarget.style.background='#0a0d1c'}>
                <Workflow size={24} color="#64748b" style={{ marginBottom: '1.5rem' }} />
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: 400 }}>{t('landing.f5_t')}</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>{t('landing.f5_d')}</p>
            </div>
            
            <div style={{ background: '#0a0d1c', padding: '3rem 2rem', transition: 'background 0.3s' }} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'} onMouseOut={e=>e.currentTarget.style.background='#0a0d1c'}>
                <BarChart3 size={24} color="#64748b" style={{ marginBottom: '1.5rem' }} />
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: 400 }}>{t('landing.f6_t')}</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>{t('landing.f6_d')}</p>
            </div>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
            <button style={{ background: '#fff', color: '#000', border: 'none', padding: '1rem 2rem', fontSize: '1rem', fontWeight: 500, borderRadius: '4px', cursor: 'pointer' }}>
                {t('landing.btn_start_free')}
            </button>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="section-padding" style={{ padding: '6rem 4rem', background: '#050714', position: 'relative' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                  <h2 className="section-title" style={{ fontSize: '2.5rem', fontWeight: 300, color: '#fff', marginBottom: '1rem' }}>{t('landing.faq_title')}</h2>
              </div>
              <div style={{ flex: '2', display: 'flex', flexDirection: 'column' }}>
                  {faqs.map((faq, idx) => (
                      <div key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                          <button 
                              onClick={() => toggleFaq(idx)}
                              style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', color: '#f8fafc', fontSize: '1.1rem', padding: '1.5rem 0', cursor: 'pointer', textAlign: 'left' }}
                          >
                              {faq.q}
                              <Plus size={18} style={{ transform: openFaq === idx ? 'rotate(45deg)' : 'none', transition: 'transform 0.3s' }} />
                          </button>
                          <div style={{ maxHeight: openFaq === idx ? '200px' : '0', overflow: 'hidden', transition: 'max-height 0.3s ease-in-out' }}>
                              <p style={{ paddingBottom: '1.5rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                                  {faq.a}
                              </p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* Footer CTA Section */}
      <section className="cta-section" style={{ padding: '8rem 4rem', background: 'linear-gradient(to bottom, #050714, #0a0d1c)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 10 }}>
              <h2 style={{ fontSize: '3.5rem', fontWeight: 300, color: '#fff', marginBottom: '1.5rem', letterSpacing: '-1px' }}>{t('landing.cta_title')}</h2>
              <p style={{ fontSize: '1.2rem', color: '#94a3b8', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem auto', lineHeight: 1.6 }}>{t('landing.cta_subtitle')}</p>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <Link to="/login" style={{ textDecoration: 'none', background: '#fff', color: '#000', padding: '1rem 2rem', borderRadius: '4px', fontWeight: 600, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'transform 0.2s' }} onMouseOver={e=>e.currentTarget.style.transform='translateY(-2px)'} onMouseOut={e=>e.currentTarget.style.transform='none'}>
                      {t('landing.hero_btn_email')}
                  </Link>
                  <button onClick={handleDemoLogin} disabled={isDemoLoading} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '1rem 2rem', borderRadius: '4px', fontWeight: 500, fontSize: '1.05rem', cursor: isDemoLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }} onMouseOver={e=>{if(!isDemoLoading){e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.4)'}}} onMouseOut={e=>{if(!isDemoLoading){e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='rgba(255,255,255,0.2)'}}}>
                      {isDemoLoading ? <div style={{width:'18px',height:'18px',border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid #fff',borderRadius:'50%',animation:'spin 1s linear infinite'}}/> : <Globe size={18}/>}
                      {t('landing.hero_btn_demo')}
                  </button>
              </div>
          </div>
      </section>

      {/* Simple Footer Bar */}
      <footer className="footer-bar" style={{ 
          background: '#02040a', 
          borderTop: '1px solid rgba(255,255,255,0.05)', 
          padding: '1.5rem 4rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          fontSize: '0.85rem',
          color: '#64748b'
      }}>
          <div className="footer-logo-text" style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
              <div style={{ background: '#1e293b', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquare size={20} color="#e2e8f0" />
              </div>
              <span>{t('landing.footer_copyright')}</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {t('landing.footer_built_with')} <Heart size={14} color="#ef4444" fill="#ef4444" /> {t('landing.footer_for_enterprises')}
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <Link to="/privacy" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e=>e.currentTarget.style.color='#fff'} onMouseOut={e=>e.currentTarget.style.color='#94a3b8'}>{t('landing.footer_privacy')}</Link>
              <Link to="/terms" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e=>e.currentTarget.style.color='#fff'} onMouseOut={e=>e.currentTarget.style.color='#94a3b8'}>{t('landing.footer_terms')}</Link>
          </div>
      </footer>

      {/* Pop-Up Modal (Shows after 10 seconds) */}
      {showPopup && (
          <div style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
              zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.4s ease-out'
          }}>
              <div className="modal-container" style={{
                  background: '#0a0d1c', width: '900px', maxWidth: '90%', height: '550px', maxHeight: '90vh',
                  borderRadius: '16px', overflow: 'hidden', display: 'flex', position: 'relative',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)'
              }}>
                  <button 
                      onClick={() => setShowPopup(false)}
                      style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', zIndex: 20
                  }}>
                      <X size={20} />
                  </button>
                  
                  {/* Left Content */}
                  <div className="modal-content" style={{ flex: 1, padding: '4rem 3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '0.35rem 0.85rem', borderRadius: '2rem', fontSize: '0.75rem', width: 'fit-content', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          {t('landing.modal_badge')}
                      </div>
                      <h2 className="modal-title" style={{ fontSize: '2.5rem', fontWeight: 300, lineHeight: 1.1, marginBottom: '1rem' }}>
                          {t('landing.modal_title_1')}<span style={{ fontWeight: 600 }}>{t('landing.modal_title_2')}</span><br/>
                          <span style={{ fontWeight: 600 }}>{t('landing.modal_title_3')}</span>{t('landing.modal_title_4')}<br/>
                          {t('landing.modal_title_5')}
                      </h2>
                      <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
                          {t('landing.modal_desc')}
                      </p>
                      
                      <button 
                        onClick={handleDemoLogin}
                        style={{ background: '#fff', color: '#000', border: 'none', padding: '1rem', borderRadius: '4px', fontWeight: 500, fontSize: '1rem', marginBottom: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                          <Scale size={18} /> {t('landing.modal_btn_demo')}
                      </button>
                      
                      <Link to="/login" style={{ textDecoration: 'none', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '1rem', borderRadius: '4px', fontWeight: 500, fontSize: '1rem', textAlign: 'center' }}>
                          {t('landing.modal_btn_email')}
                      </Link>
                  </div>
                  
                  {/* Right Image */}
                  <div className="modal-image" style={{ 
                      flex: 1, 
                      backgroundImage: 'url(/modal_bg.png)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative'
                  }}>
                      {/* Subtle gradient overlay to blend */}
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #0a0d1c 0%, transparent 20%)' }}></div>
                  </div>
              </div>
          </div>
      )}

      <style>{`
        * { box-sizing: border-box; }
        @keyframes fadeInUp { 
            from { opacity: 0; transform: translateY(20px); } 
            to { opacity: 1; transform: translateY(0); } 
        }
        @keyframes fadeIn { 
            from { opacity: 0; } 
            to { opacity: 1; } 
        }

        /* Mobile Responsiveness */
        @media (max-width: 1024px) {
            .features-grid { grid-template-columns: repeat(2, 1fr) !important; }
            .hero-title { fontSize: 3.5rem !important; }
            .cta-title { fontSize: 3rem !important; }
        }

        @media (max-width: 768px) {
            .navbar { padding: 1rem 1.5rem !important; }
            .nav-links { display: none !important; }
            .hide-mobile { display: none !important; }
            .mobile-menu-toggle { display: flex !important; }
            .get-started-btn { padding: 0.4rem 0.8rem !important; font-size: 0.85rem !important; }
            
            .section-padding { padding: 4rem 1.5rem !important; }
            .hero-section { padding: 4rem 1.5rem 5rem !important; }
            .hero-container { flex-direction: column !important; gap: 3rem !important; }
            .hero-title { font-size: 2.8rem !important; }
            .hero-subtitle { font-size: 1rem !important; margin-bottom: 1.5rem !important; }
            .hero-buttons { flex-direction: column !important; }
            .hero-buttons button, .hero-buttons a { width: 100% !important; justify-content: center !important; }
            .hero-mockup { width: 100% !important; transform: none !important; }
            .hero-mockup > div { transform: none !important; }
            .stats-grid { grid-template-columns: 1fr !important; }

            .section-title { font-size: 2.2rem !important; margin-bottom: 2rem !important; }
            .text-left { text-align: left !important; }
            .features-grid { grid-template-columns: 1fr !important; }
            
            .faq-container { flex-direction: column !important; gap: 2rem !important; }

            .cta-container { flex-direction: column !important; gap: 2rem !important; }
            .cta-title { font-size: 2.2rem !important; }
            .cta-list { font-size: 1.2rem !important; }
            .cta-glass-box { width: 100% !important; }

            .footer-bar { flex-direction: column !important; gap: 1.5rem !important; padding: 2rem 1.5rem !important; text-align: center !important; }
            .footer-logo-text { flex-direction: column !important; gap: 1rem !important; }

            .modal-container { flex-direction: column !important; overflow-y: auto !important; height: auto !important; max-height: 85vh !important; }
            .modal-image { display: none !important; }
            .modal-content { padding: 2rem 1.5rem !important; }
            .modal-title { font-size: 2rem !important; }
        }
      `}</style>
    </div>
  )
}

function Users({size, color, style}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
    )
}
