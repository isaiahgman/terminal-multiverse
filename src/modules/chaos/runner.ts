import chalk from 'chalk';
import { clearScreen, printHeader, prompt, pause, selectMenuOption } from '../../utils/cli.js';
import { getAttractorPoints, stepChaosGame } from './core.js';

export async function run(): Promise<void> {
  let running = true;
  while (running) {
    const menuOptions = [
      { name: 'Sierpinski Triangle', description: '3 Attractors, Ratio 0.5 (Classic Triangle)' },
      { name: 'Chaos Pentagram', description: '5 Attractors, Ratio 0.618 (Golden Web)' }
    ];

    const idx = await selectMenuOption(
      '📐 Chaos Game Fractal Generator',
      'Emergent geometry via random navigation between attractors.',
      menuOptions
    );

    if (idx === menuOptions.length) {
      running = false;
      break;
    }

    const attractorCount = idx === 1 ? 5 : 3;
    const ratio = idx === 1 ? 0.618 : 0.5;
    const label = idx === 1 ? 'Chaos Pentagram' : 'Sierpinski Triangle';

    const width = 75;
    const height = 30;

    const attractors = getAttractorPoints(attractorCount, width, height);

    clearScreen();
    console.log(chalk.cyan(`Preparing Chaos Game: ${label}`));
    console.log(chalk.dim('Controls: Press [q] to stop the simulation.'));
    await pause('Press Enter to start...');

    // Stdin capture setup
    const wasRaw = process.stdin.isRaw;
    process.stdin.setRawMode(true);
    process.stdin.resume();

    let keepSimulating = true;
    let currentPoint: [number, number] = [width / 2, height / 2];

    const handleKey = (data: Buffer) => {
      const key = data.toString();
      if (key === 'q' || key === '\u0003') {
        keepSimulating = false;
      }
    };

    process.stdin.on('data', handleKey);

    // Grid representing painted pixels.
    // 0 = empty, 1 = plotted point, 2 = attractor
    const grid: number[][] = Array.from({ length: height }, () => Array(width).fill(0));

    // Place attractors
    attractors.forEach(([x, y]) => {
      const ix = Math.floor(x);
      const iy = Math.floor(y);
      if (iy >= 0 && iy < height && ix >= 0 && ix < width) {
        grid[iy][ix] = 2;
      }
    });

    let totalPoints = 0;

    while (keepSimulating) {
      clearScreen();
      console.log(chalk.bold.magenta(`📐 Chaos Game: ${label}`));
      console.log(chalk.dim(`Points Plotted: ${totalPoints} | Press [q] to stop`));

      // Plot 150 new points per frame
      for (let i = 0; i < 150; i++) {
        currentPoint = stepChaosGame(currentPoint, attractors, ratio);
        const px = Math.floor(currentPoint[0]);
        const py = Math.floor(currentPoint[1]);

        if (py >= 0 && py < height && px >= 0 && px < width) {
          if (grid[py][px] === 0) {
            grid[py][px] = 1;
            totalPoints++;
          }
        }
      }

      // Draw grid
      let frameText = '';
      for (let y = 0; y < height; y++) {
        let row = '';
        for (let x = 0; x < width; x++) {
          const val = grid[y][x];
          if (val === 2) {
            row += chalk.yellow('▲'); // Attractor point
          } else if (val === 1) {
            // Draw points. Let's color based on distance to nearest attractor
            row += chalk.cyan('.');
          } else {
            row += ' ';
          }
        }
        frameText += row + '\n';
      }
      console.log(frameText);

      // Frame wait (~50ms)
      await new Promise((resolve) => setTimeout(resolve, 50));

      if (totalPoints > 8000) {
        console.log(chalk.yellow('\nMax points reached! Simulation stabilized. Press [q] to exit.'));
      }
    }

    // Restore stdin
    process.stdin.off('data', handleKey);
    process.stdin.setRawMode(wasRaw);
    process.stdin.pause();

    await pause('Simulation ended. Press Enter to return to Chaos Game menu...');
  }
}
