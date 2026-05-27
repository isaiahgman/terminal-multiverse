import chalk from 'chalk';
import { clearScreen, printHeader, prompt, pause } from '../../utils/cli.js';
import { createGrid, nextGeneration } from './core.js';

interface Preset {
  name: string;
  setup(grid: number[][]): void;
}

const PRESETS: Record<string, Preset> = {
  random: {
    name: 'Random Soup',
    setup: () => {}, // Handled directly via randomFill
  },
  glider: {
    name: 'Glider',
    setup: (grid) => {
      const cy = Math.floor(grid.length / 2);
      const cx = Math.floor(grid[0].length / 2);
      grid[cy - 1][cx] = 1;
      grid[cy][cx + 1] = 1;
      grid[cy + 1][cx - 1] = 1;
      grid[cy + 1][cx] = 1;
      grid[cy + 1][cx + 1] = 1;
    },
  },
  pulsar: {
    name: 'Pulsar (Oscillator)',
    setup: (grid) => {
      const cy = Math.floor(grid.length / 2);
      const cx = Math.floor(grid[0].length / 2);

      const drawPulsarArm = (y: number, x: number) => {
        if (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) {
          grid[y][x] = 1;
        }
      };

      const offsets = [2, 3, 4, 8, 9, 10];
      offsets.forEach((o) => {
        // Horizontal lines
        drawPulsarArm(cy - 1, cx - o);
        drawPulsarArm(cy - 1, cx + o);
        drawPulsarArm(cy + 1, cx - o);
        drawPulsarArm(cy + 1, cx + o);
        drawPulsarArm(cy - 6, cx - o);
        drawPulsarArm(cy - 6, cx + o);
        drawPulsarArm(cy + 6, cx - o);
        drawPulsarArm(cy + 6, cx + o);

        // Vertical lines
        drawPulsarArm(cy - o, cx - 1);
        drawPulsarArm(cy - o, cx + 1);
        drawPulsarArm(cy + o, cx - 1);
        drawPulsarArm(cy + o, cx + 1);
        drawPulsarArm(cy - o, cx - 6);
        drawPulsarArm(cy - o, cx + 6);
        drawPulsarArm(cy + o, cx - 6);
        drawPulsarArm(cy + o, cx + 6);
      });
    },
  },
};

export async function run(): Promise<void> {
  let running = true;
  while (running) {
    clearScreen();
    printHeader('🦠 Conway\'s Game of Life', 'Cellular automaton simulating cellular growth and decay.');

    console.log(`${chalk.bold('Available Starting States:')}`);
    const keys = Object.keys(PRESETS);
    keys.forEach((key, idx) => {
      console.log(`  ${chalk.cyan(idx + 1)}. ${PRESETS[key].name}`);
    });
    console.log(`  ${chalk.cyan('q')}. Return to Main Menu\n`);

    const selection = await prompt('Select starting state or press q: ');
    if (selection.toLowerCase() === 'q') {
      running = false;
      break;
    }

    const idx = parseInt(selection) - 1;
    if (isNaN(idx) || idx < 0 || idx >= keys.length) {
      console.log(chalk.red('Invalid selection. Press Enter to retry.'));
      await pause();
      continue;
    }

    const presetKey = keys[idx];
    const preset = PRESETS[presetKey];

    const width = 60;
    const height = 25;
    let grid = createGrid(width, height, presetKey === 'random');
    if (presetKey !== 'random') {
      preset.setup(grid);
    }

    clearScreen();
    console.log(chalk.cyan('Starting Simulation Loop...'));
    console.log(chalk.dim('Controls: Press [q] to stop the simulation.'));
    await pause('Press Enter to start...');

    // Stdin capture setup
    const wasRaw = process.stdin.isRaw;
    process.stdin.setRawMode(true);
    process.stdin.resume();

    let keepSimulating = true;
    let generation = 0;

    const handleKey = (data: Buffer) => {
      const key = data.toString();
      if (key === 'q' || key === '\u0003') {
        keepSimulating = false;
      }
    };

    process.stdin.on('data', handleKey);

    while (keepSimulating) {
      clearScreen();
      console.log(chalk.bold.magenta(`🦠 Conway's Game of Life - ${preset.name}`));
      console.log(chalk.dim(`Generation: ${generation} | Press [q] to quit`));

      // Draw grid
      let output = '';
      for (let y = 0; y < height; y++) {
        let row = '';
        for (let x = 0; x < width; x++) {
          row += grid[y][x] === 1 ? chalk.green('█') : chalk.dim('.');
        }
        output += row + '\n';
      }
      console.log(output);

      // Compute next state
      const next = nextGeneration(grid);

      // If grid has stabilized, warn user
      let isSame = true;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (grid[y][x] !== next[y][x]) {
            isSame = false;
            break;
          }
        }
        if (!isSame) break;
      }

      if (isSame) {
        console.log(chalk.yellow('\nSystem stabilized! Press [q] to exit.'));
      }

      grid = next;
      generation++;

      // Frame wait (120ms)
      await new Promise((resolve) => setTimeout(resolve, 120));
    }

    // Restore stdin
    process.stdin.off('data', handleKey);
    process.stdin.setRawMode(wasRaw);
    process.stdin.pause();

    await pause('Simulation ended. Press Enter to return to Game of Life menu...');
  }
}
