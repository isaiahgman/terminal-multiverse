import chalk from 'chalk';
import { clearScreen, printHeader, prompt, pause, selectMenuOption } from '../../utils/cli.js';
import { getCollatzSequence, generateCollatzAsciiPlot } from './core.js';

export async function run(): Promise<void> {
  let running = true;
  let currentNum = 27; // Famous starting number with 111 steps and a peak of 9232
  let useLogScale = true;

  while (running) {
    let sequence: number[] = [];
    try {
      sequence = getCollatzSequence(currentNum);
    } catch (e: any) {
      console.log(chalk.red(`Error generating sequence: ${e.message}`));
    }

    let statsAndPlot = '';
    if (sequence.length > 0) {
      const peak = Math.max(...sequence);
      const steps = sequence.length - 1; // Stopping time

      // Display sequence snippet
      let seqSnippet = '';
      if (sequence.length <= 15) {
        seqSnippet = sequence.join(' ➔ ');
      } else {
        const firstPart = sequence.slice(0, 7).join(' ➔ ');
        const lastPart = sequence.slice(-5).join(' ➔ ');
        seqSnippet = `${firstPart} ➔ ${chalk.dim('...')} ➔ ${lastPart}`;
      }

      // Generate the ASCII plot
      const width = 80;
      const height = 18;
      const plot = generateCollatzAsciiPlot(sequence, width, height, useLogScale);

      let plotText = '';
      for (let r = 0; r < height; r++) {
        let rowContent = '';
        for (let c = 0; c < width; c++) {
          const char = plot[r][c];
          if (char === '█') {
            const heightRatio = (height - 1 - r) / (height - 1);
            if (heightRatio > 0.8) {
              rowContent += chalk.red(char);
            } else if (heightRatio > 0.5) {
              rowContent += chalk.yellow(char);
            } else if (heightRatio > 0.25) {
              rowContent += chalk.green(char);
            } else {
              rowContent += chalk.cyan(char);
            }
          } else {
            rowContent += ' ';
          }
        }
        plotText += chalk.gray('│') + rowContent + chalk.gray('│\n');
      }

      const borderLine = chalk.gray('├' + '─'.repeat(width) + '┤\n');
      const bottomBorder = chalk.gray('└' + '─'.repeat(width) + '┘\n');

      statsAndPlot = 
        `${chalk.yellow('Current Number:')} ${currentNum} | ${chalk.yellow('Scaling Mode:')} ${useLogScale ? 'Logarithmic' : 'Linear'}\n` +
        `${chalk.yellow('Stopping Time:')} ${chalk.greenBright(steps)} steps | ${chalk.yellow('Peak Reached:')} ${chalk.greenBright(peak)}\n\n` +
        `${chalk.bold('Sequence Pathway:')}\n  ${seqSnippet}\n\n` +
        `${chalk.bold('Trajectory Plot:')}\n` +
        borderLine +
        plotText +
        bottomBorder +
        chalk.dim(`  Left: Start (n=${currentNum}) ${' '.repeat(width - 32)} Right: Target (n=1)`);
    }

    const menuOptions = [
      { name: 'Input New Number', description: 'Enter a custom starting positive integer' },
      { name: 'Toggle Scale Mode', description: `Switch between Logarithmic and Linear rendering` },
      { name: 'Try a Famous Orbit', description: 'Select a notable Collatz starting seed' }
    ];

    const idx = await selectMenuOption(
      '🔢 Collatz Conjecture Visualizer',
      statsAndPlot,
      menuOptions
    );

    if (idx === menuOptions.length) {
      running = false;
      break;
    }

    switch (idx) {
      case 0: {
        clearScreen();
        printHeader('🔢 Collatz - Input Starting Seed');
        const input = await prompt('Enter a positive integer: ');
        const parsed = parseInt(input, 10);
        if (isNaN(parsed) || parsed <= 0) {
          console.log(chalk.red('\nInvalid input. Must be a positive integer.'));
          await pause();
        } else {
          currentNum = parsed;
        }
        break;
      }
      case 1: {
        useLogScale = !useLogScale;
        break;
      }
      case 2: {
        const famousOptions = [
          { name: '27', description: 'Steps: 111 | Peak: 9,232 (spikes dramatically)' },
          { name: '97', description: 'Steps: 118 | Peak: 9,232' },
          { name: '871', description: 'Steps: 178 | Peak: 190,996' },
          { name: '6171', description: 'Steps: 261 | Peak: 2,634,800' },
          { name: '1023', description: 'Steps: 311 | Peak: 104,788' }
        ];

        const pSel = await selectMenuOption(
          '🔢 Collatz - Famous Starting Numbers',
          'Select a notable number with interesting orbital dynamics.',
          famousOptions
        );

        if (pSel === 0) currentNum = 27;
        else if (pSel === 1) currentNum = 97;
        else if (pSel === 2) currentNum = 871;
        else if (pSel === 3) currentNum = 6171;
        else if (pSel === 4) currentNum = 1023;
        break;
      }
    }
  }
}
