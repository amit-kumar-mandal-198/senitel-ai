import { Link } from 'react-router-dom'
import GuestChat from './GuestChat'

export default function GuestChatPage() {
  return (
    <div className="dash-page" style={{ height: 'calc(100vh - 100px)', paddingBottom: 0 }}>
      <div className="dash-page-header" style={{ marginBottom: '16px' }}>
        <div>
          <Link to="/guest" className="dash-back-link">← Back to Dashboard</Link>
          <h1 className="dash-page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ animation: 'pulse-glow 2s infinite alternate' }}>🤖</span> 
            Aegis AI Safety Assistant
          </h1>
          <p className="dash-page-subtitle">Real-time emergency guidance and facility information.</p>
        </div>
      </div>

      <div className="dash-card" style={{ padding: 0, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <GuestChat embedded={true} />
        </div>
      </div>
    </div>
  )
}
