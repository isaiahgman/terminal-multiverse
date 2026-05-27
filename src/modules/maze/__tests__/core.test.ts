import { describe, it, expect } from 'vitest';
import { generateMaze, solveMazeBFS } from '../core.js';

describe('Maze Generator', () => {
  it('should generate a maze of the requested dimensions', () => {
    const width = 15;
    const height = 11;
    const maze = generateMaze(width, height);

    expect(maze.length).toBe(height);
    expect(maze[0].length).toBe(width);
  });

  it('should have outer boundaries closed with walls', () => {
    const maze = generateMaze(11, 9);
    const height = maze.length;
    const width = maze[0].length;

    // Check top and bottom rows
    for (let x = 0; x < width; x++) {
      expect(maze[0][x]).toBe(1);
      expect(maze[height - 1][x]).toBe(1);
    }
  });
});

describe('Maze BFS Solver', () => {
  it('should solve a simple clear corridor maze', () => {
    // 0 = path, 1 = wall
    const maze = [
      [1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1],
    ];
    // Start at (1, 1), End at (1, 3).
    // Path should go: (1,1) -> (2,1) -> (3,1) -> (3,2) -> (3,3) -> (2,3) -> (1,3)
    const { path } = solveMazeBFS(maze, [1, 1], [1, 3]);

    expect(path.length).toBeGreaterThan(0);
    expect(path[0]).toEqual([1, 1]);
    expect(path[path.length - 1]).toEqual([1, 3]);

    // Check that path coordinates are valid paths
    path.forEach(([x, y]) => {
      expect(maze[y][x]).toBe(0);
    });
  });
});
