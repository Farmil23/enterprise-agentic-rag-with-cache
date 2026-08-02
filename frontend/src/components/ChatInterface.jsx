import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Send, User, Server, LogOut, PanelLeftClose, PanelLeftOpen, Terminal, FileText, Download, MessageSquarePlus, Edit2, Check, X, MessageSquare, Menu, ChevronDown, ChevronUp, FolderOpen, MoreHorizontal, Copy, BookOpen, Scale, Loader2, Database, BrainCircuit, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import OnboardingModal from './OnboardingModal'

export default function ChatInterface() {
  const [tenantId, setTenantId] = useState(() => localStorage.getItem('rag_tenant') || '')
  const [threadId, setThreadId] = useState(() => localStorage.getItem('rag_session') || '')
  
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768)
  const [primaryVisible, setPrimaryVisible] = useState(window.innerWidth > 768)
  const [tenantFiles, setTenantFiles] = useState([])
  const [chatThreads, setChatThreads] = useState([])
  
  // New UI states
  const [activeView, setActiveView] = useState('chat') // 'chat' or 'knowledge_base'
  const [primaryExpanded, setPrimaryExpanded] = useState(false)
  const [kbExpanded, setKbExpanded] = useState(true)
  
  // Rename Modal states
  const [renameModalOpen, setRenameModalOpen] = useState(false)
  const [editingThreadId, setEditingThreadId] = useState(null)
  const [editTitle, setEditTitle] = useState("")
  
  // Copy feedback state
  const [copiedId, setCopiedId] = useState(null)

  // Agentic Loading states
  const loadingSteps = [
      { text: "Initializing secure session...", icon: <Scale size={14} className="spin-slow" /> },
      { text: "Scanning enterprise documents...", icon: <Search size={14} className="pulse" /> },
      { text: "Extracting relevant context...", icon: <Database size={14} className="pulse" /> },
      { text: "Synthesizing agentic response...", icon: <BrainCircuit size={14} className="pulse" /> }
  ]
  const [loadingStepIdx, setLoadingStepIdx] = useState(0)

  useEffect(() => {
      let interval;
      if (isLoading) {
          setLoadingStepIdx(0)
          interval = setInterval(() => {
              setLoadingStepIdx(prev => Math.min(prev + 1, loadingSteps.length - 1))
          }, 1800)
      }
      return () => clearInterval(interval)
  }, [isLoading])

  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!localStorage.getItem('rag_jwt')) {
        navigate('/login')
    }
    fetchFiles()
    fetchThreads()
  }, [navigate])

  const fetchFiles = async () => {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/files`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('rag_jwt')}` }
        })
        if (res.ok) setTenantFiles((await res.json()).files || [])
    } catch (err) { console.error(err) }
  }

  const fetchThreads = async () => {
      try {
          const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/chat/threads`, {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('rag_jwt')}` }
          })
          if (res.ok) {
              const data = await res.json()
              setChatThreads(data.threads || [])
              
              if (!threadId && data.threads && data.threads.length > 0) {
                  const firstThread = data.threads[0].thread_id
                  setThreadId(firstThread)
                  localStorage.setItem('rag_session', firstThread)
              } else if (!threadId) {
                  handleNewChat()
              }
          }
      } catch (err) { console.error(err) }
  }

  const handleNewChat = () => {
      const newThreadId = `session_${tenantId}_${Math.random().toString(36).substr(2, 5)}`
      setThreadId(newThreadId)
      localStorage.setItem('rag_session', newThreadId)
      setMessages([{ role: 'assistant', content: `Halo! Anda memulai sesi baru di workspace **${tenantId.toUpperCase()}**. Ada yang bisa saya bantu hari ini?` }])
  }

  useEffect(() => {
    if (!threadId) return;
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/history/${threadId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('rag_jwt')}` }
        })
        if (response.ok) {
          const data = await response.json()
          if (data.messages && data.messages.length > 0) {
            setMessages(data.messages)
          } else {
            setMessages([{ role: 'assistant', content: `Halo! Anda terhubung ke workspace **${tenantId.toUpperCase()}**. Ada yang bisa saya bantu hari ini?` }])
          }
        }
      } catch (error) { console.error(error) }
    }
    fetchHistory()
  }, [threadId, tenantId])

  const handleDownload = async (fileId, filename) => {
      try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/files/download/${fileId}`, {
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
          } else alert("Download failed.")
      } catch (err) { console.error(err) }
  }

  const openRenameModal = (thread) => {
      setEditingThreadId(thread.thread_id)
      setEditTitle(thread.title)
      setRenameModalOpen(true)
  }

  const closeRenameModal = () => {
      setRenameModalOpen(false)
      setEditingThreadId(null)
      setEditTitle("")
  }

  const handleRename = async () => {
      if (!editTitle.trim()) {
          closeRenameModal()
          return
      }
      try {
          const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/chat/threads/${editingThreadId}`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('rag_jwt')}`
              },
              body: JSON.stringify({ title: editTitle })
          })
          if (res.ok) {
              setChatThreads(prev => prev.map(t => t.thread_id === editingThreadId ? { ...t, title: editTitle } : t))
          }
      } catch (err) { console.error(err) }
      closeRenameModal()
  }

  const handleLogout = () => {
    localStorage.removeItem('rag_jwt')
    localStorage.removeItem('rag_tenant')
    localStorage.removeItem('rag_session')
    localStorage.removeItem('rag_role')
    navigate('/login')
  }

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  useEffect(() => { scrollToBottom() }, [messages])

  const handleInput = (e) => {
    setInputValue(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`
    }
  }
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userMessage = inputValue.trim()
    setInputValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('rag_jwt')}`
        },
        body: JSON.stringify({ q: userMessage, thread_id: threadId })
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: data.answer, 
            suggested_questions: data.suggested_questions || [] 
        }])
        if (messages.length <= 1) fetchThreads()
      } else throw new Error("API request failed")
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ **Error:** Terjadi kesalahan saat menghubungi server.' }])
    } finally {
      setIsLoading(false)
    }
  }

  const submitDirectQuery = async (queryText) => {
    if (!queryText.trim() || isLoading) return
    setInputValue('')
    setMessages(prev => [...prev, { role: 'user', content: queryText }])
    setIsLoading(true)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('rag_jwt')}`
        },
        body: JSON.stringify({ q: queryText, thread_id: threadId })
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: data.answer, 
            suggested_questions: data.suggested_questions || [] 
        }])
        if (messages.length <= 1) fetchThreads()
      } else throw new Error("API request failed")
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ **Error:** Terjadi kesalahan saat menghubungi server.' }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = (text, id) => {
      navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
  }

  // Styles
  const primarySidebarWidth = !primaryVisible ? '0px' : (primaryExpanded ? '200px' : '60px')
  const visibleFiles = tenantFiles.slice(0, 5)
  const hasMoreFiles = tenantFiles.length > 5

  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh', backgroundColor: '#09090b', color: '#fff', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
        
        {/* PRIMARY SIDEBAR (Expandable Navigation) */}
        <div className="primary-sidebar" style={{ 
            width: primarySidebarWidth, 
            opacity: primaryVisible ? 1 : 0,
            borderRight: primaryVisible ? '1px solid rgba(255,255,255,0.1)' : 'none', 
            display: 'flex', 
            flexDirection: 'column', 
            padding: '1rem 0', 
            background: 'rgba(24, 24, 27, 0.95)',
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden'
        }}>
            {/* Hamburger Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', marginBottom: '2rem', height: '28px', justifyContent: primaryExpanded ? 'space-between' : 'center' }}>
                <button 
                    onClick={() => setPrimaryExpanded(!primaryExpanded)}
                    style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                    <Menu size={24} />
                </button>
                {primaryExpanded && <span style={{ color: '#3b82f6', fontWeight: 600, fontSize: '0.9rem' }}><Terminal size={20}/></span>}
            </div>
            
            <button 
                onClick={() => setActiveView('chat')}
                style={{ 
                    background: activeView === 'chat' ? 'rgba(59, 130, 246, 0.2)' : 'transparent', 
                    border: 'none', 
                    color: activeView === 'chat' ? '#60a5fa' : '#a1a1aa', 
                    cursor: 'pointer', 
                    margin: '0 0.5rem 0.5rem', padding: '0.5rem', borderRadius: '0.5rem',
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    transition: 'all 0.2s',
                    justifyContent: primaryExpanded ? 'flex-start' : 'center'
                }}
                title="Chat"
                onMouseOver={e => { if(activeView !== 'chat') { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' } }}
                onMouseOut={e => { if(activeView !== 'chat') { e.currentTarget.style.color = '#a1a1aa'; e.currentTarget.style.background = 'transparent' } }}
            >
                <MessageSquare size={24} style={{ minWidth: '24px' }} />
                {primaryExpanded && <span style={{ whiteSpace: 'nowrap', fontWeight: 500 }}>Chat</span>}
            </button>
            
            <button 
                onClick={() => setActiveView('knowledge_base')}
                style={{ 
                    background: activeView === 'knowledge_base' ? 'rgba(16, 185, 129, 0.2)' : 'transparent', 
                    border: 'none', 
                    color: activeView === 'knowledge_base' ? '#34d399' : '#a1a1aa', 
                    cursor: 'pointer', 
                    margin: '0 0.5rem 1.5rem', padding: '0.5rem', borderRadius: '0.5rem',
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    transition: 'all 0.2s',
                    justifyContent: primaryExpanded ? 'flex-start' : 'center'
                }}
                title="Knowledge Base"
                onMouseOver={e => { if(activeView !== 'knowledge_base') { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' } }}
                onMouseOut={e => { if(activeView !== 'knowledge_base') { e.currentTarget.style.color = '#a1a1aa'; e.currentTarget.style.background = 'transparent' } }}
            >
                <FolderOpen size={24} style={{ minWidth: '24px' }} />
                {primaryExpanded && <span style={{ whiteSpace: 'nowrap', fontWeight: 500 }}>Knowledge Base</span>}
            </button>
            
            <div style={{ flex: 1 }}></div>
            
            <button 
                onClick={() => navigate('/guide')}
                style={{ 
                    background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', 
                    margin: '0 0.5rem 0.5rem', padding: '0.5rem', borderRadius: '0.5rem',
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    transition: 'all 0.2s',
                    justifyContent: primaryExpanded ? 'flex-start' : 'center'
                }}
                title="Panduan"
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff' }}
                onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a1a1aa' }}
            >
                <BookOpen size={24} style={{ minWidth: '24px' }} />
                {primaryExpanded && <span style={{ whiteSpace: 'nowrap', fontWeight: 500 }}>Panduan</span>}
            </button>
            
            <button 
                onClick={handleLogout}
                style={{ 
                    background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', 
                    margin: '0 0.5rem', padding: '0.5rem', borderRadius: '0.5rem',
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    transition: 'all 0.2s',
                    justifyContent: primaryExpanded ? 'flex-start' : 'center'
                }}
                title="Logout"
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)' }}
                onMouseOut={e => { e.currentTarget.style.background = 'transparent' }}
            >
                <LogOut size={24} style={{ minWidth: '24px' }} />
                {primaryExpanded && <span style={{ whiteSpace: 'nowrap', fontWeight: 500 }}>Logout</span>}
            </button>
        </div>
        
        {/* SECONDARY SIDEBAR (Context & History) */}
        <div className="secondary-sidebar" style={{ 
            width: sidebarOpen ? '280px' : '0px', 
            opacity: sidebarOpen ? 1 : 0,
            borderRight: sidebarOpen ? '1px solid rgba(255,255,255,0.1)' : 'none', 
            display: 'flex', flexDirection: 'column', background: 'rgba(24, 24, 27, 0.95)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden',
            whiteSpace: 'nowrap'
        }}>
            {sidebarOpen && (
                <>
                    <div style={{ padding: '1.5rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '0.75rem', color: '#a1a1aa', fontWeight: 600, letterSpacing: '1px', marginBottom: '0.5rem' }}>WORKSPACE</div>
                            <button className="mobile-only-close" onClick={() => { setSidebarOpen(false); setPrimaryVisible(false); }} style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', display: 'none' }}>
                                <X size={18} />
                            </button>
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '1rem', textTransform: 'uppercase', color: '#e4e4e7' }}>{tenantId}</div>
                        <div style={{ fontSize: '0.7rem', color: '#52525b', marginTop: '0.25rem', fontFamily: 'monospace' }}>Session: {threadId.substring(0,16)}...</div>
                    </div>
                    
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                        
                        {/* CHAT HISTORY SECTION */}
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.75rem', color: '#a1a1aa', fontWeight: 600, letterSpacing: '1px', marginBottom: '1rem' }}>CHAT HISTORY</div>
                            
                            {/* NEW CHAT BUTTON */}
                            <button 
                                onClick={() => {
                                    handleNewChat()
                                    setActiveView('chat')
                                    if (window.innerWidth <= 768) {
                                        setSidebarOpen(false)
                                        setPrimaryVisible(false)
                                    }
                                }}
                                style={{ 
                                    width: '100%',
                                    background: 'rgba(59, 130, 246, 0.1)', 
                                    border: '1px dashed rgba(59, 130, 246, 0.3)', 
                                    color: '#60a5fa', 
                                    cursor: 'pointer', 
                                    padding: '0.75rem', borderRadius: '0.5rem',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    marginBottom: '1rem',
                                    transition: 'all 0.2s',
                                    fontWeight: 500
                                }}
                                onMouseOver={e => { e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'; e.currentTarget.style.borderStyle = 'solid' }}
                                onMouseOut={e => { e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'; e.currentTarget.style.borderStyle = 'dashed' }}
                            >
                                <MessageSquarePlus size={18} /> Percakapan Baru
                            </button>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '2rem' }}>
                            {chatThreads.map(t => (
                                <div 
                                    key={t.thread_id} 
                                    style={{ 
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                                        padding: '0.6rem', borderRadius: '0.5rem', cursor: 'pointer',
                                        background: t.thread_id === threadId ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                                        color: t.thread_id === threadId ? '#fff' : '#a1a1aa'
                                    }}
                                    onClick={() => {
                                        setThreadId(t.thread_id)
                                        localStorage.setItem('rag_session', t.thread_id)
                                        setActiveView('chat')
                                        if (window.innerWidth <= 768) {
                                            setSidebarOpen(false)
                                            setPrimaryVisible(false)
                                        }
                                    }}
                                    onMouseOver={e => { if(t.thread_id !== threadId) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                                    onMouseOut={e => { if(t.thread_id !== threadId) e.currentTarget.style.background = 'transparent' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                                        <MessageSquare size={14} style={{ minWidth: '14px' }} />
                                        <span style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {t.title || 'New Chat'}
                                        </span>
                                    </div>
                                    
                                    <Edit2 
                                        size={12} 
                                        style={{ opacity: t.thread_id === threadId ? 1 : 0.2, cursor: 'pointer' }} 
                                        onClick={(e) => { e.stopPropagation(); openRenameModal(t) }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* KNOWLEDGE BASE SECTION (Accordion) */}
                    <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                        <div 
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: kbExpanded ? '1rem' : '0' }}
                            onClick={() => setKbExpanded(!kbExpanded)}
                        >
                            <div style={{ fontSize: '0.75rem', color: '#a1a1aa', fontWeight: 600, letterSpacing: '1px' }}>KNOWLEDGE BASE</div>
                            {kbExpanded ? <ChevronDown size={14} color="#a1a1aa" /> : <ChevronUp size={14} color="#a1a1aa" />}
                        </div>
                        
                        {kbExpanded && (
                            <>
                                {tenantFiles.length === 0 ? (
                                    <div style={{ fontSize: '0.8rem', color: '#52525b', fontStyle: 'italic' }}>No documents available.</div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        {visibleFiles.map(f => (
                                            <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.6rem', borderRadius: '0.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                                                    <FileText size={14} color="#10b981" style={{ minWidth: '14px' }} />
                                                    <span style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={f.filename}>
                                                        {f.filename}
                                                    </span>
                                                </div>
                                                <button onClick={() => handleDownload(f.id, f.filename)} style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer' }}>
                                                    <Download size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        {hasMoreFiles && (
                                            <button 
                                                onClick={() => setActiveView('knowledge_base')}
                                                style={{ 
                                                    marginTop: '0.5rem', width: '100%', padding: '0.5rem', 
                                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
                                                    color: '#e4e4e7', borderRadius: '0.5rem', cursor: 'pointer',
                                                    fontSize: '0.8rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem'
                                                }}
                                            >
                                                <MoreHorizontal size={14}/> View All {tenantFiles.length} Files
                                            </button>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    </div>
                </>
            )}
        </div>

        {/* MAIN AREA */}
        <div className="chat-main-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', width: '100%', overflow: 'hidden' }}>
            <header style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => { setSidebarOpen(!sidebarOpen); setPrimaryVisible(!primaryVisible); }} style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}>
                        {(sidebarOpen || primaryVisible) ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
                    </button>
                    <h1 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 500 }}>
                        {activeView === 'knowledge_base' ? 'Knowledge Base' : 'Hanka Enterprise'}
                    </h1>
                </div>
            </header>

            {activeView === 'knowledge_base' ? (
                <main style={{ flex: 1, overflowY: 'auto', padding: '3rem', display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
                    <div style={{ maxWidth: '800px', width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <FolderOpen size={28} color="#10b981" /> Tenant Files
                                </h2>
                                <p style={{ margin: 0, color: '#a1a1aa', fontSize: '0.95rem' }}>View and download documents uploaded by your Tenant Administrator.</p>
                            </div>
                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', padding: '0.5rem 1rem', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 600 }}>
                                {tenantFiles.length} Total Files
                            </div>
                        </div>

                        {tenantFiles.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                <FileText size={48} color="#52525b" style={{ margin: '0 auto 1rem' }} />
                                <h3 style={{ color: '#e4e4e7', margin: '0 0 0.5rem' }}>No documents available</h3>
                                <p style={{ color: '#a1a1aa', fontSize: '0.9rem', margin: 0 }}>The Tenant Administrator hasn't uploaded any documents yet.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {tenantFiles.map(f => (
                                    <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.2s', cursor: 'default' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', overflow: 'hidden' }}>
                                            <div style={{ width: '40px', height: '40px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <FileText size={20} color="#10b981" />
                                            </div>
                                            <span style={{ fontSize: '1rem', color: '#fff', fontWeight: 500 }}>{f.filename}</span>
                                        </div>
                                        <button onClick={() => handleDownload(f.id, f.filename)} style={{ background: '#3b82f6', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 500 }}>
                                            <Download size={16} /> Download
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            ) : (
                <>
                    <main className="chat-main-area" style={{ flex: 1, overflowY: 'auto', padding: '2rem', scrollBehavior: 'smooth' }}>
                        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
                            {messages.length <= 1 && !isLoading && (
                                <div style={{ textAlign: 'center', marginTop: '10vh', animation: 'fadeIn 0.5s ease' }}>
                                    <div style={{ width: '64px', height: '64px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                        <Scale size={32} color="#3b82f6" />
                                    </div>
                                    <h2 className="chat-welcome-title" style={{ fontSize: '2.5rem', margin: '0 0 1rem 0', fontWeight: 300, letterSpacing: '-0.5px' }}>Welcome to <span style={{fontWeight: 700}}>Hanka</span></h2>
                                    <p className="chat-welcome-subtitle" style={{ color: '#a1a1aa', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 3rem', lineHeight: 1.6, padding: '0 1rem' }}>
                                        Your highly secure, enterprise-grade AI assistant. I have access to your tenant's entire knowledge base. How can I help you today?
                                    </p>
                                    
                                    <div className="welcome-prompts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', maxWidth: '800px', margin: '0 auto' }}>
                                        {['Summarize the latest document', 'What are our operational SOPs?', 'Find information about company policies', 'Help me draft an email based on recent data'].map((prompt, i) => (
                                            <button key={i} onClick={() => { setInputValue(prompt); textareaRef.current?.focus() }} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.75rem', color: '#e4e4e7', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', fontSize: '0.9rem' }} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.08)'} onMouseOut={e=>e.currentTarget.style.background='rgba(255,255,255,0.03)'}>
                                                {prompt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {messages.map((msg, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '1rem', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                {msg.role === 'assistant' && (
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1e1b4b', border: '1px solid #4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Scale size={16} color="#818cf8" />
                                    </div>
                                )}
                                <div style={{ 
                                    maxWidth: '85%', 
                                    background: msg.role === 'user' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.3)', 
                                    padding: '1rem 1.5rem', 
                                    borderRadius: '1rem',
                                    borderTopRightRadius: msg.role === 'user' ? 0 : '1rem',
                                    borderTopLeftRadius: msg.role === 'assistant' ? 0 : '1rem',
                                    lineHeight: 1.6,
                                    position: 'relative',
                                    boxShadow: msg.role === 'assistant' ? 'inset 0 0 0 1px rgba(255,255,255,0.05)' : 'none'
                                }}>
                                    {msg.role === 'user' ? (
                                        <div style={{ fontSize: '0.95rem' }}>{msg.content}</div>
                                    ) : (
                                        <div className="markdown-body" style={{ fontSize: '0.95rem', overflowX: 'auto' }}>
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {msg.content}
                                            </ReactMarkdown>
                                            
                                            {/* SUGGESTED QUESTIONS CHIPS */}
                                            {msg.suggested_questions && msg.suggested_questions.length > 0 && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem' }}>
                                                    <div style={{ fontSize: '0.75rem', color: '#a1a1aa', fontWeight: 600, letterSpacing: '0.5px' }}>Pertanyaan Lanjutan:</div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                        {msg.suggested_questions.map((sq, i) => (
                                                            <button 
                                                                key={i}
                                                                onClick={() => {
                                                                    setInputValue(sq)
                                                                    // We need to trigger submit, but state update is async.
                                                                    // A simple hack is to use a slightly delayed call or just rely on the user to press enter.
                                                                    // For immediate submit, we can just call an async function directly with the query.
                                                                    submitDirectQuery(sq)
                                                                }}
                                                                style={{
                                                                    background: 'rgba(59, 130, 246, 0.1)',
                                                                    border: '1px solid rgba(59, 130, 246, 0.3)',
                                                                    color: '#60a5fa',
                                                                    borderRadius: '99px',
                                                                    padding: '0.5rem 1rem',
                                                                    fontSize: '0.85rem',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s',
                                                                    textAlign: 'left'
                                                                }}
                                                                onMouseOver={e => { e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'; e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)' }}
                                                                onMouseOut={e => { e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'; e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)' }}
                                                            >
                                                                {sq}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem' }}>
                                                <button onClick={() => handleCopy(msg.content, idx)} style={{ background: 'transparent', border: 'none', color: copiedId === idx ? '#10b981' : '#a1a1aa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', transition: 'all 0.2s' }} onMouseOver={e=>{if(copiedId !== idx) {e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='#fff'}}} onMouseOut={e=>{if(copiedId !== idx) {e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#a1a1aa'}}}>
                                                    {copiedId === idx ? (
                                                        <><Check size={12} /> Copied!</>
                                                    ) : (
                                                        <><Copy size={12} /> Copy</>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            ))}
                            {isLoading && (
                            <div style={{ display: 'flex', gap: '1rem', animation: 'fadeIn 0.3s ease' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1e1b4b', border: '1px solid #4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Loader2 size={16} color="#818cf8" className="spin" />
                                </div>
                                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1.25rem', borderRadius: '1rem', borderTopLeftRadius: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem', justifyContent: 'center', minWidth: '220px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#818cf8', fontSize: '0.85rem', fontWeight: 500 }}>
                                        {loadingSteps[loadingStepIdx].icon}
                                        <span className="fade-text" key={loadingStepIdx}>{loadingSteps[loadingStepIdx].text}</span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden', marginTop: '0.25rem' }}>
                                        <div style={{ 
                                            height: '100%', background: '#818cf8', 
                                            width: `${((loadingStepIdx + 1) / loadingSteps.length) * 100}%`,
                                            transition: 'width 0.5s ease-out'
                                        }}></div>
                                    </div>

                                    <style>{`
                                        @keyframes spin { 100% { transform: rotate(360deg); } }
                                        .spin { animation: spin 1s linear infinite; }
                                        .spin-slow { animation: spin 3s linear infinite; }
                                        @keyframes pulse-op { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
                                        .pulse { animation: pulse-op 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                                        @keyframes fadeText { from { opacity: 0; transform: translateY(2px) } to { opacity: 1; transform: translateY(0) } }
                                        .fade-text { animation: fadeText 0.3s ease-out forwards; }
                                    `}</style>
                                </div>
                            </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </main>

                    <div className="chat-input-container" style={{ padding: '0 2rem 2rem 2rem' }}>
                        <form onSubmit={handleSubmit} style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
                            <textarea
                                className="chat-input"
                                ref={textareaRef}
                                value={inputValue}
                                onChange={handleInput}
                                onKeyDown={handleKeyDown}
                                placeholder="Ketik pesan Anda di sini... (Shift + Enter for new line)"
                                disabled={isLoading}
                                rows={1}
                                style={{
                                    width: '100%', padding: '1rem 4.5rem 1rem 1.5rem',
                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '1.5rem', color: '#fff', fontSize: '1rem', resize: 'none', outline: 'none',
                                    maxHeight: '150px', overflowY: 'auto'
                                }}
                            />
                            <button 
                                type="submit" 
                                disabled={!inputValue.trim() || isLoading}
                                style={{
                                    position: 'absolute', right: '1.5rem', bottom: '0.6rem',
                                    background: inputValue.trim() ? '#3b82f6' : 'rgba(255,255,255,0.1)', 
                                    border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                                    transition: 'background 0.2s', zIndex: 10
                                }}
                            >
                                <Send size={16} />
                            </button>
                        </form>
                        <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#52525b', margin: '0.75rem 0' }}>
                            AI can make mistakes. Consider verifying important information.
                        </div>
                    </div>
                </>
            )}
        </div>

        {/* MODALS */}
        
        {/* Rename Modal */}
        {renameModalOpen && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                <div style={{ background: '#18181b', padding: '2rem', borderRadius: '1rem', width: '90%', maxWidth: '400px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Rename Chat</h3>
                    <input 
                        value={editTitle} 
                        onChange={e => setEditTitle(e.target.value)} 
                        autoFocus
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.5)', border: '1px solid #3b82f6', color: '#fff', marginBottom: '1.5rem', outline: 'none' }}
                        onKeyDown={e => { if (e.key === 'Enter') handleRename() }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button onClick={closeRenameModal} style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '0.5rem', cursor: 'pointer' }}>Cancel</button>
                        <button onClick={handleRename} style={{ padding: '0.5rem 1rem', background: '#3b82f6', border: 'none', color: '#fff', borderRadius: '0.5rem', cursor: 'pointer' }}>Save</button>
                    </div>
                </div>
            </div>
        )}

        <OnboardingModal tenantName={tenantId} />

        <style>{`
            /* Mobile responsiveness for Chat Interface */
            @media (max-width: 768px) {
                .primary-sidebar {
                    width: ${primaryVisible ? '60px' : '0px'} !important;
                    min-width: ${primaryVisible ? '60px' : '0px'} !important;
                    border-right: none !important;
                }
                .secondary-sidebar {
                    width: ${sidebarOpen ? 'calc(100vw - 60px)' : '0px'} !important;
                    min-width: ${sidebarOpen ? 'calc(100vw - 60px)' : '0px'} !important;
                }
                .chat-main-container {
                    display: ${(sidebarOpen || primaryVisible) ? 'none' : 'flex'} !important;
                }
                .chat-welcome-title {
                    font-size: 1.8rem !important;
                }
                .welcome-prompts-grid {
                    grid-template-columns: 1fr !important;
                }
                .mobile-only-close {
                    display: block !important;
                }
                .chat-welcome-subtitle {
                    font-size: 0.95rem !important;
                    margin-bottom: 2rem !important;
                }
                .chat-main-area {
                    padding: 1rem !important;
                }
                .chat-input-container {
                    padding: 0 1rem 1rem 1rem !important;
                }
                .chat-input {
                    padding-right: 3.5rem !important;
                }
            }
        `}</style>
    </div>
  )
}
