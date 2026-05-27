import chalk from 'chalk';
import { clearScreen, printHeader, prompt, pause } from '../../utils/cli.js';
import { generateLSystem, drawTurtlePath } from './core.js';

interface LSystemPreset {
  name: string;
  axiom: string;
  rules: Record<string, string>;
  defaultAngle: number;
  defaultStep: number;
  defaultIterations: number;
}

const PRESETS: Record<string, LSystemPreset> = {
  tree: {
    name: 'Classic Fractal Tree',
    axiom: 'X',
    rules: {
      X: 'F[-X][+X]',
      F: 'FF',
    },
    defaultAngle: 25,
    defaultStep: 1.5,
    defaultIterations: 4,
  },
  plant: {
    name: 'Swaying Plant',
    axiom: 'X',
    rules: {
      X: 'F-[[X]+X]+F[+FX]-X',
      F: 'FF',
    },
    defaultAngle: 22,
    defaultStep: 1.2,
    defaultIterations: 4,
  },
  arrowhead: {
    name: 'Sierpinski Arrowhead',
    axiom: 'F',
    rules: {
      F: 'G-F-G',
      G: 'F+G+F',
    },
    defaultAngle: 60,
    defaultStep: 2.0,
    defaultIterations: 4,
  },
};

export async function run(): Promise<void> {
  let running = true;
  while (running) {
    clearScreen();
    printHeader('🌿 L-System Fractal Garden', 'Procedural organic structures generated via formal grammars.');

    console.log(`${chalk.bold('Available Presets:')}`);
    const keys = Object.keys(PRESETS);
    keys.forEach((key, idx) => {
      console.log(`  ${chalk.cyan(idx + 1)}. ${PRESETS[key].name}`);
    });
    console.log(`  ${chalk.cyan('q')}. Return to Main Menu\n`);

    const selection = await prompt('Select a preset or press q: ');
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

    clearScreen();
    printHeader(`🌿 L-System: ${preset.name}`, 'Adjust generation parameters.');

    const iterInput = await prompt(`Iterations (default ${preset.defaultIterations}): `);
    const iterations = iterInput ? parseInt(iterInput) : preset.defaultIterations;

    const angleInput = await prompt(`Branching Angle (degrees, default ${preset.defaultAngle}): `);
    const angle = angleInput ? parseFloat(angleInput) : preset.defaultAngle;

    const stepInput = await prompt(`Step Size (default ${preset.defaultStep}): `);
    const step = stepInput ? parseFloat(stepInput) : preset.defaultStep;

    console.log(chalk.yellow('\nGenerating L-System string...'));
    const lsystemString = generateLSystem(preset.axiom, preset.rules, iterations);
    console.log(chalk.dim(`String length: ${lsystemString.length} characters.`));

    console.log(chalk.yellow('Rendering ASCII grid...'));
    const width = 80;
    const height = 35;
    const grid = drawTurtlePath(lsystemString, angle, step, width, height);

    // Print the grid with nice green coloring
    clearScreen();
    printHeader(`🌿 Fractal Preview: ${preset.name}`, `Iterations: ${iterations} | Angle: ${angle}°`);
    
    let gridOutput = '';
    for (let y = 0; y < height; y++) {
      let row = '';
      for (let x = 0; x < width; x++) {
        const char = grid[y][x];
        if (char === '#') {
          // Color based on height (trunk is brown/green-ish, tips are bright green)
          const ratio = y / height;
          if (ratio > 0.8) {
            row += chalk.hex('#8B4513')('#'); // Brown trunk base
          } else if (ratio > 0.5) {
            row += chalk.green('#'); // Green branches
          } else {
            row += chalk.greenBright('#'); // Bright green tips
          }
        } else {
          row += ' ';
        }
      }
      gridOutput += row + '\n';
    }
    console.log(gridOutput);

    await pause('Press Enter to return to L-System menu...');
  }
}
