import { useState } from 'react';
import { ArrowLeft, BookOpen, MessageSquare, UploadCloud, Shield, CheckCircle, Lightbulb, X, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Guide() {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('intro');

    const sections = [
        { id: 'intro', title: 'Pengantar', icon: <BookOpen size={18} /> },
        { id: 'chat', title: 'Cara Bertanya', icon: <MessageSquare size={18} /> },
        { id: 'upload', title: 'Unggah Dokumen', icon: <UploadCloud size={18} /> },
        { id: 'performance', title: 'Performa & Cache', icon: <Lightbulb size={18} /> },
        { id: 'security', title: 'Keamanan & Batasan', icon: <Shield size={18} /> }
    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#fff', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <header style={{ 
                padding: '1.5rem 2rem', 
                borderBottom: '1px solid rgba(255,255,255,0.05)', 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                background: 'rgba(9, 9, 11, 0.8)',
                backdropFilter: 'blur(12px)',
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button 
                        onClick={() => navigate(-1)}
                        style={{ 
                            background: 'rgba(255,255,255,0.05)', border: 'none', color: '#a1a1aa', 
                            cursor: 'pointer', padding: '0.5rem', borderRadius: '0.5rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
                        onMouseOut={e => { e.currentTarget.style.color = '#a1a1aa'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: '#3b82f6' }}>Nexus</span>RAG Guide
                    </h1>
                </div>
            </header>

            <div style={{ display: 'flex', flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                {/* Sidebar Guide */}
                <aside style={{ width: '250px', padding: '2rem 1rem', borderRight: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: '73px', height: 'calc(100vh - 73px)' }}>
                    <div style={{ fontSize: '0.75rem', color: '#a1a1aa', fontWeight: 600, letterSpacing: '1px', marginBottom: '1rem', paddingLeft: '1rem' }}>
                        DAFTAR ISI
                    </div>
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {sections.map(sec => (
                            <button
                                key={sec.id}
                                onClick={() => {
                                    setActiveSection(sec.id);
                                    document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    padding: '0.75rem 1rem', borderRadius: '0.5rem', border: 'none',
                                    background: activeSection === sec.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                    color: activeSection === sec.id ? '#60a5fa' : '#a1a1aa',
                                    fontWeight: activeSection === sec.id ? 500 : 400,
                                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
                                }}
                                onMouseOver={e => { if(activeSection !== sec.id) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                                onMouseOut={e => { if(activeSection !== sec.id) e.currentTarget.style.background = 'transparent' }}
                            >
                                {sec.icon} {sec.title}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main style={{ flex: 1, padding: '3rem 4rem', overflowY: 'auto' }}>
                    <div style={{ maxWidth: '800px' }}>
                        {/* Intro Section */}
                        <section id="intro" style={{ marginBottom: '4rem' }} onMouseEnter={() => setActiveSection('intro')}>
                            <div style={{ display: 'inline-flex', padding: '0.5rem 1rem', background: 'rgba(59,130,246,0.1)', color: '#60a5fa', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem', alignItems: 'center', gap: '0.5rem' }}>
                                <BookOpen size={16} /> Dokumentasi Resmi
                            </div>
                            <h2 style={{ fontSize: '2.5rem', margin: '0 0 1rem 0', fontWeight: 700, letterSpacing: '-0.02em' }}>Panduan Pengguna RAG</h2>
                            <p style={{ color: '#a1a1aa', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                                Selamat datang di Enterprise Agentic RAG. Platform ini memungkinkan Anda untuk melakukan "chat" dengan dokumen internal perusahaan Anda secara aman. 
                                Sistem ini menggunakan teknologi AI terbaru (Retrieval-Augmented Generation) untuk memberikan jawaban yang akurat, langsung bersumber dari file Anda.
                            </p>
                            
                            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1rem', padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                                <div style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#facc15', padding: '0.75rem', borderRadius: '0.5rem' }}>
                                    <Lightbulb size={24} />
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#fff' }}>Konsep Dasar</h4>
                                    <p style={{ margin: 0, color: '#a1a1aa', lineHeight: 1.6 }}>
                                        AI ini <strong>tidak</strong> dilatih dengan data publik untuk menjawab pertanyaan spesifik perusahaan Anda. Sebaliknya, ia <strong>membaca</strong> dokumen yang Anda unggah secara real-time dan menarik informasi relevan sebelum menjawab.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '3rem 0' }} />

                        {/* Chat Section */}
                        <section id="chat" style={{ marginBottom: '4rem' }} onMouseEnter={() => setActiveSection('chat')}>
                            <h3 style={{ fontSize: '1.75rem', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <MessageSquare color="#3b82f6" /> Cara Bertanya (Chat)
                            </h3>
                            <p style={{ color: '#a1a1aa', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                                Untuk mendapatkan hasil terbaik, gunakan bahasa yang jelas dan spesifik. AI kami dapat merangkum, mencari data numerik, hingga membandingkan isi antar dokumen.
                            </p>
                            
                            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                                <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1.5rem', borderRadius: '0.75rem' }}>
                                    <h5 style={{ margin: '0 0 0.75rem 0', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                                        <CheckCircle size={18} /> Disarankan
                                    </h5>
                                    <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#a1a1aa', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <li>"Berapa total pendapatan di kuartal 3 berdasarkan laporan keuangan?"</li>
                                        <li>"Buatkan ringkasan SOP cuti tahunan dalam bentuk bullet points."</li>
                                        <li>"Bandingkan kebijakan asuransi tahun 2023 dan 2024."</li>
                                    </ul>
                                </div>
                                <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1.5rem', borderRadius: '0.75rem' }}>
                                    <h5 style={{ margin: '0 0 0.75rem 0', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                                        <X size={18} /> Hindari
                                    </h5>
                                    <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#a1a1aa', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <li>"Tolong carikan." (Terlalu ambigu)</li>
                                        <li>"Siapa presiden Amerika?" (Di luar konteks dokumen internal)</li>
                                        <li>"Apakah ada dokumen baru?" (Pertanyaan sistem, bukan isi dokumen)</li>
                                    </ul>
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                <h4 style={{ color: '#fff', margin: '0 0 1rem 0' }}>Contoh Penggunaan Lanjutan (Advanced)</h4>
                                <ul style={{ color: '#a1a1aa', margin: 0, paddingLeft: '1.5rem', lineHeight: 1.7 }}>
                                    <li><strong>Multilingual:</strong> "Tolong terjemahkan kesimpulan dari dokumen laporan Q3 ini ke bahasa Indonesia."</li>
                                    <li><strong>Format Output Khusus:</strong> "Buatkan tabel yang berisi nama proyek, anggaran, dan status dari dokumen perencanaan."</li>
                                    <li><strong>Cross-Referencing:</strong> "Berdasarkan dokumen A dan dokumen B, apakah ada perbedaan standar operasional prosedur?"</li>
                                </ul>
                            </div>
                        </section>
                        
                        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '3rem 0' }} />

                        {/* Upload Section */}
                        <section id="upload" style={{ marginBottom: '4rem' }} onMouseEnter={() => setActiveSection('upload')}>
                            <h3 style={{ fontSize: '1.75rem', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <UploadCloud color="#8b5cf6" /> Unggah Dokumen
                            </h3>
                            <p style={{ color: '#a1a1aa', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                                Hanya pengguna dengan peran <strong>Tenant Admin</strong> atau <strong>Super Admin</strong> yang dapat mengunggah dokumen baru. Dokumen yang diunggah akan langsung diproses dan bisa ditanyakan dalam hitungan detik.
                            </p>
                            
                            <ol style={{ paddingLeft: '1.5rem', color: '#e4e4e7', lineHeight: 1.8, fontSize: '1.05rem', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                <li>Login menggunakan akun Administrator Anda.</li>
                                <li>Masuk ke menu <strong>Admin Dashboard</strong> (ikon roda gigi di pojok atau panel admin).</li>
                                <li>Klik area <em>Upload</em> atau seret dan jatuhkan (drag & drop) file PDF/TXT Anda.</li>
                                <li>Tunggu hingga progres mencapai 100% dan status dokumen menjadi "Indexed".</li>
                                <li>Kembali ke menu Chat, dan Anda sudah bisa bertanya tentang isi dokumen tersebut.</li>
                            </ol>

                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(59,130,246,0.1)', padding: '1rem', borderRadius: '0.5rem', color: '#60a5fa' }}>
                                <FileText size={24} />
                                <div>
                                    <strong>Format yang Didukung:</strong> Saat ini sistem mendukung eksekusi file teks <code>.txt</code>, dokumen PDF <code>.pdf</code>, dan file Word <code>.docx</code>. Pastikan file tidak diproteksi oleh *password*.
                                </div>
                            </div>
                        </section>

                        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '3rem 0' }} />

                        {/* Performance Section */}
                        <section id="performance" style={{ marginBottom: '4rem' }} onMouseEnter={() => setActiveSection('performance')}>
                            <h3 style={{ fontSize: '1.75rem', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Lightbulb color="#facc15" /> Sistem Cache & Performa
                            </h3>
                            <p style={{ color: '#a1a1aa', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                                Enterprise RAG ini dirancang untuk kecepatan. Sistem kami menggunakan arsitektur <em>Semantic Caching</em> untuk menghindari pemrosesan ulang pada pertanyaan yang serupa.
                            </p>
                            
                            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', borderLeft: '4px solid #facc15' }}>
                                <p style={{ color: '#e4e4e7', margin: '0 0 1rem 0' }}>Bagaimana ini bekerja?</p>
                                <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#a1a1aa', lineHeight: 1.6 }}>
                                    <li>Jika Klien A bertanya "Apa visi perusahaan?", AI akan memproses dan memberikan jawaban (memakan waktu ~2-3 detik).</li>
                                    <li>Jika Klien B (atau Anda sendiri) menanyakan pertanyaan yang maknanya sama seperti "Visi misi perusahaan apa ya?", sistem <strong>tidak</strong> akan memanggil LLM kembali.</li>
                                    <li>Sistem akan langsung memunculkan jawaban dari <em>Cache</em> dalam hitungan <strong>milidetik (0.1 detik)</strong>. Cobalah sendiri!</li>
                                </ul>
                            </div>
                        </section>

                        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '3rem 0' }} />

                        {/* Security Section */}
                        <section id="security" style={{ marginBottom: '6rem' }} onMouseEnter={() => setActiveSection('security')}>
                            <h3 style={{ fontSize: '1.75rem', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Shield color="#10b981" /> Keamanan & Batasan (Limitations)
                            </h3>
                            <p style={{ color: '#a1a1aa', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                                Keamanan data Anda adalah prioritas utama. Sistem Multi-Tenant kami memastikan isolasi data tingkat tinggi.
                            </p>
                            
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div>
                                        <h4 style={{ color: '#fff', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>1. Isolasi Data (Tenant Isolation)</h4>
                                        <p style={{ color: '#a1a1aa', margin: 0, lineHeight: 1.6 }}>Data dan dokumen Anda (Tenant A) secara fisik dan logis terpisah dari klien lain (Tenant B). Vector database kami menggunakan sistem Payload Filtering yang ketat.</p>
                                    </div>
                                    <div>
                                        <h4 style={{ color: '#fff', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>2. Role-Based Access Control (RBAC)</h4>
                                        <p style={{ color: '#a1a1aa', margin: 0, lineHeight: 1.6 }}>Hanya pengguna yang telah disetujui (Approved) oleh Admin yang dapat membaca atau mengakses dokumen. Akun baru yang mendaftar akan dikarantina hingga disetujui.</p>
                                    </div>
                                    <div>
                                        <h4 style={{ color: '#fff', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>3. Tidak Ada Pelatihan Model Public</h4>
                                        <p style={{ color: '#a1a1aa', margin: 0, lineHeight: 1.6 }}>Dokumen Anda TIDAK digunakan untuk melatih (train/fine-tune) model public OpenAI. Data hanya diteruskan (passed-through) sebagai konteks sekali pakai selama proses tanya jawab.</p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem', background: 'rgba(239, 68, 68, 0.05)', padding: '1.5rem', borderRadius: '1rem', border: '1px dashed rgba(239, 68, 68, 0.2)' }}>
                                <h4 style={{ color: '#f87171', margin: '0 0 1rem 0' }}>Batasan Sistem (Limitations)</h4>
                                <ul style={{ color: '#a1a1aa', margin: 0, paddingLeft: '1.5rem', lineHeight: 1.6 }}>
                                    <li><strong>Tidak Dapat Membaca Gambar:</strong> Saat ini sistem RAG memproses teks (OCR untuk PDF teks). Jika ada grafik atau gambar di dalam PDF, AI tidak dapat "melihatnya".</li>
                                    <li><strong>Halusinasi Minimal:</strong> Kami mengatur suhu LLM ke 0 untuk mencegah halusinasi. Jika AI berkata "Saya tidak menemukan informasi tersebut di dokumen", itu berarti informasi tersebut memang secara harfiah tidak ada di file yang Anda unggah.</li>
                                </ul>
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
}
