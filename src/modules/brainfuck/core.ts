export interface BrainfuckState {
  code: string;
  codePointer: number;
  tape: Uint8Array;
  dataPointer: number;
  stdout: string;
  stdin: string;
  stdinIndex: number;
  bracketMap: Record<number, number>;
  isTerminated: boolean;
  stepsCount: number;
}

/**
 * Scan the code to precompute matching brackets for fast bracket jumps.
 */
export function precomputeBrackets(code: string): Record<number, number> {
  const map: Record<number, number> = {};
  const stack: number[] = [];

  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    if (char === '[') {
      stack.push(i);
    } else if (char === ']') {
      if (stack.length === 0) {
        throw new Error(`Unmatched closing bracket ']' at instruction index ${i}`);
      }
      const start = stack.pop()!;
      map[start] = i;
      map[i] = start;
    }
  }

  if (stack.length > 0) {
    throw new Error(`Unmatched opening bracket '[' at instruction index ${stack[stack.length - 1]}`);
  }

  return map;
}

/**
 * Initialize a new Brainfuck state.
 */
export function initInterpreter(code: string, stdin: string = ''): BrainfuckState {
  // Filter out any non-brainfuck characters
  const cleanCode = code.replace(/[^><+\-.,[\]]/g, '');
  const bracketMap = precomputeBrackets(cleanCode);

  return {
    code: cleanCode,
    codePointer: 0,
    tape: new Uint8Array(30000), // Standard size of 30,000 cells
    dataPointer: 0,
    stdout: '',
    stdin,
    stdinIndex: 0,
    bracketMap,
    isTerminated: cleanCode.length === 0,
    stepsCount: 0,
  };
}

/**
 * Execute a single instruction in the Brainfuck state.
 * Returns the new immutable BrainfuckState.
 */
export function stepInterpreter(state: BrainfuckState): BrainfuckState {
  if (state.isTerminated) {
    return state;
  }

  const newTape = new Uint8Array(state.tape);
  let newDataPointer = state.dataPointer;
  let newCodePointer = state.codePointer;
  let newStdout = state.stdout;
  let newStdinIndex = state.stdinIndex;

  const char = state.code[newCodePointer];

  switch (char) {
    case '>':
      newDataPointer = (newDataPointer + 1) % newTape.length;
      newCodePointer++;
      break;
    case '<':
      newDataPointer = (newDataPointer - 1 + newTape.length) % newTape.length;
      newCodePointer++;
      break;
    case '+':
      newTape[newDataPointer] = (newTape[newDataPointer] + 1) % 256;
      newCodePointer++;
      break;
    case '-':
      newTape[newDataPointer] = (newTape[newDataPointer] - 1 + 256) % 256;
      newCodePointer++;
      break;
    case '.':
      newStdout += String.fromCharCode(newTape[newDataPointer]);
      newCodePointer++;
      break;
    case ',':
      if (newStdinIndex < state.stdin.length) {
        newTape[newDataPointer] = state.stdin.charCodeAt(newStdinIndex) % 256;
        newStdinIndex++;
      } else {
        newTape[newDataPointer] = 0; // EOF yields 0
      }
      newCodePointer++;
      break;
    case '[':
      if (newTape[newDataPointer] === 0) {
        newCodePointer = state.bracketMap[newCodePointer] + 1;
      } else {
        newCodePointer++;
      }
      break;
    case ']':
      if (newTape[newDataPointer] !== 0) {
        newCodePointer = state.bracketMap[newCodePointer] + 1;
      } else {
        newCodePointer++;
      }
      break;
    default:
      newCodePointer++;
  }

  const isTerminated = newCodePointer >= state.code.length;

  return {
    ...state,
    tape: newTape,
    dataPointer: newDataPointer,
    codePointer: newCodePointer,
    stdout: newStdout,
    stdinIndex: newStdinIndex,
    isTerminated,
    stepsCount: state.stepsCount + 1,
  };
}

/**
 * Runs a Brainfuck program completely up to a maximum step count.
 */
export function runInterpreter(
  code: string,
  stdin: string = '',
  maxSteps: number = 200000
): { stdout: string; state: BrainfuckState } {
  let state = initInterpreter(code, stdin);

  while (!state.isTerminated && state.stepsCount < maxSteps) {
    state = stepInterpreter(state);
  }

  return {
    stdout: state.stdout,
    state,
  };
}
