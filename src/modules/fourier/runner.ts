import chalk from 'chalk';
import { clearScreen, printHeader, prompt, pause } from '../../utils/cli.js';
import { generatePresetHarmonics, plotWaveOnGrid, Harmonic } from './core.js';

export async function run(): Promise<void> {
  let running = true;
  while (running) {
    clearScreen();
    printHeader('📈 Fourier Series Composition', 'Construct complex wave functions by summing sinusoidal harmonic frequencies.');

    console.log(`${chalk.bold('Select Synthesis Target:')}`);
    console.log(`  ${chalk.cyan('1')}. Square Wave (Odd harmonics)`);
    console.log(`  ${chalk.cyan('2')}. Sawtooth Wave (All harmonics)`);
    console.log(`  ${chalk.cyan('3')}. Triangle Wave (Alternating decaying harmonics)`);
    console.log(`  ${chalk.cyan('4')}. Custom Harmonic Layering`);
    console.log(`  ${chalk.cyan('q')}. Return to Main Menu\n`);

    const selection = await prompt('Select option or press q: ');
    if (selection.toLowerCase() === 'q') {
      running = false;
      break;
    }

    let harmonics: Harmonic[] = [];
    let name = '';

    if (selection === '1' || selection === '2' || selection === '3') {
      const type = selection === '1' ? 'square' : selection === '2' ? 'sawtooth' : 'triangle';
      name = selection === '1' ? 'Square Wave' : selection === '2' ? 'Sawtooth Wave' : 'Triangle Wave';

      const countInput = await prompt('Number of harmonics to compile (1 - 50, default 8): ');
      const count = countInput ? parseInt(countInput) : 8;

      harmonics = generatePresetHarmonics(type, count);
    } else if (selection === '4') {
      name = 'Custom Layered Wave';
      console.log(chalk.yellow('\nLayer your harmonics:'));
      let adding = true;
      while (adding) {
        const freqInput = await prompt(`Harmonic #${harmonics.length + 1} Frequency (Hz, e.g. 1, 2, 3, or 'd' if done): `);
        if (freqInput.toLowerCase() === 'd') {
          adding = false;
          break;
        }
        const freq = parseFloat(freqInput);
        if (isNaN(freq) || freq <= 0) {
          console.log(chalk.red('Invalid frequency.'));
          continue;
        }

        const ampInput = await prompt(`Harmonic #${harmonics.length + 1} Amplitude (e.g. 0.5): `);
        const amp = parseFloat(ampInput);
        if (isNaN(amp)) {
          console.log(chalk.red('Invalid amplitude.'));
          continue;
        }

        harmonics.push({ frequency: freq, amplitude: amp, phase: 0 });
        console.log(chalk.green(`Added harmonic: f=${freq}Hz, amp=${amp}`));
      }
    } else {
      console.log(chalk.red('Invalid selection. Press Enter to retry.'));
      await pause();
      continue;
    }

    if (harmonics.length === 0) {
      console.log(chalk.red('No harmonics defined. Press Enter to retry.'));
      await pause();
      continue;
    }

    clearScreen();
    console.log(chalk.cyan(`Wave Composition Engine: ${name}`));
    console.log(chalk.dim('Controls: Press [q] to stop the animation.'));
    await pause('Press Enter to start simulation...');

    // Stdin capture setup
    const wasRaw = process.stdin.isRaw;
    process.stdin.setRawMode(true);
    process.stdin.resume();

    let keepSimulating = true;
    let timeOffset = 0;

    const handleKey = (data: Buffer) => {
      const key = data.toString();
      if (key === 'q' || key === '\u0003') {
        keepSimulating = false;
      }
    };

    process.stdin.on('data', handleKey);

    const width = 75;
    const height = 25;
    const centerY = Math.floor(height / 2);

    while (keepSimulating) {
      clearScreen();
      console.log(chalk.bold.magenta(`📈 Fourier Waveform: ${name}`));
      console.log(
        chalk.dim(
          `Harmonics: ${harmonics.length} | Shift: ${(timeOffset * 360).toFixed(0)}° | Press [q] to quit`
        )
      );

      const grid = plotWaveOnGrid(harmonics, width, height, timeOffset);

      // Render grid with axis
      let frameText = '';
      for (let y = 0; y < height; y++) {
        let row = '';
        for (let x = 0; x < width; x++) {
          const char = grid[y][x];
          if (char === '#') {
            row += chalk.bold.cyan('o');
          } else if (y === centerY) {
            row += chalk.dim('-'); // Center axis
          } else {
            row += ' ';
          }
        }
        frameText += row + '\n';
      }
      console.log(frameText);

      // Scroll speed
      timeOffset += 0.015;

      await new Promise((resolve) => setTimeout(resolve, 40));
    }

    // Restore stdin
    process.stdin.off('data', handleKey);
    process.stdin.setRawMode(wasRaw);
    process.stdin.pause();

    await pause('Simulation ended. Press Enter to return to Fourier menu...');
  }
}
