/**
 * Computes the Collatz sequence for a positive integer n.
 * Formula:
 * - If n is even: n = n / 2
 * - If n is odd: n = 3n + 1
 * Stops when n reaches 1.
 */
export function getCollatzSequence(n: number): number[] {
  if (n <= 0 || !Number.isInteger(n)) {
    throw new Error('Collatz input must be a positive integer.');
  }

  const sequence: number[] = [n];
  let current = n;
  let steps = 0;
  const maxSteps = 20000; // Safeguard limit to prevent infinite loops

  while (current !== 1 && steps < maxSteps) {
    if (current % 2 === 0) {
      current = current / 2;
    } else {
      current = 3 * current + 1;
    }
    sequence.push(current);
    steps++;
  }

  return sequence;
}

/**
 * Generates a 2D ASCII grid representing the Collatz sequence values over time.
 * The x-axis represents the steps/progress of the sequence (downsampled if longer than width).
 * The y-axis represents the value of the numbers, scaled logarithmically or linearly.
 */
export function generateCollatzAsciiPlot(
  sequence: number[],
  width: number,
  height: number,
  useLogScale: boolean = false,
): string[][] {
  const grid: string[][] = Array.from({ length: height }, () => Array(width).fill(' '));
  if (sequence.length === 0) {
    return grid;
  }

  const maxVal = Math.max(...sequence);
  const minVal = 1;

  // Compute scale boundaries
  const maxLog = Math.log(maxVal);
  const minLog = Math.log(minVal);
  const logRange = maxLog - minLog;

  const linearRange = maxVal - minVal;

  const len = sequence.length;

  for (let col = 0; col < width; col++) {
    // Map column index to a segment of the sequence
    const startIdx = Math.floor((col / width) * len);
    const endIdx = Math.floor(((col + 1) / width) * len);
    const segment = sequence.slice(startIdx, Math.max(startIdx + 1, endIdx));
    if (segment.length === 0) continue;

    // We can represent this column using the maximum value in this segment
    const val = Math.max(...segment);

    let ratio = 0;
    if (useLogScale) {
      if (logRange > 0) {
        ratio = (Math.log(val) - minLog) / logRange;
      }
    } else {
      if (linearRange > 0) {
        ratio = (val - minVal) / linearRange;
      }
    }

    // Determine target row (height - 1 is bottom/minVal, 0 is top/maxVal)
    const activeRows = Math.round(ratio * (height - 1));
    const targetRow = height - 1 - activeRows;

    // Draw vertical bar from bottom to target row
    for (let r = targetRow; r < height; r++) {
      grid[r][col] = '█';
    }
  }

  return grid;
}
