import React, { useEffect } from 'react'
import { ArrowLeft, Shield, Lock, Server } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const content = {
    en: {
        back: "Back to Home",
        title_1: "Privacy ",
        title_2: "Policy",
        updated: "Last Updated: August 2026",
        box_title: "Enterprise Data Commitment",
        box_desc: "Hanka AI provides a strictly isolated multi-tenant environment. We do not use your proprietary documents, prompts, or chat history to train any public or foundational AI models. Your data remains exclusively yours.",
        h1: "1. Introduction",
        p1: "Welcome to Hanka AI (\"we,\" \"our,\" or \"us\"). We are committed to protecting the privacy and security of the data entrusted to us by our enterprise clients (\"Tenants\") and their authorized users. This Privacy Policy explains how we collect, use, process, and protect your information when you use our Enterprise Agentic RAG SaaS platform.",
        h2: "2. Information We Collect",
        li2_1: "Name, email address, and authentication credentials for Tenant Administrators and Users.",
        li2_2: "Documents, PDFs, text files, and other proprietary materials uploaded by Tenant Administrators.",
        li2_3: "Chat queries, system responses, and session metadata generated during the use of our AI assistants.",
        li2_4: "IP addresses, browser types, and usage analytics for system monitoring and security.",
        h3: "3. How We Use Your Information",
        p3: "Hanka AI strictly uses collected data to provide, maintain, and improve the specific services requested by the Tenant. Specifically:",
        li3_1: "To generate context-aware AI responses based only on the specific Tenant's uploaded knowledge base.",
        li3_2: "To provide Tenant Administrators with auditing and monitoring capabilities regarding their users' activities.",
        li3_3: "To ensure system security, prevent fraud, and troubleshoot technical issues.",
        box2: "Data uploaded to Hanka AI is cryptographically isolated per tenant using Qdrant vector spaces and strictly partitioned SQL databases.",
        h4: "4. Data Isolation and AI Processing",
        p4: "As an enterprise RAG provider, data segregation is our highest priority:",
        li4_1: "Documents uploaded by Tenant A can never be queried, accessed, or inferred by Tenant B.",
        li4_2: "Hanka AI utilizes frozen foundational models (via our LLM partners). We have binding agreements ensuring that data passed through their APIs is never retained for training purposes.",
        h5: "5. Data Retention and Deletion",
        p5: "We retain Tenant data only for as long as the Tenant maintains an active subscription or as required by law. Upon termination of a contract, or upon explicit request by a Tenant Administrator, all associated documents, vector embeddings, and chat logs are permanently destroyed from our active servers and backups within 30 days.",
        h6: "6. Contact Us",
        p6: "For questions regarding this Privacy Policy or to exercise your enterprise data rights, please contact our Data Protection Officer at privacy@hanka.ai."
    },
    id: {
        back: "Kembali ke Beranda",
        title_1: "Kebijakan ",
        title_2: "Privasi",
        updated: "Terakhir Diperbarui: Agustus 2026",
        box_title: "Komitmen Data Perusahaan",
        box_desc: "Hanka AI menyediakan lingkungan multi-tenant yang terisolasi ketat. Kami tidak menggunakan dokumen hak milik, prompt, atau riwayat obrolan Anda untuk melatih model AI publik atau dasar apa pun. Data Anda tetap menjadi milik Anda sepenuhnya.",
        h1: "1. Pendahuluan",
        p1: "Selamat datang di Hanka AI (\"kami\"). Kami berkomitmen untuk melindungi privasi dan keamanan data yang dipercayakan kepada kami oleh klien perusahaan kami (\"Tenant\") dan pengguna sah mereka. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, memproses, dan melindungi informasi Anda saat Anda menggunakan platform SaaS Enterprise Agentic RAG kami.",
        h2: "2. Informasi yang Kami Kumpulkan",
        li2_1: "Nama, alamat email, dan kredensial autentikasi untuk Administrator Tenant dan Pengguna.",
        li2_2: "Dokumen, PDF, file teks, dan materi hak milik lainnya yang diunggah oleh Administrator Tenant.",
        li2_3: "Kueri obrolan, respons sistem, dan metadata sesi yang dihasilkan selama penggunaan asisten AI kami.",
        li2_4: "Alamat IP, jenis browser, dan analitik penggunaan untuk pemantauan keamanan dan sistem.",
        h3: "3. Bagaimana Kami Menggunakan Informasi Anda",
        p3: "Hanka AI secara ketat menggunakan data yang dikumpulkan untuk menyediakan, memelihara, dan meningkatkan layanan spesifik yang diminta oleh Tenant. Secara khusus:",
        li3_1: "Untuk menghasilkan respons AI yang sadar konteks hanya berdasarkan basis pengetahuan yang diunggah oleh Tenant spesifik.",
        li3_2: "Untuk memberi Administrator Tenant kemampuan audit dan pemantauan terkait aktivitas pengguna mereka.",
        li3_3: "Untuk memastikan keamanan sistem, mencegah penipuan, dan memecahkan masalah teknis.",
        box2: "Data yang diunggah ke Hanka AI diisolasi secara kriptografis per tenant menggunakan ruang vektor Qdrant dan basis data SQL yang dipartisi secara ketat.",
        h4: "4. Isolasi Data dan Pemrosesan AI",
        p4: "Sebagai penyedia RAG perusahaan, pemisahan data adalah prioritas tertinggi kami:",
        li4_1: "Dokumen yang diunggah oleh Tenant A tidak akan pernah dapat dikueri, diakses, atau disimpulkan oleh Tenant B.",
        li4_2: "Hanka AI menggunakan model dasar yang dibekukan (melalui mitra LLM kami). Kami memiliki perjanjian yang mengikat untuk memastikan bahwa data yang melewati API mereka tidak pernah disimpan untuk tujuan pelatihan.",
        h5: "5. Retensi dan Penghapusan Data",
        p5: "Kami menyimpan data Tenant hanya selama Tenant mempertahankan langganan aktif atau sebagaimana diwajibkan oleh hukum. Setelah penghentian kontrak, atau atas permintaan eksplisit oleh Administrator Tenant, semua dokumen, embedding vektor, dan log obrolan terkait akan dihancurkan secara permanen dari server aktif dan cadangan kami dalam waktu 30 hari.",
        h6: "6. Hubungi Kami",
        p6: "Untuk pertanyaan mengenai Kebijakan Privasi ini atau untuk menggunakan hak data perusahaan Anda, silakan hubungi Petugas Perlindungan Data kami di privacy@hanka.ai."
    }
}

