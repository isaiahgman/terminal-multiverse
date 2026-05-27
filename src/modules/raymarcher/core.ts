export function rotateX(x: number, y: number, z: number, angle: number): [number, number, number] {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [x, y * c - z * s, y * s + z * c];
}

export function rotateY(x: number, y: number, z: number, angle: number): [number, number, number] {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [x * c + z * s, y, -x * s + z * c];
}

export function rotateZ(x: number, y: number, z: number, angle: number): [number, number, number] {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [x * c - y * s, x * s + y * c, z];
}

export function torusSDF(x: number, y: number, z: number, r1: number, r2: number): number {
  const qx = Math.sqrt(x * x + z * z) - r1;
  const qy = y;
  return Math.sqrt(qx * qx + qy * qy) - r2;
}

export function sphereSDF(x: number, y: number, z: number, r: number): number {
  return Math.sqrt(x * x + y * y + z * z) - r;
}

export function sceneSDF(x: number, y: number, z: number, time: number, shape: 'torus' | 'sphere' = 'torus'): number {
  // Rotate the coordinate space to rotate the object
  let [rx, ry, rz] = rotateY(x, y, z, time * 1.5);
  [rx, ry, rz] = rotateX(rx, ry, rz, time * 0.8);

  if (shape === 'sphere') {
    // Add some sine wave displacement to make it look organic
    const d = Math.sin(rx * 5 + time * 3) * Math.cos(ry * 5 + time * 3) * 0.15;
    return sphereSDF(rx, ry, rz, 1.2) + d;
  }

  return torusSDF(rx, ry, rz, 1.2, 0.55);
}

export function getNormal(
  x: number,
  y: number,
  z: number,
  time: number,
  shape: 'torus' | 'sphere' = 'torus'
): [number, number, number] {
  const eps = 0.001;
  const d = sceneSDF(x, y, z, time, shape);
  const nx = sceneSDF(x + eps, y, z, time, shape) - d;
  const ny = sceneSDF(x, y + eps, z, time, shape) - d;
  const nz = sceneSDF(x, y, z + eps, time, shape) - d;

  const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
  if (len === 0) return [0, 1, 0];
  return [nx / len, ny / len, nz / len];
}

const SHADE_CHARS = ' .:-=+*#%@';

export function renderFrame(
  width: number,
  height: number,
  time: number,
  shape: 'torus' | 'sphere' = 'torus'
): string[][] {
  const grid: string[][] = Array.from({ length: height }, () => Array(width).fill(' '));
  const lightDir: [number, number, number] = [0.577, 0.577, -0.577]; // Normalized vector pointing towards the top-right-front

  const aspect = 2.0; // Terminal characters are twice as tall as they are wide

  for (let y = 0; y < height; y++) {
    const uvY = 1.0 - (2.0 * y) / height; // -1 to 1

    for (let x = 0; x < width; x++) {
      const uvX = ((2.0 * x) / width - 1.0) * aspect * (width / height) * 0.5;

      // Camera setup: ray origin and direction
      const ro: [number, number, number] = [0, 0, -3.5];
      const rd: [number, number, number] = [uvX, uvY, 1.0];
      const rdLen = Math.sqrt(rd[0] * rd[0] + rd[1] * rd[1] + rd[2] * rd[2]);
      rd[0] /= rdLen;
      rd[1] /= rdLen;
      rd[2] /= rdLen;

      // Ray marching loop
      let t = 0;
      let hit = false;
      let px = 0,
        py = 0,
        pz = 0;

      for (let step = 0; step < 40; step++) {
        px = ro[0] + rd[0] * t;
        py = ro[1] + rd[1] * t;
        pz = ro[2] + rd[2] * t;

        const d = sceneSDF(px, py, pz, time, shape);
        if (d < 0.005) {
          hit = true;
          break;
        }
        t += d;
        if (t > 8.0) break;
      }

      if (hit) {
        // Calculate lighting
        const [nx, ny, nz] = getNormal(px, py, pz, time, shape);
        const diffuse = nx * lightDir[0] + ny * lightDir[1] + nz * lightDir[2];
        const intensity = Math.max(0, diffuse);

        // Map to characters
        const charIdx = Math.floor(intensity * (SHADE_CHARS.length - 1));
        grid[y][x] = SHADE_CHARS[charIdx];
      }
    }
  }

  return grid;
}
