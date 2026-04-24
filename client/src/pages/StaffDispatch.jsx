import { useState, useEffect } from 'react'

export default function StaffDispatch() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/v1/staff')
        if (res.ok) {
          const data = await res.json()
          setStaff(data.staff || [])
        }
      } catch (err) {
        console.error('Failed to fetch staff', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStaff()
    const poll = setInterval(fetchStaff, 5000)
    return () => clearInterval(poll)
  }, [])

  const statusStyle = { 
    on_duty: { color: '#10B981', bg: 'rgba(16,185,129,0.1)', label: 'ON DUTY' }, 
    off_duty: { color: '#6B7280', bg: 'rgba(107,114,128,0.1)', label: 'OFF DUTY' }, 
    on_call: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', label: 'ON CALL' }, 
    dispatched: { color: '#DC2626', bg: 'rgba(220,38,38,0.1)', label: 'DISPATCHED' } 
  }

  const getAvatar = (role) => {
    if (role.toLowerCase().includes('security')) return '👮'
    if (role.toLowerCase().includes('maintenance')) return '🔧'
    if (role.toLowerCase().includes('house')) return '🧹'
    if (role.toLowerCase().includes('doctor')) return '👩‍⚕️'
    return '👩‍💼'
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Staff Directory...</div>

  return (
    <div className="dash-page">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">👥 Staff Dispatch</h1>
          <p className="dash-page-subtitle">Manage and dispatch staff during emergencies</p>
        </div>
        <button className="btn btn-primary">📢 Alert All Staff</button>
      </div>
      
      <div className="dash-kpi-grid" style={{ marginBottom: '20px' }}>
        <div className="dash-kpi-card"><div className="dash-kpi-value" style={{ color: '#10B981' }}>{staff.filter(s=>s.status==='on_duty').length}</div><div className="dash-kpi-label">On Duty</div></div>
        <div className="dash-kpi-card"><div className="dash-kpi-value" style={{ color: '#DC2626' }}>{staff.filter(s=>s.status==='dispatched').length}</div><div className="dash-kpi-label">Dispatched</div></div>
        <div className="dash-kpi-card"><div className="dash-kpi-value" style={{ color: '#F59E0B' }}>{staff.filter(s=>s.status==='on_call').length}</div><div className="dash-kpi-label">On Call</div></div>
        <div className="dash-kpi-card"><div className="dash-kpi-value">{staff.length}</div><div className="dash-kpi-label">Total Staff</div></div>
      </div>

      <div className="dash-card">
        <div className="dash-card-header"><h2 className="dash-card-title">Staff Directory</h2></div>
        {staff.length === 0 ? (
           <p style={{ color: 'var(--text-secondary)' }}>No staff found. Check database connection.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {staff.map(s => {
              const st = statusStyle[s.status] || statusStyle.off_duty
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-glass)', border: '1px solid var(--border-primary)' }}>
                  <div style={{ fontSize: '28px' }}>{getAvatar(s.role)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '15px' }}>{s.name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{s.role} • {s.phone}</div>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>📍 {s.location}</div>
                  <span style={{ padding: '4px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: '700', background: st.bg, color: st.color }}>{st.label}</span>
                  <button className="btn btn-outline" disabled={s.status === 'dispatched'} style={{ padding: '6px 16px', fontSize: '12px' }}>
                    {s.status === 'dispatched' ? 'Deployed' : 'Dispatch'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
