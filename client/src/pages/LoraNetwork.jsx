export default function LoraNetwork() {
  const nodes = [
    { id: 'n1', hw: 'HELTEC-V3-A1B2C3', name: 'Node Alpha — Gateway', status: 'online', battery: 87, signal: -65, hops: 0, neighbors: 3, msgs: 15847, firmware: '2.3.1', solar: true },
    { id: 'n2', hw: 'HELTEC-V3-D4E5F6', name: 'Node Beta — Relay', status: 'online', battery: 92, signal: -72, hops: 1, neighbors: 4, msgs: 12340, firmware: '2.3.1', solar: true },
    { id: 'n3', hw: 'HELTEC-V3-G7H8I9', name: 'Node Gamma — Relay', status: 'offline', battery: 23, signal: -90, hops: 2, neighbors: 1, msgs: 8921, firmware: '2.2.0', solar: false },
    { id: 'n4', hw: 'HELTEC-V3-J0K1L2', name: 'Node Delta — Edge', status: 'online', battery: 65, signal: -78, hops: 1, neighbors: 2, msgs: 20150, firmware: '2.3.1', solar: false },
    { id: 'n5', hw: 'HELTEC-V3-M3N4O5', name: 'Node Epsilon — Edge', status: 'online', battery: 91, signal: -68, hops: 2, neighbors: 2, msgs: 9432, firmware: '2.3.1', solar: true },
  ]
  return (
    <div className="dash-page">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">LoRa Mesh Network</h1>
          <p className="dash-page-subtitle">DisasterMesh — Heltec LoRa32 v3 nodes with Meshtastic firmware</p>
        </div>
        <button className="btn btn-primary">+ Add Node</button>
      </div>
      <div className="dash-kpi-grid" style={{ marginTop: '24px' }}>
        <div className="dash-kpi-card"><div className="dash-kpi-value">4/5</div><div className="dash-kpi-label">Nodes Online</div></div>
        <div className="dash-kpi-card"><div className="dash-kpi-value">66,690</div><div className="dash-kpi-label">Messages Relayed</div></div>
        <div className="dash-kpi-card"><div className="dash-kpi-value">3</div><div className="dash-kpi-label">Solar Equipped</div></div>
        <div className="dash-kpi-card"><div className="dash-kpi-value">2-15km</div><div className="dash-kpi-label">Coverage Range</div></div>
      </div>
      <div className="dash-card" style={{ marginTop: '24px' }}>
        <div className="dash-card-header"><h2 className="dash-card-title">Node Status</h2></div>
        <div className="dash-table-wrapper">
          <table className="dash-table">
            <thead><tr><th>Node</th><th>Hardware</th><th>Status</th><th>Battery</th><th>Signal</th><th>Hops</th><th>Messages</th><th>Firmware</th></tr></thead>
            <tbody>
              {nodes.map(n => (
                <tr key={n.id}>
                  <td><strong>{n.name}</strong></td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{n.hw}</td>
                  <td><span style={{ color: n.status === 'online' ? '#10B981' : '#EF4444', fontWeight: 600 }}>{n.status === 'online' ? '🟢' : '🔴'} {n.status}</span></td>
                  <td>
                    <div className="dash-delivery-bar-wrap">
                      <div className="dash-delivery-bar-bg" style={{ width: '60px' }}><div className="dash-delivery-bar-fill" style={{ width: `${n.battery}%`, background: n.battery > 50 ? '#10B981' : n.battery > 20 ? '#F59E0B' : '#EF4444' }} /></div>
                      <span>{n.battery}% {n.solar ? '☀️' : ''}</span>
                    </div>
                  </td>
                  <td>{n.signal} dBm</td>
                  <td>{n.hops}</td>
                  <td>{n.msgs.toLocaleString()}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{n.firmware}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
