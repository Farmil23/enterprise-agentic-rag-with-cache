import React, { useEffect } from 'react'
import { ArrowLeft, Scale, AlertTriangle, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function TermsOfService() {
    const navigate = useNavigate()

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    return (
        <div style={{ backgroundColor: '#05070f', color: '#fff', fontFamily: 'Inter, sans-serif', minHeight: '100vh', padding: '0 1rem' }}>
            
            {/* Minimal Header */}
            <header style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 0', display: 'flex', alignItems: 'center' }}>
                <button 
                    onClick={() => navigate('/')} 
                    style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', padding: '0.5rem 1rem 0.5rem 0', transition: 'color 0.2s' }}
                    onMouseOver={e=>e.currentTarget.style.color='#fff'}
                    onMouseOut={e=>e.currentTarget.style.color='#a1a1aa'}
                >
                    <ArrowLeft size={16} /> Back to Home
                </button>
            </header>

            <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 0 6rem 0' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: 300, letterSpacing: '-1px', margin: '0 0 1rem 0' }}>Terms of <span style={{fontWeight: 700}}>Service</span></h1>
                <p style={{ color: '#a1a1aa', fontSize: '1.1rem', marginBottom: '3rem' }}>Effective Date: August 2026</p>

                <div style={{ background: 'rgba(168, 85, 247, 0.05)', border: '1px solid rgba(168, 85, 247, 0.2)', padding: '1.5rem', borderRadius: '1rem', marginBottom: '3rem', display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                    <Scale size={32} color="#a855f7" style={{ flexShrink: 0, marginTop: '0.25rem' }} />
                    <div>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: '#c084fc' }}>B2B Enterprise Agreement</h3>
                        <p style={{ margin: 0, color: '#d4d4d8', lineHeight: 1.6 }}>By provisioning a Tenant instance on Hanka AI, your organization agrees to these terms. These terms govern API usage, SLA limits, and the responsibilities of Tenant Administrators in managing their authorized users.</p>
                    </div>
                </div>

                <div className="legal-content">
                    <h2>1. Acceptance of Terms</h2>
                    <p>By accessing or using the Hanka AI platform ("Service"), you agree to be bound by these Terms of Service. If you are entering into this agreement on behalf of a company or other legal entity, you represent that you have the authority to bind such entity to these terms.</p>

                    <h2>2. Provision of Service</h2>
                    <p>Hanka AI provides an enterprise-grade Retrieval-Augmented Generation (RAG) platform. We grant you a non-exclusive, non-transferable, revocable license to access and use the Service strictly in accordance with your subscription tier and these Terms.</p>

                    <h2>3. Tenant Administrator Responsibilities</h2>
                    <ul>
                        <li><strong>User Access:</strong> Tenant Administrators are solely responsible for approving, managing, and revoking access for their users within the Hanka AI platform.</li>
                        <li><strong>Content Legality:</strong> You are responsible for all documents and data uploaded to your Tenant Knowledge Base. You must not upload data that violates intellectual property rights, contains malicious code, or breaches regulatory compliance (e.g., unauthorized PHI).</li>
                        <li><strong>API Key Security:</strong> Tenant Administrators must safeguard their API keys. Hanka AI is not liable for unauthorized access resulting from compromised credentials.</li>
                    </ul>

                    <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '1.5rem', borderRadius: '1rem', margin: '2rem 0', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #ef4444' }}>
                        <AlertTriangle size={24} color="#ef4444" />
                        <p style={{ margin: 0, color: '#e4e4e7' }}>Strictly prohibited: Reverse-engineering the platform, attempting to access cross-tenant data, or using the Service to generate malicious, illegal, or harmful content.</p>
                    </div>

                    <h2>4. Availability and SLA</h2>
                    <p>We strive to ensure 99.9% uptime for the Service. However, the Service is highly dependent on third-party LLM providers (e.g., OpenAI, Google). Hanka AI is not liable for downtimes or degraded performance resulting directly from upstream provider outages.</p>

                    <h2>5. Intellectual Property</h2>
                    <p>Hanka AI retains all rights, title, and interest in and to the platform, including all underlying software, algorithms, and UI designs. You retain all rights and ownership to the data and documents you upload to the platform.</p>

                    <h2>6. Limitation of Liability</h2>
                    <p>To the maximum extent permitted by law, Hanka AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising out of your use or inability to use the Service.</p>
                    
                    <h2>7. Changes to Terms</h2>
                    <p>We reserve the right to modify these Terms at any time. Significant changes will be communicated to Tenant Administrators via email or through an in-app notification at least 30 days prior to taking effect.</p>
                </div>
            </main>

            <style>{`
                .legal-content h2 {
                    font-size: 1.5rem;
                    color: #fff;
                    margin: 2.5rem 0 1rem 0;
                    font-weight: 600;
                }
                .legal-content p {
                    color: #a1a1aa;
                    line-height: 1.7;
                    margin-bottom: 1.25rem;
                    font-size: 1.05rem;
                }
                .legal-content ul {
                    color: #a1a1aa;
                    line-height: 1.7;
                    margin-bottom: 1.25rem;
                    font-size: 1.05rem;
                    padding-left: 1.5rem;
                }
                .legal-content li {
                    margin-bottom: 0.5rem;
                }
                .legal-content strong {
                    color: #e4e4e7;
                }
            `}</style>
        </div>
    )
}
