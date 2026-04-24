import React, { useEffect, useState } from 'react';

export default function CCTVModal({ room, onClose }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!room) return null;

  return (
    <>
      <div 
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, backdropFilter: 'blur(4px)' }} 
      />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '80vw', height: '60vh', maxWidth: '1000px',
        backgroundColor: '#000', border: '2px solid #333',
        boxShadow: '0 0 50px rgba(0,0,0,0.8), 0 0 20px rgba(220,38,38,0.3)',
        zIndex: 10000, display: 'flex', flexDirection: 'column', overflow: 'hidden',
        fontFamily: 'monospace'
      }}>
        {/* Header */}
        <div style={{ padding: '8px 16px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', color: '#fff', background: '#111' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <span style={{ color: '#ef4444', animation: 'pulse-glow 1.5s infinite alternate' }}>● REC</span>
            <span>CAM_0{room.split('')[0]}_RM{room}</span>
            <span>1080p 60FPS</span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>×</button>
        </div>

        {/* Video feed container */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#1a1a1a' }}>
          {/* Static noise overlay pattern */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: 'repeating-radial-gradient(#000 0 0.0001%, #ffffff11 0 0.0002%)',
            backgroundSize: '100% 100%',
            opacity: 0.15, mixBlendMode: 'overlay'
          }} />
          
          {/* Scanline animation */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
            backgroundSize: '100% 2px, 3px 100%',
            opacity: 0.8
          }} />

          {/* AI Bounding Boxes */}
          <div style={{
            position: 'absolute', top: '30%', left: '40%', width: '120px', height: '240px',
            border: '2px solid #10b981', backgroundColor: 'rgba(16,185,129,0.1)',
            boxShadow: '0 0 10px rgba(16,185,129,0.5)',
            display: 'flex', alignItems: 'flex-start'
          }}>
            <span style={{ background: '#10b981', color: '#fff', fontSize: '10px', padding: '2px 4px' }}>PERSON 98%</span>
          </div>
          <div style={{ position: 'absolute', top: '31%', left: '41%', width: '60px', height: '10px', border: '1px solid #10b981', borderTop: 'none', borderLeft: 'none' }} />

          {/* Timestamp Footer */}
          <div style={{ position: 'absolute', bottom: '20px', left: '20px', color: '#fff', fontSize: '24px', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
            {time.toISOString().replace('T', ' ').substring(0, 19)}
          </div>
          
          {/* Central message */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'rgba(255,255,255,0.2)', fontSize: '24px', textAlign: 'center' }}>
            NO MOTION DETECTED
            <br />
            <span style={{ fontSize: '14px', marginTop: '8px', display: 'block' }}>NIGHT VISION ACTIVE</span>
          </div>
        </div>
      </div>
    </>
  );
}
