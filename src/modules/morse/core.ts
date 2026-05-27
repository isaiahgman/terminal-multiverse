export const MORSE_DICT: Record<string, string> = {
  a: '.-',
  b: '-...',
  c: '-.-.',
  d: '-..',
  e: '.',
  f: '..-.',
  g: '--.',
  h: '....',
  i: '..',
  j: '.---',
  k: '-.-',
  l: '.-..',
  m: '--',
  n: '-.',
  o: '---',
  p: '.--.',
  q: '--.-',
  r: '.-.',
  s: '...',
  t: '-',
  u: '..-',
  v: '...-',
  w: '.--',
  x: '-..-',
  y: '-.--',
  z: '--..',
  '1': '.----',
  '2': '..---',
  '3': '...--',
  '4': '....-',
  '5': '.....',
  '6': '-....',
  '7': '--...',
  '8': '---..',
  '9': '----.',
  '0': '-----',
};

export function textToMorse(text: string): string {
  return text
    .toLowerCase()
    .split('')
    .map((char) => {
      if (char === ' ') return ' ';
      return MORSE_DICT[char] || '';
    })
    .filter((s) => s.length > 0 || s === ' ')
    .join(' ');
}

export function generateMorseWavBuffer(
  morse: string,
  sampleRate: number = 8000,
  frequency: number = 700
): Buffer {
  const dotDuration = 0.08; // 80 ms
  const samplesPerDot = Math.floor(sampleRate * dotDuration);

  // Parse morse characters into audio durations
  // 1 = sound, 0 = silence
  const pattern: number[] = [];

  const addSound = (multiplier: number): void => {
    const len = samplesPerDot * multiplier;
    for (let i = 0; i < len; i++) {
      pattern.push(1);
    }
  };

  const addSilence = (multiplier: number): void => {
    const len = samplesPerDot * multiplier;
    for (let i = 0; i < len; i++) {
      pattern.push(0);
    }
  };

  const words = morse.split('   '); // 3 spaces = word space

  words.forEach((word, wIdx) => {
    const chars = word.split(' '); // 1 space = char space
    chars.forEach((char, cIdx) => {
      for (const symbol of char) {
        if (symbol === '.') {
          addSound(1);
        } else if (symbol === '-') {
          addSound(3);
        }
        // Element gap (1 dot duration silence)
        addSilence(1);
      }
      // Character gap (3 dots duration silence, minus the element gap we just added)
      if (cIdx < chars.length - 1) {
        addSilence(2);
      }
    });

    // Word gap (7 dots duration silence, minus the character/element gap)
    if (wIdx < words.length - 1) {
      addSilence(4);
    }
  });

  const numSamples = pattern.length;
  const bufferSize = 44 + numSamples;
  const buffer = Buffer.alloc(bufferSize);

  // 1. Chunk ID: "RIFF"
  buffer.write('RIFF', 0);
  // 2. Chunk Size: 36 + SubChunk2Size
  buffer.writeUInt32LE(36 + numSamples, 4);
  // 3. Format: "WAVE"
  buffer.write('WAVE', 8);
  // 4. Subchunk1 ID: "fmt "
  buffer.write('fmt ', 12);
  // 5. Subchunk1 Size: 16 (for PCM)
  buffer.writeUInt32LE(16, 16);
  // 6. Audio Format: 1 (PCM)
  buffer.writeUInt16LE(1, 20);
  // 7. Num Channels: 1 (Mono)
  buffer.writeUInt16LE(1, 22);
  // 8. Sample Rate: 8000
  buffer.writeUInt32LE(sampleRate, 24);
  // 9. Byte Rate: SampleRate * NumChannels * BitsPerSample/8
  buffer.writeUInt32LE(sampleRate, 28);
  // 10. Block Align: NumChannels * BitsPerSample/8
  buffer.writeUInt16LE(1, 32);
  // 11. Bits Per Sample: 8
  buffer.writeUInt16LE(8, 34);
  // 12. Subchunk2 ID: "data"
  buffer.write('data', 36);
  // 13. Subchunk2 Size: numSamples
  buffer.writeUInt32LE(numSamples, 40);

  // Generate PCM data
  for (let i = 0; i < numSamples; i++) {
    const isSound = pattern[i];
    if (isSound) {
      // Sine wave sample
      const angle = (2 * Math.PI * frequency * i) / sampleRate;
      const sampleVal = Math.round(128 + 127 * Math.sin(angle)); // 8-bit unsigned PCM
      buffer[44 + i] = sampleVal;
    } else {
      buffer[44 + i] = 128; // Silence center
    }
  }

  return buffer;
}
