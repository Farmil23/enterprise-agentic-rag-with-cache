import React, { useEffect } from 'react'
import { ArrowLeft, Shield, Lock, Server } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function PrivacyPolicy() {
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
                <h1 style={{ fontSize: '3rem', fontWeight: 300, letterSpacing: '-1px', margin: '0 0 1rem 0' }}>Privacy <span style={{fontWeight: 700}}>Policy</span></h1>
                <p style={{ color: '#a1a1aa', fontSize: '1.1rem', marginBottom: '3rem' }}>Last Updated: August 2026</p>

                <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '1.5rem', borderRadius: '1rem', marginBottom: '3rem', display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                    <Shield size={32} color="#3b82f6" style={{ flexShrink: 0, marginTop: '0.25rem' }} />
                    <div>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: '#60a5fa' }}>Enterprise Data Commitment</h3>
                        <p style={{ margin: 0, color: '#d4d4d8', lineHeight: 1.6 }}>Hanka AI provides a strictly isolated multi-tenant environment. <strong>We do not use your proprietary documents, prompts, or chat history to train any public or foundational AI models.</strong> Your data remains exclusively yours.</p>
                    </div>
                </div>

                <div className="legal-content">
                    <h2>1. Introduction</h2>
                    <p>Welcome to Hanka AI ("we," "our," or "us"). We are committed to protecting the privacy and security of the data entrusted to us by our enterprise clients ("Tenants") and their authorized users. This Privacy Policy explains how we collect, use, process, and protect your information when you use our Enterprise Agentic RAG SaaS platform.</p>

                    <h2>2. Information We Collect</h2>
                    <ul>
                        <li><strong>Account Information:</strong> Name, email address, and authentication credentials for Tenant Administrators and Users.</li>
                        <li><strong>Enterprise Knowledge Base (RAG Data):</strong> Documents, PDFs, text files, and other proprietary materials uploaded by Tenant Administrators.</li>
                        <li><strong>Interaction Logs:</strong> Chat queries, system responses, and session metadata generated during the use of our AI assistants.</li>
                        <li><strong>Technical Data:</strong> IP addresses, browser types, and usage analytics for system monitoring and security.</li>
                    </ul>

                    <h2>3. How We Use Your Information</h2>
                    <p>Hanka AI strictly uses collected data to provide, maintain, and improve the specific services requested by the Tenant. Specifically:</p>
                    <ul>
                        <li>To generate context-aware AI responses based <em>only</em> on the specific Tenant's uploaded knowledge base.</li>
                        <li>To provide Tenant Administrators with auditing and monitoring capabilities regarding their users' activities.</li>
                        <li>To ensure system security, prevent fraud, and troubleshoot technical issues.</li>
                    </ul>

                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1.5rem', borderRadius: '1rem', margin: '2rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Lock size={24} color="#a855f7" />
                        <p style={{ margin: 0, color: '#e4e4e7' }}>Data uploaded to Hanka AI is cryptographically isolated per tenant using Qdrant vector spaces and strictly partitioned SQL databases.</p>
                    </div>

                    <h2>4. Data Isolation and AI Processing</h2>
                    <p>As an enterprise RAG provider, data segregation is our highest priority:</p>
                    <ul>
                        <li><strong>Zero Cross-Contamination:</strong> Documents uploaded by Tenant A can never be queried, accessed, or inferred by Tenant B.</li>
                        <li><strong>Zero Model Training:</strong> Hanka AI utilizes frozen foundational models (via our LLM partners). We have binding agreements ensuring that data passed through their APIs is <strong>never</strong> retained for training purposes.</li>
                    </ul>

                    <h2>5. Data Retention and Deletion</h2>
                    <p>We retain Tenant data only for as long as the Tenant maintains an active subscription or as required by law. Upon termination of a contract, or upon explicit request by a Tenant Administrator, all associated documents, vector embeddings, and chat logs are permanently destroyed from our active servers and backups within 30 days.</p>

                    <h2>6. Contact Us</h2>
                    <p>For questions regarding this Privacy Policy or to exercise your enterprise data rights, please contact our Data Protection Officer at privacy@hanka.ai.</p>
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
