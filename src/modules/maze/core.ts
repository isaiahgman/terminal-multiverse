export function generateMaze(width: number, height: number): number[][] {
  // Ensure odd dimensions for cell-and-wall alignment
  const w = width % 2 === 0 ? width - 1 : width;
  const h = height % 2 === 0 ? height - 1 : height;

  // 1 = Wall, 0 = Path
  const grid: number[][] = Array.from({ length: h }, () => Array(w).fill(1));

  const stack: [number, number][] = [];
  const startX = 1;
  const startY = 1;
  grid[startY][startX] = 0;
  stack.push([startX, startY]);

  while (stack.length > 0) {
    const [cx, cy] = stack[stack.length - 1];

    // Find unvisited neighbors (2 steps away)
    const neighbors: [number, number, number, number][] = []; // [nx, ny, wallX, wallY]

    const directions = [
      [0, -2], // Up
      [2, 0],  // Right
      [0, 2],  // Down
      [-2, 0], // Left
    ];

    for (const [dx, dy] of directions) {
      const nx = cx + dx;
      const ny = cy + dy;

      if (nx > 0 && nx < w - 1 && ny > 0 && ny < h - 1) {
        if (grid[ny][nx] === 1) {
          neighbors.push([nx, ny, cx + dx / 2, cy + dy / 2]);
        }
      }
    }

    if (neighbors.length > 0) {
      // Pick random neighbor
      const [nx, ny, wx, wy] = neighbors[Math.floor(Math.random() * neighbors.length)];
      // Knock down walls
      grid[ny][nx] = 0;
      grid[wy][wx] = 0;
      stack.push([nx, ny]);
    } else {
      stack.pop();
    }
  }

  return grid;
}

export interface SolveResult {
  path: [number, number][];
  visited: [number, number][];
}

export function solveMazeBFS(
  maze: number[][],
  start: [number, number],
  end: [number, number]
): SolveResult {
  const height = maze.length;
  const width = maze[0].length;

  const queue: [number, number][] = [start];
  const visitedOrder: [number, number][] = [];
  
  // Track parents to reconstruct path
  const parentMap = new Map<string, string>();
  const visitedSet = new Set<string>();

  visitedSet.add(`${start[0]},${start[1]}`);

  let solved = false;

  while (queue.length > 0) {
    const curr = queue.shift()!;
    visitedOrder.push(curr);

    const [cx, cy] = curr;
    if (cx === end[0] && cy === end[1]) {
      solved = true;
      break;
    }

    const directions = [
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0],
    ];

    for (const [dx, dy] of directions) {
      const nx = cx + dx;
      const ny = cy + dy;

      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        if (maze[ny][nx] === 0 && !visitedSet.has(`${nx},${ny}`)) {
          visitedSet.add(`${nx},${ny}`);
          parentMap.set(`${nx},${ny}`, `${cx},${cy}`);
          queue.push([nx, ny]);
        }
      }
    }
  }

  const path: [number, number][] = [];
  if (solved) {
    let currStr = `${end[0]},${end[1]}`;
    const startStr = `${start[0]},${start[1]}`;

    while (currStr !== startStr) {
      const [x, y] = currStr.split(',').map(Number);
      path.push([x, y]);
      currStr = parentMap.get(currStr)!;
    }
    path.push(start);
    path.reverse();
  }

  return {
    path,
    visited: visitedOrder,
  };
}
