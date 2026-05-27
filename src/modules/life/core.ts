export function createGrid(width: number, height: number, randomFill: boolean = false): number[][] {
  const grid: number[][] = [];
  for (let y = 0; y < height; y++) {
    const row: number[] = [];
    for (let x = 0; x < width; x++) {
      row.push(randomFill ? (Math.random() > 0.75 ? 1 : 0) : 0);
    }
    grid.push(row);
  }
  return grid;
}

export function countNeighbors(grid: number[][], x: number, y: number): number {
  const height = grid.length;
  const width = grid[0].length;
  let count = 0;

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;

      // Wrap around grid boundaries (toroidal grid)
      const ny = (y + dy + height) % height;
      const nx = (x + dx + width) % width;

      if (grid[ny][nx] === 1) {
        count++;
      }
    }
  }

  return count;
}

export function nextGeneration(grid: number[][]): number[][] {
  const height = grid.length;
  const width = grid[0].length;
  const next = createGrid(width, height, false);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const neighbors = countNeighbors(grid, x, y);
      const state = grid[y][x];

      if (state === 1) {
        if (neighbors === 2 || neighbors === 3) {
          next[y][x] = 1;
        } else {
          next[y][x] = 0;
        }
      } else {
        if (neighbors === 3) {
          next[y][x] = 1;
        } else {
          next[y][x] = 0;
        }
      }
    }
  }

  return next;
}
