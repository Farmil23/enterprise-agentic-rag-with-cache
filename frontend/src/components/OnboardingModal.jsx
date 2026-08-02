import { useState, useEffect } from 'react';
import { X, BookOpen, MessageSquare, FolderOpen, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function OnboardingModal({ userName, tenantName }) {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Cek apakah user sudah pernah melihat onboarding ini
        const hasSeen = localStorage.getItem('rag_has_seen_onboarding');
        if (!hasSeen) {
            // Berikan sedikit delay agar transisi terasa lebih natural
            const timer = setTimeout(() => setIsOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem('rag_has_seen_onboarding', 'true');
    };

    const handleGoToGuide = () => {
        handleClose();
        navigate('/guide');
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999, // Harus paling atas
            animation: 'fadeIn 0.3s ease-out'
        }}>
            <div className="onboarding-modal-content" style={{
                background: '#18181b', // Zn 900
                width: '90%',
                maxWidth: '600px',
                borderRadius: '1rem',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                overflow: 'hidden',
                position: 'relative',
                animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                {/* Header Graphic */}
                <div style={{
                    height: '120px',
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(16,185,129,0.2) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.1)',
                        padding: '1rem',
                        borderRadius: '50%',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                        <MessageSquare size={32} color="#fff" />
                    </div>
                    
                    <button 
                        onClick={handleClose}
                        style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            background: 'rgba(0,0,0,0.5)',
                            border: 'none',
                            color: '#a1a1aa',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(0,0,0,0.8)' }}
                        onMouseOut={e => { e.currentTarget.style.color = '#a1a1aa'; e.currentTarget.style.background = 'rgba(0,0,0,0.5)' }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '2rem' }}>
                    <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#fff', fontWeight: 600 }}>
                        Selamat datang di Enterprise RAG
                    </h2>
                    <p style={{ margin: '0 0 2rem 0', color: '#a1a1aa', lineHeight: 1.6, fontSize: '0.95rem' }}>
                        Anda sekarang terhubung ke workspace <strong style={{ color: '#fff' }}>{tenantName || 'Anda'}</strong>. 
                        Sistem ini dirancang untuk membantu Anda menemukan informasi dari dokumen perusahaan secara instan dan akurat.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', padding: '0.5rem', borderRadius: '0.5rem' }}>
                                <MessageSquare size={20} />
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 0.25rem 0', color: '#e4e4e7', fontSize: '1rem' }}>Tanya Apa Saja</h4>
                                <p style={{ margin: 0, color: '#a1a1aa', fontSize: '0.85rem', lineHeight: 1.5 }}>
                                    Ajukan pertanyaan teknis, ringkas dokumen panjang, atau minta SOP. AI kami akan menjawab berdasarkan data internal.
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '0.5rem', borderRadius: '0.5rem' }}>
                                <FolderOpen size={20} />
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 0.25rem 0', color: '#e4e4e7', fontSize: '1rem' }}>Knowledge Base Aman</h4>
                                <p style={{ margin: 0, color: '#a1a1aa', fontSize: '0.85rem', lineHeight: 1.5 }}>
                                    Seluruh dokumen Anda dienkripsi dan diisolasi khusus untuk tenant Anda. Tidak ada data yang dibagikan silang.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="onboarding-buttons" style={{ display: 'flex', gap: '1rem' }}>
                        <button 
                            onClick={handleClose}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                background: '#3b82f6',
                                border: 'none',
                                color: '#fff',
                                borderRadius: '0.5rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'background 0.2s'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = '#2563eb'}
                            onMouseOut={e => e.currentTarget.style.background = '#3b82f6'}
                        >
                            Mulai Chat <ArrowRight size={18} />
                        </button>
                        <button 
                            onClick={handleGoToGuide}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                background: 'transparent',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: '#e4e4e7',
                                borderRadius: '0.5rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)' }}
                            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                        >
                            <BookOpen size={18} /> Baca Panduan Lengkap
                        </button>
                    </div>
                </div>
                <style>{`
                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
                    
                    /* Mobile Responsiveness for Modal */
                    @media (max-width: 600px) {
                        .onboarding-modal-content {
                            max-height: 85vh;
                            overflow-y: auto;
                        }
                        .onboarding-buttons {
                            flex-direction: column !important;
                        }
                        .onboarding-buttons button {
                            width: 100%;
                        }
                    }
                `}</style>
            </div>
        </div>
    );
}
