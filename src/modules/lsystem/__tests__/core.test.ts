import { describe, it, expect } from 'vitest';
import { generateLSystem, drawLine, drawTurtlePath } from '../core.js';

describe('L-System Generator', () => {
  it('should generate basic string expansions', () => {
    const axiom = 'A';
    const rules = {
      A: 'AB',
      B: 'A',
    };
    expect(generateLSystem(axiom, rules, 0)).toBe('A');
    expect(generateLSystem(axiom, rules, 1)).toBe('AB');
    expect(generateLSystem(axiom, rules, 2)).toBe('ABA');
    expect(generateLSystem(axiom, rules, 3)).toBe('ABAAB');
  });

  it('should pass-through characters without rules', () => {
    const axiom = 'A+B';
    const rules = {
      A: 'F',
    };
    expect(generateLSystem(axiom, rules, 1)).toBe('F+B');
  });
});

describe('Bresenham Line Drawing', () => {
  it('should draw a line on a grid', () => {
    const grid = [
      [' ', ' ', ' '],
      [' ', ' ', ' '],
      [' ', ' ', ' '],
    ];
    drawLine(0, 0, 2, 2, grid, '#');
    expect(grid[0][0]).toBe('#');
    expect(grid[1][1]).toBe('#');
    expect(grid[2][2]).toBe('#');
  });

  it('should clamp line drawings inside grid limits', () => {
    const grid = [
      [' ', ' '],
      [' ', ' '],
    ];
    drawLine(0, 0, 10, 10, grid, '#');
    expect(grid[0][0]).toBe('#');
    expect(grid[1][1]).toBe('#');
  });
});

describe('Turtle Path Drawing', () => {
  it('should draw a basic forward line', () => {
    const lsystem = 'F';
    const grid = drawTurtlePath(lsystem, 90, 2, 10, 10);
    // Grid bottom center is (5, 9).
    // Moving up with step 2 takes turtle to (5, 7).
    expect(grid[9][5]).toBe('#');
    expect(grid[8][5]).toBe('#');
    expect(grid[7][5]).toBe('#');
  });
});
