import { Outlet, Navigate, Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import '../styles/dashboard.css'

export default function GuestLayout() {
  const role = localStorage.getItem('sentinel_role')
  const guestRoom = localStorage.getItem('sentinel_guest_room') || '---'
  const floorNum = guestRoom !== '---' ? guestRoom.charAt(0) : '-'
  
  if (role !== 'guest' && role !== 'manager') {
    return <Navigate to="/onboarding" replace />
  }

  return (
    <div className="dash-layout">
      <div className="dash-main" style={{ marginLeft: 0 }}>
        {/* Room Number Top Strip */}
        <div style={{
          background: 'linear-gradient(90deg, #1e3a5f 0%, #0f172a 50%, #1e3a5f 100%)',
          borderBottom: '1px solid rgba(59, 130, 246, 0.3)',
          padding: '6px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          fontSize: '13px',
          fontWeight: '700',
          color: '#93c5fd',
          letterSpacing: '1px',
        }}>
          <span style={{ fontSize: '16px' }}>🏨</span>
          <span>YOUR ROOM:</span>
          <span style={{
            background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
            color: '#fff',
            padding: '2px 14px',
            borderRadius: '6px',
            fontSize: '15px',
            fontWeight: '900',
            letterSpacing: '2px',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)',
          }}>{guestRoom}</span>
          <span style={{ color: '#64748b', fontSize: '11px', marginLeft: '8px' }}>Floor {floorNum}</span>
        </div>

        {/* Minimal Guest Header */}
        <header className="dash-header" style={{ padding: '0 24px' }}>
          <div className="dash-header-left">
             <div className="dash-brand" style={{ marginRight: '16px' }}>
                <div className="dash-brand-icon">S</div>
                <span className="dash-brand-text">Sentinel <span>Guest</span></span>
             </div>
          </div>
          
          <div className="dash-header-right">
            <Link to="/guest/chat" style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
              border: '1px solid rgba(59, 130, 246, 0.5)',
              borderRadius: '10px',
              color: '#fff',
              fontWeight: '700',
              fontSize: '13px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 12px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.2s',
            }}>
              🤖 AI Assistant
            </Link>
            <button className="btn btn-outline" onClick={() => alert("Help is on the way. Please use the Guest AI Chat for immediate guidance.")} style={{ padding: '6px 12px', fontSize: '13px' }}>
               ℹ️ Help Mode
            </button>
            <ThemeToggle />
            <Link to="/guest/profile" className="dash-user-menu hover:bg-slate-800 transition-colors p-1 rounded-lg">
              <div className="dash-avatar" style={{ background: 'var(--sentinel-blue-light)' }}>GU</div>
            </Link>
          </div>
        </header>

        <div className="dash-content" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
