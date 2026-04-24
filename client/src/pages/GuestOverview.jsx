import { useState, useEffect } from 'react'
import GuestChat from './GuestChat'

export default function GuestOverview() {
  const [activeCrisis, setActiveCrisis] = useState(null)
  
  // Real-time listener for crisis state to warn guests
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/v1/hotel/overview')
        if (res.ok) {
          const json = await res.json()
          setActiveCrisis(json.activeCrisis)
        }
      } catch (err) {
        console.error('Failed to connect to API', err)
      }
    }
    fetchData()
    const poll = setInterval(fetchData, 3000)
    return () => clearInterval(poll)
  }, [])

  const triggerSOS = async () => {
    if (window.confirm("TRIGGER EMERGENCY SOS? This alerts management immediately.")) {
      try {
        await fetch('http://localhost:3000/api/v1/crisis/trigger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // Guests trigger a general "medical/security" SOS for their unknown or rough location
          body: JSON.stringify({ type: 'medical', severity: 'high', roomNum: 'GUEST-SOS', floorNum: 1 })
        });
        alert('SOS Triggered. Help is on the way. Please stay calm and use the AI Chat for instructions.');
      } catch(err) { console.error(err); }
    }
  }

  return (
    <div className="dash-overview" style={{ padding: '0' }}>
      
      {/* Top Warning Banner for Guests if active crisis exists */}
      {activeCrisis && (
        <div style={{ background: 'var(--danger-light)', padding: '24px', borderRadius: '16px', color: 'white', marginBottom: '24px', animation: 'pulse-glow 2s infinite alternate' }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>⚠️ FACILITY EMERGENCY: {activeCrisis.type.toUpperCase()}</h2>
          <p style={{ margin: 0, fontSize: '18px' }}>Please follow instructions from the AI Chat below or proceed to the nearest exit immediately.</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Side: SOS Button & Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* GIANT SOS BUTTON */}
          <div className="dash-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 20px', border: '2px solid rgba(239, 68, 68, 0.3)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '18px', color: 'var(--text-secondary)' }}>Emergency?</h3>
            <button 
              onClick={triggerSOS}
              style={{
                background: 'linear-gradient(145deg, #ef4444, #991b1b)',
                color: 'white',
                fontSize: '32px',
                fontWeight: '900',
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                border: '8px solid #7f1d1d',
                boxShadow: '0 10px 40px rgba(220, 38, 38, 0.6), inset 0 10px 20px rgba(255, 160, 160, 0.4)',
                cursor: 'pointer',
                letterSpacing: '2px',
                transition: 'all 0.1s ease',
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              SOS
            </button>
            <p style={{ marginTop: '24px', fontSize: '14px', color: 'var(--text-tertiary)' }}>Tap once to instantly alert hotel security and management.</p>
          </div>

          {/* Quick Help Card */}
          <div className="dash-card">
            <h3 className="dash-card-title">ℹ️ Guest Information</h3>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <li><strong>WiFi:</strong> Sentinel_Guest</li>
              <li><strong>Front Desk:</strong> Dial 0</li>
              <li><strong>Evacuation Route:</strong> See back of room door.</li>
            </ul>
          </div>
        </div>

        {/* Right Side: Embedded AI Chat */}
        <div style={{ height: '70vh', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-primary)', boxShadow: 'var(--shadow-md)' }}>
          {/* Reusing the GuestChat component but without its own page margins */}
          <div style={{ background: 'var(--bg-card)', height: '100%' }}>
            <GuestChat embedded={true} />
          </div>
        </div>
      </div>

    </div>
  )
}
