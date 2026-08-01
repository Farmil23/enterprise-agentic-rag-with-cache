import { Clock, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function WaitingApproval() {
  const navigate = useNavigate()

  return (
    <div className="login-container">
      <div className="login-background-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
      </div>
      <div className="login-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <div className="login-icon" style={{ margin: '0 auto 1.5rem auto', background: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }}>
          <Clock size={40} className="spin-slow" />
        </div>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: '#f8fafc' }}>Menunggu Persetujuan</h1>
        <p style={{ color: '#94a3b8', lineHeight: '1.6', marginBottom: '2rem' }}>
          Akun Anda telah berhasil didaftarkan, namun saat ini berstatus <strong>Pending</strong>.
          <br /><br />
          Silakan hubungi Admin Tenant Anda untuk meminta persetujuan akses. Setelah disetujui, Anda dapat langsung masuk ke dalam Workspace.
        </p>
        
        <button 
          onClick={() => navigate('/login')} 
          className="login-button"
          style={{ width: 'auto', padding: '0.75rem 2rem', margin: '0 auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
        >
          <ArrowLeft size={18} />
          Kembali ke Halaman Login
        </button>
      </div>

      <style>{`
        .spin-slow {
          animation: spin 4s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
