import { useState } from 'react'

const FLOOR_DATA = {
  1: { name: 'Ground Floor — Lobby & Dining', rooms: [
    { id: '101', type: 'standard', status: 'occupied', guest: 'R. Patel' },
    { id: '102', type: 'standard', status: 'occupied', guest: 'S. Gupta' },
    { id: '103', type: 'deluxe', status: 'vacant', guest: null },
    { id: '104', type: 'standard', status: 'occupied', guest: 'A. Kumar' },
    { id: '105', type: 'suite', status: 'occupied', guest: 'M. Sharma' },
    { id: '106', type: 'standard', status: 'maintenance', guest: null },
    { id: '107', type: 'standard', status: 'occupied', guest: 'V. Desai' },
    { id: '108', type: 'deluxe', status: 'occupied', guest: 'K. Nair' },
    { id: '109', type: 'standard', status: 'vacant', guest: null },
    { id: '110', type: 'standard', status: 'occupied', guest: 'P. Singh' },
  ]},
  2: { name: '2nd Floor — Standard Rooms', rooms: [
    { id: '201', type: 'standard', status: 'occupied', guest: 'T. Verma' },
    { id: '202', type: 'standard', status: 'occupied', guest: 'N. Joshi' },
    { id: '203', type: 'deluxe', status: 'occupied', guest: 'D. Rao' },
    { id: '204', type: 'standard', status: 'vacant', guest: null },
    { id: '205', type: 'standard', status: 'occupied', guest: 'H. Mehta' },
    { id: '206', type: 'standard', status: 'occupied', guest: 'R. Iyer' },
    { id: '207', type: 'suite', status: 'occupied', guest: 'L. Chopra' },
    { id: '208', type: 'standard', status: 'vacant', guest: null },
    { id: '209', type: 'standard', status: 'occupied', guest: 'G. Bhat' },
    { id: '210', type: 'deluxe', status: 'occupied', guest: 'Y. Reddy' },
  ]},
  3: { name: '3rd Floor — Premium Rooms', rooms: [
    { id: '301', type: 'deluxe', status: 'occupied', guest: 'M. Ali' },
    { id: '302', type: 'standard', status: 'occupied', guest: 'F. Khan' },
    { id: '303', type: 'standard', status: 'occupied', guest: 'A. Das' },
    { id: '304', type: 'suite', status: 'occupied', guest: 'B. Thakur' },
    { id: '305', type: 'deluxe', status: 'occupied', guest: 'C. Menon' },
    { id: '306', type: 'standard', status: 'vacant', guest: null },
    { id: '307', type: 'standard', status: 'occupied', guest: 'E. Pillai' },
    { id: '308', type: 'suite', status: 'occupied', guest: 'J. Saxena' },
    { id: '309', type: 'standard', status: 'maintenance', guest: null },
    { id: '310', type: 'deluxe', status: 'occupied', guest: 'W. Roy' },
  ]},
}

const statusColors = { occupied: '#3B82F6', vacant: '#10B981', maintenance: '#F59E0B' }
const typeIcons = { standard: '🛏️', deluxe: '⭐', suite: '👑' }

export default function FloorMaps() {
  const [activeFloor, setActiveFloor] = useState(3)
  const floor = FLOOR_DATA[activeFloor]
  const occupied = floor.rooms.filter(r => r.status === 'occupied').length
  const vacant = floor.rooms.filter(r => r.status === 'vacant').length
  const maint = floor.rooms.filter(r => r.status === 'maintenance').length

  return (
    <div className="dash-page">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">🗺️ Floor Maps</h1>
          <p className="dash-page-subtitle">Room status, guest occupancy, and maintenance tracking</p>
        </div>
      </div>

      <div className="dash-kpi-grid" style={{ marginBottom: '20px' }}>
        <div className="dash-kpi-card"><div className="dash-kpi-value" style={{ color: '#3B82F6' }}>{occupied}</div><div className="dash-kpi-label">Occupied</div></div>
        <div className="dash-kpi-card"><div className="dash-kpi-value" style={{ color: '#10B981' }}>{vacant}</div><div className="dash-kpi-label">Vacant</div></div>
        <div className="dash-kpi-card"><div className="dash-kpi-value" style={{ color: '#F59E0B' }}>{maint}</div><div className="dash-kpi-label">Maintenance</div></div>
        <div className="dash-kpi-card"><div className="dash-kpi-value">{floor.rooms.length}</div><div className="dash-kpi-label">Total Rooms</div></div>
      </div>

      <div className="dash-card">
        <div className="dash-card-header">
          <h2 className="dash-card-title">{floor.name}</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[1, 2, 3].map(f => (
              <button key={f} onClick={() => setActiveFloor(f)}
                style={{ padding: '6px 16px', borderRadius: 'var(--radius-md)', border: `1px solid ${activeFloor === f ? 'var(--sentinel-blue-light)' : 'var(--border-primary)'}`, background: activeFloor === f ? 'rgba(59,130,246,0.1)' : 'transparent', color: activeFloor === f ? 'var(--text-accent)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'var(--font-ui)' }}>
                Floor {f}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
          {floor.rooms.map(room => (
            <div key={room.id} style={{
              padding: '16px',
              borderRadius: 'var(--radius-lg)',
              background: `${statusColors[room.status]}08`,
              border: `1px solid ${statusColors[room.status]}30`,
              textAlign: 'center',
              transition: 'all 0.2s',
            }}>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{typeIcons[room.type]} {room.type}</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', margin: '4px 0' }}>{room.id}</div>
              <div style={{ fontSize: '12px', color: statusColors[room.status], fontWeight: '600', marginBottom: '4px' }}>
                {room.status.toUpperCase()}
              </div>
              {room.guest && <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>👤 {room.guest}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
