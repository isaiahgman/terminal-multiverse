import { describe, it, expect } from 'vitest';
import { computeLcsTable, computeDiff, alignSideBySide } from '../core.js';

describe('LCS Table Calculation', () => {
  it('should calculate correct LCS lengths', () => {
    const oldLines = ['apple', 'banana', 'cherry'];
    const newLines = ['apple', 'cherry', 'date'];
    const dp = computeLcsTable(oldLines, newLines);

    // LCS of ['apple', 'banana', 'cherry'] and ['apple', 'cherry', 'date'] is ['apple', 'cherry'], length 2
    expect(dp[oldLines.length][newLines.length]).toBe(2);
  });
});

describe('Diff Generation', () => {
  it('should find changes and keep unchanged lines correctly', () => {
    const oldText = 'line1\nline2\nline3';
    const newText = 'line1\nline2.modified\nline3\nline4';

    const diff = computeDiff(oldText, newText);

    expect(diff).toEqual([
      { type: 'unchanged', value: 'line1', oldLineNumber: 1, newLineNumber: 1 },
      { type: 'removed', value: 'line2', oldLineNumber: 2 },
      { type: 'added', value: 'line2.modified', newLineNumber: 2 },
      { type: 'unchanged', value: 'line3', oldLineNumber: 3, newLineNumber: 3 },
      { type: 'added', value: 'line4', newLineNumber: 4 },
    ]);
  });

  it('should handle completely different texts', () => {
    const oldText = 'A\nB';
    const newText = 'C\nD';
    const diff = computeDiff(oldText, newText);

    expect(diff).toEqual([
      { type: 'removed', value: 'A', oldLineNumber: 1 },
      { type: 'removed', value: 'B', oldLineNumber: 2 },
      { type: 'added', value: 'C', newLineNumber: 1 },
      { type: 'added', value: 'D', newLineNumber: 2 },
    ]);
  });

  it('should handle empty inputs gracefully', () => {
    expect(computeDiff('', '')).toEqual([
      { type: 'unchanged', value: '', oldLineNumber: 1, newLineNumber: 1 },
    ]);
  });
});

describe('Side-By-Side Alignment', () => {
  it('should align side by side lines correctly', () => {
    const oldText = 'A\nB';
    const newText = 'A\nC\nD';
    const diff = computeDiff(oldText, newText);
    const aligned = alignSideBySide(diff);

    // Expected:
    // Row 1: Left = A (unchanged), Right = A (unchanged)
    // Row 2: Left = B (removed), Right = C (added)
    // Row 3: Left = undefined, Right = D (added)
    expect(aligned.length).toBe(3);

    expect(aligned[0]).toEqual({
      left: { lineNumber: 1, value: 'A', type: 'unchanged' },
      right: { lineNumber: 1, value: 'A', type: 'unchanged' },
    });

    expect(aligned[1]).toEqual({
      left: { lineNumber: 2, value: 'B', type: 'removed' },
      right: { lineNumber: 2, value: 'C', type: 'added' },
    });

    expect(aligned[2]).toEqual({
      left: undefined,
      right: { lineNumber: 3, value: 'D', type: 'added' },
    });
  });
});
