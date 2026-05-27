import { describe, it, expect } from 'vitest';
import { getCollatzSequence, generateCollatzAsciiPlot } from '../core.js';

describe('Collatz Sequence Generation', () => {
  it('should throw error for non-positive integers', () => {
    expect(() => getCollatzSequence(0)).toThrow();
    expect(() => getCollatzSequence(-5)).toThrow();
    expect(() => getCollatzSequence(5.5)).toThrow();
  });

  it('should generate correct sequence for 1', () => {
    expect(getCollatzSequence(1)).toEqual([1]);
  });

  it('should generate correct sequence for 6', () => {
    // 6 -> 3 -> 10 -> 5 -> 16 -> 8 -> 4 -> 2 -> 1
    expect(getCollatzSequence(6)).toEqual([6, 3, 10, 5, 16, 8, 4, 2, 1]);
  });

  it('should generate correct sequence for 5', () => {
    // 5 -> 16 -> 8 -> 4 -> 2 -> 1
    expect(getCollatzSequence(5)).toEqual([5, 16, 8, 4, 2, 1]);
  });
});

describe('Collatz ASCII Plot Generation', () => {
  it('should return empty grid if sequence is empty', () => {
    const grid = generateCollatzAsciiPlot([], 10, 5);
    expect(grid.length).toBe(5);
    expect(grid[0].length).toBe(10);
    expect(grid.every((row) => row.every((c) => c === ' '))).toBe(true);
  });

  it('should generate a plot of correct size', () => {
    const seq = [6, 3, 10, 5, 16, 8, 4, 2, 1];
    const grid = generateCollatzAsciiPlot(seq, 9, 5);
    expect(grid.length).toBe(5);
    expect(grid[0].length).toBe(9);
    // At step 4, the value is 16 (max). It should be plotted at row 0 (the top).
    // The index 4 corresponds to column 4 in a 9-column grid mapping.
    expect(grid[0][4]).toBe('█');
    // At step 8, the value is 1 (min). It should be at the bottom.
    // Index 8 corresponds to column 8. Bottom is row 4.
    expect(grid[4][8]).toBe('█');
  });

  it('should support logarithmic scale without crashing', () => {
    const seq = [
      1000, 500, 250, 125, 376, 188, 94, 47, 142, 71, 214, 107, 322, 161, 484, 242, 121, 364, 182,
      91, 274, 137, 412, 206, 103, 310, 155, 466, 233, 700, 350, 175, 526, 263, 790, 395, 1186, 593,
      1780, 890, 445, 1336, 668, 334, 167, 502, 251, 754, 377, 1132, 566, 283, 850, 425, 1276, 638,
      319, 958, 479, 1438, 719, 2158, 1079, 3238, 1619, 4858, 2429, 7288, 3644, 1822, 911, 2734,
      1367, 4102, 2051, 6154, 3077, 9232, 4616, 2308, 1154, 577, 1732, 866, 433, 1300, 650, 325,
      976, 488, 244, 122, 61, 184, 92, 46, 23, 70, 35, 106, 53, 160, 80, 40, 20, 10, 5, 16, 8, 4, 2,
      1,
    ];
    const grid = generateCollatzAsciiPlot(seq, 50, 15, true);
    expect(grid.length).toBe(15);
    expect(grid[0].length).toBe(50);
  });
});
