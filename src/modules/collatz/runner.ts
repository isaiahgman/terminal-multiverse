import chalk from 'chalk';
import { clearScreen, printHeader, prompt, pause } from '../../utils/cli.js';
import { getCollatzSequence, generateCollatzAsciiPlot } from './core.js';

export async function run(): Promise<void> {
  let running = true;
  let currentNum = 27; // Famous starting number with 111 steps and a peak of 9232
  let useLogScale = true;

  while (running) {
    clearScreen();
    printHeader(
      '🔢 Collatz Conjecture Visualizer',
      'Visualize the "3n + 1" sequence behavior and its eventual decay to 1.'
    );

    console.log(`${chalk.bold('Configuration & Stats:')}`);
    console.log(`  ${chalk.yellow('Starting Number:')} ${currentNum}`);
    console.log(`  ${chalk.yellow('Scaling Mode:')}    ${useLogScale ? chalk.magenta('Logarithmic') : chalk.cyan('Linear')} (recommended for large peaks)`);
    console.log();

    let sequence: number[] = [];
    try {
      sequence = getCollatzSequence(currentNum);
    } catch (e: any) {
      console.log(chalk.red(`Error generating sequence: ${e.message}`));
    }

    if (sequence.length > 0) {
      const peak = Math.max(...sequence);
      const steps = sequence.length - 1; // Stopping time

      console.log(`${chalk.bold('Sequence Statistics:')}`);
      console.log(`  - Stopping Time (Steps to 1): ${chalk.greenBright(steps)}`);
      console.log(`  - Peak Value Reached:        ${chalk.greenBright(peak)}`);
      console.log();

      // Display sequence snippet
      let seqSnippet = '';
      if (sequence.length <= 15) {
        seqSnippet = sequence.join(' ➔ ');
      } else {
        const firstPart = sequence.slice(0, 7).join(' ➔ ');
        const lastPart = sequence.slice(-5).join(' ➔ ');
        seqSnippet = `${firstPart} ➔ ${chalk.dim('...')} ➔ ${lastPart}`;
      }
      console.log(`${chalk.bold('Sequence Pathway:')}`);
      console.log(`  ${seqSnippet}\n`);

      // Generate and render the ASCII plot
      const width = 80;
      const height = 18;
      const plot = generateCollatzAsciiPlot(sequence, width, height, useLogScale);

      console.log(`${chalk.bold('Trajectory Plot:')}`);
      console.log(chalk.gray('┌' + '─'.repeat(width) + '┐'));

      for (let r = 0; r < height; r++) {
        let rowContent = '';
        for (let c = 0; c < width; c++) {
          const char = plot[r][c];
          if (char === '█') {
            // Apply gradient color depending on the height
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
        console.log(chalk.gray('│') + rowContent + chalk.gray('│'));
      }
      console.log(chalk.gray('└' + '─'.repeat(width) + '┘'));
      console.log(chalk.dim(`  Left: Start (n=${currentNum}) ${' '.repeat(width - 32)} Right: Target (n=1)`));
    }

    console.log(`\n${chalk.bold('Menu Options:')}`);
    console.log(`  ${chalk.cyan('1.')} Input New Number`);
    console.log(`  ${chalk.cyan('2.')} Toggle Scale (Linear / Logarithmic)`);
    console.log(`  ${chalk.cyan('3.')} Try a famous number (e.g. 27, 871, 6171, 97)`);
    console.log(`  ${chalk.cyan('q.')} Return to Main Menu\n`);

    const selection = await prompt('Select an option: ');
    const choice = selection.trim().toLowerCase();

    if (choice === 'q') {
      running = false;
      break;
    }

    switch (choice) {
      case '1': {
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
      case '2': {
        useLogScale = !useLogScale;
        break;
      }
      case '3': {
        clearScreen();
        printHeader('🔢 Collatz - Famous Starting Numbers', 'Select a notable number with interesting dynamics.');
        console.log(`  ${chalk.cyan('1.')} ${chalk.bold('27')}    - Steps: 111 | Peak: 9,232 (spikes dramatically)`);
        console.log(`  ${chalk.cyan('2.')} ${chalk.bold('97')}    - Steps: 118 | Peak: 9,232`);
        console.log(`  ${chalk.cyan('3.')} ${chalk.bold('871')}   - Steps: 178 | Peak: 190,996`);
        console.log(`  ${chalk.cyan('4.')} ${chalk.bold('6171')}  - Steps: 261 | Peak: 2,634,800`);
        console.log(`  ${chalk.cyan('5.')} ${chalk.bold('1023')}  - Steps: 311 | Peak: 104,788`);
        console.log(`  ${chalk.cyan('b.')} Back\n`);

        const pSel = await prompt('Select a number: ');
        const cleanPSel = pSel.trim().toLowerCase();
        if (cleanPSel === '1') currentNum = 27;
        else if (cleanPSel === '2') currentNum = 97;
        else if (cleanPSel === '3') currentNum = 871;
        else if (cleanPSel === '4') currentNum = 6171;
        else if (cleanPSel === '5') currentNum = 1023;
        break;
      }
      default:
        console.log(chalk.red('\nInvalid choice. Press Enter to retry.'));
        await pause();
        break;
    }
  }
}
