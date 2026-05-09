export const floorPlanNodes = [
  // Exits / Stairwells
  { id: 'exit_west', x: 5, y: 50, type: 'exit', blocked: false, label: 'West Exit' },
  { id: 'exit_east', x: 95, y: 50, type: 'exit', blocked: false, label: 'East Exit' },
  
  // Corridor
  { id: 'c1', x: 20, y: 50, type: 'corridor' },
  { id: 'c2', x: 40, y: 50, type: 'corridor' },
  { id: 'c3', x: 60, y: 50, type: 'corridor' },
  { id: 'c4', x: 80, y: 50, type: 'corridor' },

  // Rooms (Top)
  { id: 'r301', x: 20, y: 20, type: 'room', label: '301' },
  { id: 'r302', x: 40, y: 20, type: 'room', label: '302' },
  { id: 'r303', x: 60, y: 20, type: 'room', label: '303' },
  { id: 'r304', x: 80, y: 20, type: 'room', label: '304' },

  // Rooms (Bottom)
  { id: 'r305', x: 20, y: 80, type: 'room', label: '305' },
  { id: 'r306', x: 40, y: 80, type: 'room', label: '306' },
  { id: 'r307', x: 60, y: 80, type: 'room', label: '307' },
  { id: 'r308', x: 80, y: 80, type: 'room', label: '308' },
];

export const floorPlanEdges = {
  // Exits connected to nearest corridor
  'exit_west': ['c1'],
  'exit_east': ['c4'],

  // Corridor segments connected to each other and adjacent rooms
  'c1': ['exit_west', 'c2', 'r301', 'r305'],
  'c2': ['c1', 'c3', 'r302', 'r306'],
  'c3': ['c2', 'c4', 'r303', 'r307'],
  'c4': ['c3', 'exit_east', 'r304', 'r308'],

  // Rooms only connect to their adjacent corridor segment
  'r301': ['c1'],
  'r302': ['c2'],
  'r303': ['c3'],
  'r304': ['c4'],
  'r305': ['c1'],
  'r306': ['c2'],
  'r307': ['c3'],
  'r308': ['c4']
};
