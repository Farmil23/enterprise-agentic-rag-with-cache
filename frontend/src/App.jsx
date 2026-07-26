import { useState, useEffect, useRef } from 'react'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [tenantId, setTenantId] = useState('')
  const [threadId, setThreadId] = useState('')
  
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch history when user logs in
  useEffect(() => {
    if (!isLoggedIn) return;
    
    const fetchHistory = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/history/${threadId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.messages && data.messages.length > 0) {
            setMessages(data.messages)
          } else {
            // Welcome message if history is empty
            setMessages([
              { role: 'assistant', content: `Halo! Anda terhubung ke workspace [${tenantId.toUpperCase()}]. Ada yang bisa saya bantu?` }
            ])
          }
        }
      } catch (error) {
        console.error("Failed to fetch history:", error)
      }
    }
    fetchHistory()
  }, [isLoggedIn, threadId, tenantId])

  const handleLogin = (e) => {
    e.preventDefault()
    if (!tenantId.trim()) return
    
    // Create a deterministic thread ID for this session based on tenant
    // In production, this would be tied to the actual user's session ID
    setThreadId(`session_${tenantId}_${Math.random().toString(36).substr(2, 5)}`)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setTenantId('')
    setMessages([])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userMessage = inputValue.trim()
    setInputValue('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch('http://127.0.0.1:8000/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: userMessage,
          thread_id: threadId,
          tenant_id: tenantId.toLowerCase()
        })
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(prev => [...prev, { role: 'assistant', content: data.answer }])
      } else {
        throw new Error("API request failed")
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Maaf, terjadi kesalahan saat menghubungi server.' }])
    } finally {
      setIsLoading(false)
    }
  }

  // --- LOGIN SCREEN RENDER ---
  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1>Enterprise AI</h1>
          <p>Login ke Workspace Multi-Tenant Anda</p>
          
          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <label>Tenant ID / Workspace</label>
              <input 
                type="text" 
                className="login-input"
                placeholder="Contoh: kampus_a"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                required
                autoFocus
              />
            </div>
            
            <button type="submit" className="login-button">
              Masuk Workspace
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </form>
        </div>
      </div>
    )
  }

  // --- CHAT INTERFACE RENDER ---
  return (
    <div className="app-container">
      <header className="chat-header">
        <div>
          <h1>Enterprise RAG</h1>
          <div className="status" style={{marginTop: '0.25rem'}}>
            <div className="status-dot"></div>
            Workspace: {tenantId.toUpperCase()}
          </div>
        </div>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </header>

      <main className="chat-window">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message-wrapper ${msg.role}`}>
            <div className="message-bubble">
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message-wrapper ai">
            <div className="message-bubble">
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <div className="chat-input-container">
        <form onSubmit={handleSubmit} className="chat-input-form">
          <input
            type="text"
            className="chat-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ketik pertanyaan Anda di sini..."
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="send-button"
            disabled={!inputValue.trim() || isLoading}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}

export default App
