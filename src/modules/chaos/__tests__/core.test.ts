import { describe, it, expect } from 'vitest';
import { getAttractorPoints, stepChaosGame, runSimulationSteps } from '../core.js';

describe('Chaos Game Attractor Points', () => {
  it('should return the correct number of attractor points', () => {
    const points = getAttractorPoints(3, 80, 40);
    expect(points.length).toBe(3);
  });

  it('should generate points within grid bounds', () => {
    const points = getAttractorPoints(5, 100, 50);
    points.forEach(([x, y]) => {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(100);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThan(50);
    });
  });
});

describe('Chaos Game Stepping Logic', () => {
  it('should move closer to an attractor by the specified ratio', () => {
    const start: [number, number] = [0, 0];
    const attractors: [number, number][] = [[10, 10]]; // Only one attractor to make it deterministic
    const ratio = 0.5;

    const next = stepChaosGame(start, attractors, ratio);
    expect(next[0]).toBe(5);
    expect(next[1]).toBe(5);
  });

  it('should run multiple simulation steps', () => {
    const start: [number, number] = [0, 0];
    const attractors: [number, number][] = [[10, 0]];
    const ratio = 0.5;

    // Steps:
    // 0: [0, 0] -> [5, 0]
    // 1: [5, 0] -> [7.5, 0]
    const history = runSimulationSteps(2, start, attractors, ratio);
    expect(history.length).toBe(2);
    expect(history[0][0]).toBe(5);
    expect(history[1][0]).toBe(7.5);
  });
});
