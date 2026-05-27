import { describe, it, expect } from 'vitest';
import { getFourierSeriesValue, generatePresetHarmonics, plotWaveOnGrid } from '../core.js';

describe('Fourier Series Calculations', () => {
  it('should calculate value for a single sine wave', () => {
    // f = 1Hz, amp = 1.0, phase = 0.
    const harmonics = [{ frequency: 1, amplitude: 1.0, phase: 0 }];
    // at t = 0, sin(0) = 0
    expect(getFourierSeriesValue(harmonics, 0)).toBeCloseTo(0);
    // at t = 0.25, sin(2 * PI * 1 * 0.25) = sin(PI/2) = 1.0
    expect(getFourierSeriesValue(harmonics, 0.25)).toBeCloseTo(1.0);
    // at t = 0.5, sin(PI) = 0
    expect(getFourierSeriesValue(harmonics, 0.5)).toBeCloseTo(0);
  });
});

describe('Fourier Harmonic Presets', () => {
  it('should generate correct number of harmonics for square wave', () => {
    const list = generatePresetHarmonics('square', 5);
    expect(list.length).toBe(5);
    // Verify frequencies: 1, 3, 5, 7, 9
    expect(list[0].frequency).toBe(1);
    expect(list[4].frequency).toBe(9);
  });

  it('should generate correct number of harmonics for sawtooth wave', () => {
    const list = generatePresetHarmonics('sawtooth', 4);
    expect(list.length).toBe(4);
    // Verify frequencies: 1, 2, 3, 4
    expect(list[0].frequency).toBe(1);
    expect(list[3].frequency).toBe(4);
  });
});

describe('Fourier Grid Plotting', () => {
  it('should output grid of correct dimensions', () => {
    const harmonics = [{ frequency: 1, amplitude: 1.0, phase: 0 }];
    const grid = plotWaveOnGrid(harmonics, 20, 10);
    expect(grid.length).toBe(10);
    expect(grid[0].length).toBe(20);
  });
});
