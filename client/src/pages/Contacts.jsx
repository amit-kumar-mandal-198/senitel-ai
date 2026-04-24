export default function Contacts() {
  const contacts = [
    { id: 'c1', name: 'Priya Sharma', phone: '+91XXXXXXXX89', email: 'p****a@example.com', groups: ['district_4', 'flood_zone'], zone: 'District 4', emergency: true },
    { id: 'c2', name: 'Raj Patel', phone: '+91XXXXXXXX42', email: 'r****l@example.com', groups: ['district_7'], zone: 'District 7', emergency: false },
    { id: 'c3', name: 'Anita Desai', phone: '+91XXXXXXXX67', email: 'a****i@example.com', groups: ['emergency_responders'], zone: 'Central', emergency: true },
    { id: 'c4', name: 'Vikram Singh', phone: '+91XXXXXXXX15', email: 'v****h@example.com', groups: ['district_4', 'volunteers'], zone: 'District 4', emergency: false },
    { id: 'c5', name: 'Meera Nair', phone: '+91XXXXXXXX33', email: 'm****r@example.com', groups: ['hospital_staff'], zone: 'Medical Zone', emergency: true },
  ]
  return (
    <div className="dash-page">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">Contacts</h1>
          <p className="dash-page-subtitle">12,847 contacts across 8 groups</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-outline">📥 Import CSV</button>
          <button className="btn btn-primary">+ Add Contact</button>
        </div>
      </div>
      <div className="dash-card" style={{ marginTop: '24px' }}>
        <div className="dash-table-wrapper">
          <table className="dash-table">
            <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Groups</th><th>Zone</th><th>Emergency</th></tr></thead>
            <tbody>
              {contacts.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.name}</strong></td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{c.phone}</td>
                  <td style={{ fontSize: '13px' }}>{c.email}</td>
                  <td>{c.groups.map(g => <span key={g} style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '99px', fontSize: '11px', background: 'rgba(59,130,246,0.1)', color: '#60A5FA', marginRight: '4px', fontWeight: 500 }}>{g}</span>)}</td>
                  <td>{c.zone}</td>
                  <td>{c.emergency ? <span style={{ color: '#EF4444', fontWeight: 600 }}>🔒 Yes</span> : <span style={{ color: 'var(--text-tertiary)' }}>No</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
