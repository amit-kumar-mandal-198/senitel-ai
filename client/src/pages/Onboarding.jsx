import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/dashboard.css'

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showRoomPrompt, setShowRoomPrompt] = useState(false)
  const [guestRoom, setGuestRoom] = useState('')
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    hotelName: 'The Grand Aurora',
    address: '123 Skyway Blvd',
    floors: 5,
    sensors: true
  })

  const nextStep = () => {
    if (step < 2) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const finishOnboarding = (role) => {
    if (role === 'guest') {
      setShowRoomPrompt(true)
      return
    }
    setLoading(true)
    localStorage.setItem('sentinel_role', role)
    setTimeout(() => {
      navigate('/dashboard')
    }, 2000)
  }

  const confirmGuestRoom = () => {
    if (!guestRoom.trim()) return
    setLoading(true)
    localStorage.setItem('sentinel_role', 'guest')
    localStorage.setItem('sentinel_guest_room', guestRoom.trim())
    setTimeout(() => {
      navigate('/guest')
    }, 2000)
  }

  return (
    <div className="onboarding-layout">
      <div className="onboarding-sidebar">
        <div className="dash-brand" style={{ marginBottom: '40px' }}>
          <div className="dash-brand-icon">S</div>
          <span className="dash-brand-text">Sentinel <span>AI</span></span>
        </div>
        
        <h2 style={{ fontSize: '20px', marginBottom: '24px', color: 'var(--text-primary)' }}>Setup your Hotel</h2>
        
        <ul className="onboarding-steps">
          <li className={`onboarding-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-circle">{step > 1 ? '✓' : '1'}</div>
            <span>Property Details</span>
          </li>
          <li className={`onboarding-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="step-circle">{step > 2 ? '✓' : '2'}</div>
            <span>Integration & Launch</span>
          </li>
        </ul>
      </div>

      <div className="onboarding-content">
        <div className="onboarding-container" style={{ maxWidth: '900px' }}>
          
          {step === 1 && (
            <div className="onboarding-panel fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <h1>Welcome to Sentinel AI</h1>
                  <p>Let's get your hotel set up for automated crisis management in less than 5 minutes.</p>
                </div>
                <div style={{ padding: '6px 12px', background: 'rgba(59,130,246,0.1)', borderRadius: '16px', color: 'var(--sentinel-blue-light)', fontSize: '13px', fontWeight: '600' }}>Step 1 of 2</div>
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginTop: '24px' }}>
                {/* Left Column: Property Details */}
                <div className="dash-card" style={{ flex: '1 1 350px', background: 'var(--bg-glass)', border: '1px solid var(--border-primary)', padding: '24px' }}>
                  <h2 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--text-primary)' }}>Property Details</h2>
                  <div className="dash-field" style={{ marginTop: '16px' }}>
                    <label className="dash-label">Hotel Name</label>
                    <input type="text" className="dash-input" value={formData.hotelName} onChange={e => setFormData({...formData, hotelName: e.target.value})} />
                  </div>
                  
                  <div className="dash-field">
                    <label className="dash-label">Property Address</label>
                    <input type="text" className="dash-input" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                  </div>
                </div>

                {/* Right Column: Floor Mapping */}
                <div className="dash-card" style={{ flex: '1 1 350px', background: 'var(--bg-glass)', border: '1px solid var(--border-primary)', padding: '24px' }}>
                  <h2 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--text-primary)' }}>Floor Mapping Configuration</h2>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Define the physical layout of your property so Aegis AI can route guests accurately.</p>
                  
                  <div className="dash-field" style={{ marginTop: '24px' }}>
                    <label className="dash-label">Total Number of Floors</label>
                    <input type="number" className="dash-input" value={formData.floors} onChange={e => setFormData({...formData, floors: parseInt(e.target.value)})} />
                  </div>

                  <div className="dash-card" style={{ background: 'rgba(59,130,246,0.05)', marginTop: '24px', padding: '16px', border: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ fontSize: '24px' }}>🗺️</div>
                      <div>
                        <h3 style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>Wait, do I have to map every room manually?</h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>No! You can upload your PMS (Property Management System) CSV and we will generate exactly where the stairwells and rooms are automatically.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="onboarding-panel fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <h1>IoT Integration & Launch Dashboard</h1>
                  <p>Connect your existing hardware and review your property details.</p>
                </div>
                <div style={{ padding: '6px 12px', background: 'rgba(59,130,246,0.1)', borderRadius: '16px', color: 'var(--sentinel-blue-light)', fontSize: '13px', fontWeight: '600' }}>Step 2 of 2</div>
              </div>
              
              <div style={{ marginTop: '32px' }}>
                <h2 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--text-primary)' }}>IoT & Sensor Integration</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                  <label style={{ flex: '1 1 350px', display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: '1px solid var(--sentinel-blue-light)', borderRadius: 'var(--radius-md)', background: 'rgba(59,130,246,0.1)', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <input type="checkbox" checked={formData.sensors} onChange={e => setFormData({...formData, sensors: e.target.checked})} style={{ width: '20px', height: '20px', accentColor: 'var(--sentinel-blue)' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Enable Smart Smoke Detectors</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Automatically trigger Fire Protocol on API webhook</div>
                    </div>
                  </label>

                  <label style={{ flex: '1 1 350px', display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <input type="checkbox" defaultChecked={true} style={{ width: '20px', height: '20px', accentColor: 'var(--sentinel-blue)' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>PMS Sync (Oracle Opera / Cloudbeds)</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Sync live guest occupancy data every 5 minutes</div>
                    </div>
                  </label>
                </div>
              </div>

              <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid var(--border-primary)' }}>
                <h2 style={{ fontSize: '18px', marginBottom: '24px', color: 'var(--text-primary)' }}>Review & Launch Dashboard</h2>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                  <div className="dash-card text-left" style={{ flex: '1 1 200px', background: 'var(--bg-glass)', border: '1px solid var(--border-primary)', padding: '20px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500' }}>Property Name</span>
                    <div style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '16px', marginTop: '6px' }}>{formData.hotelName}</div>
                  </div>
                  
                  <div className="dash-card text-left" style={{ flex: '1 1 200px', background: 'var(--bg-glass)', border: '1px solid var(--border-primary)', padding: '20px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500' }}>Location & Floors</span>
                    <div style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '16px', marginTop: '6px' }}>{formData.floors} Floors Mapping Active</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>{formData.address}</div>
                  </div>

                  <div className="dash-card text-left" style={{ flex: '1 1 200px', background: 'var(--bg-glass)', border: '1px solid var(--border-primary)', padding: '20px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500' }}>Security Posture</span>
                    <div style={{ color: '#10B981', fontWeight: '800', fontSize: '16px', marginTop: '6px' }}>ACTIVE</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>
                      {formData.sensors ? 'IoT Sensors Enabled' : 'Sensors Disabled'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="onboarding-actions">
            <div>
              {step > 1 ? (
                <button className="btn btn-outline" onClick={prevStep} disabled={loading}>← Back</button>
              ) : null}
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              {step === 1 ? (
                <button className="btn btn-primary" onClick={nextStep}>Continue →</button>
              ) : (
                loading ? (
                  <button className="btn btn-primary" disabled>Initializing System...</button>
                ) : (
                  <>
                    <button className="btn btn-outline" onClick={() => finishOnboarding('guest')}>
                      👤 Setup as Guest
                    </button>
                    <button className="btn btn-primary" onClick={() => finishOnboarding('manager')}>
                      👔 Setup as Manager
                    </button>
                  </>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* GUEST ROOM NUMBER PROMPT MODAL */}
      {showRoomPrompt && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #0f172a, #1e293b)',
            border: '2px solid rgba(59,130,246,0.3)',
            borderRadius: '24px', padding: '48px', textAlign: 'center',
            maxWidth: '460px', width: '90%',
            boxShadow: '0 0 60px rgba(59,130,246,0.15), 0 25px 50px rgba(0,0,0,0.5)',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏨</div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#f1f5f9', margin: '0 0 8px 0' }}>
              Welcome, Guest!
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 32px 0', lineHeight: 1.5 }}>
              Please enter your room number to personalize your safety experience.
            </p>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', textAlign: 'left' }}>
                Room Number
              </label>
              <input
                type="text"
                value={guestRoom}
                onChange={e => setGuestRoom(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && confirmGuestRoom()}
                placeholder=""
                autoFocus
                style={{
                  width: '100%', padding: '16px 20px',
                  background: '#0f172a', border: '2px solid rgba(59,130,246,0.3)',
                  borderRadius: '12px', color: '#f1f5f9',
                  fontSize: '28px', fontWeight: '800', textAlign: 'center',
                  letterSpacing: '4px', outline: 'none',
                  fontFamily: 'var(--font-mono, monospace)',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = 'rgba(59,130,246,0.3)'}
              />
            </div>

            <button
              onClick={confirmGuestRoom}
              disabled={!guestRoom.trim() || loading}
              style={{
                width: '100%', padding: '16px',
                background: guestRoom.trim() ? 'linear-gradient(135deg, #2563EB, #1D4ED8)' : '#1e293b',
                color: guestRoom.trim() ? '#fff' : '#475569',
                fontWeight: '800', fontSize: '15px',
                borderRadius: '12px', border: 'none', cursor: guestRoom.trim() ? 'pointer' : 'not-allowed',
                boxShadow: guestRoom.trim() ? '0 4px 20px rgba(37,99,235,0.4)' : 'none',
                transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '1px',
              }}
            >
              {loading ? '⏳ Setting Up...' : '✓ Confirm & Enter'}
            </button>

            <button
              onClick={() => setShowRoomPrompt(false)}
              style={{
                marginTop: '12px', background: 'none', border: 'none',
                color: '#475569', fontSize: '13px', cursor: 'pointer',
                padding: '8px',
              }}
            >
              ← Go Back
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