export default function PrivacyPolicy() {
    const navigate = useNavigate()
    const { i18n } = useTranslation()
    const t = content[i18n.language.startsWith('id') ? 'id' : 'en']

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    return (
        <div style={{ backgroundColor: '#05070f', color: '#fff', fontFamily: 'Inter, sans-serif', minHeight: '100vh', padding: '0 1rem' }}>
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
                <h1 style={{ fontSize: '3rem', fontWeight: 300, letterSpacing: '-1px', margin: '0 0 1rem 0' }}>{t.title_1} <span style={{fontWeight: 700}}>{t.title_2}</span></h1>
                <p style={{ color: '#a1a1aa', fontSize: '1.1rem', marginBottom: '3rem' }}>{t.updated}</p>

                <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '1.5rem', borderRadius: '1rem', marginBottom: '3rem', display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                    <Shield size={32} color="#3b82f6" style={{ flexShrink: 0, marginTop: '0.25rem' }} />
                    <div>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: '#60a5fa' }}>{t.box_title}</h3>
                        <p style={{ margin: 0, color: '#d4d4d8', lineHeight: 1.6 }}>{t.box_desc}</p>
                    </div>
                </div>

                <div className="legal-content">
                    <h2>{t.h1}</h2>
                    <p>{t.p1}</p>

                    <h2>{t.h2}</h2>
                    <ul>
                        <li><strong>Account Information:</strong> {t.li2_1}</li>
                        <li><strong>Enterprise Knowledge Base (RAG Data):</strong> {t.li2_2}</li>
                        <li><strong>Interaction Logs:</strong> {t.li2_3}</li>
                        <li><strong>Technical Data:</strong> {t.li2_4}</li>
                    </ul>

                    <h2>{t.h3}</h2>
                    <p>{t.p3}</p>
                    <ul>
                        <li>{t.li3_1}</li>
                        <li>{t.li3_2}</li>
                        <li>{t.li3_3}</li>
                    </ul>

                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1.5rem', borderRadius: '1rem', margin: '2rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Lock size={24} color="#a855f7" />
                        <p style={{ margin: 0, color: '#e4e4e7' }}>{t.box2}</p>
                    </div>

                    <h2>{t.h4}</h2>
                    <p>{t.p4}</p>
                    <ul>
                        <li><strong>Zero Cross-Contamination:</strong> {t.li4_1}</li>
                        <li><strong>Zero Model Training:</strong> {t.li4_2}</li>
                    </ul>

                    <h2>{t.h5}</h2>
                    <p>{t.p5}</p>

                    <h2>{t.h6}</h2>
                    <p>{t.p6}</p>
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
