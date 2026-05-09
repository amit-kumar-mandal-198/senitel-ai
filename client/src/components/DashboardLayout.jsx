import { useState } from 'react'
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom'
import '../styles/dashboard.css'
import ThemeToggle from './ThemeToggle'
import AegisCommand from './AegisCommand'
import SpaceBackground from './SpaceBackground'

const NAV_ITEMS = [
  { path: '/dashboard', icon: '🏨', label: 'Hotel Overview', exact: true },
  { path: '/dashboard/crisis', icon: '🚨', label: 'Trigger Crisis' },
  { path: '/dashboard/guest-chat', icon: '🤖', label: 'Guest AI Chat' },
  { path: '/dashboard/floors', icon: '🗺️', label: 'Floor Maps' },
  { path: '/dashboard/incidents', icon: '🚨', label: 'Active Incidents' },
  { path: '/dashboard/reports', icon: '📋', label: 'Incident Reports' },
  { path: '/dashboard/staff', icon: '🗺️', label: 'Responder Map' },
  { type: 'divider' },
  { path: '/dashboard/settings', icon: '⚙️', label: 'Settings' },
]

export default function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [aegisOpen, setAegisOpen] = useState(false)
  const location = useLocation()

  return (
    <div className={`dash-layout ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <SpaceBackground />
      <aside className={`dash-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="dash-sidebar-header">
          <Link to="/" className="dash-brand">
            <div className="dash-brand-icon">S</div>
            {!sidebarCollapsed && <span className="dash-brand-text">Sentinel <span>AI</span></span>}
          </Link>
          <button className="dash-collapse-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} aria-label="Toggle sidebar">
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        <nav className="dash-nav">
          {NAV_ITEMS.map((item, i) => {
            if (item.type === 'divider') return <div className="dash-nav-divider" key={`div-${i}`} />
            return (
              <NavLink key={item.path} to={item.path} end={item.exact}
                className={({ isActive }) => `dash-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}>
                <span className="dash-nav-icon">{item.icon}</span>
                {!sidebarCollapsed && <span className="dash-nav-label">{item.label}</span>}
              </NavLink>
            )
          })}
        </nav>

        <div className="dash-sidebar-footer">
          {!sidebarCollapsed && (
            <div className="dash-plan-badge">
              <span className="dash-plan-dot" />
              <span>Grand Hotel — Pro Plan</span>
            </div>
          )}
        </div>
      </aside>

      {mobileOpen && <div className="dash-overlay" onClick={() => setMobileOpen(false)} />}

      <div className="dash-main">
        <header className="dash-header">
          <div className="dash-header-left">
            <button className="dash-mobile-toggle" onClick={() => setMobileOpen(true)} aria-label="Open sidebar">☰</button>
            <div className="dash-breadcrumb">
              <span className="dash-breadcrumb-item">Hotel Dashboard</span>
              {location.pathname !== '/dashboard' && (
                <>
                  <span className="dash-breadcrumb-sep">/</span>
                  <span className="dash-breadcrumb-item active">
                    {NAV_ITEMS.find(n => n.path === location.pathname)?.label || 'Page'}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="dash-header-right">
            <button 
              onClick={() => setAegisOpen(true)}
              className="btn btn-primary" 
              style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              🤖 Aegis Command
            </button>
            <ThemeToggle />
            <div className="dash-status-indicator">
              <span className="dash-status-dot online" />
              <span>All Floors Clear</span>
            </div>
            <button className="dash-notification-btn" aria-label="Notifications">
              🔔<span className="dash-notif-badge">0</span>
            </button>
            <Link to="/dashboard/profile" className="dash-user-menu hover:bg-slate-800 transition-colors p-1 rounded-lg">
              <div className="dash-avatar">MG</div>
              {!sidebarCollapsed && <span className="dash-user-name">Manager</span>}
            </Link>
          </div>
        </header>

        <div className="dash-content">
          <Outlet />
        </div>
      </div>
      
      <AegisCommand isOpen={aegisOpen} onClose={() => setAegisOpen(false)} />
    </div>
  )
}
