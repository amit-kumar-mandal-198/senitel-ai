import { useState } from 'react'
import { Link } from 'react-router-dom'

const SEVERITY_OPTIONS = [
  { value: 'critical', label: 'CRITICAL', color: '#DC2626', emoji: '🔴' },
  { value: 'high', label: 'HIGH', color: '#F59E0B', emoji: '🟠' },
  { value: 'medium', label: 'MEDIUM', color: '#3B82F6', emoji: '🟡' },
  { value: 'low', label: 'LOW', color: '#10B981', emoji: '🟢' },
]

// Color System: emergency=Red, digital=Blue, offline=Amber, guest=Teal, ai=Purple
const CHANNELS = [
  // Primary Digital
  { id: 'sms', label: 'SMS (Twilio/Vonage)', icon: '💬', category: 'digital' },
  { id: 'push_android', label: 'Push (Android FCM)', icon: '📱', category: 'digital' },
  { id: 'push_ios', label: 'Push (iOS APNs)', icon: '🍎', category: 'digital' },
  { id: 'email', label: 'Email (SendGrid/AWS)', icon: '📧', category: 'digital' },
  { id: 'voice', label: 'Voice/IVR', icon: '📞', category: 'digital' },
  { id: 'whatsapp', label: 'WhatsApp', icon: '💚', category: 'digital' },
  { id: 'pa', label: 'PA System', icon: '🔊', category: 'digital' },
  // Collaboration
  { id: 'slack', label: 'Slack', icon: '💼', category: 'digital' },
  { id: 'teams', label: 'MS Teams', icon: '🟦', category: 'digital' },
  // Government
  { id: 'ipaws', label: 'IPAWS-OPEN', icon: '🏛️', category: 'digital' },
  { id: 'wea', label: 'WEA Cell Broadcast', icon: '📶', category: 'digital' },
  { id: 'eas', label: 'EAS TV/Radio', icon: '📺', category: 'digital' },
  // Offline/IoT
  { id: 'lora', label: 'LoRa Mesh', icon: '📡', category: 'offline' },
  { id: 'ble', label: 'BLE Beacons', icon: '🛜', category: 'offline' },
  { id: 'satellite', label: 'Satellite (Starlink)', icon: '🛰️', category: 'offline' },
  { id: 'tv', label: 'Smart TV Override', icon: '📺', category: 'offline' },
  { id: 'lighting', label: 'Smart Lighting', icon: '💡', category: 'offline' },
  { id: 'drapes', label: 'Smart Drapes', icon: '🪟', category: 'offline' },
  { id: 'locks', label: 'BLE Lock Override', icon: '🚪', category: 'offline' },
  { id: 'occupancy', label: 'Occupancy Sensors', icon: '🚶', category: 'offline' },
  // Emergency/SOS
  { id: 'panic', label: 'Mobile Panic Button', icon: '🆘', category: 'emergency' },
  { id: 'silent_sos', label: 'Silent SOS Bridge', icon: '🎙️', category: 'emergency' },
  { id: 'guardian', label: 'Guardian Timer', icon: '⏱️', category: 'emergency' },
  { id: 'fall_detect', label: 'Fall Detection', icon: '💥', category: 'emergency' },
  // Guest Tools
  { id: 'photo', label: 'In-App Photo/GPS', icon: '📸', category: 'guest' },
  { id: 'map', label: 'Crowdsourced Map', icon: '🗺️', category: 'guest' },
  // AI Pipeline
  { id: 'ai_threat', label: 'Threat Detection', icon: '🧠', category: 'ai' },
  { id: 'ai_validate', label: 'Pre-send Validation', icon: '✅', category: 'ai' },
  { id: 'ai_draft', label: 'Alert Drafting', icon: '✍️', category: 'ai' },
  { id: 'ai_translate', label: 'Live Translation', icon: '🌐', category: 'ai' },
  { id: 'ai_orchestrate', label: 'Dispatch (Novu)', icon: '🔄', category: 'ai' },
  { id: 'ai_debrief', label: 'Post-incident Debrief', icon: '📄', category: 'ai' },
]

