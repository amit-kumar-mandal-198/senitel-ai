import React, { createContext, useContext, useState } from 'react';

const EvacuationContext = createContext();

export function EvacuationProvider({ children }) {
  const [hazardZones, setHazardZones] = useState([]);
  
  return (
    <EvacuationContext.Provider value={{ hazardZones, setHazardZones }}>
      {children}
    </EvacuationContext.Provider>
  );
}

export function useEvacuation() {
  return useContext(EvacuationContext);
}
