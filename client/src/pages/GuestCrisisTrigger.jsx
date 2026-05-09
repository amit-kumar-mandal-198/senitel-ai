import { useState } from 'react'
import { Link } from 'react-router-dom'
import API_BASE_URL from '../api.config'

const CRISIS_TYPES = [
  { id: 'fire', icon: '🔥', label: 'Fire', color: '#DC2626', desc: 'I see fire or smoke in my room or nearby.' },
  { id: 'flood', icon: '🌊', label: 'Water Leak', color: '#3B82F6', desc: 'Water flooding, pipe burst, or leak detected.' },
  { id: 'medical', icon: '🏥', label: 'Medical', color: '#10B981', desc: 'I need urgent medical help immediately.' },
  { id: 'security', icon: '🔒', label: 'Security', color: '#F59E0B', desc: 'Intruder, theft, or I feel unsafe.' },
  { id: 'power', icon: '⚡', label: 'Power Out', color: '#8B5CF6', desc: 'No electricity. I\'m stuck or in the dark.' },
  { id: 'gas', icon: '💨', label: 'Gas / Smell', color: '#EF4444', desc: 'Strange smell or suspected gas leak.' },
]

const FLOORS = {
  1: ['101','102','103','104','105','106','107','108','109','110'],
  2: ['201','202','203','204','205','206','207','208','209','210'],
  3: ['301','302','303','304','305','306','307','308','309','310'],
}