const CAT_COLORS = {
  emergency: '#DC2626', // Red
  digital: '#3B82F6',   // Blue
  offline: '#F59E0B',   // Amber
  guest: '#14B8A6',     // Teal
  ai: '#A855F7',        // Purple
}

const LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'hi', label: 'Hindi' },
  { id: 'kn', label: 'Kannada' },
  { id: 'ta', label: 'Tamil' },
  { id: 'te', label: 'Telugu' },
  { id: 'bn', label: 'Bengali' },
  { id: 'mr', label: 'Marathi' },
  { id: 'gu', label: 'Gujarati' },
]

export default function AlertCreate() {
  const [step, setStep] = useState(1)
  const [severity, setSeverity] = useState('critical')
  const [title, setTitle] = useState('Flash Flood Warning — District 4')
  const [body, setBody] = useState('Severe flooding expected in District 4 due to heavy rainfall. Evacuate to higher ground immediately. Avoid low-lying areas and bridges.\n\nEmergency shelter: Community Center, Main Street.')
  const [channels, setChannels] = useState(['sms', 'push', 'email', 'lora'])
  const [languages, setLanguages] = useState(['en', 'hi', 'kn'])
  const [validating, setValidating] = useState(false)
  const [validation, setValidation] = useState(null)
  const [dispatching, setDispatching] = useState(false)
  const [dispatched, setDispatched] = useState(false)

  const toggleChannel = (id) => {
    setChannels(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
  }

  const toggleLanguage = (id) => {
    setLanguages(prev => prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id])
  }

  const handleValidate = () => {
    setValidating(true)
    setTimeout(() => {
      setValidation({
        score: 97,
        zone_match: true,
        duplicate_check: false,
        timing_valid: true,
        severity_appropriate: true,
        suggestions: ['Consider adding shelter capacity information'],
        latency_ms: 1200,
        cost_usd: 0.0008,
      })
      setValidating(false)
      setStep(2)
    }, 2000)
  }

  const handleDispatch = () => {
    setDispatching(true)
    setTimeout(() => {
      setDispatching(false)
      setDispatched(true)
      setStep(3)
    }, 1500)
  }

  return (
    <div className="dash-alert-create">
      <div className="dash-page-header">
        <div>
          <Link to="/dashboard" className="dash-back-link">← Back to Dashboard</Link>
          <h1 className="dash-page-title">Create New Alert</h1>
        </div>
        <div className="dash-step-indicator">
          {['Compose', 'AI Validate', 'Dispatched'].map((s, i) => (
            <div className={`dash-step ${step > i ? 'completed' : ''} ${step === i + 1 ? 'active' : ''}`} key={i}>
              <div className="dash-step-number">{step > i + 1 ? '✓' : i + 1}</div>
              <span className="dash-step-label">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Compose */}
      {step === 1 && (
        <div className="dash-compose-form">
          <div className="dash-form-grid">
            <div className="dash-form-main">
              {/* Title */}
              <div className="dash-field">
                <label className="dash-label">Alert Title *</label>
                <input
                  type="text"
                  className="dash-input"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Flash Flood Warning — District 4"
                />
              </div>

              {/* Severity */}
              <div className="dash-field">
                <label className="dash-label">Severity *</label>
                <div className="dash-severity-grid">
                  {SEVERITY_OPTIONS.map(s => (
                    <button
                      key={s.value}
                      className={`dash-severity-btn ${severity === s.value ? 'selected' : ''}`}
                      style={{
                        '--sev-color': s.color,
                        borderColor: severity === s.value ? s.color : 'var(--border-primary)'
                      }}
                      onClick={() => setSeverity(s.value)}
                    >
                      <span>{s.emoji}</span>
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Body */}
              <div className="dash-field">
                <label className="dash-label">Alert Body *</label>
                <textarea
                  className="dash-textarea"
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  rows={6}
                  placeholder="Enter the alert message..."
                />
                <div className="dash-ai-assist">
                  <span>🤖 AI Draft Assist</span>
                  <button className="dash-ai-btn">Generate AI Draft</button>
                  <button className="dash-ai-btn">Improve Text</button>
                  <button className="dash-ai-btn">Translate</button>
                </div>
              </div>

              {/* Target Zone */}
              <div className="dash-field">
                <label className="dash-label">Target Zone *</label>
                <div className="dash-map-placeholder">
                  <div className="dash-map-inner">
                    <div className="dash-map-overlay">
                      <span className="dash-map-icon">🗺️</span>
                      <span>Mapbox GL JS Map</span>
                      <span className="dash-map-sub">Draw Polygon | Select Zone ▼</span>
                    </div>
                    <div className="dash-map-zone">
                      <span>📍 District 4 (drawn polygon)</span>
                    </div>
                  </div>
                  <div className="dash-map-stats">
                    <span>📍 12,847 contacts in zone</span>
                    <span>•</span>
                    <span>Area: 45.2 km²</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="dash-form-sidebar">
              {/* Channels */}
              <div className="dash-field">
                <label className="dash-label">Channels *</label>
                <div className="dash-channel-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {CHANNELS.map(ch => (
                    <label 
                      className={`dash-channel-item ${channels.includes(ch.id) ? 'selected' : ''}`} 
                      key={ch.id}
                      style={{ 
                        borderColor: channels.includes(ch.id) ? CAT_COLORS[ch.category] : 'var(--border-primary)',
                        background: channels.includes(ch.id) ? `${CAT_COLORS[ch.category]}1A` : 'transparent' 
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={channels.includes(ch.id)}
                        onChange={() => toggleChannel(ch.id)}
                      />
                      <span className="dash-channel-icon">{ch.icon}</span>
                      <span className="dash-channel-label" style={{ fontSize: '13px' }}>{ch.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div className="dash-field">
                <label className="dash-label">Languages</label>
                <div className="dash-lang-grid">
                  {LANGUAGES.map(lang => (
                    <label className={`dash-lang-item ${languages.includes(lang.id) ? 'selected' : ''}`} key={lang.id}>
                      <input
                        type="checkbox"
                        checked={languages.includes(lang.id)}
                        onChange={() => toggleLanguage(lang.id)}
                      />
                      <span>{lang.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="dash-summary-card">
                <h3>Alert Summary</h3>
                <div className="dash-summary-row">
                  <span>Severity</span>
                  <span style={{ color: SEVERITY_OPTIONS.find(s => s.value === severity)?.color }}>
                    {severity.toUpperCase()}
                  </span>
                </div>
                <div className="dash-summary-row">
                  <span>Channels</span>
                  <span>{channels.length} selected</span>
                </div>
                <div className="dash-summary-row">
                  <span>Languages</span>
                  <span>{languages.length} selected</span>
                </div>
                <div className="dash-summary-row">
                  <span>Recipients</span>
                  <span>~12,847</span>
                </div>
              </div>
            </div>
          </div>

          <div className="dash-form-actions">
            <Link to="/dashboard" className="btn btn-ghost">Cancel</Link>
            <button className="btn btn-primary btn-lg" onClick={handleValidate} disabled={!title || !body}>
              {validating ? '🤖 Validating...' : 'Next: AI Validate →'}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: AI Validation Result */}
      {step === 2 && validation && (
        <div className="dash-validation-view">
          <div className="dash-validation-card">
            <div className="dash-validation-header">
              <span className="dash-validation-icon">🤖</span>
              <div>
                <h2>AI Validation Results</h2>
                <p>Validated in {(validation.latency_ms / 1000).toFixed(1)}s | Cost: ${validation.cost_usd.toFixed(4)}</p>
              </div>
              <div className="dash-validation-score">
                <div className="dash-score-circle">
                  <span className="dash-score-value">{validation.score}</span>
                  <span className="dash-score-label">/100</span>
                </div>
              </div>
            </div>

            <div className="dash-validation-checks">
              <div className="dash-check-item pass">
                <span className="dash-check-icon">✅</span>
                <div>
                  <strong>Zone Match</strong>
                  <p>Alert zone matches flood-prone area</p>
                </div>
              </div>
              <div className="dash-check-item pass">
                <span className="dash-check-icon">✅</span>
                <div>
                  <strong>No Duplicates</strong>
                  <p>No similar alert in last 24 hours</p>
                </div>
              </div>
              <div className="dash-check-item pass">
                <span className="dash-check-icon">✅</span>
                <div>
                  <strong>Timing Valid</strong>
                  <p>Consistent with weather data and time of day</p>
                </div>
              </div>
              <div className="dash-check-item pass">
                <span className="dash-check-icon">✅</span>
                <div>
                  <strong>Severity Appropriate</strong>
                  <p>CRITICAL matches flash flood scenario</p>
                </div>
              </div>
              <div className="dash-check-item suggestion">
                <span className="dash-check-icon">⚠️</span>
                <div>
                  <strong>Suggestion</strong>
                  <p>Consider adding shelter capacity information</p>
                </div>
              </div>
            </div>
          </div>

          {/* Alert Preview */}
          <div className="dash-preview-card">
            <h2>Alert Preview</h2>
            <div className="dash-preview-grid">
              <div className="dash-preview-device">
                <div className="dash-preview-label">📱 SMS</div>
                <div className="dash-preview-content sms">
                  <strong>SENTINEL AI</strong>
                  <div className="dash-preview-sev critical">🔴 CRITICAL</div>
                  <p>{title}</p>
                  <p style={{ fontSize: '12px' }}>{body.substring(0, 120)}...</p>
                </div>
              </div>
              <div className="dash-preview-device">
                <div className="dash-preview-label">📱 PUSH</div>
                <div className="dash-preview-content push">
                  <div className="dash-preview-push-header">
                    <strong>Sentinel AI</strong>
                    <span>now</span>
                  </div>
                  <div className="dash-preview-sev critical">🔴 FLASH FLOOD</div>
                  <p>{title}</p>
                  <p style={{ fontSize: '12px' }}>Evacuate immediately</p>
                </div>
              </div>
              <div className="dash-preview-device">
                <div className="dash-preview-label">📧 EMAIL</div>
                <div className="dash-preview-content email">
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>From: alerts@sentinel-ai.com</div>
                  <strong>Subject: {title}</strong>
                  <p style={{ fontSize: '12px', marginTop: '8px' }}>Dear [Name],</p>
                  <p style={{ fontSize: '12px' }}>{body.substring(0, 100)}...</p>
                </div>
              </div>
            </div>
          </div>

          <div className="dash-form-actions">
            <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back to Edit</button>
            <button className="btn btn-primary btn-lg" onClick={handleDispatch} disabled={dispatching}>
              {dispatching ? '🚀 Dispatching...' : '🚀 Confirm & Dispatch Alert'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Dispatched */}
      {step === 3 && (
        <div className="dash-dispatched-view">
          <div className="dash-dispatched-card">
            <div className="dash-dispatched-icon">✅</div>
            <h2>Alert Dispatched Successfully</h2>
            <p>Your alert is being delivered across {channels.length} channels to approximately 12,847 recipients.</p>

            <div className="dash-dispatch-stats">
              <div className="dash-dispatch-stat">
                <span className="dash-dispatch-stat-value">12,847</span>
                <span className="dash-dispatch-stat-label">Total Recipients</span>
              </div>
              <div className="dash-dispatch-stat">
                <span className="dash-dispatch-stat-value">{channels.length}</span>
                <span className="dash-dispatch-stat-label">Channels Active</span>
              </div>
              <div className="dash-dispatch-stat">
                <span className="dash-dispatch-stat-value">&lt;5s</span>
                <span className="dash-dispatch-stat-label">Est. Dispatch Time</span>
              </div>
              <div className="dash-dispatch-stat">
                <span className="dash-dispatch-stat-value">97</span>
                <span className="dash-dispatch-stat-label">AI Score</span>
              </div>
            </div>

            <div className="dash-dispatch-channels">
              {channels.map(ch => {
                const channel = CHANNELS.find(c => c.id === ch)
                return (
                  <div className="dash-dispatch-channel" key={ch}>
                    <span>{channel?.icon}</span>
                    <span>{channel?.label}</span>
                    <span className="dash-dispatch-status">Sending...</span>
                  </div>
                )
              })}
            </div>

            <div className="dash-form-actions" style={{ justifyContent: 'center', marginTop: '32px' }}>
              <Link to="/dashboard" className="btn btn-outline">← Back to Dashboard</Link>
              <Link to="/dashboard/alerts/new" className="btn btn-primary" onClick={() => { setStep(1); setValidation(null); setDispatched(false) }}>
                Create Another Alert
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
