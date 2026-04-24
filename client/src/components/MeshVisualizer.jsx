import React, { useEffect, useState } from 'react';

export default function MeshVisualizer({ isOffline }) {
  const [nodes, setNodes] = useState([]);

  useEffect(() => {
    // Generate 15 random nodes
    setNodes(Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      active: true,
      connections: []
    })));
  }, []);

  return (
    <div className="dash-card" style={{ marginTop: '20px', position: 'relative', overflow: 'hidden' }}>
      <div className="dash-card-header">
        <h2 className="dash-card-title">📡 Sentinel Mesh Network</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ 
            width: '10px', height: '10px', borderRadius: '50%', 
            background: isOffline ? 'var(--sentinel-blue)' : 'var(--success-light)',
            boxShadow: `0 0 10px ${isOffline ? 'var(--sentinel-blue)' : 'var(--success-light)'}`,
            animation: 'pulse-glow 2s infinite'
          }} />
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
            {isOffline ? 'LORA MESH ACTIVE (OFFLINE)' : 'CLOUD CONNECTED'}
          </span>
        </div>
      </div>
      
      <div style={{ height: '200px', background: 'var(--bg-primary)', borderRadius: '8px', position: 'relative' }}>
        <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={isOffline ? '#3b82f6' : '#10b981'} stopOpacity="0.1" />
              <stop offset="50%" stopColor={isOffline ? '#3b82f6' : '#10b981'} stopOpacity="0.5" />
              <stop offset="100%" stopColor={isOffline ? '#3b82f6' : '#10b981'} stopOpacity="0.1" />
            </linearGradient>
          </defs>
          {nodes.map(node => 
            nodes.map(target => {
              // Draw lines between nearby nodes
              const dist = Math.hypot(node.x - target.x, node.y - target.y);
              if (dist < 40 && dist > 0) {
                return (
                  <line 
                    key={`${node.id}-${target.id}`}
                    x1={`${node.x}%`} y1={`${node.y}%`} 
                    x2={`${target.x}%`} y2={`${target.y}%`}
                    stroke="url(#lineGrad)" 
                    strokeWidth="1.5"
                    style={{
                      strokeDasharray: isOffline ? '5,5' : 'none',
                      animation: isOffline ? 'dash 20s linear infinite' : 'none'
                    }}
                  />
                )
              }
              return null;
            }
          ))}
          {nodes.map(node => (
            <circle 
              key={`node-${node.id}`}
              cx={`${node.x}%`} cy={`${node.y}%`} 
              r="4" 
              fill={isOffline ? '#3b82f6' : '#10b981'} 
              style={{ filter: `drop-shadow(0 0 4px ${isOffline ? '#3b82f6' : '#10b981'})` }}
            />
          ))}
        </svg>

        {isOffline && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: 'rgba(15, 23, 42, 0.8)', padding: '12px 24px', borderRadius: '24px',
            border: '1px solid var(--sentinel-blue)', color: 'var(--sentinel-blue-light)',
            fontWeight: 'bold', fontSize: '14px', backdropFilter: 'blur(4px)'
          }}>
            SYSTEM RUNNING ON LOCAL MESH
          </div>
        )}
      </div>
    </div>
  );
}
