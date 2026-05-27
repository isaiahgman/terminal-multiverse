import { describe, it, expect } from 'vitest';
import {
  precomputeBrackets,
  initInterpreter,
  stepInterpreter,
  runInterpreter,
} from '../core.js';

describe('Brainfuck Parser and Bracket Matching', () => {
  it('should pair brackets correctly', () => {
    const code = '[->+<]';
    const map = precomputeBrackets(code);
    expect(map[0]).toBe(5);
    expect(map[5]).toBe(0);
  });

  it('should throw on unmatched brackets', () => {
    expect(() => precomputeBrackets('[')).toThrow();
    expect(() => precomputeBrackets(']')).toThrow();
    expect(() => precomputeBrackets('[[]')).toThrow();
  });
});

describe('Brainfuck Step Interpreter', () => {
  it('should increment and decrement cells', () => {
    let state = initInterpreter('++-');
    expect(state.tape[0]).toBe(0);

    state = stepInterpreter(state); // +
    expect(state.tape[0]).toBe(1);

    state = stepInterpreter(state); // +
    expect(state.tape[0]).toBe(2);

    state = stepInterpreter(state); // -
    expect(state.tape[0]).toBe(1);
    expect(state.isTerminated).toBe(true);
  });

  it('should move data pointer', () => {
    let state = initInterpreter('>+<');
    state = stepInterpreter(state); // >
    expect(state.dataPointer).toBe(1);

    state = stepInterpreter(state); // +
    expect(state.tape[1]).toBe(1);

    state = stepInterpreter(state); // <
    expect(state.dataPointer).toBe(0);
  });

  it('should wrap cell values to 8-bit range', () => {
    let state = initInterpreter('-');
    state = stepInterpreter(state); // 0 - 1
    expect(state.tape[0]).toBe(255); // wrap around

    let state2 = initInterpreter('+');
    // Set cell to 255 manually
    state2.tape[0] = 255;
    state2 = stepInterpreter(state2); // 255 + 1
    expect(state2.tape[0]).toBe(0); // wrap around
  });
});

describe('Brainfuck Program Executions', () => {
  it('should run a simple loop to multiply/add', () => {
    // Set cell 0 to 3, cell 1 to 4. Loop: [ - > + < ] to move value from 0 to 1
    // Cell 0: 3. Cell 1: 4. After loop, Cell 0: 0, Cell 1: 7
    const code = '[->+<]';
    let state = initInterpreter(code);
    state.tape[0] = 3;
    state.tape[1] = 4;

    // Run until termination
    while (!state.isTerminated) {
      state = stepInterpreter(state);
    }

    expect(state.tape[0]).toBe(0);
    expect(state.tape[1]).toBe(7);
  });

  it('should run Hello World preset program', () => {
    // Classic Hello World program in Brainfuck
    const helloWorld = '++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.';
    const result = runInterpreter(helloWorld);
    expect(result.stdout).toBe('Hello World!\n');
  });
});
