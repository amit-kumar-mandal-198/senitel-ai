import { useState, useRef, useEffect } from 'react'

export default function GuestChat({ embedded }) {
  const [room, setRoom] = useState('305')
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I am Aegis, the Hotel AI Safety Assistant. How can I help you today?' }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [crisisActive, setCrisisActive] = useState(true)
  const [crisisType, setCrisisType] = useState('fire')
  const [crisisRoom, setCrisisRoom] = useState('302')
  const chatRef = useRef(null)

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages, isTyping])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text) return

    const newMessages = [...messages, { role: 'user', text }]
    setMessages(newMessages)
    setInput('')
    setIsTyping(true)

    // Format for Anthropic Messages API, dropping the initial hardcoded hello if it's the only thing to save tokens,
    // though the system handles it. The Anthropic API expects alternate user/assistant. 
    // We should map 'assistant' to 'assistant' and 'user' to 'user' with 'content' replacing 'text'
    const conversationHistory = newMessages.map(m => ({
      role: m.role,
      content: m.text
    }))

    // Anthropic API strictly requires the first message to be from 'user'. 
    // If the first message in our array is 'assistant' (the greeting), we'll shift it out for the backend payload.
    const apiHistory = conversationHistory[0].role === 'assistant' 
      ? conversationHistory.slice(1) 
      : conversationHistory

    try {
      const res = await fetch('https://senitel-ai-production.up.railway.app/api/v1/chat/aegis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationHistory: apiHistory,
          userRoomNum: room,
          crisisActive,
          crisisType,
          crisisRoomNum: crisisRoom
        })
      })

      if (res.ok) {
        const data = await res.json()
        setMessages(prev => [...prev, { role: 'assistant', text: data.text }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I am having trouble connecting to the Hotel AI network. Is the backend running?' }])
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Network connection error.' }])
    } finally {
      setIsTyping(false)
    }
  }

  const content = (
    <div style={{ display: 'grid', gridTemplateColumns: embedded ? '1fr' : 'minmax(0, 1fr) 350px', gap: '20px', height: '100%' }}>
      {/* Chat Window */}
      <div className={embedded ? "" : "dash-card"} style={{ padding: 0, display: 'flex', flexDirection: 'column', height: embedded ? '100%' : '600px', border: embedded ? 'none' : undefined }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--gradient-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', paddingLeft:'4px' }}>🤖</div>
              <div>
                <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '15px' }}>Aegis - Claude 3</div>
                <div style={{ fontSize: '12px', color: crisisActive ? '#EF4444' : '#10B981' }}>
                  {crisisActive ? `🔴 Crisis Active — ${crisisType} at Rm ${crisisRoom}` : '🟢 All Clear'}
                </div>
              </div>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Guest Room: {room}</div>
          </div>

          <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map((msg, i) => (
              <div key={i}
                className={msg.role === 'assistant' ? 'chat-bubble-bot' : 'chat-bubble-user'}
                style={{
                maxWidth: '80%',
                padding: '12px 16px',
                borderRadius: msg.role === 'assistant' ? '12px 12px 12px 4px' : '12px 12px 4px 12px',
                alignSelf: msg.role === 'assistant' ? 'flex-start' : 'flex-end',
                color: msg.role === 'user' ? 'white' : undefined,
                fontSize: '14px',
                lineHeight: '1.5',
                whiteSpace: 'pre-line',
              }}>
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div style={{ padding: '12px 16px', borderRadius: '12px 12px 12px 4px', background: 'var(--bg-tertiary)', alignSelf: 'flex-start', color: 'var(--text-tertiary)', fontSize: '14px', border: '1px solid var(--border-primary)' }}>
                ● ● ●
              </div>
            )}
          </div>

          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-primary)', display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="dash-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Message Aegis..."
              style={{ marginBottom: 0 }}
            />
            <button className="btn btn-primary" onClick={sendMessage} disabled={isTyping} style={{ flexShrink: 0 }}>Send</button>
          </div>
        </div>

        {/* Controls Panel - Hide if embedded */}
        {!embedded && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="dash-card">
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>🎮 Claude Routing Demo</h3>

              <div className="dash-field">
                <label className="dash-label">Your Room (Guest)</label>
                <select className="dash-input" value={room} onChange={e => setRoom(e.target.value)} style={{ marginBottom: 0 }}>
                  {['301','302','303','304','305','306','307','308','309','310'].map(r => (
                    <option key={r} value={r}>Room {r}</option>
                  ))}
                </select>
              </div>

              <div className="dash-field">
                <label className="dash-label">Simulate Crisis Status</label>
                <button
                  className="btn"
                  onClick={() => setCrisisActive(!crisisActive)}
                  style={{ width: '100%', background: crisisActive ? 'rgba(220,38,38,0.15)' : 'rgba(16,185,129,0.15)', color: crisisActive ? '#EF4444' : '#10B981', border: `1px solid ${crisisActive ? 'rgba(220,38,38,0.3)' : 'rgba(16,185,129,0.3)'}` }}
                >
                  {crisisActive ? '🔴 Crisis ON' : '🟢 Crisis OFF'}
                </button>
              </div>

              <div className="dash-field">
                <label className="dash-label">Crisis Type</label>
                <select className="dash-input" value={crisisType} onChange={e => setCrisisType(e.target.value)} style={{ marginBottom: 0 }}>
                  <option value="fire">🔥 Fire</option>
                  <option value="flood">🌊 Flood</option>
                  <option value="medical">🏥 Medical</option>
                  <option value="security">🔒 Security</option>
                  <option value="gas">💨 Gas Leak</option>
                </select>
              </div>

              <div className="dash-field">
                <label className="dash-label">Crisis Origin Location</label>
                <select className="dash-input" value={crisisRoom} onChange={e => setCrisisRoom(e.target.value)} style={{ marginBottom: 0 }}>
                  {['301','302','303','304','305','306','307','308','309','310'].map(r => (
                    <option key={r} value={r}>Room {r}</option>
                  ))}
                </select>
              </div>
              
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '12px' }}>
                Note: Claude is instructed that North stairs are near x08-x10 and South stairs are near x01-x03. Test its reasoning by placing the fire near your chosen stairwell!
              </p>
            </div>
          </div>
        )}
      </div>
  )

  if (embedded) return content;

  return (
    <div className="dash-page">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">🤖 Guest AI Chat (Aegis)</h1>
          <p className="dash-page-subtitle">Powered by Anthropic Claude 3 for Dynamic Life Safety Routing</p>
        </div>
      </div>
      {content}
    </div>
  )
}
