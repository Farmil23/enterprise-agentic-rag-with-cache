import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import LoginRegister from './components/LoginRegister'
import ChatInterface from './components/ChatInterface'
import TenantAdminDashboard from './components/TenantAdminDashboard'
import SuperAdminDashboard from './components/SuperAdminDashboard'
import WaitingApproval from './components/WaitingApproval'
import Guide from './components/Guide'
import PrivacyPolicy from './components/PrivacyPolicy'
import TermsOfService from './components/TermsOfService'

function ProtectedRoute({ children, allowedRoles }) {
  const jwt = localStorage.getItem('rag_jwt')
  const role = localStorage.getItem('rag_role')

  if (!jwt) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to their respective correct dashboard if they try to access wrong route
    if (role === 'super_admin') return <Navigate to="/admin/super" replace />
    if (role === 'tenant_admin') return <Navigate to="/admin/tenant" replace />
    return <Navigate to="/chat" replace />
  }

  return children
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginRegister />} />
        <Route path="/waiting-approval" element={<WaitingApproval />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        
        <Route path="/chat" element={
          <ProtectedRoute allowedRoles={['regular_user', 'tenant_admin', 'super_admin']}>
            <ChatInterface />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/tenant" element={
          <ProtectedRoute allowedRoles={['tenant_admin', 'super_admin']}>
            <TenantAdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/admin/super" element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        } />

        {/* Default Route */}
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    </Router>
  )
}

export default App
