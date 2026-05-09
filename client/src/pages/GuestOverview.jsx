import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API_BASE_URL from '../api.config'
import GuestChat from './GuestChat'
import SafetyCheckIn from '../components/guest/SafetyCheckIn'
import LanguagePreference from '../components/guest/LanguagePreference'
import DemoToolbar from '../components/dev/DemoToolbar'

export default function GuestOverview() {
  const [activeCrisis, setActiveCrisis] = useState(null)
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/hotel/overview`)
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
        await fetch(`${API_BASE_URL}/api/v1/crisis/trigger`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'medical', severity: 'high', roomNum: 'GUEST-SOS', floorNum: 1 })
        });
        alert('SOS Triggered. Help is on the way. Please stay calm and use the AI Chat for instructions.');
      } catch(err) { console.error(err); }
    }
  }

  return (
    <div className="dash-page">
      <SafetyCheckIn />
      <DemoToolbar />
      
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Giant SOS Card */}
          <div className="dash-card" style={{ textAlign: 'center', padding: '32px 20px', border: '1px solid rgba(220,38,38,0.3)', background: 'rgba(220,38,38,0.02)' }}>
            <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>Emergency?</h3>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button 
                onClick={triggerSOS}
                style={{
                  width: '140px', height: '140px', borderRadius: '50%',
                  background: 'linear-gradient(145deg, #ef4444, #dc2626)',
                  border: '4px solid rgba(255,255,255,0.2)',
                  color: 'white', fontSize: '36px', fontWeight: '900', letterSpacing: '2px',
                  cursor: 'pointer', boxShadow: '0 10px 40px rgba(220,38,38,0.4), inset 0 0 20px rgba(255,255,255,0.2)',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              >
                SOS
              </button>
            </div>
            <p style={{ margin: '24px 0 16px 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Tap once to instantly alert hotel security and management.
            </p>
            <Link to="/guest/crisis" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', color: '#60A5FA', borderColor: 'rgba(59,130,246,0.3)' }}>
              📋 Detailed Report
            </Link>
          </div>

          {/* Language Selector */}
          <LanguagePreference guestId="guest_123" />

          {/* Guest Info Card */}
          <div className="dash-card">
            <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#60A5FA' }}>ℹ️</span> Guest Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-primary)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>WiFi:</span>
                <strong style={{ color: 'var(--text-primary)' }}>Sentinel_Guest</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-primary)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Front Desk:</span>
                <strong style={{ color: 'var(--text-primary)' }}>Dial 0</strong>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Evacuation Route:</span>
                <strong style={{ color: 'var(--text-primary)' }}>See back of room door.</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side AI Chat */}
        <div className="dash-card" style={{ padding: 0, height: 'min(75vh, 800px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-primary)', background: 'var(--bg-panel)' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ animation: 'pulse-glow 2s infinite alternate' }}>🤖</span> Aegis AI Assistant
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-tertiary)' }}>Ask for facility info or emergency guidance</p>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <GuestChat embedded={true} />
          </div>
        </div>

      </div>
    </div>
  )
}
