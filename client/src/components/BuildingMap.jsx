import React from 'react';

export default function BuildingMap({ activeCrisis }) {
  const isCrisisActive = !!activeCrisis;
  const crisisRoom = activeCrisis?.roomNum ? parseInt(activeCrisis.roomNum) : null;
  const crisisFloor = activeCrisis?.floorNum || (crisisRoom ? Math.floor(crisisRoom / 100) : null);
  
  // Hotel Layout Constants
  const FLOORS = [3, 2, 1];
  const ROOMS_PER_FLOOR = 10;
  
  // Determine safe stairwell
  let safeStairwell = null;
  let dangerStairwell = null;
  
  if (isCrisisActive && crisisRoom) {
    const roomSuffix = crisisRoom % 100;
    if (roomSuffix >= 6) {
      safeStairwell = 'south'; // South is rooms 01-03
      dangerStairwell = 'north';
    } else {
      safeStairwell = 'north'; // North is rooms 08-10
      dangerStairwell = 'south';
    }
  }

  const renderRoom = (floorNum, suffix) => {
    const roomNum = floorNum * 100 + suffix;
    const isCrisisRoom = isCrisisActive && roomNum === crisisRoom;
    
    // Determine path styling
    let isPath = false;
    let pathDirection = ''; // right or left
    
    if (isCrisisActive && crisisFloor === floorNum && roomNum !== crisisRoom) {
       // if we are between the crisis room and the safe stairwell
       const crisisSuffix = crisisRoom % 100;
       if (safeStairwell === 'north' && suffix > crisisSuffix) {
           isPath = true;
           pathDirection = 'right'; // towards north (8-10)
       } else if (safeStairwell === 'south' && suffix < crisisSuffix) {
           isPath = true;
           pathDirection = 'left'; // towards south (1-3)
       }
    }

    const baseStyle = {
      flex: 1,
      height: '40px',
      border: '1px solid var(--border-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '11px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      position: 'relative',
      background: 'var(--bg-glass)',
      color: 'var(--text-secondary)'
    };

    if (isCrisisRoom) {
      baseStyle.background = 'rgba(239, 68, 68, 0.2)';
      baseStyle.border = '1px solid #EF4444';
      baseStyle.color = '#EF4444';
      baseStyle.boxShadow = '0 0 15px rgba(239, 68, 68, 0.5)';
      baseStyle.zIndex = 10;
    } else if (isPath) {
      baseStyle.background = 'rgba(16, 185, 129, 0.15)';
      baseStyle.borderTop = '2px dashed #10B981';
      baseStyle.borderBottom = '2px dashed #10B981';
      baseStyle.color = '#10B981';
    }

    return (
      <div key={roomNum} style={baseStyle}>
        {roomNum}
        {isCrisisRoom && <span style={{position:'absolute', top: -15, fontSize: '16px'}}>🚨</span>}
        {isPath && (
           <span style={{position:'absolute', top:'50%', transform:'translateY(-50%)', opacity: 0.6, fontSize: '14px', right: pathDirection==='right'? -10 : 'auto', left: pathDirection==='left'? -10 : 'auto'}}>
             {pathDirection === 'right' ? '→' : '←'}
           </span>
        )}
      </div>
    );
  };

  const renderStairwell = (type, floorNum) => {
    const isSafe = safeStairwell === type;
    const isDanger = dangerStairwell === type;
    
    let bg = 'var(--bg-glass)';
    let color = 'var(--text-secondary)';
    let border = '1px solid var(--border-primary)';
    
    if (isCrisisActive) {
      if (isSafe && floorNum <= crisisFloor) {
        bg = 'rgba(16, 185, 129, 0.2)';
        color = '#10B981';
        border = '1px solid #10B981';
      } else if (isDanger && floorNum === crisisFloor) {
        bg = 'rgba(239, 68, 68, 0.1)';
        color = '#EF4444';
        border = '1px dashed #EF4444';
      }
    }

    return (
      <div style={{
        width: '60px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: bg,
        color,
        border,
        borderBottom: 'none',
        fontSize: '10px',
        fontWeight: 'bold',
        textAlign: 'center'
      }}>
        {type==='south' ? 'SOUTH\nSTAIRS' : 'NORTH\nSTAIRS'}
        {isSafe && floorNum <= crisisFloor && <div style={{fontSize:'14px', marginTop:'4px'}}>⬇️</div>}
        {isDanger && floorNum === crisisFloor && <div style={{fontSize:'12px', marginTop:'4px'}}>⚠️</div>}
      </div>
    );
  };

  return (
    <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          🗺️ Tactical Responder View
        </h2>
        {isCrisisActive ? (
          <div style={{ display: 'flex', gap: '12px' }}>
             <span style={{ padding: '6px 12px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', borderRadius: '99px', fontSize: '13px', fontWeight: 'bold' }}>
               🚨 EVACUATION ACTIVE
             </span>
             <span style={{ padding: '6px 12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', borderRadius: '99px', fontSize: '13px', fontWeight: 'bold' }}>
               ✅ SAFE ROUTE: {safeStairwell.toUpperCase()} STAIRWELL
             </span>
          </div>
        ) : (
          <span style={{ padding: '6px 12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', borderRadius: '99px', fontSize: '13px', fontWeight: 'bold' }}>
             🟢 BUILDING SECURE
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {FLOORS.map(floorNum => (
          <div key={floorNum} style={{ display: 'flex', alignItems: 'stretch', gap: '12px' }}>
            <div style={{ width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', borderRight: '2px solid var(--border-primary)' }}>
              FL {floorNum}
            </div>
            
            {/* South Stairwell */}
            {renderStairwell('south', floorNum)}

            <div style={{ flex: 1, display: 'flex', gap: '4px' }}>
              {[1,2,3,4,5,6,7,8,9,10].map(suffix => renderRoom(floorNum, suffix))}
            </div>

            {/* North Stairwell */}
            {renderStairwell('north', floorNum)}
          </div>
        ))}
        {/* Ground Floor Exit Level indicators */}
        <div style={{ display: 'flex', paddingLeft:'52px', marginTop: '4px' }}>
           <div style={{width:'60px', textAlign:'center', color:'#10B981', fontWeight:'bold', fontSize:'12px'}}>
             {safeStairwell === 'south' && 'EXIT'}
           </div>
           <div style={{flex: 1}}></div>
           <div style={{width:'60px', textAlign:'center', color:'#10B981', fontWeight:'bold', fontSize:'12px'}}>
             {safeStairwell === 'north' && 'EXIT'}
           </div>
        </div>
      </div>
    </div>
  );
}
