import { useState } from 'react'

const dummyIncident = {
  id: 'INC-2026-041',
  type: 'Fire Alarm',
  location: 'Room 205 (Floor 2)',
  severity: 'CRITICAL',
  status: 'RESOLVED',
  date: 'April 14, 2026',
  triggerTime: '02:14:31 AM',
  resolveTime: '02:41:15 AM',
  guestsAffected: 12,
  staffDispatched: ['Vikram Singh (Maintenance)', 'Anita Desai (Security)'],
  timeline: [
    { time: '02:14:31 AM', event: 'Smoke detector triggered in Room 205.' },
    { time: '02:14:34 AM', event: 'Sentinel AI auto-dispatched Security and Maintenance via push notification.' },
    { time: '02:14:35 AM', event: 'Aegis AI activated for Floor 2. Evacuation routed to NORTH stairwell.' },
    { time: '02:17:12 AM', event: 'Guest in Room 204 confirmed safe via AI Chat.' },
    { time: '02:19:40 AM', event: 'Security personnel (Anita Desai) arrived at Room 205. Confirmed minor electrical fire (hair dryer).' },
    { time: '02:22:15 AM', event: 'Maintenance (Vikram Singh) secured the outlet.' },
    { time: '02:41:15 AM', event: 'All clear issued by Manager. Guests allowed to return to rooms.' },
  ]
}

export default function IncidentReports() {
  const [viewingReport, setViewingReport] = useState(false)

  const handlePrint = () => {
    // In a real application, this would format the page for a print media query and trigger window.print()
    alert("Printing simulated! This would trigger standard window.print() with a PDF stylesheet in production.")
  }

  if (viewingReport) {
    return (
      <div className="dash-page" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <button className="btn btn-outline" onClick={() => setViewingReport(false)}>← Back to Log</button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-outline" onClick={handlePrint}>🖨️ Print PDF</button>
            <button className="btn btn-primary">✉️ Email to Compliance</button>
          </div>
        </div>

        {/* Printable Report Document */}
        <div className="report-document">
          <div className="report-header">
            <div>
              <h1 className="report-title">After Action Report</h1>
              <div className="report-subtitle">CONFIDENTIAL • DO NOT DISTRIBUTE</div>
            </div>
            <div className="report-brand">
              <div style={{ width: '40px', height: '40px', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', fontWeight: 'bold' }}>S</div>
              <div style={{ fontWeight: 'bold', fontSize: '18px' }}>Sentinel AI</div>
            </div>
          </div>

          <div className="report-meta-grid">
            <div className="report-meta-box">
              <div className="rm-label">Incident ID</div>
              <div className="rm-value">{dummyIncident.id}</div>
            </div>
            <div className="report-meta-box">
              <div className="rm-label">Type & Severity</div>
              <div className="rm-value" style={{ color: '#DC2626' }}>{dummyIncident.type} • {dummyIncident.severity}</div>
            </div>
            <div className="report-meta-box">
              <div className="rm-label">Date & Time</div>
              <div className="rm-value">{dummyIncident.date} {dummyIncident.triggerTime}</div>
            </div>
            <div className="report-meta-box">
              <div className="rm-label">Location</div>
              <div className="rm-value">{dummyIncident.location}</div>
            </div>
          </div>

          <div className="report-section">
            <h2>Executive Summary</h2>
            <p>
              On {dummyIncident.date} at {dummyIncident.triggerTime}, a {dummyIncident.severity} {dummyIncident.type.toLowerCase()} was identified at {dummyIncident.location}. 
              Sentinel AI automated response protocols within 3 seconds, notifying {dummyIncident.staffDispatched.length} staff members and successfully routing {dummyIncident.guestsAffected} guests away from the danger zone using the Aegis AI Assistant. 
              The incident was contained and marked resolved at {dummyIncident.resolveTime}. Total incident duration: 26m 44s.
            </p>
          </div>

          <div className="report-section">
            <h2>Chronological Timeline</h2>
            <table className="report-table">
              <thead>
                <tr>
                  <th style={{ width: '150px' }}>Timestamp</th>
                  <th>Event Description / System Action</th>
                </tr>
              </thead>
              <tbody>
                {dummyIncident.timeline.map((item, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{item.time}</td>
                    <td>{item.event}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="report-section">
            <h2>Staff Deployed</h2>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
              {dummyIncident.staffDispatched.map(s => <li key={s}>{s}</li>)}
            </ul>
          </div>

          <div className="report-footer">
            <p>Generated automatically by Sentinel AI Compliance Engine on April 18, 2026. This document meets standard OSHA and local fire marshall reporting requirements.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dash-page">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">📋 Compliance & Reports</h1>
          <p className="dash-page-subtitle">Generate official after-action reports for resolved incidents</p>
        </div>
      </div>

      <div className="dash-card">
        <div className="dash-table-wrapper">
          <table className="dash-table">
            <thead>
              <tr><th>Incident ID</th><th>Date</th><th>Type</th><th>Location</th><th>Result</th><th>Action</th></tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontFamily: 'monospace' }}>INC-2026-041</td>
                <td>April 14, 2026</td>
                <td><strong style={{ color: '#DC2626' }}>Fire Alarm</strong></td>
                <td>Room 205</td>
                <td><span style={{ color: '#10B981', fontWeight: 600 }}>Resolved</span> (26m)</td>
                <td><button className="btn btn-primary" onClick={() => setViewingReport(true)} style={{ padding: '6px 12px', fontSize: '13px' }}>View Report</button></td>
              </tr>
              <tr>
                <td style={{ fontFamily: 'monospace' }}>INC-2026-039</td>
                <td>April 11, 2026</td>
                <td><strong style={{ color: '#3B82F6' }}>Water Leak</strong></td>
                <td>Room 102</td>
                <td><span style={{ color: '#10B981', fontWeight: 600 }}>Resolved</span> (41m)</td>
                <td><button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '13px' }}>View Report</button></td>
              </tr>
              <tr>
                <td style={{ fontFamily: 'monospace' }}>INC-2026-035</td>
                <td>April 02, 2026</td>
                <td><strong style={{ color: '#10B981' }}>Medical</strong></td>
                <td>Room 310</td>
                <td><span style={{ color: '#10B981', fontWeight: 600 }}>Resolved</span> (1h 12m)</td>
                <td><button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '13px' }}>View Report</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
