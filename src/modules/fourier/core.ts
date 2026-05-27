export interface Harmonic {
  frequency: number;
  amplitude: number;
  phase: number;
}

export function getFourierSeriesValue(harmonics: Harmonic[], t: number): number {
  let value = 0;
  for (const h of harmonics) {
    value += h.amplitude * Math.sin(2 * Math.PI * h.frequency * t + h.phase);
  }
  return value;
}

export function generatePresetHarmonics(
  type: 'square' | 'sawtooth' | 'triangle',
  count: number,
): Harmonic[] {
  const harmonics: Harmonic[] = [];

  if (type === 'square') {
    // Square wave has only odd harmonics: sin(x) + sin(3x)/3 + sin(5x)/5 + ...
    for (let i = 1; i <= count; i++) {
      const n = 2 * i - 1; // 1, 3, 5, ...
      harmonics.push({
        frequency: n,
        amplitude: 1 / n,
        phase: 0,
      });
    }
  } else if (type === 'sawtooth') {
    // Sawtooth wave: sin(x) - sin(2x)/2 + sin(3x)/3 - sin(4x)/4 + ...
    for (let i = 1; i <= count; i++) {
      harmonics.push({
        frequency: i,
        amplitude: (i % 2 === 0 ? -1 : 1) / i,
        phase: 0,
      });
    }
  } else if (type === 'triangle') {
    // Triangle wave: sin(x) - sin(3x)/9 + sin(5x)/25 - ...
    // Amplitude decays as 1/n^2, alternate phases
    for (let i = 1; i <= count; i++) {
      const n = 2 * i - 1; // 1, 3, 5, ...
      harmonics.push({
        frequency: n,
        amplitude: 1 / (n * n),
        phase: i % 2 === 0 ? Math.PI : 0,
      });
    }
  }

  return harmonics;
}

export function plotWaveOnGrid(
  harmonics: Harmonic[],
  width: number,
  height: number,
  timeOffset: number = 0,
): string[][] {
  const grid: string[][] = Array.from({ length: height }, () => Array(width).fill(' '));

  // Determine amplitude scaling factor so it fits nicely
  // Sum of amplitudes
  const sumAmps = harmonics.reduce((sum, h) => sum + Math.abs(h.amplitude), 0);
  const scale = sumAmps > 0 ? (height / 2 - 2) / sumAmps : 1;

  const centerY = Math.floor(height / 2);

  for (let x = 0; x < width; x++) {
    // Map x position to time t (e.g. 0 to 1.5 periods)
    const t = x / width + timeOffset;
    const val = getFourierSeriesValue(harmonics, t);
    const py = Math.round(centerY - val * scale);

    if (py >= 0 && py < height) {
      grid[py][x] = '#';
    }
  }

  return grid;
}
