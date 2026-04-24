import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const CRISIS_TYPES = [
  { id: 'fire', icon: '🔥', label: 'Fire', color: '#DC2626', desc: 'Fire detected in room or floor. Triggers evacuation protocol.', severity: 'critical' },
  { id: 'flood', icon: '🌊', label: 'Flooding', color: '#3B82F6', desc: 'Water leak, pipe burst, or storm flooding. Alerts maintenance.', severity: 'high' },
  { id: 'medical', icon: '🏥', label: 'Medical', color: '#10B981', desc: 'Guest medical emergency. Dispatches medical team.', severity: 'high' },
  { id: 'security', icon: '🔒', label: 'Security', color: '#F59E0B', desc: 'Intruder, theft, or suspicious activity. Lockdown protocol.', severity: 'critical' },
  { id: 'power', icon: '⚡', label: 'Power Outage', color: '#8B5CF6', desc: 'Power failure. Emergency lighting and elevator rescue.', severity: 'medium' },
  { id: 'gas', icon: '💨', label: 'Gas Leak', color: '#EF4444', desc: 'Gas detected. Immediate evacuation and ventilation.', severity: 'critical' },
]

const FLOORS = {
  1: ['101','102','103','104','105','106','107','108','109','110'],
  2: ['201','202','203','204','205','206','207','208','209','210'],
  3: ['301','302','303','304','305','306','307','308','309','310'],
}

export default function CrisisTrigger() {
  const [crisisType, setCrisisType] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [selectedFloor, setSelectedFloor] = useState(3)
  const [triggering, setTriggering] = useState(false)
  const [triggered, setTriggered] = useState(false)
  const [apiError, setApiError] = useState(null)

  const handleTrigger = async () => {
    if (!crisisType || !selectedRoom) return
    setTriggering(true)
    setApiError(null)

    const selectedCrisis = CRISIS_TYPES.find(c => c.id === crisisType)

    try {
      const res = await fetch('http://localhost:3000/api/v1/crisis/trigger', {
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
      } else {
        setApiError('Failed to trigger crisis. Is backend running?')
      }
    } catch (err) {
      setApiError('Network error connecting to backend API.')
    } finally {
      setTriggering(false)
    }
  }

  const selectedCrisis = CRISIS_TYPES.find(c => c.id === crisisType)

  if (triggered) {
    return (
      <div className="dash-page">
        <div className="dash-dispatched-view">
          <div className="dash-dispatched-card">
            <div className="dash-dispatched-icon">🚨</div>
            <h2>Crisis Activated</h2>
            <p>
              <strong style={{ color: selectedCrisis?.color }}>{selectedCrisis?.icon} {selectedCrisis?.label.toUpperCase()}</strong> at
              Room <strong>{selectedRoom}</strong> has been triggered via API.
            </p>

            <div className="dash-dispatch-stats" style={{ marginTop: '32px' }}>
              <div className="dash-dispatch-stat">
                <span className="dash-dispatch-stat-value">{selectedCrisis?.icon}</span>
                <span className="dash-dispatch-stat-label">{selectedCrisis?.label}</span>
              </div>
              <div className="dash-dispatch-stat">
                <span className="dash-dispatch-stat-value">{selectedRoom}</span>
                <span className="dash-dispatch-stat-label">Room</span>
              </div>
              <div className="dash-dispatch-stat">
                <span className="dash-dispatch-stat-value">&lt;3s</span>
                <span className="dash-dispatch-stat-label">Database Synced</span>
              </div>
              <div className="dash-dispatch-stat">
                <span className="dash-dispatch-stat-value">🤖</span>
                <span className="dash-dispatch-stat-label">AI Chat Active</span>
              </div>
            </div>

            <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 'var(--radius-lg)' }}>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                ✅ SQLite Database updated with active Incident<br/>
                ✅ Dashboard floor map is now flashing red<br/>
                ✅ Nearby hotel staff have been flagged as "dispatched"<br/>
                ✅ Priority API routes activated
              </p>
            </div>

            <div className="dash-form-actions" style={{ justifyContent: 'center', marginTop: '32px' }}>
              <Link to="/dashboard" className="btn btn-outline">← View Floor Map</Link>
              <Link to="/dashboard/guest-chat" className="btn btn-primary">🤖 Open Guest AI Chat</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dash-page">
      <div className="dash-page-header">
        <div>
          <Link to="/dashboard" className="dash-back-link">← Back to Dashboard</Link>
          <h1 className="dash-page-title">🚨 Trigger Crisis Alert</h1>
          <p className="dash-page-subtitle">Select crisis type and room location to activate emergency protocol.</p>
        </div>
      </div>

      {apiError && (
        <div style={{ padding: '16px', background: 'rgba(220,38,38,0.1)', color: '#DC2626', border: '1px solid currentColor', borderRadius: '8px', marginBottom: '24px', fontWeight: 'bold' }}>
          {apiError}
        </div>
      )}

      {/* Step 1: Crisis Type */}
      <div className="dash-card" style={{ marginBottom: '24px' }}>
        <div className="dash-card-header">
          <h2 className="dash-card-title">Step 1: Select Crisis Type</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          {CRISIS_TYPES.map(c => (
            <button
              key={c.id}
              onClick={() => setCrisisType(c.id)}
              style={{
                padding: '20px 16px',
                background: crisisType === c.id ? `${c.color}15` : 'var(--bg-glass)',
                border: `2px solid ${crisisType === c.id ? c.color : 'var(--border-primary)'}`,
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
                fontFamily: 'var(--font-ui)',
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>{c.icon}</div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: crisisType === c.id ? c.color : 'var(--text-primary)' }}>{c.label}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>{c.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Room Selection */}
      <div className="dash-card" style={{ marginBottom: '24px' }}>
        <div className="dash-card-header">
          <h2 className="dash-card-title">Step 2: Select Room Location</h2>
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
              style={{ cursor: 'pointer', border: selectedRoom === room ? '2px solid var(--sentinel-blue-light)' : undefined }}
            >
              <span className="hotel-room-number">{room}</span>
              <span className="hotel-room-status">{selectedRoom === room ? '📍' : '—'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Summary + Trigger */}
      {crisisType && selectedRoom && (
        <div className="dash-card" style={{ borderColor: selectedCrisis?.color, borderWidth: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Ready to trigger:</div>
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
              {triggering ? '⏳ Activating Database...' : '🚨 TRIGGER CRISIS NOW'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
