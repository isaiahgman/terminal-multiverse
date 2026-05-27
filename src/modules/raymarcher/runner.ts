import chalk from 'chalk';
import { clearScreen, printHeader, prompt, pause } from '../../utils/cli.js';
import { renderFrame } from './core.js';

export async function run(): Promise<void> {
  let running = true;
  while (running) {
    clearScreen();
    printHeader('🕶️ Text-Based 3D Ray Marcher', 'Real-time math-based 3D renderer running in your terminal.');

    console.log(`${chalk.bold('Select 3D Shape:')}`);
    console.log(`  ${chalk.cyan('1')}. Rotating Torus (Donut)`);
    console.log(`  ${chalk.cyan('2')}. Deforming Organic Sphere`);
    console.log(`  ${chalk.cyan('q')}. Return to Main Menu\n`);

    const selection = await prompt('Select option or press q: ');
    if (selection.toLowerCase() === 'q') {
      running = false;
      break;
    }

    let shape: 'torus' | 'sphere' = 'torus';
    let label = 'Rotating Torus';
    if (selection === '2') {
      shape = 'sphere';
      label = 'Deforming Sphere';
    } else if (selection !== '1') {
      console.log(chalk.red('Invalid selection. Press Enter to retry.'));
      await pause();
      continue;
    }

    clearScreen();
    console.log(chalk.cyan('Preparing Raymarcher Engine...'));
    console.log(chalk.dim('Controls: Press [q] to stop rendering.'));
    await pause('Press Enter to start...');

    // Stdin capture setup
    const wasRaw = process.stdin.isRaw;
    process.stdin.setRawMode(true);
    process.stdin.resume();

    let keepRunning = true;
    let time = 0;

    const handleKey = (data: Buffer) => {
      const key = data.toString();
      if (key === 'q' || key === '\u0003') {
        keepRunning = false;
      }
    };

    process.stdin.on('data', handleKey);

    const width = 60;
    const height = 25;

    while (keepRunning) {
      clearScreen();
      console.log(chalk.bold.magenta(`🕶️ Ray Marcher Scene: ${label}`));
      console.log(chalk.dim(`Frame Angle: ${(time * 50).toFixed(0)}° | Press [q] to quit`));

      const grid = renderFrame(width, height, time, shape);

      let frameText = '';
      for (let y = 0; y < height; y++) {
        let row = '';
        for (let x = 0; x < width; x++) {
          const char = grid[y][x];
          // Add some nice coloring to the object based on char density
          if (char === '@' || char === '%') {
            row += chalk.magentaBright(char);
          } else if (char === '#' || char === '*') {
            row += chalk.magenta(char);
          } else if (char === '+' || char === '=') {
            row += chalk.blueBright(char);
          } else if (char !== ' ') {
            row += chalk.blue(char);
          } else {
            row += ' ';
          }
        }
        frameText += row + '\n';
      }
      console.log(frameText);

      time += 0.08;

      // Frame wait (~60ms, around 16 FPS)
      await new Promise((resolve) => setTimeout(resolve, 60));
    }

    // Restore stdin
    process.stdin.off('data', handleKey);
    process.stdin.setRawMode(wasRaw);
    process.stdin.pause();

    await pause('Rendering stopped. Press Enter to return to Ray Marcher menu...');
  }
}
