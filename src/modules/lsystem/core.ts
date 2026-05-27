export function generateLSystem(
  axiom: string,
  rules: Record<string, string>,
  iterations: number
): string {
  let current = axiom;
  for (let i = 0; i < iterations; i++) {
    let next = '';
    for (const char of current) {
      next += rules[char] !== undefined ? rules[char] : char;
    }
    current = next;
  }
  return current;
}

interface TurtleState {
  x: number;
  y: number;
  angle: number; // in radians
}

export function drawTurtlePath(
  lsystemString: string,
  baseAngle: number, // in degrees
  initialStep: number,
  width: number,
  height: number
): string[][] {
  const grid: string[][] = Array.from({ length: height }, () => Array(width).fill(' '));
  const stack: TurtleState[] = [];

  // Start at bottom center, pointing up (-PI/2)
  let state: TurtleState = {
    x: width / 2,
    y: height - 1,
    angle: -Math.PI / 2,
  };

  const angleRad = (baseAngle * Math.PI) / 180;
  let step = initialStep;

  for (const char of lsystemString) {
    if (char === 'F' || char === 'G') {
      const nextX = state.x + step * Math.cos(state.angle);
      const nextY = state.y + step * Math.sin(state.angle);
      drawLine(state.x, state.y, nextX, nextY, grid, '#');
      state.x = nextX;
      state.y = nextY;
    } else if (char === '+') {
      state.angle += angleRad;
    } else if (char === '-') {
      state.angle -= angleRad;
    } else if (char === '[') {
      stack.push({ ...state });
    } else if (char === ']') {
      const popped = stack.pop();
      if (popped) {
        state = popped;
      }
    }
  }

  return grid;
}

export function drawLine(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  grid: string[][],
  char: string
): void {
  const width = grid[0].length;
  const height = grid.length;

  let ix0 = Math.round(x0);
  let iy0 = Math.round(y0);
  const ix1 = Math.round(x1);
  const iy1 = Math.round(y1);

  const dx = Math.abs(ix1 - ix0);
  const dy = Math.abs(iy1 - iy0);
  const sx = ix0 < ix1 ? 1 : -1;
  const sy = iy0 < iy1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    if (ix0 >= 0 && ix0 < width && iy0 >= 0 && iy0 < height) {
      grid[iy0][ix0] = char;
    }

    if (ix0 === ix1 && iy0 === iy1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      ix0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      iy0 += sy;
    }
  }
}
