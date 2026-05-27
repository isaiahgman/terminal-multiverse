export const ROTORS: Record<string, { wiring: string; notch: string }> = {
  I: { wiring: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ', notch: 'Q' },
  II: { wiring: 'AJDKSIRUXBLHWTMCQGZNPYFVOE', notch: 'E' },
  III: { wiring: 'BDFHJLCPRTXVZNYEIWGAKMUSQO', notch: 'V' },
};

export const REFLECTORS: Record<string, string> = {
  B: 'YRUHQSLDPXNGOKMIEBFZCWVJAT',
  C: 'FVPJIAOYEDRZXWGCTKUQSBNMHL',
};

export interface EnigmaConfig {
  rotors: [string, string, string]; // [Left, Middle, Right]
  positions: [string, string, string]; // [Left, Middle, Right], e.g., ["A", "A", "A"]
  plugboard: string; // Space-separated pairs, e.g., "AB CD"
  reflector: string; // "B" or "C"
}

// Convert character to 0-25 index
export function charToIdx(char: string): number {
  return char.toUpperCase().charCodeAt(0) - 65;
}

// Convert 0-25 index to character
export function idxToChar(idx: number): string {
  return String.fromCharCode(idx + 65);
}

// Parse plugboard settings into a 26-element mapping array
export function parsePlugboard(settings: string): number[] {
  const mapping = Array.from({ length: 26 }, (_, i) => i);
  const cleanSettings = settings.toUpperCase().trim();
  if (cleanSettings === '') {
    return mapping;
  }
  const pairs = cleanSettings.split(/\s+/);
  const used = new Set<number>();

  for (const pair of pairs) {
    if (pair.length !== 2) {
      throw new Error(`Invalid plugboard pair: ${pair}. Pairs must be exactly 2 letters.`);
    }
    const a = charToIdx(pair[0]);
    const b = charToIdx(pair[1]);
    if (a < 0 || a > 25 || b < 0 || b > 25) {
      throw new Error(`Invalid characters in plugboard pair: ${pair}. Only A-Z allowed.`);
    }
    if (a === b) {
      throw new Error(`A letter cannot be connected to itself: ${pair}`);
    }
    if (used.has(a) || used.has(b)) {
      throw new Error(`Duplicate letter in plugboard settings: ${pair}`);
    }
    used.add(a);
    used.add(b);
    mapping[a] = b;
    mapping[b] = a;
  }
  return mapping;
}

// Perform a single step of the rotors
// Returns the next positions as indices [L, M, R]
export function stepRotors(
  positions: [number, number, number],
  rotorTypes: [string, string, string],
): [number, number, number] {
  const [posL, posM, posR] = positions;
  const [typeL, typeM, typeR] = rotorTypes;

  const notchM = charToIdx(ROTORS[typeM]?.notch ?? 'E');
  const notchR = charToIdx(ROTORS[typeR]?.notch ?? 'V');

  let nextL = posL;
  let nextM = posM;
  let nextR = (posR + 1) % 26;

  // Double stepping logic:
  // If Middle rotor is at its notch, it steps and steps Left.
  // Else if Right rotor is at its notch, Middle rotor steps.
  if (posM === notchM) {
    nextM = (posM + 1) % 26;
    nextL = (posL + 1) % 26;
  } else if (posR === notchR) {
    nextM = (posM + 1) % 26;
  }

  return [nextL, nextM, nextR];
}

// Encrypt/Decrypt a single character given the state (without automatically stepping)
export function encryptChar(
  char: string,
  positions: [number, number, number],
  rotorTypes: [string, string, string],
  reflectorType: string,
  plugboardMap: number[],
): string {
  const upper = char.toUpperCase();
  if (upper < 'A' || upper > 'Z') {
    return char; // Non-alphabetic characters pass through unchanged
  }

  let code = charToIdx(upper);

  // 1. Plugboard
  code = plugboardMap[code];

  // Get rotor wirings
  const wL = ROTORS[rotorTypes[0]].wiring;
  const wM = ROTORS[rotorTypes[1]].wiring;
  const wR = ROTORS[rotorTypes[2]].wiring;

  const ref = REFLECTORS[reflectorType] || REFLECTORS.B;

  // 2. Right rotor (forward)
  code = rotorPassForward(code, wR, positions[2]);

  // 3. Middle rotor (forward)
  code = rotorPassForward(code, wM, positions[1]);

  // 4. Left rotor (forward)
  code = rotorPassForward(code, wL, positions[0]);

  // 5. Reflector
  code = charToIdx(ref[code]);

  // 6. Left rotor (backward)
  code = rotorPassBackward(code, wL, positions[0]);

  // 7. Middle rotor (backward)
  code = rotorPassBackward(code, wM, positions[1]);

  // 8. Right rotor (backward)
  code = rotorPassBackward(code, wR, positions[2]);

  // 9. Plugboard
  code = plugboardMap[code];

  const result = idxToChar(code);
  return char === char.toLowerCase() ? result.toLowerCase() : result;
}

// Helper: Rotor forward pass
function rotorPassForward(code: number, wiring: string, pos: number): number {
  const inputIdx = (code + pos) % 26;
  const outputChar = wiring[inputIdx];
  const outputIdx = charToIdx(outputChar);
  return (outputIdx - pos + 26) % 26;
}

// Helper: Rotor backward pass
function rotorPassBackward(code: number, wiring: string, pos: number): number {
  // Find which character in the wiring maps to the input contact (code + pos) % 26
  const targetContact = (code + pos) % 26;
  const outputIdx = wiring.indexOf(idxToChar(targetContact));
  return (outputIdx - pos + 26) % 26;
}

// Encrypt a full string, stepping the rotors appropriately for each letter
export function encryptString(
  input: string,
  config: EnigmaConfig,
): { ciphertext: string; finalPositions: [string, string, string] } {
  const plugboardMap = parsePlugboard(config.plugboard);
  const rotorTypes = config.rotors;
  const reflectorType = config.reflector;

  let currentPosIndices: [number, number, number] = [
    charToIdx(config.positions[0]),
    charToIdx(config.positions[1]),
    charToIdx(config.positions[2]),
  ];

  let ciphertext = '';

  for (const char of input) {
    const isLetter = /[A-Za-z]/.test(char);
    if (isLetter) {
      // Step rotors BEFORE encrypting the letter
      currentPosIndices = stepRotors(currentPosIndices, rotorTypes);
      ciphertext += encryptChar(char, currentPosIndices, rotorTypes, reflectorType, plugboardMap);
    } else {
      ciphertext += char;
    }
  }

  const finalPositions: [string, string, string] = [
    idxToChar(currentPosIndices[0]),
    idxToChar(currentPosIndices[1]),
    idxToChar(currentPosIndices[2]),
  ];

  return { ciphertext, finalPositions };
}
