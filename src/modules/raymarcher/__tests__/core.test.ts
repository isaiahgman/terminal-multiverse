import { describe, it, expect } from 'vitest';
import { rotateX, rotateY, rotateZ, torusSDF, sphereSDF, renderFrame } from '../core.js';

describe('3D Matrix Rotations', () => {
  it('should return identical values for 0 angle rotations', () => {
    const pt: [number, number, number] = [1.0, 2.0, 3.0];
    expect(rotateX(pt[0], pt[1], pt[2], 0)[0]).toBeCloseTo(pt[0]);
    expect(rotateX(pt[0], pt[1], pt[2], 0)[1]).toBeCloseTo(pt[1]);
    expect(rotateX(pt[0], pt[1], pt[2], 0)[2]).toBeCloseTo(pt[2]);

    expect(rotateY(pt[0], pt[1], pt[2], 0)[0]).toBeCloseTo(pt[0]);
    expect(rotateY(pt[0], pt[1], pt[2], 0)[1]).toBeCloseTo(pt[1]);
    expect(rotateY(pt[0], pt[1], pt[2], 0)[2]).toBeCloseTo(pt[2]);

    expect(rotateZ(pt[0], pt[1], pt[2], 0)[0]).toBeCloseTo(pt[0]);
    expect(rotateZ(pt[0], pt[1], pt[2], 0)[1]).toBeCloseTo(pt[1]);
    expect(rotateZ(pt[0], pt[1], pt[2], 0)[2]).toBeCloseTo(pt[2]);
  });
});

describe('SDF Calculations', () => {
  it('should return 0 at sphere boundary', () => {
    // Sphere of radius 2.0. Point (2,0,0) is exactly on boundary.
    const dist = sphereSDF(2.0, 0, 0, 2.0);
    expect(dist).toBeCloseTo(0);
  });

  it('should return correct torus distance values', () => {
    // Torus with R1 = 1.0, R2 = 0.5.
    // Point (1.5, 0, 0) should be on boundary (distance = 0)
    const dist = torusSDF(1.5, 0, 0, 1.0, 0.5);
    expect(dist).toBeCloseTo(0);
  });
});

describe('Ray Marcher Render Frame', () => {
  it('should return a correctly-dimensioned grid', () => {
    const grid = renderFrame(10, 8, 0, 'sphere');
    expect(grid.length).toBe(8);
    expect(grid[0].length).toBe(10);
  });
});
