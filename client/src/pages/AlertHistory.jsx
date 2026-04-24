import { Link } from 'react-router-dom'

const MOCK_HISTORY = [
  { id: 'a1', title: 'Flash Flood Warning — District 4', severity: 'critical', status: 'sent', delivery: 98.2, recipients: 12847, channels: ['sms', 'push', 'email', 'lora'], time: '2 min ago', aiScore: 97 },
  { id: 'a2', title: 'Road Closure — NH-44', severity: 'high', status: 'sent', delivery: 95.7, recipients: 8420, channels: ['sms', 'push'], time: '15 min ago', aiScore: 94 },
  { id: 'a3', title: 'Scheduled Maintenance — Grid B', severity: 'medium', status: 'sent', delivery: 99.1, recipients: 3200, channels: ['email', 'push'], time: '1 hr ago', aiScore: 99 },
  { id: 'a4', title: 'Air Quality Advisory — Delhi NCR', severity: 'low', status: 'sent', delivery: 97.5, recipients: 45000, channels: ['sms', 'push', 'email'], time: '3 hr ago', aiScore: 95 },
  { id: 'a5', title: 'Earthquake Preparedness Drill', severity: 'medium', status: 'sent', delivery: 96.8, recipients: 15600, channels: ['sms', 'push', 'email', 'pa'], time: '5 hr ago', aiScore: 98 },
  { id: 'a6', title: 'Cyclone Warning — Coastal AP', severity: 'critical', status: 'sent', delivery: 97.9, recipients: 89000, channels: ['sms', 'push', 'email', 'lora', 'ipaws'], time: '8 hr ago', aiScore: 99 },
]

const sevColors = { critical: '#DC2626', high: '#F59E0B', medium: '#3B82F6', low: '#10B981' }

export default function AlertHistory() {
  return (
    <div className="dash-page">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">Alert History</h1>
          <p className="dash-page-subtitle">All dispatched alerts with delivery analytics</p>
        </div>
        <Link to="/dashboard/alerts/new" className="btn btn-primary">🚨 Create Alert</Link>
      </div>

      <div className="dash-card" style={{ marginTop: '24px' }}>
        <div className="dash-table-wrapper">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Alert</th>
                <th>Severity</th>
                <th>Recipients</th>
                <th>Channels</th>
                <th>Delivery</th>
                <th>AI Score</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_HISTORY.map(a => (
                <tr key={a.id}>
                  <td><strong>{a.title}</strong></td>
                  <td>
                    <span className="dash-severity-badge" style={{ color: sevColors[a.severity], background: `${sevColors[a.severity]}15` }}>
                      {a.severity.toUpperCase()}
                    </span>
                  </td>
                  <td>{a.recipients.toLocaleString()}</td>
                  <td><span className="dash-channel-count">{a.channels.length} channels</span></td>
                  <td>
                    <div className="dash-delivery-bar-wrap">
                      <div className="dash-delivery-bar-bg">
                        <div className="dash-delivery-bar-fill" style={{ width: `${a.delivery}%` }} />
                      </div>
                      <span>{a.delivery}%</span>
                    </div>
                  </td>
                  <td><span className="dash-ai-score">{a.aiScore}/100</span></td>
                  <td className="dash-time-cell">{a.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
