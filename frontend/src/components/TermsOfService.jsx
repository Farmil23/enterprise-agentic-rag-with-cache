import React, { useEffect } from 'react'
import { ArrowLeft, Scale, AlertTriangle, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const content = {
    en: {
        back: "Back to Home",
        title_1: "Terms of ",
        title_2: "Service",
        updated: "Effective Date: August 2026",
        box_title: "B2B Enterprise Agreement",
        box_desc: "By provisioning a Tenant instance on Hanka AI, your organization agrees to these terms. These terms govern API usage, SLA limits, and the responsibilities of Tenant Administrators in managing their authorized users.",
        h1: "1. Acceptance of Terms",
        p1: "By accessing or using the Hanka AI platform (\"Service\"), you agree to be bound by these Terms of Service. If you are entering into this agreement on behalf of a company or other legal entity, you represent that you have the authority to bind such entity to these terms.",
        h2: "2. Provision of Service",
        p2: "Hanka AI provides an enterprise-grade Retrieval-Augmented Generation (RAG) platform. We grant you a non-exclusive, non-transferable, revocable license to access and use the Service strictly in accordance with your subscription tier and these Terms.",
        h3: "3. Tenant Administrator Responsibilities",
        li3_1: "Tenant Administrators are solely responsible for approving, managing, and revoking access for their users within the Hanka AI platform.",
        li3_2: "You are responsible for all documents and data uploaded to your Tenant Knowledge Base. You must not upload data that violates intellectual property rights, contains malicious code, or breaches regulatory compliance (e.g., unauthorized PHI).",
        li3_3: "Tenant Administrators must safeguard their API keys. Hanka AI is not liable for unauthorized access resulting from compromised credentials.",
        box2: "Strictly prohibited: Reverse-engineering the platform, attempting to access cross-tenant data, or using the Service to generate malicious, illegal, or harmful content.",
        h4: "4. Availability and SLA",
        p4: "We strive to ensure 99.9% uptime for the Service. However, the Service is highly dependent on third-party LLM providers (e.g., OpenAI, Google). Hanka AI is not liable for downtimes or degraded performance resulting directly from upstream provider outages.",
        h5: "5. Intellectual Property",
        p5: "Hanka AI retains all rights, title, and interest in and to the platform, including all underlying software, algorithms, and UI designs. You retain all rights and ownership to the data and documents you upload to the platform.",
        h6: "6. Limitation of Liability",
        p6: "To the maximum extent permitted by law, Hanka AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising out of your use or inability to use the Service.",
        h7: "7. Changes to Terms",
        p7: "We reserve the right to modify these Terms at any time. Significant changes will be communicated to Tenant Administrators via email or through an in-app notification at least 30 days prior to taking effect."
    },
    id: {
        back: "Kembali ke Beranda",
        title_1: "Ketentuan ",
        title_2: "Layanan",
        updated: "Tanggal Berlaku: Agustus 2026",
        box_title: "Perjanjian Perusahaan B2B",
        box_desc: "Dengan menyediakan instans Tenant di Hanka AI, organisasi Anda menyetujui persyaratan ini. Persyaratan ini mengatur penggunaan API, batas SLA, dan tanggung jawab Administrator Tenant dalam mengelola pengguna sah mereka.",
        h1: "1. Penerimaan Syarat",
        p1: "Dengan mengakses atau menggunakan platform Hanka AI (\"Layanan\"), Anda setuju untuk terikat oleh Ketentuan Layanan ini. Jika Anda menyetujui perjanjian ini atas nama perusahaan atau badan hukum lainnya, Anda menyatakan bahwa Anda memiliki kewenangan untuk mengikat entitas tersebut pada persyaratan ini.",
        h2: "2. Penyediaan Layanan",
        p2: "Hanka AI menyediakan platform Retrieval-Augmented Generation (RAG) tingkat perusahaan. Kami memberi Anda lisensi non-eksklusif, tidak dapat dialihkan, dan dapat dibatalkan untuk mengakses dan menggunakan Layanan secara ketat sesuai dengan tingkat langganan Anda dan Ketentuan ini.",
        h3: "3. Tanggung Jawab Administrator Tenant",
        li3_1: "Administrator Tenant sepenuhnya bertanggung jawab untuk menyetujui, mengelola, dan mencabut akses untuk pengguna mereka di dalam platform Hanka AI.",
        li3_2: "Anda bertanggung jawab atas semua dokumen dan data yang diunggah ke Basis Pengetahuan Tenant Anda. Anda tidak boleh mengunggah data yang melanggar hak kekayaan intelektual, mengandung kode berbahaya, atau melanggar kepatuhan peraturan (misalnya, PHI yang tidak sah).",
        li3_3: "Administrator Tenant harus menjaga kunci API mereka. Hanka AI tidak bertanggung jawab atas akses tidak sah yang diakibatkan oleh kredensial yang disusupi.",
        box2: "Sangat dilarang: Melakukan rekayasa balik pada platform, mencoba mengakses data lintas tenant, atau menggunakan Layanan untuk menghasilkan konten yang berbahaya, ilegal, atau merusak.",
        h4: "4. Ketersediaan dan SLA",
        p4: "Kami berusaha keras untuk memastikan waktu aktif 99,9% untuk Layanan. Namun, Layanan ini sangat bergantung pada penyedia LLM pihak ketiga (misalnya, OpenAI, Google). Hanka AI tidak bertanggung jawab atas waktu henti atau penurunan kinerja yang diakibatkan langsung oleh pemadaman penyedia hulu.",
        h5: "5. Kekayaan Intelektual",
        p5: "Hanka AI memiliki semua hak, kepemilikan, dan kepentingan di dalam dan pada platform, termasuk semua perangkat lunak yang mendasarinya, algoritma, dan desain UI. Anda memegang semua hak dan kepemilikan atas data dan dokumen yang Anda unggah ke platform.",
        h6: "6. Batasan Tanggung Jawab",
        p6: "Sejauh diizinkan oleh hukum, Hanka AI tidak bertanggung jawab atas kerusakan tidak langsung, insidental, khusus, konsekuensial, atau hukuman, termasuk hilangnya keuntungan, data, atau niat baik, yang timbul dari penggunaan atau ketidakmampuan Anda untuk menggunakan Layanan.",
        h7: "7. Perubahan Ketentuan",
        p7: "Kami berhak untuk mengubah Ketentuan ini kapan saja. Perubahan signifikan akan dikomunikasikan kepada Administrator Tenant melalui email atau melalui pemberitahuan dalam aplikasi setidaknya 30 hari sebelum berlaku."
    }
}

export default function TermsOfService() {
    const navigate = useNavigate()
    const { i18n } = useTranslation()
    const t = content[i18n.language.startsWith('id') ? 'id' : 'en']

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
                    <ArrowLeft size={16} /> {t.back}
                </button>
            </header>

            <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 0 6rem 0' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: 300, letterSpacing: '-1px', margin: '0 0 1rem 0' }}>{t.title_1}<span style={{fontWeight: 700}}>{t.title_2}</span></h1>
                <p style={{ color: '#a1a1aa', fontSize: '1.1rem', marginBottom: '3rem' }}>{t.updated}</p>

                <div style={{ background: 'rgba(168, 85, 247, 0.05)', border: '1px solid rgba(168, 85, 247, 0.2)', padding: '1.5rem', borderRadius: '1rem', marginBottom: '3rem', display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                    <Scale size={32} color="#a855f7" style={{ flexShrink: 0, marginTop: '0.25rem' }} />
                    <div>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: '#c084fc' }}>{t.box_title}</h3>
                        <p style={{ margin: 0, color: '#d4d4d8', lineHeight: 1.6 }}>{t.box_desc}</p>
                    </div>
                </div>

                <div className="legal-content">
                    <h2>{t.h1}</h2>
                    <p>{t.p1}</p>

                    <h2>{t.h2}</h2>
                    <p>{t.p2}</p>

                    <h2>{t.h3}</h2>
                    <ul>
                        <li><strong>User Access:</strong> {t.li3_1}</li>
                        <li><strong>Content Legality:</strong> {t.li3_2}</li>
                        <li><strong>API Key Security:</strong> {t.li3_3}</li>
                    </ul>

                    <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '1.5rem', borderRadius: '1rem', margin: '2rem 0', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #ef4444' }}>
                        <AlertTriangle size={24} color="#ef4444" />
                        <p style={{ margin: 0, color: '#e4e4e7' }}>{t.box2}</p>
                    </div>

                    <h2>{t.h4}</h2>
                    <p>{t.p4}</p>

                    <h2>{t.h5}</h2>
                    <p>{t.p5}</p>

                    <h2>{t.h6}</h2>
                    <p>{t.p6}</p>
                    
                    <h2>{t.h7}</h2>
                    <p>{t.p7}</p>
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
