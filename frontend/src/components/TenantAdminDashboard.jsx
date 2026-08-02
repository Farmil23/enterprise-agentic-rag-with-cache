import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
    LogOut, Users, MessageSquare, CheckCircle, XCircle, 
    FileText, Upload, Download, LayoutDashboard, Activity, 
    Settings, ShieldCheck, Menu, Search, Clock, Database, ChevronRight, Filter, ChevronDown, Scale
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function TenantAdminDashboard() {
  const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState('dashboard') // dashboard, activity, knowledge, settings
  const [sidebarExpanded, setSidebarExpanded] = useState(window.innerWidth > 768)
  
  const [pendingUsers, setPendingUsers] = useState([])
  const [insights, setInsights] = useState(null)
  const [usersList, setUsersList] = useState([])
  const [historyUser, setHistoryUser] = useState('')
  const [userHistory, setUserHistory] = useState(null)
  const [tenantLogs, setTenantLogs] = useState([])
  const [dateFilter, setDateFilter] = useState('all') // 'all', 'today', 'week', 'month'
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const [logSearch, setLogSearch] = useState('')
  const [selectedLog, setSelectedLog] = useState(null)
  const [expandedSource, setExpandedSource] = useState(null)
  
  // Real data processing for charts
  const processChartData = () => {
      const queryCounts = {};
      const userActivity = {};
      
      tenantLogs.forEach(log => {
          // Format date as 'MMM DD'
          const dateObj = new Date(log.time);
          const date = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          queryCounts[date] = (queryCounts[date] || 0) + 1;
          
          const user = log.username || 'Unknown';
          userActivity[user] = (userActivity[user] || 0) + 1;
      });
      
      // Convert to array and sort chronologically
      let queryData = Object.keys(queryCounts).map(date => ({
          name: date,
          queries: queryCounts[date],
          rawDate: new Date(date + ' ' + new Date().getFullYear())
      })).sort((a, b) => a.rawDate - b.rawDate).slice(-14);
      
      if (queryData.length === 0) queryData = [{ name: 'No Data', queries: 0 }];
      
      let userActivityData = Object.keys(userActivity).map(user => ({
          name: user.length > 15 ? user.substring(0,15)+'...' : user,
          queries: userActivity[user]
      }));
      
      if (userActivityData.length === 0) userActivityData = [{ name: 'No Users', queries: 0 }];

      return { queryData, userActivityData };
  };
  
  const { queryData, userActivityData } = processChartData();
  
  const navigate = useNavigate()
  const tenantId = localStorage.getItem('rag_tenant') || ''

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('rag_jwt')}` }
      const [usersRes, insightsRes, allUsersRes, filesRes, logsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000' : window.location.origin)}/admin/users/pending`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000' : window.location.origin)}/admin/insights`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000' : window.location.origin)}/admin/users/all`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000' : window.location.origin)}/files`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000' : window.location.origin)}/admin/tenant/logs`, { headers })
      ])
      
      if (usersRes.ok) setPendingUsers((await usersRes.json()).pending_users)
      if (insightsRes.ok) setInsights(await insightsRes.json())
      if (allUsersRes.ok) setUsersList((await allUsersRes.json()).users)
      if (filesRes.ok) setFiles((await filesRes.json()).files)
      if (logsRes.ok) setTenantLogs((await logsRes.json()).logs)
    } catch (err) { console.error(err) }
  }

  const handleStatusUpdate = async (username, status) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000' : window.location.origin)}/admin/users/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('rag_jwt')}`
        },
        body: JSON.stringify({ username, status })
      })
      if (response.ok) fetchData()
    } catch (err) { console.error(err) }
  }

  const fetchHistory = async (username) => {
    if (!username) {
        setUserHistory(null)
        return
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000' : window.location.origin)}/admin/history/${username}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('rag_jwt')}` }
      })
      if (response.ok) {
        const data = await response.json()
        setUserHistory(data.history || [])
      } else {
        setUserHistory([])
      }
    } catch (err) { console.error(err) }
  }

  const handleUserSelect = (e) => {
    const selected = e.target.value
    setHistoryUser(selected)
    fetchHistory(selected)
  }
  
  const handleFileUpload = async (e) => {
      e.preventDefault()
      if (!uploadFile) return
      
      setUploading(true)
      const formData = new FormData()
      formData.append('file', uploadFile)
      
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000' : window.location.origin)}/admin/files/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('rag_jwt')}` },
            body: formData
        })
        if (response.ok) {
            alert(t("tenantAdmin.alert_upload_success"))
            setUploadFile(null)
            fetchData() 
        } else alert(t("tenantAdmin.alert_upload_failed"))
      } catch (error) { console.error(error) } 
      finally { setUploading(false) }
  }
  
  const handleDownload = async (fileId, filename) => {
      try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000' : window.location.origin)}/files/download/${fileId}`, {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('rag_jwt')}` }
          })
          if (response.ok) {
              const blob = await response.blob()
              const url = window.URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = filename
              document.body.appendChild(a)
              a.click()
              window.URL.revokeObjectURL(url)
              a.remove()
          } else alert(t("tenantAdmin.alert_download_failed"))
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
                  width: '100%', padding: sidebarExpanded ? '0.85rem 1rem' : '0.85rem 0',
                  background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  color: isActive ? '#60a5fa' : '#a1a1aa',
                  border: 'none', borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                  cursor: 'pointer', textAlign: 'left',
                  fontSize: '0.95rem', fontWeight: isActive ? 600 : 400,
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

  const filteredHistory = userHistory?.filter(log => {
      if (dateFilter === 'all') return true
      const logDate = new Date(log.time)
      const now = new Date()
      const diffDays = (now - logDate) / (1000 * 60 * 60 * 24)
      if (dateFilter === 'today') return logDate.toDateString() === now.toDateString()
      if (dateFilter === 'week') return diffDays <= 7
      if (dateFilter === 'month') return diffDays <= 30
      return true
  })

    return (
    <div style={{ display: 'flex', width: '100%', height: '100vh', backgroundColor: '#05070f', color: '#fff', fontFamily: 'Inter, sans-serif', overflow: 'hidden', position: 'relative' }}>
        
        {/* COLLAPSIBLE SIDEBAR */}
        <div className="admin-sidebar" style={{ 
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
                            Hanka Tenant
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
                        {t("tenantAdmin.sb_tenant")} <strong style={{ color: '#fff' }}>{tenantId.toUpperCase()}</strong>
                    </div>
                )}
            </div>
            
            <div style={{ flex: 1, padding: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <SidebarItem id="dashboard" icon={LayoutDashboard} label={t("tenantAdmin.sb_dashboard")} />
                <SidebarItem id="activity" icon={Activity} label={t("tenantAdmin.sb_activity")} />
                <SidebarItem id="knowledge" icon={Database} label={t("tenantAdmin.sb_knowledge")} />
                <SidebarItem id="settings" icon={Users} label={t("tenantAdmin.sb_users")} />
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
                    title={t("tenantAdmin.sb_logout")}
                >
                    <LogOut size={16} style={{ minWidth: '16px' }} /> 
                    {sidebarExpanded && <span>{t("tenantAdmin.sb_logout")}</span>}
                </button>
            </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="admin-main" style={{ flex: 1, overflowY: 'auto', padding: '3rem', scrollBehavior: 'smooth', position: 'relative', zIndex: 10 }}>
            <div style={{ maxWidth: '1400px', width: '90%', margin: '0 auto' }}>
                
                {/* 1. DASHBOARD TAB */}
                {activeTab === 'dashboard' && (
                    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                        <h2 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', fontWeight: 300, letterSpacing: '-0.5px' }}>{t("tenantAdmin.dash_welcome")} <span style={{fontWeight: 700}}>{t("tenantAdmin.dash_admin")}</span></h2>
                        <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0 0 3rem 0', fontSize: '1.05rem' }}>{t("tenantAdmin.dash_desc")}</p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
                            <div style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', padding: '2.5rem', borderRadius: '1.25rem', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05 }}><Users size={120} /></div>
                                <h3 style={{ margin: 0, color: '#fff', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                                    <Users size={18} /> {t("tenantAdmin.dash_metric_users")}
                                </h3>
                                <p style={{ fontSize: '4rem', fontWeight: '300', margin: '1rem 0 0 0', color: '#fff', letterSpacing: '-1px' }}>{insights?.total_users || 0}</p>
                            </div>
                            <div style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', padding: '2.5rem', borderRadius: '1.25rem', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05 }}><MessageSquare size={120} /></div>
                                <h3 style={{ margin: 0, color: '#fff', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                                    <MessageSquare size={18} /> {t("tenantAdmin.dash_metric_queries")}
                                </h3>
                                <p style={{ fontSize: '4rem', fontWeight: '300', margin: '1rem 0 0 0', color: '#fff', letterSpacing: '-1px' }}>{insights?.total_queries || 0}</p>
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '1.25rem' }}>
                                <h3 style={{ margin: '0 0 1.5rem 0', color: '#fff', fontSize: '1.1rem', fontWeight: 600 }}>{t("tenantAdmin.dash_chart_time")}</h3>
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
                                <h3 style={{ margin: '0 0 1.5rem 0', color: '#fff', fontSize: '1.1rem', fontWeight: 600 }}>{t("tenantAdmin.dash_chart_users")}</h3>
                                <div style={{ width: '100%', height: '300px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={userActivityData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip contentStyle={{ background: 'rgba(5, 7, 15, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                            <Bar dataKey="queries" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        <h3 style={{ fontSize: '1.3rem', margin: '0 0 1.5rem 0', fontWeight: 600 }}>{t("tenantAdmin.dash_quick_actions")}</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                            <div onClick={() => setActiveTab('settings')} style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', padding: '1.75rem', borderRadius: '1rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '1rem' }} onMouseOver={e=>{e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.transform='translateY(-4px)'}} onMouseOut={e=>{e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.transform='none'}}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Users size={24} color="#fff" />
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>{t("tenantAdmin.dash_qa_users_title")}</h4>
                                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>{t("tenantAdmin.dash_qa_users_desc", { count: pendingUsers.length })}</p>
                                </div>
                            </div>
                            <div onClick={() => setActiveTab('knowledge')} style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', padding: '1.75rem', borderRadius: '1rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '1rem' }} onMouseOver={e=>{e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.transform='translateY(-4px)'}} onMouseOut={e=>{e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.transform='none'}}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Database size={24} color="#fff" />
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>Knowledge Base</h4>
                                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>{t("tenantAdmin.dash_qa_kb_desc")}</p>
                                </div>
                            </div>
                            <div onClick={() => setActiveTab('activity')} style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', padding: '1.75rem', borderRadius: '1rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '1rem' }} onMouseOver={e=>{e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.transform='translateY(-4px)'}} onMouseOut={e=>{e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.transform='none'}}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Activity size={24} color="#fff" />
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>Activity Logs</h4>
                                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>{t("tenantAdmin.dash_qa_activity_desc")}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. ACTIVITY LOGS TAB */}
                {activeTab === 'activity' && (
                    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                        <div style={{ marginBottom: '3rem' }}>
                            <h2 style={{ fontSize: '2.2rem', margin: '0 0 0.5rem 0', fontWeight: 300, letterSpacing: '-0.5px' }}>
                                {t("tenantAdmin.act_title_1")} <span style={{fontWeight: 700}}>{t("tenantAdmin.act_title_2")}</span>
                            </h2>
                            <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem' }}>{t("tenantAdmin.act_desc")}</p>
                        </div>
                        
                        <div className="responsive-flex" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                            {/* User Selector */}
                            <div style={{ width: '300px', background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem', position: 'sticky', top: '0' }}>
                                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Search size={14}/> {t("tenantAdmin.act_select_user")}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {usersList.length === 0 && <div style={{ color: '#52525b', fontSize: '0.9rem' }}>{t("tenantAdmin.act_no_users")}</div>}
                                    {usersList.map(u => (
                                        <button 
                                            key={u.username}
                                            onClick={() => { setHistoryUser(u.username); fetchHistory(u.username); }}
                                            style={{
                                                width: '100%', padding: '1rem',
                                                background: historyUser === u.username ? 'rgba(59, 130, 246, 0.15)' : 'rgba(0,0,0,0.2)',
                                                border: '1px solid', borderColor: historyUser === u.username ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
                                                color: historyUser === u.username ? '#fff' : '#a1a1aa',
                                                borderRadius: '0.75rem', cursor: 'pointer', textAlign: 'left',
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseOver={e => { if(historyUser !== u.username) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                                            onMouseOut={e => { if(historyUser !== u.username) e.currentTarget.style.background = 'rgba(0,0,0,0.2)' }}
                                        >
                                            <span style={{ fontWeight: 500 }}>{u.username}</span>
                                            <ChevronRight size={16} opacity={historyUser === u.username ? 1 : 0.3} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Log Timeline */}
                            <div style={{ flex: 1 }}>
                                {!historyUser ? (
                                    <div style={{ padding: '4rem', textAlign: 'center', background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '1rem', color: '#52525b' }}>
                                        <Activity size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#a1a1aa' }}>{t("tenantAdmin.act_empty_title")}</h3>
                                        <p style={{ margin: 0 }}>{t("tenantAdmin.act_empty_desc")}</p>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Clock size={18} color="#3b82f6"/> {t("tenantAdmin.act_timeline_for")} <span style={{ color: '#fff' }}>{historyUser}</span>
                                            </h3>
                                            
                                            {/* Date Filter Custom Dropdown */}
                                            <div style={{ position: 'relative' }}>
                                                <button 
                                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                                    style={{ 
                                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
                                                        color: '#fff', padding: '0.5rem 1rem', borderRadius: '0.5rem',
                                                        cursor: 'pointer', outline: 'none', fontSize: '0.85rem'
                                                    }}
                                                >
                                                    <Filter size={14} color="#a1a1aa" />
                                                    {dateFilter === 'all' ? t('tenantAdmin.act_filter_all') : dateFilter === 'today' ? t('tenantAdmin.act_filter_today') : dateFilter === 'week' ? t('tenantAdmin.act_filter_week') : t('tenantAdmin.act_filter_month')}
                                                    <ChevronDown size={14} color="#a1a1aa" />
                                                </button>
                                                
                                                {isFilterOpen && (
                                                    <div style={{ 
                                                        position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem',
                                                        background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', 
                                                        borderRadius: '0.5rem', overflow: 'hidden', zIndex: 50,
                                                        width: '150px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                                                    }}>
                                                        {['all', 'today', 'week', 'month'].map(opt => (
                                                            <div 
                                                                key={opt}
                                                                onClick={() => { setDateFilter(opt); setIsFilterOpen(false); }}
                                                                style={{ 
                                                                    padding: '0.75rem 1rem', fontSize: '0.85rem', cursor: 'pointer',
                                                                    background: dateFilter === opt ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                                                                    color: dateFilter === opt ? '#60a5fa' : '#fff',
                                                                    transition: 'background 0.2s'
                                                                }}
                                                                onMouseOver={e => { if(dateFilter !== opt) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                                                                onMouseOut={e => { if(dateFilter !== opt) e.currentTarget.style.background = 'transparent' }}
                                                            >
                                                                {opt === 'all' ? 'All Time' : opt === 'today' ? 'Today' : opt === 'week' ? 'Past 7 Days' : 'Past 30 Days'}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {filteredHistory?.length === 0 ? (
                                            <div style={{ padding: '2rem', textAlign: 'center', color: '#a1a1aa', background: 'rgba(0,0,0,0.2)', borderRadius: '1rem' }}>No activity matches this filter.</div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {filteredHistory?.map((log, idx) => (
                                                    <div 
                                                        key={idx} 
                                                        onClick={() => setSelectedLog(log)}
                                                        style={{ 
                                                            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                                                            padding: '1.5rem', borderRadius: '1rem', cursor: 'pointer',
                                                            transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden'
                                                        }}
                                                        onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)' }}
                                                        onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)' }}
                                                    >
                                                        <div style={{ width: '4px', background: '#3b82f6', position: 'absolute', left: 0, top: 0, bottom: 0 }}></div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                                                            <div style={{ fontSize: '0.85rem', color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <Clock size={14}/> {new Date(log.time).toLocaleString()}
                                                            </div>
                                                            <div style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', padding: '0.25rem 0.75rem', borderRadius: '99px', fontWeight: 600 }}>
                                                                {log.sources?.length || 0} Sources
                                                            </div>
                                                        </div>
                                                        <div style={{ fontSize: '1.05rem', color: '#fff', fontWeight: 500, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                            "{log.query}"
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. KNOWLEDGE BASE TAB */}
                {activeTab === 'knowledge' && (
                    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                        <div style={{ marginBottom: '3rem' }}>
                            <h2 style={{ fontSize: '2.2rem', margin: '0 0 0.5rem 0', fontWeight: 300, letterSpacing: '-0.5px' }}>
                                Tenant Knowledge <span style={{fontWeight: 700}}>Base</span>
                            </h2>
                            <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem' }}>Manage the proprietary documents that fuel your AI agent.</p>
                        </div>
                        
                        <div style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(24, 24, 27, 0.5) 100%)', border: '1px dashed rgba(168, 85, 247, 0.3)', padding: '3rem', borderRadius: '1.25rem', marginBottom: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(168, 85, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                <Upload size={32} color="#a855f7" />
                            </div>
                            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>{t("tenantAdmin.kb_upload_title")}</h3>
                            <p style={{ margin: '0 0 2rem 0', color: '#a1a1aa', fontSize: '0.95rem' }}>Supports PDF, TXT, HTML, DOCX, and PPTX.</p>
                            
                            <form onSubmit={handleFileUpload} style={{ display: 'flex', gap: '1rem', alignItems: 'center', width: '100%', maxWidth: '500px' }}>
                                <input 
                                    type="file" 
                                    id="kb-upload"
                                    onChange={(e) => setUploadFile(e.target.files[0])}
                                    style={{ display: 'none' }}
                                    accept=".pdf,.txt,.html,.htm,.docx,.pptx"
                                />
                                <label 
                                    htmlFor="kb-upload" 
                                    style={{ 
                                        flex: 1, padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.3)', 
                                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', 
                                        color: uploadFile ? '#fff' : '#a1a1aa', fontSize: '0.9rem', cursor: 'pointer',
                                        display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={e=>e.currentTarget.style.borderColor='rgba(168, 85, 247, 0.5)'}
                                    onMouseOut={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'}
                                >
                                    {uploadFile ? uploadFile.name : "Select a document to upload..."}
                                </label>
                                <button 
                                    type="submit" 
                                    disabled={!uploadFile || uploading}
                                    style={{ 
                                        padding: '0.75rem 1.5rem', 
                                        background: uploading || !uploadFile ? 'rgba(255,255,255,0.1)' : '#a855f7', 
                                        color: uploading || !uploadFile ? '#a1a1aa' : '#fff', 
                                        border: 'none', borderRadius: '0.75rem', 
                                        cursor: uploading || !uploadFile ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, transition: 'all 0.2s'
                                    }}
                                >
                                    {uploading ? <div style={{width:'16px', height:'16px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 1s linear infinite'}}/> : <Database size={16} />}
                                    {uploading ? 'Ingesting...' : 'Ingest Data'}
                                </button>
                            </form>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 600 }}>Indexed Files</h3>
                                <div style={{ fontSize: '0.85rem', background: 'rgba(255,255,255,0.1)', padding: '0.35rem 0.75rem', borderRadius: '99px' }}>{files.length} Total</div>
                            </div>
                            
                            {files.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)', borderRadius: '1rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                    <FileText size={48} color="#52525b" style={{ margin: '0 auto 1rem' }} />
                                    <p style={{ color: '#a1a1aa', fontSize: '1.05rem', margin: 0 }}>No documents have been indexed yet.</p>
                                </div>
                            ) : (
                                <div style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                                        <thead>
                                            <tr style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <th style={{ textAlign: 'left', padding: '1.25rem 1.5rem', fontWeight: 600, color: '#a1a1aa' }}>Document Name</th>
                                                <th style={{ textAlign: 'left', padding: '1.25rem 1.5rem', fontWeight: 600, color: '#a1a1aa' }}>Uploader</th>
                                                <th style={{ textAlign: 'left', padding: '1.25rem 1.5rem', fontWeight: 600, color: '#a1a1aa' }}>Date Indexed</th>
                                                <th style={{ textAlign: 'right', padding: '1.25rem 1.5rem', fontWeight: 600, color: '#a1a1aa' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {files.map(f => (
                                                <tr key={f.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.03)'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                            <div style={{ width: '36px', height: '36px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <FileText size={18} color="#a855f7" />
                                                            </div>
                                                            <span style={{ fontWeight: 500, color: '#fff' }}>{f.filename}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1.25rem 1.5rem', color: '#a1a1aa' }}>{f.uploaded_by}</td>
                                                    <td style={{ padding: '1.25rem 1.5rem', color: '#a1a1aa' }}>{new Date(f.created_at).toLocaleDateString()}</td>
                                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                                        <button 
                                                            onClick={() => handleDownload(f.id, f.filename)}
                                                            style={{ 
                                                                background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', 
                                                                padding: '0.5rem 1rem', borderRadius: '0.5rem', color: '#fff', 
                                                                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', transition: 'all 0.2s'
                                                            }}
                                                            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                                        >
                                                            <Download size={14} /> Download
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 4. SETTINGS & USERS TAB */}
                {activeTab === 'settings' && (
                    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                        <div style={{ marginBottom: '3rem' }}>
                            <h2 style={{ fontSize: '2.2rem', margin: '0 0 0.5rem 0', fontWeight: 300, letterSpacing: '-0.5px' }}>
                                User <span style={{fontWeight: 700}}>Management</span>
                            </h2>
                            <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem' }}>Control who has access to your workspace and agent.</p>
                        </div>

                        {pendingUsers.length > 0 && (
                            <div style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(24, 24, 27, 0.5) 100%)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '2rem', borderRadius: '1.25rem', marginBottom: '3rem' }}>
                                <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <ShieldCheck size={20} /> Action Required: Pending Approvals
                                </h3>
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {pendingUsers.map(u => (
                                        <div key={u.username} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: 'rgba(0,0,0,0.4)', borderRadius: '0.75rem', borderLeft: '4px solid #f59e0b' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Users size={20} color="#a1a1aa" />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{u.username}</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#a1a1aa', textTransform: 'capitalize' }}>Requested Role: {u.role.replace('_', ' ')}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                <button onClick={() => handleStatusUpdate(u.username, 'approved')} style={{ background: '#10b981', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '0.5rem', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}><CheckCircle size={16}/> Approve</button>
                                                <button onClick={() => handleStatusUpdate(u.username, 'rejected')} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.6rem 1.25rem', borderRadius: '0.5rem', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}><XCircle size={16}/> Reject</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.25rem', overflow: 'hidden' }}>
                            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Active Members</h3>
                                <div style={{ fontSize: '0.85rem', background: 'rgba(255,255,255,0.1)', padding: '0.35rem 0.75rem', borderRadius: '99px' }}>{usersList.length} Approved</div>
                            </div>
                            
                            {usersList.length === 0 ? (
                                <p style={{ color: '#52525b', margin: 0, padding: '4rem', textAlign: 'center' }}>No users found.</p>
                            ) : (
                                <div style={{ padding: '1rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                        {usersList.map(u => (
                                            <div key={u.username} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Users size={18} color="#60a5fa" />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, color: '#fff' }}>{u.username}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.2rem', fontWeight: 500 }}>
                                                            {u.role.replace('_', ' ')}
                                                        </div>
                                                    </div>
                                                </div>
                                                <ShieldCheck size={20} color="#10b981" opacity={0.5} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
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
            @keyframes spin { 100% { transform: rotate(360deg); } }
            
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

            /* Mobile Responsiveness */
            @media (max-width: 768px) {
                .admin-sidebar {
                    position: absolute !important;
                    height: 100vh !important;
                    width: ${sidebarExpanded ? '100%' : '70px'} !important;
                }
                .admin-main {
                    padding: 1rem !important;
                    display: ${sidebarExpanded ? 'none' : 'block'} !important;
                    margin-left: 70px !important;
                }
                .responsive-grid {
                    grid-template-columns: 1fr !important;
                }
                .responsive-flex {
                    flex-direction: column !important;
                }
            }
            /* Mobile Responsiveness */
            @media (max-width: 768px) {
                .admin-sidebar {
                    position: absolute !important;
                    height: 100vh !important;
                    width: ${sidebarExpanded ? '100%' : '70px'} !important;
                }
                .admin-main {
                    padding: 1.5rem 1rem !important;
                    display: ${sidebarExpanded ? 'none' : 'block'} !important;
                    margin-left: 70px !important;
                    width: calc(100% - 70px) !important;
                }
                .responsive-flex {
                    flex-direction: column !important;
                }
                .user-selector {
                    width: 100% !important;
                    position: static !important;
                }
            }
        `}</style>
    </div>
  )
}
