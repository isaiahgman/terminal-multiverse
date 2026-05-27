import chalk from 'chalk';
import { clearScreen, printHeader, prompt, pause } from '../../utils/cli.js';
import {
  initInterpreter,
  stepInterpreter,
  runInterpreter,
  BrainfuckState,
} from './core.js';

interface BFPreset {
  name: string;
  code: string;
  description: string;
  stdin?: string;
}

const PRESETS: Record<string, BFPreset> = {
  hello: {
    name: 'Hello World',
    code: '++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.',
    description: 'The standard greeting program in Brainfuck.',
  },
  alphabet: {
    name: 'A-Z Alphabet Generator',
    code: '+++++++[>+++++++++<-]>+<++++++++++++++++++++++++++[->.+<]',
    description: 'Generates uppercase A to Z using loops and arithmetic offsets.',
  },
  add: {
    name: 'Add Two Numbers (4 + 3)',
    code: '++++ > +++ < [->+<] >>',
    description: 'Sets Cell 0 to 4 and Cell 1 to 3, then loops to add them into Cell 1.',
  },
  cat: {
    name: 'Echo Input (Cat program)',
    code: ',[.,]',
    description: 'Reads user input and echoes it directly back to stdout.',
    stdin: 'Hi!',
  },
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function run(): Promise<void> {
  let running = true;
  let activeCode = PRESETS.hello.code;
  let activeName = PRESETS.hello.name;
  let activeDescription = PRESETS.hello.description;
  let activeStdin = PRESETS.hello.stdin || '';

  while (running) {
    clearScreen();
    printHeader('🧠 Interactive Brainfuck Interpreter', 'A virtual machine and visualizer for the 8-command esoteric language.');

    console.log(`${chalk.bold('Active Program:')} ${chalk.yellow(activeName)}`);
    console.log(`${chalk.dim(activeDescription)}`);
    console.log();

    console.log(`${chalk.bold('Menu Options:')}`);
    console.log(`  ${chalk.cyan('1.')} Run Program (Instant)`);
    console.log(`  ${chalk.cyan('2.')} Animate Program (Slow - 1 step/frame)`);
    console.log(`  ${chalk.cyan('3.')} Animate Program (Fast - 50 steps/frame)`);
    console.log(`  ${chalk.cyan('4.')} Load Preset Program`);
    console.log(`  ${chalk.cyan('5.')} Enter Custom Brainfuck Code`);
    console.log(`  ${chalk.cyan('q.')} Return to Main Menu\n`);

    const selection = await prompt('Select an option: ');
    const choice = selection.trim().toLowerCase();

    if (choice === 'q') {
      running = false;
      break;
    }

    switch (choice) {
      case '1': {
        // Run instantly
        clearScreen();
        printHeader(`🧠 Running: ${activeName}`, 'Executing to completion...');
        console.log(chalk.yellow('Program code:'));
        console.log(chalk.dim(activeCode));
        console.log('\nRunning...');

        const startTime = Date.now();
        const { stdout, state } = runInterpreter(activeCode, activeStdin);
        const duration = Date.now() - startTime;

        console.log('\n----------------------------------------');
        console.log(`${chalk.bold('Execution completed in')} ${duration}ms`);
        console.log(`${chalk.bold('Total steps:')} ${state.stepsCount}`);
        console.log(`${chalk.bold('Final stdout:')}`);
        console.log(stdout ? chalk.greenBright(stdout) : chalk.dim('(No output)'));
        console.log('----------------------------------------');
        await pause();
        break;
      }

      case '2':
      case '3': {
        // Animated execution
        const stepsPerFrame = choice === '2' ? 1 : 50;
        const delay = choice === '2' ? 80 : 30;

        clearScreen();
        let state: BrainfuckState;
        try {
          state = initInterpreter(activeCode, activeStdin);
        } catch (e: any) {
          console.log(chalk.red(`Error compiling code: ${e.message}`));
          await pause();
          break;
        }

        while (!state.isTerminated) {
          // Perform batch steps
          for (let i = 0; i < stepsPerFrame && !state.isTerminated; i++) {
            state = stepInterpreter(state);
          }

          clearScreen();
          printHeader(`🧠 Animating: ${activeName}`, `Steps: ${state.stepsCount} | Pointer: ${state.dataPointer}`);

          // Render tape
          console.log(chalk.bold('Data Tape:'));
          console.log(renderTapeWindow(state.tape, state.dataPointer));

          // Render code instruction pointer
          console.log(chalk.bold('Code pointer:'));
          console.log(renderCodeWindow(state.code, state.codePointer));
          console.log();

          // Render output
          console.log(chalk.bold('Standard Output:'));
          console.log(state.stdout ? chalk.greenBright(state.stdout) : chalk.dim('(None yet)'));
          console.log();

          await sleep(delay);
        }

        console.log(chalk.yellow('Program terminated.'));
        await pause();
        break;
      }

      case '4': {
        clearScreen();
        printHeader('🧠 Load Brainfuck Preset', 'Choose a classic algorithm.');
        const keys = Object.keys(PRESETS);
        keys.forEach((key, idx) => {
          console.log(`  ${chalk.cyan(idx + 1)}. ${PRESETS[key].name} - ${chalk.dim(PRESETS[key].description)}`);
        });
        console.log(`  ${chalk.cyan('b.')} Back\n`);

        const presetChoice = await prompt('Select preset: ');
        const cleanChoice = presetChoice.trim().toLowerCase();
        if (cleanChoice === 'b') {
          break;
        }
        const idx = parseInt(cleanChoice) - 1;
        if (!isNaN(idx) && idx >= 0 && idx < keys.length) {
          const key = keys[idx];
          activeCode = PRESETS[key].code;
          activeName = PRESETS[key].name;
          activeDescription = PRESETS[key].description;
          activeStdin = PRESETS[key].stdin || '';
        } else {
          console.log(chalk.red('\nInvalid selection. Press Enter to retry.'));
          await pause();
        }
        break;
      }

      case '5': {
        clearScreen();
        printHeader('🧠 Enter Custom Brainfuck Code', 'Allowed characters: ><+-.,[]');
        const codeIn = await prompt('Enter code: ');
        const clean = codeIn.replace(/[^><+\-.,[\]]/g, '');
        if (clean.length === 0) {
          console.log(chalk.red('\nNo valid brainfuck instructions entered.'));
          await pause();
          break;
        }

        let stdinIn = '';
        if (clean.includes(',')) {
          stdinIn = await prompt('This code uses input (,). Enter stdin string: ');
        }

        activeCode = clean;
        activeName = 'Custom Program';
        activeDescription = 'User defined brainfuck program.';
        activeStdin = stdinIn;
        console.log(chalk.green('\nCode loaded.'));
        await pause();
        break;
      }

      default:
        console.log(chalk.red('\nInvalid choice. Press Enter to retry.'));
        await pause();
        break;
    }
  }
}

function renderTapeWindow(tape: Uint8Array, dp: number, size: number = 6): string {
  let output = '  ';
  // Show cells from dp - size to dp + size
  for (let i = -size; i <= size; i++) {
    const idx = (dp + i + tape.length) % tape.length;
    const val = tape[idx];
    const isCurrent = i === 0;

    const cellStr = val.toString().padStart(3, ' ');
    if (isCurrent) {
      output += chalk.bold.yellow(`[${cellStr}]`);
    } else {
      output += chalk.gray(`[${cellStr}]`);
    }
  }

  // Draw indicator line below
  let indicator = '  ';
  for (let i = -size; i <= size; i++) {
    if (i === 0) {
      indicator += chalk.bold.yellow('  ▲  ');
    } else {
      indicator += '     ';
    }
  }

  return `${output}\n${indicator}`;
}

function renderCodeWindow(code: string, cp: number, size: number = 20): string {
  const start = Math.max(0, cp - size);
  const end = Math.min(code.length, cp + size + 1);

  let prefix = code.substring(start, cp);
  const active = code[cp] || '';
  let suffix = code.substring(cp + 1, end);

  if (start > 0) prefix = '...' + prefix;
  if (end < code.length) suffix = suffix + '...';

  return '  ' + chalk.dim(prefix) + chalk.bold.yellow(active) + chalk.dim(suffix);
}
