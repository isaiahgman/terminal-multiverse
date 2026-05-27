import { describe, it, expect } from 'vitest';
import { textToMorse, generateMorseWavBuffer } from '../core.js';

describe('Morse Code Translation', () => {
  it('should translate letters and numbers correctly', () => {
    expect(textToMorse('SOS')).toBe('... --- ...');
    expect(textToMorse('a 1')).toBe('.-   .----');
  });

  it('should filter out unsupported characters', () => {
    expect(textToMorse('Hello!')).toBe('.... . .-.. .-.. ---');
  });
});

describe('WAV Audio Exporter', () => {
  it('should generate a buffer with a valid WAV header', () => {
    const morse = '.-';
    const buffer = generateMorseWavBuffer(morse, 8000, 700);

    // Verify WAV headers
    expect(buffer.toString('ascii', 0, 4)).toBe('RIFF');
    expect(buffer.readUInt32LE(4)).toBe(buffer.length - 8);
    expect(buffer.toString('ascii', 8, 12)).toBe('WAVE');
    expect(buffer.toString('ascii', 12, 16)).toBe('fmt ');
    expect(buffer.readUInt32LE(16)).toBe(16); // Subchunk1Size
    expect(buffer.readUInt16LE(20)).toBe(1); // AudioFormat PCM
    expect(buffer.readUInt16LE(22)).toBe(1); // NumChannels Mono
    expect(buffer.readUInt32LE(24)).toBe(8000); // SampleRate
    expect(buffer.toString('ascii', 36, 40)).toBe('data');
    expect(buffer.readUInt32LE(40)).toBe(buffer.length - 44); // Subchunk2Size
  });
});
