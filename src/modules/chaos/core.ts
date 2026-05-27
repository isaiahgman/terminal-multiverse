export function getAttractorPoints(count: number, width: number, height: number): [number, number][] {
  const points: [number, number][] = [];
  const centerX = width / 2;
  const centerY = height / 2;
  // Attractors placed in a circle
  // Scale so it fits nicely on the canvas
  const radius = Math.min(centerX, centerY) - 2;

  for (let i = 0; i < count; i++) {
    // Add offset so 3 attractors points up (classic triangle)
    const angle = (i * 2 * Math.PI) / count - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push([x, y]);
  }

  return points;
}

export function stepChaosGame(
  current: [number, number],
  attractors: [number, number][],
  ratio: number
): [number, number] {
  // Pick a random attractor
  const idx = Math.floor(Math.random() * attractors.length);
  const target = attractors[idx];

  // Move towards the target by the specified ratio
  const nextX = current[0] + (target[0] - current[0]) * ratio;
  const nextY = current[1] + (target[1] - current[1]) * ratio;

  return [nextX, nextY];
}

export function runSimulationSteps(
  steps: number,
  start: [number, number],
  attractors: [number, number][],
  ratio: number
): [number, number][] {
  const history: [number, number][] = [];
  let curr = start;
  for (let i = 0; i < steps; i++) {
    curr = stepChaosGame(curr, attractors, ratio);
    history.push(curr);
  }
  return history;
}
