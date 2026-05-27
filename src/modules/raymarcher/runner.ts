import chalk from 'chalk';
import {
  clearScreen,
  printHeader,
  prompt,
  pause,
  selectMenuOption,
  hideCursor,
  showCursor,
  cursorToHome,
  enterAlternateBuffer,
  exitAlternateBuffer,
} from '../../utils/cli.js';
import { renderFrame } from './core.js';

export async function run(): Promise<void> {
  let running = true;
  while (running) {
    const menuOptions = [
      { name: 'Rotating Torus (Donut)', description: 'Math-based rotating torus render' },
      {
        name: 'Deforming Organic Sphere',
        description: 'Interactive blobby coordinate deformation',
      },
    ];

    const idx = await selectMenuOption(
      '🕶️ Text-Based 3D Ray Marcher',
      'Real-time math-based 3D renderer running in your terminal.',
      menuOptions,
    );

    if (idx === menuOptions.length) {
      running = false;
      break;
    }

    const shape = idx === 1 ? ('sphere' as const) : ('torus' as const);
    const label = idx === 1 ? 'Deforming Sphere' : 'Rotating Torus';

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

    hideCursor();
    enterAlternateBuffer();
    clearScreen();

    while (keepRunning) {
      cursorToHome();

      let frameContent = chalk.bold.magenta(`🕶️ Ray Marcher Scene: ${label}\n`);
      frameContent += chalk.dim(`Frame Angle: ${(time * 50).toFixed(0)}° | Press [q] to quit\n\n`);

      const grid = renderFrame(width, height, time, shape);

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
        frameContent += row + '\n';
      }

      process.stdout.write(frameContent);

      time += 0.08;

      // Frame wait (~60ms, around 16 FPS)
      await new Promise((resolve) => setTimeout(resolve, 60));
    }

    exitAlternateBuffer();
    showCursor();

    // Restore stdin
    process.stdin.off('data', handleKey);
    process.stdin.setRawMode(wasRaw);
    process.stdin.pause();

    await pause('Rendering stopped. Press Enter to return to Ray Marcher menu...');
  }
}
