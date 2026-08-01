import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
    LogOut, Globe, Shield, Activity, Users, ShieldCheck, 
    Menu, LayoutDashboard, Building2, CheckCircle, XCircle,
    Plus, Key, Eye, Clock, Database, Scale, FileText, ChevronDown
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard') // dashboard, tenants, approvals, logs
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  
  const [insights, setInsights] = useState(null)
  const [tenants, setTenants] = useState([])
  const [pendingUsers, setPendingUsers] = useState([])
  const [logs, setLogs] = useState([])
  
  // New Tenant Form
  const [newTenantId, setNewTenantId] = useState('')
  const [newTenantName, setNewTenantName] = useState('')
  const [isCreatingTenant, setIsCreatingTenant] = useState(false)
  const [createMsg, setCreateMsg] = useState('')

  // Upload Document to Tenant Form
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadTenant, setUploadTenant] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState('')
  
  // Global Logs Filters
  const [logTenantFilter, setLogTenantFilter] = useState('all')
  const [logDateFilter, setLogDateFilter] = useState('all') // all, today, week, month
  const [logUserSearch, setLogUserSearch] = useState('')
  
  // Modal states for logs
  const [selectedLog, setSelectedLog] = useState(null)
  const [expandedSource, setExpandedSource] = useState(null)
  
  // Real data processing for charts
  const processChartData = () => {
      const queryCounts = {};
      const tenantUsers = {};
      
      logs.forEach(log => {
          // Format date as 'MMM DD'
          const dateObj = new Date(log.time);
          const date = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          queryCounts[date] = (queryCounts[date] || 0) + 1;
          
          const tenant = log.tenant_id || 'Unknown';
          if (!tenantUsers[tenant]) tenantUsers[tenant] = new Set();
          if (log.username) tenantUsers[tenant].add(log.username);
      });
      
      // Convert to array and sort chronologically (assuming logs are fetched desc, reverse to asc for chart)
      let queryData = Object.keys(queryCounts).map(date => ({
          name: date,
          queries: queryCounts[date],
          rawDate: new Date(date + ' ' + new Date().getFullYear()) // approximation for sorting
      })).sort((a, b) => a.rawDate - b.rawDate).slice(-14);
      
      if (queryData.length === 0) queryData = [{ name: 'No Data', queries: 0 }];
      
      let tenantData = Object.keys(tenantUsers).map(tenant => ({
          name: tenant.length > 15 ? tenant.substring(0,15)+'...' : tenant,
          users: tenantUsers[tenant].size
      }));
      
      if (tenantData.length === 0) tenantData = [{ name: 'No Tenants', users: 0 }];

      return { queryData, tenantData };
  };
  
  const { queryData, tenantData } = processChartData();
  
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
    fetchGlobalLogs()
  }, [])

  useEffect(() => {
      if (activeTab === 'dashboard') fetchData()
      else if (activeTab === 'tenants') fetchTenants()
      else if (activeTab === 'approvals') fetchPendingUsers()
      else if (activeTab === 'logs') fetchGlobalLogs()
  }, [activeTab])

  const headers = { 
      'Authorization': `Bearer ${localStorage.getItem('rag_jwt')}`,
      'Content-Type': 'application/json'
  }

  const fetchData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/admin/insights`, { headers })
      if (response.ok) {
        const data = await response.json()
        setInsights(data)
      }
    } catch (err) { console.error(err) }
  }
  
  const fetchTenants = async () => {
      try {
          const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/admin/super/tenants`, { headers })
          if (res.ok) {
              const data = await res.json()
              setTenants(data.tenants)
          }
      } catch (e) { console.error(e) }
  }
  
  const fetchPendingUsers = async () => {
      try {
          const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/admin/users/pending`, { headers })
          if (res.ok) {
              const data = await res.json()
              setPendingUsers(data.pending_users)
          }
      } catch (e) { console.error(e) }
  }
  
  const fetchGlobalLogs = async () => {
      try {
          const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/admin/super/logs`, { headers })
          if (res.ok) {
              const data = await res.json()
              setLogs(data.logs)
          }
      } catch (e) { console.error(e) }
  }

  const handleCreateTenant = async (e) => {
      e.preventDefault()
      setIsCreatingTenant(true)
      setCreateMsg('')
      try {
          const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/admin/super/tenants`, {
              method: 'POST',
              headers,
              body: JSON.stringify({ tenant_id: newTenantId, name: newTenantName })
          })
          const data = await res.json()
          if (res.ok) {
              setCreateMsg(`Success! API Key: ${data.api_key}`)
              setNewTenantId('')
              setNewTenantName('')
              fetchTenants()
          } else {
              setCreateMsg(`Error: ${data.detail}`)
          }
      } catch (err) {
          setCreateMsg("Connection error.")
      } finally {
          setIsCreatingTenant(false)
      }
  }

  const handleUploadToTenant = async (e) => {
      e.preventDefault()
      if (!uploadFile || !uploadTenant) {
          setUploadMsg("Please select a tenant and a file.");
          return;
      }
      setIsUploading(true)
      setUploadMsg('')
      
      const formData = new FormData()
      formData.append('file', uploadFile)
      formData.append('target_tenant', uploadTenant)
      
      try {
          const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/admin/files/upload`, {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${localStorage.getItem('rag_jwt')}`
                  // No Content-Type for FormData
              },
              body: formData
          })
          const data = await res.json()
          if (res.ok) {
              setUploadMsg(`Success! ${data.message}`)
              setUploadFile(null)
          } else {
              setUploadMsg(`Error: ${data.detail}`)
          }
      } catch (err) {
          setUploadMsg("Connection error.")
      } finally {
          setIsUploading(false)
      }
  }

  const handleUpdateStatus = async (username, status) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/admin/users/status`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ username, status })
      })
      if (response.ok) {
        fetchPendingUsers()
      }
    } catch (err) { console.error(err) }
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const SidebarItem = ({ id, icon: Icon, label }) => {
      const isActive = activeTab === id
      return (
          <button 
              onClick={() => setActiveTab(id)}
              style={{
                  display: 'flex', alignItems: 'center', gap: '1rem', 
                  width: '100%', padding: '1rem 1.5rem', 
                  background: isActive ? 'rgba(168, 85, 247, 0.15)' : 'transparent', 
                  border: 'none', 
                  borderRight: isActive ? '3px solid #a855f7' : '3px solid transparent',
                  color: isActive ? '#c084fc' : '#a1a1aa', 
                  cursor: 'pointer', fontSize: '0.95rem', fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.2s',
                  justifyContent: sidebarExpanded ? 'flex-start' : 'center'
              }}
              onMouseOver={e => { if(!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff' } }}
              onMouseOut={e => { if(!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a1a1aa' } }}
              title={label}
          >
              <Icon size={20} style={{ minWidth: '20px' }} />
              {sidebarExpanded && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
          </button>
      )
  }

    return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#05070f', color: '#fff', fontFamily: 'Inter, sans-serif', overflow: 'hidden', position: 'relative' }}>
        
        {/* COLLAPSIBLE SIDEBAR */}
        <div style={{ 
            width: sidebarExpanded ? '260px' : '70px', 
            borderRight: '1px solid rgba(255,255,255,0.05)', 
            display: 'flex', 
            flexDirection: 'column', 
            background: 'rgba(10, 15, 30, 0.4)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            zIndex: 10,
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden'
        }}>
            <div style={{ padding: sidebarExpanded ? '1.5rem' : '1.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: sidebarExpanded ? 'flex-start' : 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarExpanded ? 'space-between' : 'center', width: '100%', marginBottom: sidebarExpanded ? '1rem' : '0' }}>
                    {sidebarExpanded && (
                        <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: '0.5px' }}>
                            <Scale size={24} color="#fff" />
                            Hanka Admin
                        </h1>
                    )}
                    <button 
                        onClick={() => setSidebarExpanded(!sidebarExpanded)} 
                        style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Menu size={24} />
                    </button>
                </div>
                {sidebarExpanded && (
                    <div style={{ fontSize: '0.75rem', color: '#a1a1aa', background: 'rgba(255,255,255,0.05)', padding: '0.35rem 0.6rem', borderRadius: '0.25rem', width: '100%' }}>
                        Role: <strong style={{ color: '#fff' }}>SUPER_ADMIN</strong>
                    </div>
                )}
            </div>
            
            <div style={{ flex: 1, padding: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <SidebarItem id="dashboard" icon={LayoutDashboard} label="Global Metrics" />
                <SidebarItem id="tenants" icon={Building2} label="Tenants" />
                <SidebarItem id="approvals" icon={ShieldCheck} label="Access Requests" />
                <SidebarItem id="logs" icon={Activity} label="Global Logs" />
            </div>
            
            <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center' }}>
                <button 
                    onClick={handleLogout}
                    style={{ 
                        width: '100%', padding: '0.75rem', 
                        background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', 
                        border: '1px dashed rgba(239, 68, 68, 0.3)', borderRadius: '0.5rem', 
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        transition: 'all 0.2s', fontWeight: 500
                    }}
                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.borderStyle = 'solid' }}
                    onMouseOut={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.borderStyle = 'dashed' }}
                    title="Logout"
                >
                    <LogOut size={16} style={{ minWidth: '16px' }} /> 
                    {sidebarExpanded && <span>Logout</span>}
                </button>
            </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '3rem', scrollBehavior: 'smooth', position: 'relative', zIndex: 10 }}>
            <div style={{ maxWidth: '1400px', width: '90%', margin: '0 auto' }}>
                
                {/* 1. DASHBOARD TAB */}
                {activeTab === 'dashboard' && (
                    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                        <h2 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', fontWeight: 300, letterSpacing: '-0.5px' }}>Master <span style={{fontWeight: 700}}>Oversight</span></h2>
                        <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0 0 3rem 0', fontSize: '1.05rem' }}>Global monitoring of all enterprise instances and nodes.</p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
                            <div style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', padding: '2.5rem', borderRadius: '1.25rem', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05 }}><Building2 size={120} /></div>
                                <h3 style={{ margin: 0, color: '#fff', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                                    <Building2 size={18} /> Total Tenants
                                </h3>
                                <p style={{ fontSize: '3.5rem', margin: '1rem 0 0 0', fontWeight: 300, color: '#fff' }}>{insights?.total_tenants || 0}</p>
                            </div>
                            
                            <div style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', padding: '2.5rem', borderRadius: '1.25rem', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05 }}><Users size={120} /></div>
                                <h3 style={{ margin: 0, color: '#fff', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                                    <Users size={18} /> Global Users
                                </h3>
                                <p style={{ fontSize: '3.5rem', margin: '1rem 0 0 0', fontWeight: 300, color: '#fff' }}>{insights?.total_users || 0}</p>
                            </div>
                            
                            <div style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', padding: '2.5rem', borderRadius: '1.25rem', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05 }}><Activity size={120} /></div>
                                <h3 style={{ margin: 0, color: '#fff', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                                    <Activity size={18} /> Global Queries
                                </h3>
                                <p style={{ fontSize: '3.5rem', margin: '1rem 0 0 0', fontWeight: 300, color: '#fff' }}>{insights?.total_queries || 0}</p>
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '1.25rem' }}>
                                <h3 style={{ margin: '0 0 1.5rem 0', color: '#fff', fontSize: '1.1rem', fontWeight: 600 }}>Queries Over Time</h3>
                                <div style={{ width: '100%', height: '300px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={queryData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip contentStyle={{ background: 'rgba(5, 7, 15, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                                            <Line type="monotone" dataKey="queries" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '1.25rem' }}>
                                <h3 style={{ margin: '0 0 1.5rem 0', color: '#fff', fontSize: '1.1rem', fontWeight: 600 }}>Users per Tenant</h3>
                                <div style={{ width: '100%', height: '300px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={tenantData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip contentStyle={{ background: 'rgba(5, 7, 15, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                            <Bar dataKey="users" fill="#a855f7" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. TENANTS TAB */}
                {activeTab === 'tenants' && (
                    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ fontSize: '2.2rem', margin: '0 0 0.5rem 0', fontWeight: 300, letterSpacing: '-0.5px' }}>Tenant <span style={{fontWeight: 700}}>Instances</span></h2>
                                <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0 }}>Manage enterprise clients and their API Keys.</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                            {/* Tenant List */}
                            <div style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', overflow: 'hidden' }}>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>
                                                <th style={{ padding: '1rem 1.5rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Tenant ID</th>
                                                <th style={{ padding: '1rem 1.5rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Name</th>
                                                <th style={{ padding: '1rem 1.5rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>API Key</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tenants.map(t => (
                                                <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                                                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 500 }}>{t.id}</td>
                                                    <td style={{ padding: '1.25rem 1.5rem', color: '#d4d4d8' }}>{t.name}</td>
                                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.4rem 0.75rem', borderRadius: '0.5rem', width: 'fit-content', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                            <Key size={14} color="#a1a1aa" />
                                                            <code style={{ fontSize: '0.85rem', color: '#a855f7' }}>{t.api_key.substring(0, 12)}...</code>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {tenants.length === 0 && (
                                                <tr><td colSpan="3" style={{ padding: '3rem', textAlign: 'center', color: '#a1a1aa' }}>No tenants found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            
                            {/* Forms Column */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                {/* Create Tenant Form */}
                                <div style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem', height: 'fit-content' }}>
                                    <h3 style={{ margin: '0 0 1.5rem 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                                        <Plus size={18} /> New Instance
                                    </h3>
                                    
                                    {createMsg && (
                                        <div style={{ padding: '1rem', background: createMsg.includes('Success') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: createMsg.includes('Success') ? '#34d399' : '#ef4444', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem', border: `1px solid ${createMsg.includes('Success') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}` }}>
                                            {createMsg}
                                        </div>
                                    )}
                                    
                                    <form onSubmit={handleCreateTenant} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.5rem' }}>Tenant ID (No Spaces)</label>
                                            <input 
                                                type="text" 
                                                value={newTenantId}
                                                onChange={(e) => setNewTenantId(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                                                required
                                                style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: '#fff', outline: 'none' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.5rem' }}>Display Name</label>
                                            <input 
                                                type="text" 
                                                value={newTenantName}
                                                onChange={(e) => setNewTenantName(e.target.value)}
                                                required
                                                style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: '#fff', outline: 'none' }}
                                            />
                                        </div>
                                        <button 
                                            type="submit" 
                                            disabled={isCreatingTenant}
                                            style={{ width: '100%', padding: '0.85rem', background: '#a855f7', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: isCreatingTenant ? 'not-allowed' : 'pointer', marginTop: '0.5rem', transition: 'background 0.2s' }}
                                            onMouseOver={e=> { if(!isCreatingTenant) e.currentTarget.style.background = '#9333ea' }}
                                            onMouseOut={e=> { if(!isCreatingTenant) e.currentTarget.style.background = '#a855f7' }}
                                        >
                                            {isCreatingTenant ? 'Provisioning...' : 'Provision Tenant'}
                                        </button>
                                    </form>
                                </div>

                                {/* Upload to Tenant Form */}
                                <div style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '1rem', padding: '1.5rem', height: 'fit-content' }}>
                                    <h3 style={{ margin: '0 0 1.5rem 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                                        <Database size={18} /> Seed Knowledge Base
                                    </h3>
                                    
                                    {uploadMsg && (
                                        <div style={{ padding: '1rem', background: uploadMsg.includes('Success') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: uploadMsg.includes('Success') ? '#34d399' : '#ef4444', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem', border: `1px solid ${uploadMsg.includes('Success') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}` }}>
                                            {uploadMsg}
                                        </div>
                                    )}
                                    
                                    <form onSubmit={handleUploadToTenant} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.5rem' }}>Select Target Tenant</label>
                                            <select 
                                                value={uploadTenant}
                                                onChange={(e) => setUploadTenant(e.target.value)}
                                                required
                                                style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: '#fff', outline: 'none', cursor: 'pointer' }}
                                            >
                                                <option value="" disabled style={{ background: '#18181b' }}>-- Select Tenant --</option>
                                                {tenants.map(t => (
                                                    <option key={t.id} value={t.id} style={{ background: '#18181b' }}>{t.id} - {t.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.5rem' }}>Document File (PDF, TXT, DOCX)</label>
                                            <input 
                                                type="file"
                                                accept=".pdf,.txt,.docx"
                                                onChange={(e) => setUploadFile(e.target.files[0])}
                                                required
                                                style={{ width: '100%', padding: '0.65rem', background: 'rgba(0,0,0,0.2)', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '0.5rem', color: '#fff', outline: 'none', fontSize: '0.9rem' }}
                                            />
                                        </div>
                                        <button 
                                            type="submit" 
                                            disabled={isUploading}
                                            style={{ width: '100%', padding: '0.85rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: isUploading ? 'not-allowed' : 'pointer', marginTop: '0.5rem', transition: 'background 0.2s' }}
                                            onMouseOver={e=> { if(!isUploading) e.currentTarget.style.background = '#2563eb' }}
                                            onMouseOut={e=> { if(!isUploading) e.currentTarget.style.background = '#3b82f6' }}
                                        >
                                            {isUploading ? 'Uploading & Processing...' : 'Upload File'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. APPROVALS TAB */}
                {activeTab === 'approvals' && (
                    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                        <div style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '2.2rem', margin: '0 0 0.5rem 0', fontWeight: 300, letterSpacing: '-0.5px' }}>Global Access <span style={{fontWeight: 700}}>Requests</span></h2>
                            <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0 }}>Review and approve initial Tenant Admins and cross-tenant users.</p>
                        </div>
                        
                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', overflow: 'hidden' }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>
                                            <th style={{ padding: '1rem 1.5rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Username</th>
                                            <th style={{ padding: '1rem 1.5rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Target Tenant</th>
                                            <th style={{ padding: '1rem 1.5rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Role Requested</th>
                                            <th style={{ padding: '1rem 1.5rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingUsers.map(user => (
                                            <tr key={user.username} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                                                <td style={{ padding: '1.25rem 1.5rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                                        {user.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    {user.username}
                                                </td>
                                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                                    <span style={{ background: 'rgba(255,255,255,0.05)', padding: '0.35rem 0.75rem', borderRadius: '1rem', fontSize: '0.85rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                        {user.tenant_id}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                                    <span style={{ 
                                                        color: user.role === 'tenant_admin' ? '#c084fc' : '#60a5fa', 
                                                        background: user.role === 'tenant_admin' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                                        padding: '0.35rem 0.75rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 600
                                                    }}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                        <button 
                                                            onClick={() => handleUpdateStatus(user.username, 'approved')}
                                                            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, transition: 'background 0.2s' }}
                                                            onMouseOver={e=>e.currentTarget.style.background='rgba(16, 185, 129, 0.2)'}
                                                            onMouseOut={e=>e.currentTarget.style.background='rgba(16, 185, 129, 0.1)'}
                                                        >
                                                            <CheckCircle size={16} /> Approve
                                                        </button>
                                                        <button 
                                                            onClick={() => handleUpdateStatus(user.username, 'rejected')}
                                                            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, transition: 'background 0.2s' }}
                                                            onMouseOver={e=>e.currentTarget.style.background='rgba(239, 68, 68, 0.2)'}
                                                            onMouseOut={e=>e.currentTarget.style.background='rgba(239, 68, 68, 0.1)'}
                                                        >
                                                            <XCircle size={16} /> Reject
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {pendingUsers.length === 0 && (
                                            <tr>
                                                <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: '#a1a1aa' }}>
                                                    <ShieldCheck size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                                    <div>All caught up. No pending requests.</div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. GLOBAL LOGS TAB */}
                {activeTab === 'logs' && (
                    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <h2 style={{ fontSize: '2.2rem', margin: '0 0 0.5rem 0', fontWeight: 300, letterSpacing: '-0.5px' }}>Global Agentic <span style={{fontWeight: 700}}>Logs</span></h2>
                                <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0 }}>System-wide monitoring of all RAG interactions.</p>
                            </div>
                            
                            {/* Filters */}
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                {/* Username Search */}
                                <input 
                                    type="text"
                                    placeholder="Search username..."
                                    value={logUserSearch}
                                    onChange={(e) => setLogUserSearch(e.target.value)}
                                    style={{ padding: '0.65rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: '#fff', fontSize: '0.85rem', outline: 'none', minWidth: '150px' }}
                                />
                                
                                {/* Tenant Filter */}
                                <select 
                                    value={logTenantFilter}
                                    onChange={(e) => setLogTenantFilter(e.target.value)}
                                    style={{ padding: '0.65rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: '#fff', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}
                                >
                                    <option value="all" style={{ background: '#18181b' }}>All Tenants</option>
                                    {[...new Set(logs.map(l => l.tenant_id))].map(tId => (
                                        <option key={tId} value={tId} style={{ background: '#18181b' }}>Tenant: {tId}</option>
                                    ))}
                                </select>

                                {/* Date Filter */}
                                <select 
                                    value={logDateFilter}
                                    onChange={(e) => setLogDateFilter(e.target.value)}
                                    style={{ padding: '0.65rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: '#fff', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}
                                >
                                    <option value="all" style={{ background: '#18181b' }}>All Time</option>
                                    <option value="today" style={{ background: '#18181b' }}>Today</option>
                                    <option value="week" style={{ background: '#18181b' }}>Past 7 Days</option>
                                    <option value="month" style={{ background: '#18181b' }}>Past 30 Days</option>
                                </select>
                            </div>
                        </div>
                        
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {(() => {
                                const filteredLogs = logs.filter(log => {
                                    // Tenant filter
                                    if (logTenantFilter !== 'all' && log.tenant_id !== logTenantFilter) return false;
                                    
                                    // Username search
                                    if (logUserSearch && !log.username.toLowerCase().includes(logUserSearch.toLowerCase())) return false;
                                    
                                    // Date filter
                                    if (logDateFilter !== 'all') {
                                        const logDate = new Date(log.time);
                                        const now = new Date();
                                        const diffDays = (now - logDate) / (1000 * 60 * 60 * 24);
                                        if (logDateFilter === 'today' && logDate.toDateString() !== now.toDateString()) return false;
                                        if (logDateFilter === 'week' && diffDays > 7) return false;
                                        if (logDateFilter === 'month' && diffDays > 30) return false;
                                    }
                                    return true;
                                });

                                if (filteredLogs.length === 0) {
                                    return (
                                        <div style={{ padding: '4rem', textAlign: 'center', color: '#a1a1aa', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', borderRadius: '1rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                            <Activity size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                            <div>No activity matches your filters.</div>
                                        </div>
                                    );
                                }

                                return filteredLogs.map((log, i) => (
                                    <div key={i} onClick={() => setSelectedLog(log)} style={{ 
                                        background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)', padding: '1.5rem', borderRadius: '1rem', 
                                        border: '1px solid rgba(255,255,255,0.1)', display: 'grid', gridTemplateColumns: '200px 1fr', gap: '2rem',
                                        transition: 'background 0.2s', cursor: 'pointer'
                                    }} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.06)'} onMouseOut={e=>e.currentTarget.style.background='rgba(255,255,255,0.03)'}>
                                        
                                        <div style={{ borderRight: '1px solid rgba(255,255,255,0.05)', paddingRight: '1rem' }}>
                                            <div style={{ fontSize: '0.8rem', color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
                                                <Clock size={14} /> {new Date(log.time).toLocaleString()}
                                            </div>
                                            <div style={{ fontWeight: 600, color: '#e4e4e7', marginBottom: '0.5rem' }}>{log.username}</div>
                                            <div style={{ display: 'inline-block', background: 'rgba(168, 85, 247, 0.1)', color: '#c084fc', padding: '0.25rem 0.6rem', borderRadius: '0.5rem', fontSize: '0.75rem', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                                                {log.tenant_id}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <div style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                                                <strong style={{ color: '#60a5fa' }}>Q:</strong> {log.query}
                                            </div>
                                            <div style={{ color: '#a1a1aa', fontSize: '0.95rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                <strong style={{ color: '#34d399' }}>A:</strong> {log.answer}
                                            </div>
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>
                )}
            </div>
        </div>
        
        {/* LOG DETAIL MODAL */}
        {selectedLog && (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(5, 7, 15, 0.65)', backdropFilter: 'blur(10px)',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                zIndex: 1000, padding: '2rem'
            }}>
                <div style={{
                    background: 'rgba(10, 15, 30, 0.4)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '1.25rem', width: '100%', maxWidth: '800px', maxHeight: '90vh',
                    overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
                }}>
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'rgba(10, 15, 30, 0.8)', backdropFilter: 'blur(20px)', zIndex: 10 }}>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Activity size={20} color="#fff"/> Activity Insights
                        </h2>
                        <button onClick={() => { setSelectedLog(null); setExpandedSource(null); }} style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', padding: '0.5rem', transition: 'color 0.2s' }} onMouseOver={e=>e.currentTarget.style.color='#fff'} onMouseOut={e=>e.currentTarget.style.color='#a1a1aa'}>
                            <XCircle size={28} />
                        </button>
                    </div>
                    
                    <div style={{ padding: '2.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.25rem 1.5rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem' }}>Execution Time</div>
                                <div style={{ color: '#fff', fontWeight: 500, fontSize: '1.1rem' }}>{new Date(selectedLog.time).toLocaleString()}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.75rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem' }}>Status</div>
                                <div style={{ color: '#10b981', fontWeight: 600, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}><CheckCircle size={16}/> Success</div>
                            </div>
                        </div>
                        
                        <div style={{ marginBottom: '3rem' }}>
                            <div style={{ fontSize: '0.85rem', color: '#60a5fa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Users size={16} /> User Query
                            </div>
                            <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.15)', padding: '1.5rem', borderRadius: '0.75rem', color: '#fff', fontSize: '1.15rem', lineHeight: 1.6 }}>
                                {selectedLog.query}
                            </div>
                        </div>
                        
                        <div style={{ marginBottom: '3rem' }}>
                            <div style={{ fontSize: '0.85rem', color: '#c084fc', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Database size={16} /> Agent Response
                            </div>
                            <div className="markdown-body custom-markdown" style={{ background: 'rgba(168, 85, 247, 0.05)', border: '1px solid rgba(168, 85, 247, 0.15)', padding: '1.5rem', borderRadius: '0.75rem', color: '#f4f4f5', fontSize: '1rem', lineHeight: 1.8 }}>
                                {selectedLog.answer ? (
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {selectedLog.answer}
                                    </ReactMarkdown>
                                ) : (
                                    <span style={{ fontStyle: 'italic', color: '#a1a1aa' }}>No answer recorded in state.</span>
                                )}
                            </div>
                        </div>
                        
                        <div>
                            <div style={{ fontSize: '0.85rem', color: '#34d399', marginBottom: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FileText size={16} /> Documents Context Retrieved ({selectedLog.sources?.length || 0})
                            </div>
                            
                            {(!selectedLog.sources || selectedLog.sources.length === 0) ? (
                                <div style={{ color: '#52525b', fontSize: '0.9rem', padding: '2rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.75rem', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.05)' }}>The agent did not fetch any documents for this query.</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {selectedLog.sources.map((src, i) => {
                                        const isExpanded = expandedSource === i;
                                        return (
                                            <div 
                                                key={i} 
                                                onClick={() => setExpandedSource(isExpanded ? null : i)}
                                                style={{ 
                                                    background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '0.75rem', 
                                                    borderLeft: '4px solid #10b981', borderTop: '1px solid rgba(255,255,255,0.05)', 
                                                    borderRight: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                    cursor: 'pointer', transition: 'background 0.2s'
                                                }}
                                                onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.05)'}
                                                onMouseOut={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                                            >
                                                <div style={{ fontSize: '0.9rem', color: '#34d399', marginBottom: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                                        <FileText size={16} style={{ minWidth: '16px' }}/> {typeof src === 'string' ? src : (src.metadata?.source || src.metadata?.filename || 'System Chunk')}
                                                    </div>
                                                    <ChevronDown size={16} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
                                                </div>
                                                {(src.page_content || typeof src === 'string') && (
                                                    <div style={{ 
                                                        fontSize: '0.9rem', color: '#a1a1aa', lineHeight: 1.7, 
                                                        display: isExpanded ? 'block' : '-webkit-box', 
                                                        WebkitLineClamp: isExpanded ? 'unset' : 3, 
                                                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                                        transition: 'all 0.3s ease'
                                                    }}>
                                                        {typeof src === 'string' ? src.replace('CONTENT: ', '') : src.page_content}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}
        
        <style>{`
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            
            /* Custom Scrollbar for Modal and App */
            ::-webkit-scrollbar {
                width: 8px;
                height: 8px;
            }
            ::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.2); 
                border-radius: 4px;
            }
            ::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.1); 
                border-radius: 4px;
            }
            ::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.2); 
            }

            /* Fix Markdown Styling Spacing */
            .custom-markdown p { margin-top: 0; margin-bottom: 1rem; }
            .custom-markdown p:last-child { margin-bottom: 0; }
            .custom-markdown ul, .custom-markdown ol { margin-top: 0; padding-left: 1.5rem; margin-bottom: 1rem; }
            .custom-markdown li { margin-bottom: 0.5rem; }
            .custom-markdown h1, .custom-markdown h2, .custom-markdown h3 { margin-top: 1.5rem; margin-bottom: 0.75rem; color: #fff; }
        `}</style>
    </div>
  )
}
