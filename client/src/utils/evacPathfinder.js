/**
 * Uses Breadth-First Search (BFS) to find the shortest safe path from the guest's 
 * current node to the nearest unblocked exit.
 * 
 * Algorithm:
 * 1. Identify all "danger nodes": nodes directly in hazardZones + any nodes 1 hop away.
 * 2. Identify all "blocked exits": exits with blocked: true in floor nodes.
 * 3. Initialize a BFS queue with the starting node and track visited nodes.
 * 4. While queue is not empty, dequeue a node. If it's an unblocked exit, return the path.
 * 5. Otherwise, queue all its neighbors that are NOT in the danger nodes list (and not visited).
 * 6. Returns empty array if no path is found (e.g., all exits blocked or unreachable).
 * 
 * @param {string} startNodeId - ID of the node where the guest is located
 * @param {Array} hazardZones - Array of objects like { nodeId: 'r302', severity: 'fire' }
 * @param {Array} nodes - Floor plan nodes array
 * @param {Object} edges - Adjacency list mapping node IDs to arrays of neighbor IDs
 * @returns {string[]} Array of node IDs representing the safe path, or empty array if trapped
 */
export function calculateEvacuationPath(startNodeId, hazardZones, nodes, edges) {
  if (!startNodeId || !nodes || !edges) return [];

  // 1. Identify danger nodes (direct hazards + 1 hop neighbors)
  const dangerNodes = new Set();
  hazardZones.forEach(hazard => {
    dangerNodes.add(hazard.nodeId);
    // Add 1-hop neighbors to danger zones
    if (edges[hazard.nodeId]) {
      edges[hazard.nodeId].forEach(neighbor => dangerNodes.add(neighbor));
    }
  });

  // 2. Identify exits and check if they are explicitly marked as blocked in the floor plan
  const exitNodes = new Set();
  const explicitlyBlockedExits = new Set();
  
  nodes.forEach(n => {
    if (n.type === 'exit' || n.type === 'stairwell') {
      exitNodes.add(n.id);
      if (n.blocked) {
        explicitlyBlockedExits.add(n.id);
      }
    }
  });

  // 3. BFS Setup
  const queue = [[startNodeId]]; // Queue of paths
  const visited = new Set([startNodeId]);

  while (queue.length > 0) {
    const currentPath = queue.shift();
    const currentNode = currentPath[currentPath.length - 1];

    // Check if we reached a valid exit
    if (exitNodes.has(currentNode)) {
      // If the exit is not explicitly blocked, and not in a danger zone (unless it's literally the only way and not fully engulfed, but rule says 1-hop is impassable)
      // Actually, if it's an exit, it shouldn't be explicitly blocked.
      if (!explicitlyBlockedExits.has(currentNode)) {
        return currentPath;
      }
    }

    // Traverse neighbors
    const neighbors = edges[currentNode] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        // Is the neighbor impassable?
        // A neighbor is impassable if it's a danger node OR an explicitly blocked exit
        const isImpassable = dangerNodes.has(neighbor) || explicitlyBlockedExits.has(neighbor);
        
        if (!isImpassable) {
          visited.add(neighbor);
          queue.push([...currentPath, neighbor]);
        }
      }
    }
  }

  // No safe path found
  return [];
}
