import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API_BASE_URL from '../api.config'
import SafetyCheckIn from '../components/guest/SafetyCheckIn'
import LanguagePreference from '../components/guest/LanguagePreference'
import DemoToolbar from '../components/dev/DemoToolbar'

const CRISIS_TYPES = [
  { id: 'fire', icon: '🔥', label: 'Fire', color: '#DC2626', desc: 'I see fire or smoke in my room.', severity: 'critical' },
  { id: 'flood', icon: '🌊', label: 'Water Leak', color: '#3B82F6', desc: 'Water flooding or pipe burst.', severity: 'high' },
  { id: 'medical', icon: '🏥', label: 'Medical', color: '#10B981', desc: 'I need urgent medical help.', severity: 'high' },
  { id: 'security', icon: '🔒', label: 'Security', color: '#F59E0B', desc: 'Intruder or suspicious activity.', severity: 'critical' },
  { id: 'power', icon: '⚡', label: 'Power Out', color: '#8B5CF6', desc: 'No electricity.', severity: 'medium' },
  { id: 'gas', icon: '💨', label: 'Gas Leak', color: '#EF4444', desc: 'Strange smell or gas leak.', severity: 'critical' },
]

const FLOORS = {
  1: ['101','102','103','104','105','106','107','108','109','110'],
  2: ['201','202','203','204','205','206','207','208','209','210'],
  3: ['301','302','303','304','305','306','307','308','309','310'],
}

export default function GuestOverview() {
  const [activeCrisis, setActiveCrisis] = useState(null)
  
  // Form State
  const [crisisType, setCrisisType] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [selectedFloor, setSelectedFloor] = useState(1)
  const [triggering, setTriggering] = useState(false)
  const [triggered, setTriggered] = useState(false)
  const [apiError, setApiError] = useState(null)

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
        alert('SOS Triggered. Help is on the way.');
      } catch(err) { console.error(err); }
    }
  }

  const handleTrigger = async () => {
    if (!crisisType || !selectedRoom) return
    setTriggering(true)
    setApiError(null)

    const selectedCrisis = CRISIS_TYPES.find(c => c.id === crisisType)

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/crisis/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: crisisType,
          severity: selectedCrisis.severity,
          roomNum: selectedRoom,
          floorNum: selectedFloor
        })
      })

      if (res.ok) {
        setTriggered(true)
        if ('speechSynthesis' in window) {
          const msg = new SpeechSynthesisUtterance('Your emergency alert has been sent. Hotel security has been notified. Please stay calm and follow instructions.')
          msg.rate = 0.9
          window.speechSynthesis.speak(msg)
        }
      } else {
        setApiError('Failed to send alert. Please call the front desk.')
      }
    } catch (err) {
      setApiError('Network error connecting to system.')
    } finally {
      setTriggering(false)
    }
  }

  const selectedCrisis = CRISIS_TYPES.find(c => c.id === crisisType)

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
            <Link to="/guest/chat" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', color: '#60A5FA', borderColor: 'rgba(59,130,246,0.3)' }}>
              🤖 Open AI Assistant
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

        {/* Right Side: Emergency Report Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="dash-card">
            <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '800' }}>🚨 Report an Emergency</h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Select what's happening and your room location to send an immediate alert.</p>
          </div>

          {apiError && (
            <div style={{ padding: '16px', background: 'rgba(220,38,38,0.1)', color: '#DC2626', border: '1px solid currentColor', borderRadius: '8px', fontWeight: 'bold' }}>
              {apiError}
            </div>
          )}

          {triggered ? (
            <div className="dash-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '64px', animation: 'pulse-glow 2s infinite alternate', marginBottom: '24px' }}>🚨</div>
              <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>Help Is On The Way</h2>
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
                Your <strong style={{ color: selectedCrisis?.color }}>{selectedCrisis?.icon} {selectedCrisis?.label.toUpperCase()}</strong> alert at
                Room <strong>{selectedRoom}</strong> has been received by hotel management.
              </p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <button className="btn btn-outline" onClick={() => {setTriggered(false); setCrisisType(null); setSelectedRoom(null);}}>Reset</button>
                <Link to="/guest/chat" className="btn btn-primary" style={{ background: '#3B82F6', color: 'white' }}>🤖 Open AI Chat for Guidance</Link>
              </div>
            </div>
          ) : (
            <>
              {/* Step 1: Crisis Type */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <h2 className="dash-card-title">Step 1: What's happening?</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                  {CRISIS_TYPES.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setCrisisType(c.id)}
                      style={{
                        padding: '16px 12px',
                        background: crisisType === c.id ? `${c.color}15` : 'var(--bg-glass)',
                        border: `2px solid ${crisisType === c.id ? c.color : 'var(--border-primary)'}`,
                        borderRadius: 'var(--radius-lg)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s',
                        fontFamily: 'var(--font-ui)',
                      }}
                    >
                      <div style={{ fontSize: '28px', marginBottom: '8px' }}>{c.icon}</div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: crisisType === c.id ? c.color : 'var(--text-primary)' }}>{c.label}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>{c.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Room Selection */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <h2 className="dash-card-title">Step 2: Where are you?</h2>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3].map(f => (
                      <button key={f}
                        onClick={() => setSelectedFloor(f)}
                        style={{
                          padding: '6px 16px',
                          borderRadius: 'var(--radius-md)',
                          border: `1px solid ${selectedFloor === f ? 'var(--sentinel-blue-light)' : 'var(--border-primary)'}`,
                          background: selectedFloor === f ? 'rgba(59,130,246,0.1)' : 'transparent',
                          color: selectedFloor === f ? 'var(--text-accent)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '600',
                          fontFamily: 'var(--font-ui)',
                        }}>
                        Floor {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="hotel-floor-grid">
                  {FLOORS[selectedFloor].map(room => (
                    <button
                      key={room}
                      onClick={() => setSelectedRoom(room)}
                      className={`hotel-room ${selectedRoom === room ? 'selected' : 'safe'}`}
                      style={{ cursor: 'pointer', border: selectedRoom === room ? '2px solid var(--sentinel-blue-light)' : undefined, minHeight: '60px' }}
                    >
                      <span className="hotel-room-number" style={{ fontSize: '16px' }}>{room}</span>
                      <span className="hotel-room-status" style={{ fontSize: '12px' }}>{selectedRoom === room ? '📍' : '—'}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary + Trigger */}
              {crisisType && selectedRoom && (
                <div className="dash-card" style={{ borderColor: selectedCrisis?.color, borderWidth: '2px', background: `${selectedCrisis?.color}0a` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Ready to send alert:</div>
                      <div style={{ fontSize: '20px', fontWeight: '800', color: selectedCrisis?.color }}>
                        {selectedCrisis?.icon} {selectedCrisis?.label.toUpperCase()} — Room {selectedRoom}
                      </div>
                    </div>
                    <button
                      className="btn btn-lg"
                      onClick={handleTrigger}
                      disabled={triggering}
                      style={{ background: selectedCrisis?.color, color: 'white', padding: '16px 32px', fontSize: '16px' }}
                    >
                      {triggering ? '⏳ Sending Alert...' : '🚨 SEND EMERGENCY ALERT'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  )
}
