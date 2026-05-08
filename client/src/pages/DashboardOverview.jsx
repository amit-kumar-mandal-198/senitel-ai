import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import TiltCard from '../components/TiltCard'
import CCTVModal from '../components/CCTVModal'
import MeshVisualizer from '../components/MeshVisualizer'
import API_BASE_URL from '../api.config'

const sevColors = { critical: '#DC2626', high: '#F59E0B', medium: '#3B82F6', low: '#10B981' }
const statusColors = { resolved: '#10B981', active: '#DC2626', investigating: '#F59E0B' }

export default function DashboardOverview() {
  const [time, setTime] = useState(new Date())
  const [data, setData] = useState(null)
  const [evacProgress, setEvacProgress] = useState(0)
  const [cctvRoom, setCctvRoom] = useState(null)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [responderMode, setResponderMode] = useState(false)
  
  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Network status listener
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    }
  }, [])

  // Simulating evacuation progress logic during active crisis
  useEffect(() => {
    let interval;
    if (data?.activeCrisis && evacProgress < 100) {
      interval = setInterval(() => {
        setEvacProgress(prev => {
          const jump = Math.random() * 8 + 2;
          return prev + jump >= 100 ? 100 : prev + jump;
        })
      }, 1500)
    } else if (!data?.activeCrisis && evacProgress !== 0) {
      setEvacProgress(0)
    }
    return () => clearInterval(interval)
  }, [data?.activeCrisis, evacProgress])

  // Mock fallback data for demo mode
  const mockData = {
    hotel: {
      id: '1',
      name: 'Grand Hotel',
      floors: [
        {
          id: 'f1', level: 1,
          rooms: [
            { id: 'r1', number: '101', status: 'occupied', guests: [{id: 'g1', name: 'Guest'}] },
            { id: 'r2', number: '102', status: 'vacant', guests: [] },
            { id: 'r3', number: '103', status: 'occupied', guests: [{id: 'g2', name: 'Guest'}] },
            { id: 'r4', number: '104', status: 'vacant', guests: [] },
            { id: 'r5', number: '105', status: 'occupied', guests: [{id: 'g3', name: 'Guest'}] },
            { id: 'r1_6', number: '106', status: 'vacant', guests: [] },
            { id: 'r1_7', number: '107', status: 'occupied', guests: [{id: 'g1_7', name: 'Guest'}] },
            { id: 'r1_8', number: '108', status: 'occupied', guests: [{id: 'g1_8', name: 'Guest'}] },
            { id: 'r1_9', number: '109', status: 'vacant', guests: [] },
            { id: 'r1_10', number: '110', status: 'occupied', guests: [{id: 'g1_10', name: 'Guest'}] }
          ]
        },
        {
          id: 'f2', level: 2,
          rooms: [
            { id: 'r6', number: '201', status: 'occupied', guests: [{id: 'g4', name: 'Guest'}] },
            { id: 'r7', number: '202', status: 'vacant', guests: [] },
            { id: 'r8', number: '203', status: 'occupied', guests: [{id: 'g5', name: 'Guest'}] },
            { id: 'r9', number: '204', status: 'vacant', guests: [] },
            { id: 'r10', number: '205', status: 'occupied', guests: [{id: 'g6', name: 'Guest'}] },
            { id: 'r2_6', number: '206', status: 'vacant', guests: [] },
            { id: 'r2_7', number: '207', status: 'occupied', guests: [{id: 'g2_7', name: 'Guest'}] },
            { id: 'r2_8', number: '208', status: 'occupied', guests: [{id: 'g2_8', name: 'Guest'}] },
            { id: 'r2_9', number: '209', status: 'vacant', guests: [] },
            { id: 'r2_10', number: '210', status: 'occupied', guests: [{id: 'g2_10', name: 'Guest'}] }
          ]
        },
        {
          id: 'f3', level: 3,
          rooms: [
            { id: 'r11', number: '301', status: 'occupied', guests: [{id: 'g7', name: 'Guest'}] },
            { id: 'r12', number: '302', status: 'vacant', guests: [] },
            { id: 'r13', number: '303', status: 'occupied', guests: [{id: 'g8', name: 'Guest'}] },
            { id: 'r14', number: '304', status: 'vacant', guests: [] },
            { id: 'r15', number: '305', status: 'occupied', guests: [{id: 'g9', name: 'Guest'}] },
            { id: 'r3_6', number: '306', status: 'vacant', guests: [] },
            { id: 'r3_7', number: '307', status: 'occupied', guests: [{id: 'g3_7', name: 'Guest'}] },
            { id: 'r3_8', number: '308', status: 'occupied', guests: [{id: 'g3_8', name: 'Guest'}] },
            { id: 'r3_9', number: '309', status: 'vacant', guests: [] },
            { id: 'r3_10', number: '310', status: 'occupied', guests: [{id: 'g3_10', name: 'Guest'}] }
          ]
        }
      ]
    },
    activeCrisis: null,
    recentIncidents: []
  }

  // Fetch real data from backend with demo fallback
  useEffect(() => {
    let attempts = 0
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/hotel/overview`)
        if (res.ok) {
          const json = await res.json()
          setData(json)
          return
        }
      } catch (err) {
        console.warn('API unreachable, attempt', ++attempts)
      }
      // After 2 failed attempts (~6s), switch to demo mode
      if (attempts >= 2 && !data) {
        console.warn('Switching to demo mode with mock data')
        setData(mockData)
      }
    }
    
    fetchData()
    // Poll every 3 seconds for updates (e.g. from the crisis trigger)
    const poll = setInterval(fetchData, 3000)
    return () => clearInterval(poll)
  }, [])

  if (!data) {
    return (
      <div className="dash-overview" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '100px', color: 'var(--text-secondary)', textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--sentinel-blue)', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '20px' }} />
        <h2>Connecting to Hotel API...</h2>
        <p>Loading dashboard data. If the backend is unavailable, demo mode will activate shortly.</p>
      </div>
    )
  }

  const { activeCrisis, recentIncidents, hotel } = data
  const totalRooms = hotel.floors.reduce((acc, f) => acc + f.rooms.length, 0)
  
  // Danger logic based on active crisis
  let guestsInDangerCount = 0

  if (responderMode && activeCrisis) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#000', color: '#fff', zIndex: 99999, display: 'flex', flexDirection: 'column', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h1 style={{ color: 'var(--danger-light)', margin: 0, fontSize: '24px' }}>🚨 RESPONDER MODE</h1>
          <button onClick={() => setResponderMode(false)} style={{ background: '#333', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '18px', cursor: 'pointer' }}>Exit</button>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ background: 'var(--danger-light)', color: '#fff', padding: '10px 20px', borderRadius: '50px', fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', animation: 'pulse-glow 1s infinite alternate' }}>
            {activeCrisis.type.toUpperCase()}
          </div>
          
          <div style={{ fontSize: '120px', fontWeight: '900', lineHeight: 1, textShadow: '0 10px 30px rgba(220,38,38,0.5)' }}>
            ROOM {activeCrisis.roomNum}
          </div>
          
          <div style={{ fontSize: '40px', color: '#aaa', marginTop: '10px' }}>
            Floor {activeCrisis.floorNum}
          </div>

          <div style={{ marginTop: '60px', fontSize: '80px', color: 'var(--sentinel-blue-light)' }}>
            ⬆️
          </div>
          <p style={{ fontSize: '24px', color: '#aaa' }}>Proceed up stairwell B</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="dash-overview">
      <div className="dash-page-header" style={{ flexWrap: 'wrap' }}>
        <div>
          <h1 className="dash-page-title">🏨 {hotel.name} Dashboard</h1>
          <p className="dash-page-subtitle">
            {activeCrisis
              ? `🔴 ACTIVE CRISIS — ${activeCrisis.type.toUpperCase()} at Room ${activeCrisis.roomNum}`
              : `🟢 All Clear — ${time.toLocaleTimeString()} — All floors safe`
            }
          </p>
        </div>
        
        {/* ONE PUSH EMERGENCY BUTTON */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={async () => {
              if (window.confirm("CONFIRM ONE-PUSH EMERGENCY ALERT? This will instantly trigger a facility-wide security lockdown.")) {
                
                // Play Audio Warning
                if ('speechSynthesis' in window) {
                  const utterance = new SpeechSynthesisUtterance("Warning. Critical security alert activated on Floor 1. Initiating immediate network lockdown.");
                  utterance.rate = 1.0;
                  utterance.pitch = 0.9;
                  window.speechSynthesis.speak(utterance);
                }

                try {
                  await fetch(`${API_BASE_URL}/api/v1/crisis/trigger`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'security', severity: 'critical', roomNum: '101', floorNum: 1 })
                  });
                } catch(err) { console.error(err); }
              }
            }}
            style={{
              background: 'linear-gradient(to bottom, #ef4444, #991b1b)',
              color: 'white',
              fontSize: '20px',
              fontWeight: '900',
              fontFamily: 'var(--font-ui)',
              padding: '24px 48px',
              borderRadius: '999px',
              border: '4px solid #7f1d1d',
              boxShadow: '0 10px 40px rgba(220, 38, 38, 0.6), inset 0 5px 15px rgba(255, 160, 160, 0.4)',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'all 0.1s ease',
              animation: !activeCrisis ? 'pulse-glow 2s infinite alternate' : 'none'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            🚨 Instantly Trigger Alert
          </button>
          
          <Link to="/dashboard/crisis" className="btn btn-outline" style={{ height: 'fit-content' }}>
            Advanced Setup
          </Link>
          
          {activeCrisis && (
            <button onClick={() => setResponderMode(true)} className="btn btn-outline" style={{ height: 'fit-content', background: 'rgba(255,255,255,0.1)' }}>
              📱 Responder View
            </button>
          )}
        </div>
      </div>

      {/* Evacuation Tracker */}
      {activeCrisis && (
        <div className="dash-card" style={{ marginBottom: '20px', background: 'var(--bg-card)', border: '2px solid var(--danger-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, color: 'var(--danger-light)' }}>🚨 EVACUATION STATUS: IN PROGRESS</h3>
            <span style={{ fontWeight: 'bold', fontSize: '18px', color: evacProgress === 100 ? 'var(--success-light)' : 'var(--text-primary)' }}>
              {Math.floor(evacProgress)}% Secured
            </span>
          </div>
          <div style={{ width: '100%', height: '24px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-primary)' }}>
            <div style={{ 
              height: '100%', 
              width: `${evacProgress}%`, 
              background: evacProgress === 100 ? 'var(--success-light)' : 'linear-gradient(90deg, #ef4444, #f59e0b)',
              transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
            }} />
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="dash-kpi-grid">
        <TiltCard className="dash-kpi-card" style={{ zIndex: 10 }}>
          <div className="dash-kpi-header">
            <span className="dash-kpi-icon" style={{ background: activeCrisis ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: activeCrisis ? '#EF4444' : '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {activeCrisis ? '🔴' : '🟢'}
            </span>
          </div>
          <div className="dash-kpi-value" style={{ color: activeCrisis ? '#EF4444' : '#10B981' }}>
            {activeCrisis ? 'ACTIVE' : 'CLEAR'}
          </div>
          <div className="dash-kpi-label">Crisis Status</div>
        </TiltCard>

        <TiltCard className="dash-kpi-card" style={{ zIndex: 10 }}>
          <div className="dash-kpi-header">
            <span className="dash-kpi-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🏠</span>
          </div>
          <div className="dash-kpi-value">{totalRooms}</div>
          <div className="dash-kpi-label">Total Rooms ({hotel.floors.length} Floors)</div>
        </TiltCard>

        <TiltCard className="dash-kpi-card" style={{ zIndex: 10 }}>
          <div className="dash-kpi-header">
            <span className="dash-kpi-icon" style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</span>
          </div>
          {/* We'll calculate this in the floor loop below */}
          <div className="dash-kpi-value" id="danger-count">-</div>
          <div className="dash-kpi-label">Guests Needing Help</div>
        </TiltCard>

        <TiltCard className="dash-kpi-card" style={{ zIndex: 10 }}>
          <div className="dash-kpi-header">
            <span className="dash-kpi-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📋</span>
          </div>
          <div className="dash-kpi-value">{recentIncidents.length}</div>
          <div className="dash-kpi-label">Past Incidents (30d)</div>
        </TiltCard>
      </div>

      {/* Floor Map */}
      <div className="dash-card" style={{ marginBottom: '20px' }}>
        <div className="dash-card-header">
          <h2 className="dash-card-title">🗺️ Live Floor Map</h2>
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#10B981', border: '1px solid rgba(16,185,129,0.5)' }} /> Safe
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#DC2626', border: '1px solid rgba(220,38,38,0.5)' }} /> Danger
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#F59E0B', border: '1px solid rgba(245,158,11,0.5)' }} /> Help Needed
            </span>
          </div>
        </div>

        {hotel.floors.sort((a,b)=>b.level-a.level).map(floorData => (
          <div key={floorData.id} style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: 'var(--bg-glass)', padding: '2px 10px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>F{floorData.level}</span>
              Floor {floorData.level}
            </div>
            <div className="hotel-floor-grid">
              {floorData.rooms.sort((a,b)=>(a.number||'').localeCompare(b.number||'')).map(room => {
                const isCrisis = activeCrisis?.roomNum === room.number
                // Nearby calculation based on room numbers
                const cNum = parseInt(activeCrisis?.roomNum || '0')
                const rNum = parseInt(room.number)
                const isSameFloor = activeCrisis?.floorNum === floorData.level
                const isInDanger = activeCrisis && isSameFloor && Math.abs(rNum - cNum) <= 3 && rNum !== cNum
                
                if (isInDanger && room.status === 'occupied') {
                  guestsInDangerCount += (room.guests || []).length
                }

                let roomClass = 'hotel-room safe'
                if (isCrisis) roomClass = 'hotel-room danger'
                else if (isInDanger) roomClass = 'hotel-room warning'

                return (
                  <div 
                    className={roomClass} 
                    key={room.id} 
                    title="Click to view live camera feed"
                    onClick={() => setCctvRoom(room.number)}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="hotel-room-number">{room.number}</span>
                    <span className="hotel-room-status">
                      {isCrisis ? '🔥' : isInDanger ? '⚠️' : (room.status==='occupied' ? '👤' : '✓')}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        {/* Hack to update the total guests in danger KPI without a complex state re-render */}
        <script>{`document.getElementById('danger-count') && (document.getElementById('danger-count').innerText = '${guestsInDangerCount}')`}</script>
      </div>

      {/* Recent Incidents */}
      <div className="dash-card">
        <div className="dash-card-header">
          <h2 className="dash-card-title">Recent Incidents</h2>
          <Link to="/dashboard/incidents" className="dash-card-link">View All →</Link>
        </div>
        <div className="dash-alert-list">
          {recentIncidents.map(inc => (
            <div className="dash-alert-item" key={inc.id}>
              <div className="dash-alert-severity" style={{ background: sevColors[inc.severity] || '#3B82F6' }} />
              <div className="dash-alert-info">
                <div className="dash-alert-title">
                  <span className="dash-severity-badge" style={{ color: statusColors[inc.status] || '#10B981', background: `${statusColors[inc.status] || '#10B981'}15` }}>
                    {(inc.status || 'unknown').toUpperCase()}
                  </span>
                  {inc.note || inc.type}
                </div>
                <div className="dash-alert-meta">
                  {inc.roomNum && <><span>Room: {inc.roomNum} (Floor {inc.floorNum})</span><span>•</span></>}
                  <span>{new Date(inc.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mesh Network Status Widget */}
      <MeshVisualizer isOffline={isOffline} />

      {/* CCTV Modal Overlay */}
      <CCTVModal room={cctvRoom} onClose={() => setCctvRoom(null)} />
    </div>
  )
}
