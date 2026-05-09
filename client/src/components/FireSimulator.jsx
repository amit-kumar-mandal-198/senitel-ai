import React, { useState } from 'react';
import { useEvacuation } from '../context/EvacuationContext';
import { floorPlanNodes } from '../utils/floorPlanData';

export default function FireSimulator() {
  const { hazardZones, setHazardZones } = useEvacuation();
  const [selectedNode, setSelectedNode] = useState(floorPlanNodes[0].id);

  const triggerFire = () => {
    // Avoid duplicates
    if (!hazardZones.some(h => h.nodeId === selectedNode)) {
      setHazardZones([...hazardZones, { nodeId: selectedNode, severity: 'fire' }]);
    }
  };

  const clearAlerts = () => {
    setHazardZones([]);
  };

  return (
    <div style={{ marginTop: '24px', padding: '16px', background: '#1f2937', borderRadius: '8px', border: '1px solid #374151', color: 'white' }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#f87171' }}>🔧 Admin: Fire Simulator (Hackathon)</h3>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <select 
          value={selectedNode} 
          onChange={(e) => setSelectedNode(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', background: '#374151', color: 'white', border: '1px solid #4b5563' }}
        >
          {floorPlanNodes.map(node => (
            <option key={node.id} value={node.id}>
              {node.label || node.id} ({node.type})
            </option>
          ))}
        </select>
        <button 
          onClick={triggerFire}
          style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Trigger Fire Alert
        </button>
        <button 
          onClick={clearAlerts}
          style={{ padding: '8px 16px', background: '#4b5563', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Clear All Alerts
        </button>
      </div>
      
      {hazardZones.length > 0 && (
        <div style={{ marginTop: '12px', fontSize: '12px', color: '#9ca3af' }}>
          Active Hazards: {hazardZones.map(h => h.nodeId).join(', ')}
        </div>
      )}
    </div>
  );
}
