import { useState, useRef, useEffect } from 'react';

export default function AegisCommand({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Aegis System initialized. I am your AI Operations assistant. How can I manage the facility today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    // Simulate AI processing
    setTimeout(async () => {
      let botResponse = "I have logged your request.";

      const lowerTxt = userMsg.toLowerCase();
      if (lowerTxt.includes('lockdown') || lowerTxt.includes('evacuate') || lowerTxt.includes('emergency')) {
        botResponse = "Understood. Bypassing manual setup. Activating critical security lockdown on the facility now. Alerting response teams.";
        
        // Trigger the actual crisis via the backend API!
        try {
          await fetch('http://localhost:3000/api/v1/crisis/trigger', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'security', severity: 'critical', roomNum: 'AI Command', floorNum: 1 })
          });
        } catch(err) {
          console.error("API error", err);
        }
      } else if (lowerTxt.includes('status') || lowerTxt.includes('report')) {
        botResponse = "Current facility status is Nominal. All sensors indicate safe levels. No active incidents reported in the last 24 hours.";
      }

      setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
      setIsTyping(false);
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Semi-transparent overlay to close */}
      <div 
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, backdropFilter: 'blur(2px)' }} 
      />
      
      {/* Slide-out panel */}
      <div style={{
        position: 'fixed', right: 0, top: 0, bottom: 0, width: '400px', maxWidth: '90vw',
        background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border-primary)',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.5)', zIndex: 1001,
        display: 'flex', flexDirection: 'column',
        animation: 'slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse'
      }}>
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🤖</div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Aegis Command</h3>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Sentinel Natural Language Engine</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '24px', cursor: 'pointer' }}>×</button>
        </div>

        {/* Chat window */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: '16px',
                borderBottomLeftRadius: msg.role === 'bot' ? '4px' : '16px',
                borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                background: msg.role === 'user' ? 'var(--sentinel-blue-light)' : 'var(--bg-card)',
                color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                border: msg.role === 'bot' ? '1px solid var(--border-primary)' : 'none',
                fontSize: '14px', lineHeight: '1.5',
                boxShadow: 'var(--shadow-sm)'
              }}>
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div style={{ alignSelf: 'flex-start', background: 'var(--bg-card)', border: '1px solid var(--border-primary)', padding: '12px 16px', borderRadius: '16px', borderBottomLeftRadius: '4px' }}>
              <span className="typing-dots" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Aegis is processing...</span>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input area */}
        <div style={{ padding: '20px', borderTop: '1px solid var(--border-primary)', background: 'var(--bg-primary)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., 'Initiate lockdown on floor 2'" 
              className="dash-input"
              style={{ flex: 1, padding: '12px 16px', borderRadius: '24px', fontSize: '14px' }}
              autoFocus
            />
            <button type="submit" className="btn btn-primary" style={{ borderRadius: '50%', width: '44px', height: '44px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ↑
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
