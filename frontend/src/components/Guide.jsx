import { useState } from 'react';
import { ArrowLeft, BookOpen, MessageSquare, UploadCloud, Shield, CheckCircle, Lightbulb, X, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const content = {
    en: {
        back: "Back to Home",
        title_1: "Enterprise",
        title_2: "Guide",
        desc: "Everything you need to know about operating your AI Assistant and managing documents safely.",
        
        sec_intro: "Introduction",
        sec_chat: "How to Ask",
        sec_upload: "Upload Documents",
        sec_perf: "Performance & Cache",
        sec_sec: "Security & Limits",

        h_intro: "Welcome to Enterprise Agentic RAG",
        p_intro: "This platform is an Artificial Intelligence solution specifically designed for companies. It acts as an extremely smart 'second brain' that has read all your company documents (SOPs, Reports, Contracts) and is ready to answer any questions accurately.",
        box_intro_title: "What makes this different from regular ChatGPT?",
        li_intro_1: "No Hallucination: Answers are purely based on the documents you upload, not the internet.",
        li_intro_2: "Data Privacy: Your data is NEVER used to train public AI models.",
        li_intro_3: "Multi-Tenant: Your company (Tenant) data is 100% isolated from other companies.",

        h_chat: "How to Ask Effectively",
        p_chat: "To get the best answers, imagine you are talking to a smart but new intern.",
        li_chat_1: "Be Specific:",
        li_chat_1_desc: "Instead of asking 'What are the rules?', ask 'What are the rules regarding employee remote work according to the HR Handbook?'",
        li_chat_2: "Ask for Summaries:",
        li_chat_2_desc: "'Summarize the 3 main points from the financial report document for Q3 2026.'",
        li_chat_3: "Cross-Reference:",
        li_chat_3_desc: "The AI can combine information from multiple documents at once. You don't need to specify which document it came from.",

        h_upload: "Upload Documents",
        p_upload: "Only users with the Tenant Admin or Super Admin role can upload new documents. Uploaded documents will be immediately processed and can be queried within seconds.",
        li_up_1: "Login using your Administrator account.",
        li_up_2: "Go to the Admin Dashboard menu (gear icon).",
        li_up_3: "Click the Upload area or drag & drop your PDF/TXT file.",
        li_up_4: "Wait until the progress reaches 100% and the status becomes 'Indexed'.",
        li_up_5: "Return to the Chat menu, and you can start asking about the document.",
        box_up: "Supported Formats: Currently the system supports .txt, .pdf, and .docx files. Make sure the file is not password-protected.",

        h_perf: "Caching System & Performance",
        p_perf: "This Enterprise RAG is designed for speed. Our system uses a Semantic Caching architecture to avoid reprocessing similar questions.",
        box_perf_title: "How does it work?",
        li_perf_1: "If Client A asks 'What is the company vision?', the AI will process and provide an answer (takes ~2-3 seconds).",
        li_perf_2: "If Client B (or you) asks a question with the same meaning like 'What are the company's vision and mission?', the system will NOT call the LLM again.",
        li_perf_3: "The system will instantly output the answer from the Cache in milliseconds (0.1 seconds). Try it yourself!",

        h_sec: "Security & Limitations",
        p_sec: "Your data security is our top priority. Our Multi-Tenant system ensures high-level data isolation.",
        sec_box_1_title: "1. Data Isolation (Tenant Isolation)",
        sec_box_1_desc: "Your data and documents (Tenant A) are physically and logically separated from other clients (Tenant B). Our vector database uses strict Payload Filtering.",
        sec_box_2_title: "2. Role-Based Access Control (RBAC)",
        sec_box_2_desc: "Only users who have been Approved by the Admin can read or access documents. New registered accounts will be quarantined until approved.",
        sec_box_3_title: "3. No Public Model Training",
        sec_box_3_desc: "Your documents are NOT used to train/fine-tune OpenAI public models. Data is only passed-through as a one-time context during the Q&A process.",
        lim_title: "System Limitations",
        li_lim_1: "Cannot Read Images: Currently, the RAG system processes text (OCR for text PDFs). If there are graphs or images in the PDF, the AI cannot 'see' them.",
        li_lim_2: "Minimal Hallucination: We set the LLM temperature to 0 to prevent hallucination. If the AI says 'I couldn't find that information in the documents', it means the information is literally not in the files you uploaded."
    },
    id: {
        back: "Kembali ke Beranda",
        title_1: "Panduan",
        title_2: "Penggunaan",
        desc: "Segala hal yang perlu Anda ketahui tentang cara mengoperasikan Asisten AI dan mengelola dokumen dengan aman.",
        
        sec_intro: "Pengantar",
        sec_chat: "Cara Bertanya",
        sec_upload: "Unggah Dokumen",
        sec_perf: "Performa & Cache",
        sec_sec: "Keamanan & Batasan",

        h_intro: "Selamat datang di Enterprise Agentic RAG",
        p_intro: "Platform ini adalah solusi Kecerdasan Buatan (AI) yang dirancang khusus untuk perusahaan. Ia bertindak sebagai 'otak kedua' yang sangat pintar, yang telah membaca seluruh dokumen perusahaan Anda (SOP, Laporan, Kontrak) dan siap menjawab pertanyaan apa pun dengan akurat.",
        box_intro_title: "Apa bedanya dengan ChatGPT biasa?",
        li_intro_1: "Tanpa Halusinasi: Jawaban murni didasarkan pada dokumen yang Anda unggah, bukan dari internet bebas.",
        li_intro_2: "Privasi Data: Data Anda TIDAK PERNAH digunakan untuk melatih model AI publik.",
        li_intro_3: "Multi-Tenant: Data perusahaan Anda (Tenant) 100% terisolasi dari perusahaan lain.",

        h_chat: "Cara Bertanya yang Efektif",
        p_chat: "Untuk mendapatkan jawaban terbaik, bayangkan Anda sedang berbicara dengan asisten magang yang pintar tapi baru masuk.",
        li_chat_1: "Spesifik:",
        li_chat_1_desc: "Daripada bertanya 'Apa aturannya?', tanyakan 'Apa aturan mengenai cuti karyawan menurut dokumen Buku Panduan HRD?'",
        li_chat_2: "Minta Ringkasan:",
        li_chat_2_desc: "'Tolong ringkas 3 poin utama dari dokumen laporan keuangan Q3 2026.'",
        li_chat_3: "Lintas Dokumen:",
        li_chat_3_desc: "AI dapat menggabungkan informasi dari berbagai dokumen sekaligus. Anda tidak perlu repot menyebutkan dari dokumen mana asalnya.",

        h_upload: "Unggah Dokumen",
        p_upload: "Hanya pengguna dengan peran Tenant Admin atau Super Admin yang dapat mengunggah dokumen baru. Dokumen yang diunggah akan langsung diproses dan bisa ditanyakan dalam hitungan detik.",
        li_up_1: "Login menggunakan akun Administrator Anda.",
        li_up_2: "Masuk ke menu Admin Dashboard (ikon roda gigi di pojok atau panel admin).",
        li_up_3: "Klik area Upload atau seret dan jatuhkan (drag & drop) file PDF/TXT Anda.",
        li_up_4: "Tunggu hingga progres mencapai 100% dan status dokumen menjadi 'Indexed'.",
        li_up_5: "Kembali ke menu Chat, dan Anda sudah bisa bertanya tentang isi dokumen tersebut.",
        box_up: "Format yang Didukung: Saat ini sistem mendukung eksekusi file teks .txt, dokumen PDF .pdf, dan file Word .docx. Pastikan file tidak diproteksi oleh password.",

        h_perf: "Sistem Cache & Performa",
        p_perf: "Enterprise RAG ini dirancang untuk kecepatan. Sistem kami menggunakan arsitektur Semantic Caching untuk menghindari pemrosesan ulang pada pertanyaan yang serupa.",
        box_perf_title: "Bagaimana ini bekerja?",
        li_perf_1: "Jika Klien A bertanya 'Apa visi perusahaan?', AI akan memproses dan memberikan jawaban (memakan waktu ~2-3 detik).",
        li_perf_2: "Jika Klien B (atau Anda sendiri) menanyakan pertanyaan yang maknanya sama seperti 'Visi misi perusahaan apa ya?', sistem TIDAK akan memanggil LLM kembali.",
        li_perf_3: "Sistem akan langsung memunculkan jawaban dari Cache dalam hitungan milidetik (0.1 detik). Cobalah sendiri!",

        h_sec: "Keamanan & Batasan (Limitations)",
        p_sec: "Keamanan data Anda adalah prioritas utama. Sistem Multi-Tenant kami memastikan isolasi data tingkat tinggi.",
        sec_box_1_title: "1. Isolasi Data (Tenant Isolation)",
        sec_box_1_desc: "Data dan dokumen Anda (Tenant A) secara fisik dan logis terpisah dari klien lain (Tenant B). Vector database kami menggunakan sistem Payload Filtering yang ketat.",
        sec_box_2_title: "2. Role-Based Access Control (RBAC)",
        sec_box_2_desc: "Hanya pengguna yang telah disetujui (Approved) oleh Admin yang dapat membaca atau mengakses dokumen. Akun baru yang mendaftar akan dikarantina hingga disetujui.",
        sec_box_3_title: "3. Tidak Ada Pelatihan Model Public",
        sec_box_3_desc: "Dokumen Anda TIDAK digunakan untuk melatih (train/fine-tune) model public OpenAI. Data hanya diteruskan (passed-through) sebagai konteks sekali pakai selama proses tanya jawab.",
        lim_title: "Batasan Sistem (Limitations)",
        li_lim_1: "Tidak Dapat Membaca Gambar: Saat ini sistem RAG memproses teks (OCR untuk PDF teks). Jika ada grafik atau gambar di dalam PDF, AI tidak dapat 'melihatnya'.",
        li_lim_2: "Halusinasi Minimal: Kami mengatur suhu LLM ke 0 untuk mencegah halusinasi. Jika AI berkata 'Saya tidak menemukan informasi tersebut di dokumen', itu berarti informasi tersebut memang secara harfiah tidak ada di file yang Anda unggah."
    }
}

export default function Guide() {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('intro');
    const { i18n } = useTranslation();
    const t = content[i18n.language.startsWith('id') ? 'id' : 'en'];

    const sections = [
        { id: 'intro', title: t.sec_intro, icon: <BookOpen size={18} /> },
        { id: 'chat', title: t.sec_chat, icon: <MessageSquare size={18} /> },
        { id: 'upload', title: t.sec_upload, icon: <UploadCloud size={18} /> },
        { id: 'performance', title: t.sec_perf, icon: <Lightbulb size={18} /> },
        { id: 'security', title: t.sec_sec, icon: <Shield size={18} /> }
    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#fff', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column' }}>
            <header style={{ 
                position: 'sticky', top: 0, zIndex: 10, background: 'rgba(9,9,11,0.8)', 
                backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)',
                padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
                <button 
                    onClick={() => navigate('/')} 
                    style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', transition: 'color 0.2s' }}
                    onMouseOver={e=>e.currentTarget.style.color='#fff'}
                    onMouseOut={e=>e.currentTarget.style.color='#a1a1aa'}
                >
                    <ArrowLeft size={18} /> {t.back}
                </button>
            </header>

            <div style={{ display: 'flex', flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '2rem' }}>
                <aside style={{ width: '250px', position: 'sticky', top: '100px', height: 'max-content', paddingRight: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 300, margin: '0 0 0.5rem 0', letterSpacing: '-0.5px' }}>{t.title_1} <span style={{fontWeight: 700}}>{t.title_2}</span></h1>
                        <p style={{ color: '#a1a1aa', fontSize: '0.85rem', margin: 0 }}>{t.desc}</p>
                    </div>
                    {sections.map(sec => (
                        <a 
                            key={sec.id}
                            href={`#${sec.id}`}
                            onClick={() => setActiveSection(sec.id)}
                            style={{ 
                                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', 
                                color: activeSection === sec.id ? '#fff' : '#a1a1aa', 
                                background: activeSection === sec.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                                borderRadius: '0.5rem', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500,
                                transition: 'all 0.2s'
                            }}
                        >
                            {sec.icon} {sec.title}
                        </a>
                    ))}
                </aside>

                <main style={{ flex: 1, paddingLeft: '3rem', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ maxWidth: '700px' }}>
                        
                        {/* Intro Section */}
                        <section id="intro" style={{ marginBottom: '4rem' }} onMouseEnter={() => setActiveSection('intro')}>
                            <h3 style={{ fontSize: '1.75rem', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <BookOpen color="#3b82f6" /> {t.h_intro}
                            </h3>
                            <p style={{ color: '#a1a1aa', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                                {t.p_intro}
                            </p>
                            
                            <div style={{ background: 'rgba(59,130,246,0.05)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(59,130,246,0.2)' }}>
                                <h4 style={{ color: '#60a5fa', margin: '0 0 1rem 0' }}>{t.box_intro_title}</h4>
                                <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#d4d4d8', lineHeight: 1.6 }}>
                                    <li><strong>{t.li_intro_1.split(':')[0]}:</strong>{t.li_intro_1.split(':')[1]}</li>
                                    <li style={{ marginTop: '0.5rem' }}><strong>{t.li_intro_2.split(':')[0]}:</strong>{t.li_intro_2.split(':')[1]}</li>
                                    <li style={{ marginTop: '0.5rem' }}><strong>{t.li_intro_3.split(':')[0]}:</strong>{t.li_intro_3.split(':')[1]}</li>
                                </ul>
                            </div>
                        </section>

                        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '3rem 0' }} />

                        {/* Chat Section */}
                        <section id="chat" style={{ marginBottom: '4rem' }} onMouseEnter={() => setActiveSection('chat')}>
                            <h3 style={{ fontSize: '1.75rem', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <MessageSquare color="#10b981" /> {t.h_chat}
                            </h3>
                            <p style={{ color: '#a1a1aa', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                                {t.p_chat}
                            </p>
                            
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '0.75rem' }}>
                                    <h4 style={{ color: '#e4e4e7', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={16} color="#10b981"/> {t.li_chat_1}</h4>
                                    <p style={{ margin: 0, color: '#a1a1aa' }}>{t.li_chat_1_desc}</p>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '0.75rem' }}>
                                    <h4 style={{ color: '#e4e4e7', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={16} color="#10b981"/> {t.li_chat_2}</h4>
                                    <p style={{ margin: 0, color: '#a1a1aa' }}>{t.li_chat_2_desc}</p>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '0.75rem' }}>
                                    <h4 style={{ color: '#e4e4e7', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={16} color="#10b981"/> {t.li_chat_3}</h4>
                                    <p style={{ margin: 0, color: '#a1a1aa' }}>{t.li_chat_3_desc}</p>
                                </div>
                            </div>
                        </section>

                        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '3rem 0' }} />

                        {/* Upload Section */}
                        <section id="upload" style={{ marginBottom: '4rem' }} onMouseEnter={() => setActiveSection('upload')}>
                            <h3 style={{ fontSize: '1.75rem', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <UploadCloud color="#8b5cf6" /> {t.h_upload}
                            </h3>
                            <p style={{ color: '#a1a1aa', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                                {t.p_upload}
                            </p>
                            
                            <ol style={{ paddingLeft: '1.5rem', color: '#e4e4e7', lineHeight: 1.8, fontSize: '1.05rem', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                <li>{t.li_up_1}</li>
                                <li>{t.li_up_2}</li>
                                <li>{t.li_up_3}</li>
                                <li>{t.li_up_4}</li>
                                <li>{t.li_up_5}</li>
                            </ol>

                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(59,130,246,0.1)', padding: '1rem', borderRadius: '0.5rem', color: '#60a5fa' }}>
                                <FileText size={24} />
                                <div>
                                    <strong>{t.box_up.split(':')[0]}:</strong> {t.box_up.split(':')[1]}
                                </div>
                            </div>
                        </section>

                        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '3rem 0' }} />

                        {/* Performance Section */}
                        <section id="performance" style={{ marginBottom: '4rem' }} onMouseEnter={() => setActiveSection('performance')}>
                            <h3 style={{ fontSize: '1.75rem', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Lightbulb color="#facc15" /> {t.h_perf}
                            </h3>
                            <p style={{ color: '#a1a1aa', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                                {t.p_perf}
                            </p>
                            
                            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', borderLeft: '4px solid #facc15' }}>
                                <p style={{ color: '#e4e4e7', margin: '0 0 1rem 0' }}>{t.box_perf_title}</p>
                                <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#a1a1aa', lineHeight: 1.6 }}>
                                    <li>{t.li_perf_1}</li>
                                    <li>{t.li_perf_2}</li>
                                    <li>{t.li_perf_3}</li>
                                </ul>
                            </div>
                        </section>

                        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '3rem 0' }} />

                        {/* Security Section */}
                        <section id="security" style={{ marginBottom: '6rem' }} onMouseEnter={() => setActiveSection('security')}>
                            <h3 style={{ fontSize: '1.75rem', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Shield color="#10b981" /> {t.h_sec}
                            </h3>
                            <p style={{ color: '#a1a1aa', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                                {t.p_sec}
                            </p>
                            
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div>
                                        <h4 style={{ color: '#fff', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{t.sec_box_1_title}</h4>
                                        <p style={{ color: '#a1a1aa', margin: 0, lineHeight: 1.6 }}>{t.sec_box_1_desc}</p>
                                    </div>
                                    <div>
                                        <h4 style={{ color: '#fff', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{t.sec_box_2_title}</h4>
                                        <p style={{ color: '#a1a1aa', margin: 0, lineHeight: 1.6 }}>{t.sec_box_2_desc}</p>
                                    </div>
                                    <div>
                                        <h4 style={{ color: '#fff', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{t.sec_box_3_title}</h4>
                                        <p style={{ color: '#a1a1aa', margin: 0, lineHeight: 1.6 }}>{t.sec_box_3_desc}</p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem', background: 'rgba(239, 68, 68, 0.05)', padding: '1.5rem', borderRadius: '1rem', border: '1px dashed rgba(239, 68, 68, 0.2)' }}>
                                <h4 style={{ color: '#f87171', margin: '0 0 1rem 0' }}>{t.lim_title}</h4>
                                <ul style={{ color: '#a1a1aa', margin: 0, paddingLeft: '1.5rem', lineHeight: 1.6 }}>
                                    <li><strong>{t.li_lim_1.split(':')[0]}:</strong>{t.li_lim_1.split(':')[1]}</li>
                                    <li><strong>{t.li_lim_2.split(':')[0]}:</strong>{t.li_lim_2.split(':')[1]}</li>
                                </ul>
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
}
