import { useState, useRef, useEffect } from 'react'
import API_BASE_URL from '../api.config'

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
      const res = await fetch(`${API_BASE_URL}/api/v1/chat/aegis`, {
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
    <div className={`grid gap-6 h-full ${embedded ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-[1fr_350px]'}`}>
      {/* Chat Window */}
      <div className={`flex flex-col overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-white/10 ${embedded ? 'h-full rounded-none border-none' : 'h-[600px] rounded-3xl shadow-2xl'}`}>
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-xl shadow-lg border border-white/20">🤖</div>
              <div>
                <div className="font-bold text-slate-100 text-sm">Aegis - Claude 3</div>
                <div className={`text-xs font-medium ${crisisActive ? 'text-red-400' : 'text-emerald-400'}`}>
                  {crisisActive ? `🔴 Crisis Active — ${crisisType} at Rm ${crisisRoom}` : '🟢 All Clear'}
                </div>
              </div>
            </div>
            <div className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-white/5">Room: {room}</div>
          </div>

          <div ref={chatRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scroll-smooth">
            {messages.map((msg, i) => (
              <div key={i}
                className={`max-w-[80%] p-4 text-sm leading-relaxed whitespace-pre-line backdrop-blur-md shadow-lg border border-white/5 ${
                  msg.role === 'assistant' 
                    ? 'bg-slate-800/80 text-slate-200 rounded-2xl rounded-bl-sm self-start' 
                    : 'bg-blue-600/80 text-white rounded-2xl rounded-br-sm self-end'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className="max-w-[80%] p-4 text-sm bg-slate-800/50 text-slate-400 rounded-2xl rounded-bl-sm self-start backdrop-blur-md border border-white/5 animate-pulse">
                ● ● ●
              </div>
            )}
          </div>

          <div className="p-4 border-t border-white/10 bg-slate-800/50 flex gap-3">
            <input
              type="text"
              className="flex-1 bg-slate-900/50 text-slate-100 placeholder-slate-500 border border-white/10 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Message Aegis..."
            />
            <button 
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-full px-6 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-lg shadow-blue-900/20"
              onClick={sendMessage} 
              disabled={isTyping}
            >
              Send
            </button>
          </div>
        </div>

        {/* Controls Panel - Hide if embedded */}
        {!embedded && (
          <div className="flex flex-col gap-4">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">🎮 Claude Routing Demo</h3>

              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-400 mb-1">Your Room (Guest)</label>
                <select className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50" value={room} onChange={e => setRoom(e.target.value)}>
                  {['301','302','303','304','305','306','307','308','309','310'].map(r => (
                    <option key={r} value={r}>Room {r}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-400 mb-1">Simulate Crisis Status</label>
                <button
                  className={`w-full py-2 px-4 rounded-xl font-medium border transition-colors ${crisisActive ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'}`}
                  onClick={() => setCrisisActive(!crisisActive)}
                >
                  {crisisActive ? '🔴 Crisis ON' : '🟢 Crisis OFF'}
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-400 mb-1">Crisis Type</label>
                <select className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50" value={crisisType} onChange={e => setCrisisType(e.target.value)}>
                  <option value="fire">🔥 Fire</option>
                  <option value="flood">🌊 Flood</option>
                  <option value="medical">🏥 Medical</option>
                  <option value="security">🔒 Security</option>
                  <option value="gas">💨 Gas Leak</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-400 mb-1">Crisis Origin Location</label>
                <select className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50" value={crisisRoom} onChange={e => setCrisisRoom(e.target.value)}>
                  {['301','302','303','304','305','306','307','308','309','310'].map(r => (
                    <option key={r} value={r}>Room {r}</option>
                  ))}
                </select>
              </div>
              
              <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">
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
