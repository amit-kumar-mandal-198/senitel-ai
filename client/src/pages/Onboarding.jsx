import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/dashboard.css'

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    hotelName: 'The Grand Aurora',
    address: '123 Skyway Blvd',
    floors: 5,
    sensors: true
  })

  const nextStep = () => {
    if (step < 4) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const finishOnboarding = (role) => {
    setLoading(true)
    localStorage.setItem('sentinel_role', role)
    setTimeout(() => {
      navigate(role === 'manager' ? '/dashboard' : '/guest')
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
            <span>Floor Mapping</span>
          </li>
          <li className={`onboarding-step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
            <div className="step-circle">{step > 3 ? '✓' : '3'}</div>
            <span>IoT Integration</span>
          </li>
          <li className={`onboarding-step ${step >= 4 ? 'active' : ''}`}>
            <div className="step-circle">4</div>
            <span>Review & Launch</span>
          </li>
        </ul>
      </div>

      <div className="onboarding-content">
        <div className="onboarding-container">
          
          {step === 1 && (
            <div className="onboarding-panel fade-in">
              <h1>Welcome to Sentinel AI</h1>
              <p>Let's get your hotel set up for automated crisis management in less than 5 minutes.</p>
              
              <div className="dash-field" style={{ marginTop: '32px' }}>
                <label className="dash-label">Hotel Name</label>
                <input type="text" className="dash-input" value={formData.hotelName} onChange={e => setFormData({...formData, hotelName: e.target.value})} />
              </div>
              
              <div className="dash-field">
                <label className="dash-label">Property Address</label>
                <input type="text" className="dash-input" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="onboarding-panel fade-in">
              <h1>Floor Mapping Configuration</h1>
              <p>Define the physical layout of your property so Aegis AI can route guests accurately.</p>
              
              <div className="dash-field" style={{ marginTop: '32px' }}>
                <label className="dash-label">Total Number of Floors</label>
                <input type="number" className="dash-input" value={formData.floors} onChange={e => setFormData({...formData, floors: parseInt(e.target.value)})} />
              </div>

              <div className="dash-card" style={{ background: 'rgba(59,130,246,0.05)', marginTop: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '24px' }}>🗺️</div>
                  <div>
                    <h3 style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Wait, do I have to map every room manually?</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>No! In the next step, you can just upload your PMS (Property Management System) CSV and we will generate exactly where the stairwells and rooms are automatically.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="onboarding-panel fade-in">
              <h1>IoT & Sensor Integration</h1>
              <p>Connect your existing hardware to Sentinel AI for instant zero-touch emergency triggers.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '32px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: '1px solid var(--sentinel-blue-light)', borderRadius: 'var(--radius-md)', background: 'rgba(59,130,246,0.1)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.sensors} onChange={e => setFormData({...formData, sensors: e.target.checked})} style={{ width: '20px', height: '20px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Enable Smart Smoke Detectors</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Automatically trigger Fire Protocol on API webhook</div>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked={true} style={{ width: '20px', height: '20px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>PMS Sync (Oracle Opera / Cloudbeds)</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Sync live guest occupancy data every 5 minutes</div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="onboarding-panel fade-in text-center" style={{ textAlign: 'center', paddingTop: '40px' }}>
              <div style={{ fontSize: '64px', marginBottom: '24px' }}>🛡️</div>
              <h1>You're Ready to Launch</h1>
              <p>Your property is configured. Sentinel AI is armed and monitoring.</p>
              
              <div className="dash-card text-left" style={{ textAlign: 'left', marginTop: '32px', display: 'inline-block', width: '100%', maxWidth: '400px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Property</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{formData.hotelName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Floors</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{formData.floors} Mapping Active</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Security Posture</span>
                  <span style={{ color: '#10B981', fontWeight: '800' }}>ACTIVE</span>
                </div>
              </div>
            </div>
          )}

          <div className="onboarding-actions">
            {step > 1 ? (
              <button className="btn btn-outline" onClick={prevStep} disabled={loading}>Back</button>
            ) : <div />}
            
            {step < 4 ? (
              <button className="btn btn-primary" onClick={nextStep}>Continue →</button>
            ) : (
              loading ? (
                <button className="btn btn-primary" disabled>Initializing System...</button>
              ) : (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn btn-outline" onClick={() => finishOnboarding('guest')}>
                    👤 Setup as Guest
                  </button>
                  <button className="btn btn-primary" onClick={() => finishOnboarding('manager')}>
                    👔 Setup as Manager
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