export default function GuestCrisisTrigger() {
  const [crisisType, setCrisisType] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [selectedFloor, setSelectedFloor] = useState(1)
  const [triggering, setTriggering] = useState(false)
  const [triggered, setTriggered] = useState(false)
  const [apiError, setApiError] = useState(null)

  const handleTrigger = async () => {
    if (!crisisType || !selectedRoom) return
    setTriggering(true)
    setApiError(null)

    const selectedCrisis = CRISIS_TYPES.find(c => c.id === crisisType)

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/crisis/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: crisisType,
          severity: selectedCrisis.severity || 'high',
          roomNum: selectedRoom,
          floorNum: selectedFloor
        })
      })

      if (res.ok) {
        setTriggered(true)
        // Play voice confirmation
        if ('speechSynthesis' in window) {
          const msg = new SpeechSynthesisUtterance('Your emergency alert has been sent. Hotel security has been notified. Please stay calm and follow instructions.')
          msg.rate = 0.9
          window.speechSynthesis.speak(msg)
        }
      } else {
        setApiError('Could not send alert. Please call the front desk at extension 0.')
      }
    } catch (err) {
      setApiError('Network error. Please call the front desk at extension 0.')
    } finally {
      setTriggering(false)
    }
  }

  const selectedCrisis = CRISIS_TYPES.find(c => c.id === crisisType)

  // Success confirmation screen
  if (triggered) {
    return (
      <div style={{ padding: '24px', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          maxWidth: '560px',
          width: '100%',
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(220, 38, 38, 0.3)',
          borderRadius: '24px',
          padding: '48px 32px',
          textAlign: 'center',
          boxShadow: '0 0 80px rgba(220, 38, 38, 0.15)',
        }}>
          {/* Pulsing alert icon */}
          <div style={{
            width: '80px', height: '80px',
            margin: '0 auto 24px',
            borderRadius: '50%',
            background: 'rgba(220, 38, 38, 0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '40px',
            animation: 'pulse-glow 2s infinite alternate',
          }}>🚨</div>

          <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: '800', margin: '0 0 8px' }}>
            Help Is On The Way
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', margin: '0 0 32px', lineHeight: '1.6' }}>
            Your <strong style={{ color: selectedCrisis?.color }}>{selectedCrisis?.icon} {selectedCrisis?.label}</strong> alert 
            for Room <strong style={{ color: '#fff' }}>{selectedRoom}</strong> has been received by hotel management.
          </p>

          {/* Status indicators */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px',
            marginBottom: '32px',
          }}>
            {[
              { icon: '✅', text: 'Security Notified' },
              { icon: '✅', text: 'Staff Dispatched' },
              { icon: '✅', text: 'Location Shared' },
              { icon: '✅', text: 'AI Chat Active' },
            ].map((item, i) => (
              <div key={i} style={{
                padding: '12px',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '12px',
                fontSize: '13px',
                color: '#10B981',
                fontWeight: '600',
              }}>
                {item.icon} {item.text}
              </div>
            ))}
          </div>

          {/* Safety instructions */}
          <div style={{
            padding: '20px',
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '16px',
            textAlign: 'left',
            marginBottom: '32px',
          }}>
            <h4 style={{ color: '#60A5FA', margin: '0 0 12px', fontSize: '14px', fontWeight: '700' }}>
              🛡️ While You Wait:
            </h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: 'rgba(255,255,255,0.7)', fontSize: '13px', lineHeight: '2' }}>
              <li>Stay calm and do not use elevators</li>
              <li>Check your room door — if it's hot, do NOT open it</li>
              <li>Use the AI Chat below for real-time guidance</li>
              <li>Call the front desk: <strong style={{ color: '#fff' }}>Dial 0</strong></li>
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/guest" style={{
              padding: '14px 28px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '12px',
              color: '#fff',
              fontWeight: '700',
              fontSize: '14px',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}>
              ← Back to Safety Hub
            </Link>
            <Link to="/guest" style={{
              padding: '14px 28px',
              background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontWeight: '700',
              fontSize: '14px',
              textDecoration: 'none',
              boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.2s',
            }}>
              🤖 Open AI Chat
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px 0' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <Link to="/guest" style={{
          color: 'rgba(255,255,255,0.4)',
          textDecoration: 'none',
          fontSize: '13px',
          fontWeight: '500',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '12px',
          transition: 'color 0.2s',
        }}>
          ← Back to Guest Hub
        </Link>
        <h1 style={{
          color: '#fff',
          fontSize: '28px',
          fontWeight: '800',
          margin: '0 0 8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{
            width: '42px', height: '42px',
            borderRadius: '12px',
            background: 'rgba(220, 38, 38, 0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px',
          }}>🚨</span>
          Report an Emergency
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.5)',
          fontSize: '15px',
          margin: 0,
        }}>
          Select what's happening and your location. Hotel staff will be dispatched immediately.
        </p>
      </div>

      {/* API Error Banner */}
      {apiError && (
        <div style={{
          padding: '16px 20px',
          background: 'rgba(220, 38, 38, 0.1)',
          border: '1px solid rgba(220, 38, 38, 0.3)',
          borderRadius: '16px',
          color: '#FCA5A5',
          fontWeight: '600',
          fontSize: '14px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <span style={{ fontSize: '20px' }}>⚠️</span>
          {apiError}
        </div>
      )}

      {/* Step 1: What's Happening */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '20px',
        padding: '28px',
        marginBottom: '20px',
      }}>
        <h2 style={{
          color: '#fff',
          fontSize: '16px',
          fontWeight: '700',
          margin: '0 0 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <span style={{
            width: '28px', height: '28px',
            borderRadius: '8px',
            background: 'rgba(59, 130, 246, 0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px',
            fontWeight: '800',
            color: '#60A5FA',
          }}>1</span>
          What's happening?
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))',
          gap: '12px',
        }}>
          {CRISIS_TYPES.map(c => (
            <button
              key={c.id}
              onClick={() => setCrisisType(c.id)}
              style={{
                padding: '20px 14px',
                background: crisisType === c.id
                  ? `${c.color}18`
                  : 'rgba(255, 255, 255, 0.03)',
                border: `2px solid ${crisisType === c.id ? c.color : 'rgba(255, 255, 255, 0.08)'}`,
                borderRadius: '16px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: crisisType === c.id ? 'scale(1.03)' : 'scale(1)',
                boxShadow: crisisType === c.id ? `0 4px 24px ${c.color}25` : 'none',
              }}
            >
              <div style={{ fontSize: '34px', marginBottom: '10px' }}>{c.icon}</div>
              <div style={{
                fontSize: '14px',
                fontWeight: '700',
                color: crisisType === c.id ? c.color : '#fff',
                marginBottom: '6px',
              }}>{c.label}</div>
              <div style={{
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.4)',
                lineHeight: '1.4',
              }}>{c.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Where are you */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '20px',
        padding: '28px',
        marginBottom: '20px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <h2 style={{
            color: '#fff',
            fontSize: '16px',
            fontWeight: '700',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span style={{
              width: '28px', height: '28px',
              borderRadius: '8px',
              background: 'rgba(59, 130, 246, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '800',
              color: '#60A5FA',
            }}>2</span>
            Where are you?
          </h2>

          {/* Floor selector */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {[1, 2, 3].map(f => (
              <button
                key={f}
                onClick={() => { setSelectedFloor(f); setSelectedRoom(null) }}
                style={{
                  padding: '8px 18px',
                  borderRadius: '10px',
                  border: `1px solid ${selectedFloor === f ? '#60A5FA' : 'rgba(255, 255, 255, 0.1)'}`,
                  background: selectedFloor === f ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  color: selectedFloor === f ? '#60A5FA' : 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '700',
                  transition: 'all 0.2s',
                }}
              >
                Floor {f}
              </button>
            ))}
          </div>
        </div>

        {/* Room grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
          gap: '10px',
        }}>
          {FLOORS[selectedFloor].map(room => {
            const isSelected = selectedRoom === room
            return (
              <button
                key={room}
                onClick={() => setSelectedRoom(room)}
                style={{
                  padding: '16px 8px',
                  borderRadius: '12px',
                  border: `2px solid ${isSelected ? '#60A5FA' : 'rgba(255, 255, 255, 0.08)'}`,
                  background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                  boxShadow: isSelected ? '0 4px 20px rgba(59, 130, 246, 0.2)' : 'none',
                }}
              >
                <div style={{
                  fontSize: '16px',
                  fontWeight: '800',
                  color: isSelected ? '#60A5FA' : '#fff',
                }}>{room}</div>
                <div style={{
                  fontSize: '16px',
                  marginTop: '4px',
                }}>{isSelected ? '📍' : '—'}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Step 3: Confirm & Trigger */}
      {crisisType && selectedRoom && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(16px)',
          border: `2px solid ${selectedCrisis?.color}40`,
          borderRadius: '20px',
          padding: '28px',
          marginBottom: '20px',
          animation: 'fadeInUp 0.3s ease-out',
        }}>
          <h2 style={{
            color: '#fff',
            fontSize: '16px',
            fontWeight: '700',
            margin: '0 0 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span style={{
              width: '28px', height: '28px',
              borderRadius: '8px',
              background: 'rgba(220, 38, 38, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '800',
              color: '#FCA5A5',
            }}>3</span>
            Confirm & Send Alert
          </h2>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
          }}>
            {/* Summary */}
            <div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>
                Sending alert for:
              </div>
              <div style={{
                fontSize: '22px',
                fontWeight: '800',
                color: selectedCrisis?.color,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                {selectedCrisis?.icon} {selectedCrisis?.label} — Room {selectedRoom}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>
                Floor {selectedFloor} • Hotel staff will be dispatched immediately
              </div>
            </div>

            {/* Big trigger button */}
            <button
              onClick={handleTrigger}
              disabled={triggering}
              style={{
                padding: '18px 40px',
                background: triggering
                  ? 'rgba(100, 100, 100, 0.3)'
                  : `linear-gradient(135deg, ${selectedCrisis?.color}, ${selectedCrisis?.color}CC)`,
                color: '#fff',
                border: 'none',
                borderRadius: '16px',
                fontSize: '16px',
                fontWeight: '800',
                cursor: triggering ? 'wait' : 'pointer',
                letterSpacing: '0.5px',
                boxShadow: triggering ? 'none' : `0 8px 32px ${selectedCrisis?.color}40`,
                transition: 'all 0.3s',
                transform: triggering ? 'scale(0.98)' : 'scale(1)',
                opacity: triggering ? 0.7 : 1,
              }}
            >
              {triggering ? '⏳ Sending Alert...' : '🚨 SEND EMERGENCY ALERT'}
            </button>
          </div>
        </div>
      )}

      {/* Emergency contacts footer */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        marginTop: '8px',
      }}>
        {[
          { icon: '📞', label: 'Front Desk', value: 'Dial 0' },
          { icon: '🚒', label: 'Fire Dept.', value: '101' },
          { icon: '🚑', label: 'Ambulance', value: '102' },
          { icon: '🚔', label: 'Police', value: '100' },
        ].map((contact, i) => (
          <div key={i} style={{
            flex: '1 1 120px',
            padding: '14px 16px',
            background: 'rgba(15, 23, 42, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '14px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '20px', marginBottom: '6px' }}>{contact.icon}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>{contact.label}</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>{contact.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
