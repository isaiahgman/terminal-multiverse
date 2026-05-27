import chalk from 'chalk';
import { clearScreen, printHeader, prompt } from './utils/cli.js';
import { Module } from './modules/types.js';

// Module runners
import { run as runLsystem } from './modules/lsystem/runner.js';
import { run as runLife } from './modules/life/runner.js';
import { run as runRaymarcher } from './modules/raymarcher/runner.js';
import { run as runChaos } from './modules/chaos/runner.js';
import { run as runMarkov } from './modules/markov/runner.js';
import { run as runMorse } from './modules/morse/runner.js';
import { run as runMaze } from './modules/maze/runner.js';
import { run as runFourier } from './modules/fourier/runner.js';
import { run as runEnigma } from './modules/enigma/runner.js';
import { run as runCollatz } from './modules/collatz/runner.js';
import { run as runDiff } from './modules/diff/runner.js';

const MODULES: Module[] = [
  {
    name: '🌿 L-System Fractal Garden',
    description: 'Procedural organic plant growth simulations',
    run: runLsystem,
  },
  {
    name: '🦠 Conway\'s Game of Life',
    description: 'Interactive cellular automata simulation loop',
    run: runLife,
  },
  {
    name: '🕶️ 3D Ray Marcher',
    description: 'Real-time 3D camera ray tracer with ASCII rendering',
    run: runRaymarcher,
  },
  {
    name: '📐 Chaos Game Fractal Generator',
    description: 'Emergent geometric Sierpinski fractals via random math',
    run: runChaos,
  },
  {
    name: '✍️ Markov Chain Text Generator',
    description: 'Nonsense sentence generator compiling transition tables',
    run: runMarkov,
  },
  {
    name: '🔊 Morse WAV Audio Exporter',
    description: 'Translate text to Morse code and write to WAV file',
    run: runMorse,
  },
  {
    name: '🕸️ Maze Generator & Solver',
    description: 'DFS maze creator and BFS shortest path finder',
    run: runMaze,
  },
  {
    name: '📈 Fourier Waveform Synthesizer',
    description: 'Synthesize square, sawtooth, and custom waves in 1D',
    run: runFourier,
  },
  {
    name: '🔑 Enigma Cipher Machine',
    description: 'WWI-era rotor-based text encryption and decryption',
    run: runEnigma,
  },
  {
    name: '📊 Collatz Conjecture Plotter',
    description: 'Trace 3n+1 orbits and plot dynamic graph trajectories',
    run: runCollatz,
  },
  {
    name: '🔍 Visual Diff Comparison',
    description: 'Compare line diffs side-by-side using LCS algorithms',
    run: runDiff,
  },
];

async function main(): Promise<void> {
  let running = true;

  while (running) {
    clearScreen();
    printHeader(
      '🌌 TERMINAL MULTIVERSE CONSOLE 🌌',
      'Select a workspace module to experience computational systems.'
    );

    console.log(chalk.bold.magenta('Available Systems:'));
    MODULES.forEach((mod, idx) => {
      const num = String(idx + 1).padStart(2, ' ');
      console.log(
        `  ${chalk.cyan(num)}. ${chalk.bold.white(mod.name)} - ${chalk.dim(mod.description)}`
      );
    });
    console.log(`  ${chalk.cyan(' q')}. ${chalk.bold.red('Exit Console')}\n`);

    const selection = await prompt('Enter selection: ');

    if (selection.toLowerCase() === 'q') {
      clearScreen();
      console.log(
        chalk.bold.yellow(
          '\nThank you for exploring the Terminal Multiverse. Exiting console...\n'
        )
      );
      running = false;
      break;
    }

    const idx = parseInt(selection) - 1;
    if (isNaN(idx) || idx < 0 || idx >= MODULES.length) {
      console.log(chalk.red('Invalid selection. Press Enter to retry.'));
      await new Promise((resolve) => setTimeout(resolve, 1000));
      continue;
    }

    try {
      const selectedModule = MODULES[idx];
      await selectedModule.run();
    } catch (error) {
      console.log(chalk.red(`\nAn error occurred in the module: ${error}`));
      await prompt('\nPress Enter to return to Main Menu...');
    }
  }
}

main().catch((err) => {
  console.error(chalk.red('Critical error running Multiverse:'), err);
  process.exit(1);
});
