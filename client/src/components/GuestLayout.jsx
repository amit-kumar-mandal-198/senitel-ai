import { Outlet, Navigate, Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import '../styles/dashboard.css'

export default function GuestLayout() {
  const role = localStorage.getItem('sentinel_role')
  
  if (role !== 'guest' && role !== 'manager') {
    // If no specific role is found, fallback to onboarding or landing
    return <Navigate to="/onboarding" replace />
  }

  return (
    <div className="dash-layout">
      <div className="dash-main" style={{ marginLeft: 0 }}>
        {/* Minimal Guest Header */}
        <header className="dash-header" style={{ padding: '0 24px' }}>
          <div className="dash-header-left">
             <div className="dash-brand" style={{ marginRight: '16px' }}>
                <div className="dash-brand-icon">S</div>
                <span className="dash-brand-text">Sentinel <span>Guest</span></span>
             </div>
          </div>
          
          <div className="dash-header-right">
            <Link to="/guest/crisis" style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #DC2626, #991B1B)',
              border: '1px solid rgba(220, 38, 38, 0.5)',
              borderRadius: '10px',
              color: '#fff',
              fontWeight: '700',
              fontSize: '13px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 12px rgba(220, 38, 38, 0.3)',
              transition: 'all 0.2s',
            }}>
              🚨 Report Emergency
            </Link>
            <button className="btn btn-outline" onClick={() => alert("Help is on the way. Please use the Guest AI Chat for immediate guidance.")} style={{ padding: '6px 12px', fontSize: '13px' }}>
               ℹ️ Help Mode
            </button>
            <ThemeToggle />
            <div className="dash-user-menu">
              <div className="dash-avatar" style={{ background: 'var(--sentinel-blue-light)' }}>GU</div>
            </div>
          </div>
        </header>

        <div className="dash-content" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
