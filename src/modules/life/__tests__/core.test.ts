import { describe, it, expect } from 'vitest';
import { createGrid, countNeighbors, nextGeneration } from '../core.js';

describe('Game of Life Grid Creation', () => {
  it('should create an empty grid of correct size', () => {
    const grid = createGrid(5, 3, false);
    expect(grid.length).toBe(3);
    expect(grid[0].length).toBe(5);
    expect(grid.flat().every((cell) => cell === 0)).toBe(true);
  });
});

describe('Game of Life Neighbor Counting', () => {
  it('should count neighbors in flat space', () => {
    const grid = [
      [0, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ];
    // Center cell (1, 1) has 2 neighbors (left and right)
    expect(countNeighbors(grid, 1, 1)).toBe(2);
    // Top-middle cell (1, 0) has 3 neighbors (below, below-left, below-right)
    expect(countNeighbors(grid, 1, 0)).toBe(3);
  });

  it('should wrap around edges (toroidal geometry)', () => {
    const grid = [
      [1, 0, 0],
      [0, 0, 0],
      [0, 0, 1],
    ];
    // Top-left cell (0, 0) should wrap to bottom-right cell (2, 2)
    // Neighbors of (0, 0) include (2, 2) which is 1
    expect(countNeighbors(grid, 0, 0)).toBe(1);
  });
});

describe('Game of Life Stepping', () => {
  it('should preserve a 2x2 stable block', () => {
    let grid = [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ];
    grid = nextGeneration(grid);
    expect(grid[1][1]).toBe(1);
    expect(grid[1][2]).toBe(1);
    expect(grid[2][1]).toBe(1);
    expect(grid[2][2]).toBe(1);
  });

  it('should oscillate a 3x1 blinker', () => {
    const blinkerHorizontal = [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ];
    const step1 = nextGeneration(blinkerHorizontal);
    // Should turn vertical
    expect(step1[1][2]).toBe(1);
    expect(step1[2][2]).toBe(1);
    expect(step1[3][2]).toBe(1);
    expect(step1[2][1]).toBe(0);
    expect(step1[2][3]).toBe(0);

    const step2 = nextGeneration(step1);
    // Should go back horizontal
    expect(step2[2][1]).toBe(1);
    expect(step2[2][2]).toBe(1);
    expect(step2[2][3]).toBe(1);
  });
});
