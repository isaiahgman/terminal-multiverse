import { describe, it, expect } from 'vitest';
import {
  charToIdx,
  idxToChar,
  parsePlugboard,
  stepRotors,
  encryptChar,
  encryptString,
  EnigmaConfig,
} from '../core.js';

describe('Enigma Core Utils', () => {
  it('should convert characters and indices correctly', () => {
    expect(charToIdx('A')).toBe(0);
    expect(charToIdx('Z')).toBe(25);
    expect(idxToChar(0)).toBe('A');
    expect(idxToChar(25)).toBe('Z');
  });

  it('should parse valid plugboard settings', () => {
    const map = parsePlugboard('AB CD');
    expect(map[0]).toBe(1); // A -> B
    expect(map[1]).toBe(0); // B -> A
    expect(map[2]).toBe(3); // C -> D
    expect(map[3]).toBe(2); // D -> C
    expect(map[4]).toBe(4); // E -> E (untouched)
  });

  it('should throw on invalid plugboard settings', () => {
    expect(() => parsePlugboard('ABC')).toThrow();
    expect(() => parsePlugboard('AB AC')).toThrow(); // Duplicate A
    expect(() => parsePlugboard('AA')).toThrow(); // Self-connection
  });
});

describe('Enigma Rotor Stepping', () => {
  it('should step right rotor normally', () => {
    // Starting at A A A (0, 0, 0)
    // Rotors: I, II, III
    // Notch for III is V (21). Thus, right rotor stepping shouldn't trigger middle yet.
    const start: [number, number, number] = [0, 0, 0];
    const next = stepRotors(start, ['I', 'II', 'III']);
    expect(next).toEqual([0, 0, 1]); // A A B
  });

  it('should step middle rotor when right rotor hits notch', () => {
    // Rotor III notch is V (21). When stepping from V to W, the middle rotor steps.
    const start: [number, number, number] = [0, 0, 21]; // A A V
    const next = stepRotors(start, ['I', 'II', 'III']);
    expect(next).toEqual([0, 1, 22]); // A B W
  });

  it('should trigger double stepping when middle rotor is at notch', () => {
    // Rotor II notch is E (4). When middle rotor is at E, it steps itself AND the left rotor.
    // Starting at: Left=0 (A), Middle=4 (E), Right=0 (A)
    const start: [number, number, number] = [0, 4, 0];
    const next = stepRotors(start, ['I', 'II', 'III']);
    // Middle was at notch (4), so both Middle and Left step. Right steps as always.
    expect(next).toEqual([1, 5, 1]); // B F B
  });
});

describe('Enigma Encryption and Decryption', () => {
  const config: EnigmaConfig = {
    rotors: ['I', 'II', 'III'],
    positions: ['A', 'A', 'A'],
    plugboard: 'AM FI KO YT',
    reflector: 'B',
  };

  it('should encrypt a character correctly', () => {
    const plugboardMap = parsePlugboard(config.plugboard);
    // Encryption of 'A' at initial positions A, A, A *after* stepping once.
    // The first letter causes a step from [0, 0, 0] to [0, 0, 1].
    const nextPos: [number, number, number] = [0, 0, 1];
    const ciphertextChar = encryptChar('A', nextPos, config.rotors, config.reflector, plugboardMap);
    expect(ciphertextChar).toBeDefined();
    expect(ciphertextChar).not.toBe('A'); // Enigma never encrypts a letter to itself
  });

  it('should encrypt a string and decrypt it back with the same initial config', () => {
    const plaintext = 'HELLO WORLD';
    const result = encryptString(plaintext, config);

    // Decrypting requires restarting with the exact same initial settings
    const decryptResult = encryptString(result.ciphertext, config);
    expect(decryptResult.ciphertext).toBe(plaintext);
  });

  it('should keep non-letters unchanged', () => {
    const plaintext = 'HELLO, WORLD! 123';
    const result = encryptString(plaintext, config);
    expect(result.ciphertext).toContain(', ');
    expect(result.ciphertext).toContain('! ');
    expect(result.ciphertext).toContain('123');

    const decryptResult = encryptString(result.ciphertext, config);
    expect(decryptResult.ciphertext).toBe(plaintext);
  });
});
