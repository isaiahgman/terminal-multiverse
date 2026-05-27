import { describe, it, expect } from 'vitest';
import { buildTransitionTable, generateMarkovText } from '../core.js';

describe('Markov Chain Transition Table Builder', () => {
  it('should build table correctly with prefix length 1', () => {
    const corpus = 'the cat sat the cat';
    const table = buildTransitionTable(corpus, 1);

    expect(table.get('the')).toContain('cat');
    expect(table.get('cat')).toContain('sat');
    expect(table.get('sat')).toContain('the');
  });

  it('should build table correctly with prefix length 2', () => {
    const corpus = 'the cat sat on the mat';
    const table = buildTransitionTable(corpus, 2);

    expect(table.get('the cat')).toContain('sat');
    expect(table.get('cat sat')).toContain('on');
    expect(table.get('sat on')).toContain('the');
    expect(table.get('on the')).toContain('mat');
  });

  it('should return empty map if corpus is smaller than prefix length', () => {
    const corpus = 'one two';
    const table = buildTransitionTable(corpus, 3);
    expect(table.size).toBe(0);
  });
});

describe('Markov Text Generator', () => {
  it('should generate text of requested length', () => {
    const corpus = 'red fish blue fish one fish two fish';
    const table = buildTransitionTable(corpus, 1);
    const text = generateMarkovText(table, 10, 1);

    const words = text.split(' ');
    expect(words.length).toBe(10);
  });

  it('should return empty string if table is empty', () => {
    const table = new Map<string, string[]>();
    const text = generateMarkovText(table, 10, 2);
    expect(text).toBe('');
  });
});
