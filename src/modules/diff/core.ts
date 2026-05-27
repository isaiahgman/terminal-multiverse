export interface DiffItem {
  type: 'added' | 'removed' | 'unchanged';
  value: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export interface SideBySideLine {
  left?: {
    lineNumber: number;
    value: string;
    type: 'removed' | 'unchanged';
  };
  right?: {
    lineNumber: number;
    value: string;
    type: 'added' | 'unchanged';
  };
}

/**
 * Computes the DP table for the Longest Common Subsequence of two line arrays.
 */
export function computeLcsTable(oldLines: string[], newLines: string[]): number[][] {
  const M = oldLines.length;
  const N = newLines.length;
  const dp: number[][] = Array.from({ length: M + 1 }, () => Array(N + 1).fill(0));

  for (let i = 1; i <= M; i++) {
    for (let j = 1; j <= N; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp;
}

/**
 * Compares two blocks of text and returns a flat array of DiffItems
 * indicating additions, deletions, and unchanged lines.
 */
export function computeDiff(oldText: string, newText: string): DiffItem[] {
  // Normalize line endings and split
  const oldLines = oldText.split(/\r?\n/);
  const newLines = newText.split(/\r?\n/);
  const M = oldLines.length;
  const N = newLines.length;

  const dp = computeLcsTable(oldLines, newLines);
  const diff: DiffItem[] = [];

  let i = M;
  let j = N;

  // Backtrack to reconstruct the diff
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      diff.unshift({
        type: 'unchanged',
        value: oldLines[i - 1],
        oldLineNumber: i,
        newLineNumber: j,
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diff.unshift({
        type: 'added',
        value: newLines[j - 1],
        newLineNumber: j,
      });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      diff.unshift({
        type: 'removed',
        value: oldLines[i - 1],
        oldLineNumber: i,
      });
      i--;
    }
  }

  return diff;
}

/**
 * Aligns flat DiffItems into side-by-side rows.
 * Consecutive additions/deletions are paired horizontally when possible.
 */
export function alignSideBySide(diff: DiffItem[]): SideBySideLine[] {
  const lines: SideBySideLine[] = [];
  let i = 0;

  while (i < diff.length) {
    if (diff[i].type === 'unchanged') {
      lines.push({
        left: {
          lineNumber: diff[i].oldLineNumber!,
          value: diff[i].value,
          type: 'unchanged',
        },
        right: {
          lineNumber: diff[i].newLineNumber!,
          value: diff[i].value,
          type: 'unchanged',
        },
      });
      i++;
    } else {
      // Accumulate consecutive changes (removals and additions)
      const removed: DiffItem[] = [];
      const added: DiffItem[] = [];

      while (i < diff.length && diff[i].type !== 'unchanged') {
        if (diff[i].type === 'removed') {
          removed.push(diff[i]);
        } else {
          added.push(diff[i]);
        }
        i++;
      }

      // Pair them up side by side
      const maxLen = Math.max(removed.length, added.length);
      for (let k = 0; k < maxLen; k++) {
        const rem = removed[k];
        const add = added[k];

        lines.push({
          left: rem
            ? {
                lineNumber: rem.oldLineNumber!,
                value: rem.value,
                type: 'removed',
              }
            : undefined,
          right: add
            ? {
                lineNumber: add.newLineNumber!,
                value: add.value,
                type: 'added',
              }
            : undefined,
        });
      }
    }
  }

  return lines;
}
