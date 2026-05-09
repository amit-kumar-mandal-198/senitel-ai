import React, { useMemo } from 'react';
import { useEvacuation } from '../context/EvacuationContext';
import { floorPlanNodes, floorPlanEdges } from '../utils/floorPlanData';
import { calculateEvacuationPath } from '../utils/evacPathfinder';

export default function EvacuationMap({ guestRoomId = 'r302', floorId = '3' }) {
  const { hazardZones } = useEvacuation();

  const path = useMemo(() => {
    return calculateEvacuationPath(guestRoomId, hazardZones, floorPlanNodes, floorPlanEdges);
  }, [guestRoomId, hazardZones]);

  // Determine path polyline points
  const pathPoints = path.map(nodeId => {
    const n = floorPlanNodes.find(n => n.id === nodeId);
    return `${n?.x},${n?.y}`;
  }).join(' ');

  // Summary bar logic
  let summary = '';
  if (path.length > 0) {
    const startNode = floorPlanNodes.find(n => n.id === guestRoomId);
    const endNode = floorPlanNodes.find(n => n.id === path[path.length - 1]);
    const direction = endNode.x > startNode.x ? 'East' : 'West';
    const time = path.length; // roughly 1 sec per node
    summary = `Head ${direction} → ${endNode.label} · Est. ${time} sec`;
  } else {
    summary = "🚨 ALL ROUTES BLOCKED - Contact staff immediately 🚨";
  }

  // Helper to check if a node is in a hazard zone
  const isHazard = (nodeId) => hazardZones.some(h => h.nodeId === nodeId);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif', background: '#111827', color: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
      <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 'bold' }}>Floor {floorId} Evacuation Map</h2>
      
      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', fontSize: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '50%' }}></div>
          <span>You</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', background: '#22c55e', borderRadius: '2px' }}></div>
          <span>Safe Exit</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '2px' }}></div>
          <span>Danger Zone</span>
        </div>
      </div>

      {/* SVG Map Container */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '2/1', background: '#1f2937', borderRadius: '8px', overflow: 'hidden' }}>
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', preserveAspectRatio: 'xMidYMid meet' }}>
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e" />
            </marker>
            <style>
              {`
                @keyframes pulse {
                  0% { opacity: 0.5; transform: scale(1); }
                  50% { opacity: 1; transform: scale(1.1); }
                  100% { opacity: 0.5; transform: scale(1); }
                }
                .hazard-anim {
                  transform-origin: center;
                  animation: pulse 1.5s infinite;
                }
              `}
            </style>
          </defs>

          {/* Render base paths (Corridors) */}
          {floorPlanNodes.filter(n => n.type === 'corridor').map((node, i) => (
            <circle key={`corridor-${i}`} cx={node.x} cy={node.y} r="3" fill="#4b5563" />
          ))}

          {/* Render edges as faint lines to show connectivity */}
          {Object.entries(floorPlanEdges).map(([nodeId, neighbors]) => {
            const start = floorPlanNodes.find(n => n.id === nodeId);
            if (!start) return null;
            return neighbors.map(neighborId => {
              const end = floorPlanNodes.find(n => n.id === neighborId);
              if (!end) return null;
              return (
                <line 
                  key={`edge-${nodeId}-${neighborId}`} 
                  x1={start.x} y1={start.y} x2={end.x} y2={end.y} 
                  stroke="#374151" strokeWidth="0.5" 
                />
              );
            });
          })}

          {/* Render Rooms */}
          {floorPlanNodes.filter(n => n.type === 'room').map((node) => (
            <g key={node.id}>
              <rect 
                x={node.x - 6} y={node.y - 6} width="12" height="12" 
                fill="#6b7280" rx="1" 
              />
              <text x={node.x} y={node.y + 1} fontSize="4" fill="#111827" textAnchor="middle" dominantBaseline="middle" fontWeight="bold">
                {node.label}
              </text>
            </g>
          ))}

          {/* Render Exits */}
          {floorPlanNodes.filter(n => n.type === 'exit').map((node) => {
            const hazard = isHazard(node.id) || node.blocked;
            return (
              <g key={node.id}>
                <rect 
                  x={node.x - 8} y={node.y - 8} width="16" height="16" 
                  fill={hazard ? '#ef4444' : '#22c55e'} rx="2" 
                />
                <text x={node.x} y={node.y + 1} fontSize="3" fill="white" textAnchor="middle" dominantBaseline="middle" fontWeight="bold">
                  {hazard ? 'BLOCKED' : 'EXIT ✓'}
                </text>
              </g>
            );
          })}

          {/* Render Safe Path */}
          {path.length > 0 && (
            <polyline 
              points={pathPoints} 
              fill="none" 
              stroke="#22c55e" 
              strokeWidth="1.5" 
              strokeDasharray="2 1" 
              markerMid="url(#arrow)"
              markerEnd="url(#arrow)" 
            />
          )}

          {/* Render Hazard Zones */}
          {hazardZones.map((hazard, i) => {
            const node = floorPlanNodes.find(n => n.id === hazard.nodeId);
            if (!node) return null;
            return (
              <g key={`hazard-${i}`} className="hazard-anim" style={{ transformOrigin: `${node.x}px ${node.y}px` }}>
                <circle cx={node.x} cy={node.y} r="8" fill="rgba(239, 68, 68, 0.4)" />
                <circle cx={node.x} cy={node.y} r="5" fill="#ef4444" />
                <text x={node.x} y={node.y + 1.5} fontSize="5" textAnchor="middle" dominantBaseline="middle">🔥</text>
              </g>
            );
          })}

          {/* Render Guest Location */}
          {(() => {
            const guestNode = floorPlanNodes.find(n => n.id === guestRoomId);
            if (!guestNode) return null;
            return (
              <g>
                <circle cx={guestNode.x} cy={guestNode.y} r="4" fill="#3b82f6" stroke="#fff" strokeWidth="0.5" />
                <text x={guestNode.x} y={guestNode.y - 6} fontSize="3" fill="#3b82f6" textAnchor="middle" fontWeight="bold">You</text>
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Footer Bar */}
      <div style={{ marginTop: '20px', padding: '16px', background: path.length > 0 ? '#065f46' : '#7f1d1d', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold', fontSize: '18px', letterSpacing: '0.5px' }}>
        {summary}
      </div>
    </div>
  );
}
