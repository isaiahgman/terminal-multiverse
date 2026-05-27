import chalk from 'chalk';
import { clearScreen, printHeader, prompt, pause, selectMenuOption, hideCursor, showCursor, cursorToHome, enterAlternateBuffer, exitAlternateBuffer } from '../../utils/cli.js';
import { generatePresetHarmonics, plotWaveOnGrid, Harmonic } from './core.js';

export async function run(): Promise<void> {
  let running = true;
  while (running) {
    const menuOptions = [
      { name: 'Square Wave', description: 'Odd harmonics summation (sin(x) + sin(3x)/3 + ...)' },
      { name: 'Sawtooth Wave', description: 'All harmonics summation (sin(x) - sin(2x)/2 + ...)' },
      { name: 'Triangle Wave', description: 'Alternating decaying harmonics (sin(x) - sin(3x)/9 + ...)' },
      { name: 'Custom Harmonic Layering', description: 'Manually layer individual sine frequencies' }
    ];

    const idx = await selectMenuOption(
      '📈 Fourier Series Composition',
      'Construct complex wave functions by summing sinusoidal harmonic frequencies.',
      menuOptions
    );

    if (idx === menuOptions.length) {
      running = false;
      break;
    }

    let harmonics: Harmonic[] = [];
    let name = '';

    if (idx === 0 || idx === 1 || idx === 2) {
      const type = idx === 0 ? 'square' : idx === 1 ? 'sawtooth' : 'triangle';
      name = idx === 0 ? 'Square Wave' : idx === 1 ? 'Sawtooth Wave' : 'Triangle Wave';

      clearScreen();
      printHeader(`📈 Compile Preset: ${name}`, 'Define the target frequency resolution.');
      const countInput = await prompt('Number of harmonics to compile (1 - 50, default 8): ');
      const count = countInput ? parseInt(countInput) : 8;

      harmonics = generatePresetHarmonics(type, count);
    } else if (idx === 3) {
      name = 'Custom Layered Wave';
      clearScreen();
      printHeader('📈 Custom Wave Layering', 'Define custom frequency elements.');
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

    hideCursor();
    enterAlternateBuffer();
    clearScreen();

    while (keepSimulating) {
      cursorToHome();
      let frameText = chalk.bold.magenta(`📈 Fourier Waveform: ${name}\n`);
      frameText += chalk.dim(
        `Harmonics: ${harmonics.length} | Shift: ${(timeOffset * 360).toFixed(0)}° | Press [q] to quit\n\n`
      );

      const grid = plotWaveOnGrid(harmonics, width, height, timeOffset);

      // Render grid with axis
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
      process.stdout.write(frameText);

      // Scroll speed
      timeOffset += 0.015;

      await new Promise((resolve) => setTimeout(resolve, 40));
    }

    exitAlternateBuffer();
    showCursor();

    // Restore stdin
    process.stdin.off('data', handleKey);
    process.stdin.setRawMode(wasRaw);
    process.stdin.pause();

    await pause('Simulation ended. Press Enter to return to Fourier menu...');
  }
}
