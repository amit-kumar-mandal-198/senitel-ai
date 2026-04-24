export default function Incidents() {
  const incidents = [
    { id: 1, type: '🔥 Fire Drill', room: '—', floor: 'All', severity: 'medium', status: 'resolved', time: '2 days ago', duration: '4m 12s', guests: 22, note: 'Scheduled drill — all guests evacuated successfully.' },
    { id: 2, type: '🌊 Water Leak', room: '205', floor: '2', severity: 'low', status: 'resolved', time: '5 days ago', duration: '22 min', guests: 1, note: 'Bathroom pipe leak. Maintenance sealed pipe. Guest moved to room 208.' },
    { id: 3, type: '🏥 Medical', room: '308', floor: '3', severity: 'high', status: 'resolved', time: '1 week ago', duration: '35 min', guests: 1, note: 'Guest chest pain. Hotel doctor + ambulance dispatched. Guest stable at Apollo Hospital.' },
    { id: 4, type: '⚡ Power Outage', room: '—', floor: 'All', severity: 'medium', status: 'resolved', time: '2 weeks ago', duration: '1h 15m', guests: 30, note: 'Grid failure. Generator activated in 12s. All guest rooms restored.' },
    { id: 5, type: '🔒 Security', room: '107', floor: '1', severity: 'low', status: 'resolved', time: '3 weeks ago', duration: '8 min', guests: 0, note: 'Unauthorized person on floor 1. Security escorted individual out.' },
  ]
  const sevColors = { critical: '#DC2626', high: '#F59E0B', medium: '#3B82F6', low: '#10B981' }

  return (
    <div className="dash-page">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">📋 Incident Log</h1>
          <p className="dash-page-subtitle">Complete history of all hotel incidents and responses</p>
        </div>
      </div>
      <div className="dash-card">
        <div className="dash-table-wrapper">
          <table className="dash-table">
            <thead>
              <tr><th>Incident</th><th>Location</th><th>Severity</th><th>Duration</th><th>Guests</th><th>Status</th><th>Time</th></tr>
            </thead>
            <tbody>
              {incidents.map(inc => (
                <tr key={inc.id}>
                  <td>
                    <strong style={{ display: 'block' }}>{inc.type}</strong>
                    <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{inc.note}</span>
                  </td>
                  <td>{inc.room !== '—' ? `Room ${inc.room}` : 'All Floors'}</td>
                  <td><span className="dash-severity-badge" style={{ color: sevColors[inc.severity], background: `${sevColors[inc.severity]}15` }}>{inc.severity.toUpperCase()}</span></td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{inc.duration}</td>
                  <td>{inc.guests} affected</td>
                  <td><span style={{ color: '#10B981', fontWeight: 600 }}>✅ {inc.status.toUpperCase()}</span></td>
                  <td className="dash-time-cell">{inc.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
