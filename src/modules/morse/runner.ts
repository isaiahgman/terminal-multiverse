import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { clearScreen, printHeader, prompt, pause } from '../../utils/cli.js';
import { textToMorse, generateMorseWavBuffer } from './core.js';

export async function run(): Promise<void> {
  let running = true;
  while (running) {
    clearScreen();
    printHeader('🔊 Web Audio Morse Wave Exporter', 'Translate text to international Morse Code and export as a playable .wav audio file.');

    console.log(`${chalk.bold('Options:')}`);
    console.log(`  ${chalk.cyan('1')}. Translate & Export Morse Audio`);
    console.log(`  ${chalk.cyan('q')}. Return to Main Menu\n`);

    const selection = await prompt('Select option or press q: ');
    if (selection.toLowerCase() === 'q') {
      running = false;
      break;
    }

    if (selection !== '1') {
      console.log(chalk.red('Invalid selection. Press Enter to retry.'));
      await pause();
      continue;
    }

    clearScreen();
    printHeader('🔊 Translate & Export Morse Audio');

    const input = await prompt('Enter text to translate (letters & numbers only): ');
    if (!input) {
      console.log(chalk.red('Input cannot be empty. Press Enter to retry.'));
      await pause();
      continue;
    }

    const morse = textToMorse(input);
    console.log(`\n${chalk.bold('Input Text:')}   ${chalk.white(input)}`);
    console.log(`${chalk.bold('Morse Code:')}   ${chalk.yellow(morse)}\n`);

    const shouldExport = await prompt('Export to .wav file? (y/n, default y): ');
    if (shouldExport.toLowerCase() === 'n') {
      await pause();
      continue;
    }

    let fileName = await prompt('Enter output file name (default "morse.wav"): ');
    if (!fileName) {
      fileName = 'morse.wav';
    }
    if (!fileName.endsWith('.wav')) {
      fileName += '.wav';
    }

    // Save in scratch directory to avoid clutter
    const outputDir = '/Users/isaiahgathala/.gemini/antigravity/scratch/terminal-multiverse';
    const outputPath = path.join(outputDir, fileName);

    console.log(chalk.yellow('\nGenerating PCM audio samples...'));
    const buffer = generateMorseWavBuffer(morse);

    try {
      console.log(chalk.yellow(`Writing WAV data to file: ${outputPath}...`));
      fs.writeFileSync(outputPath, buffer);
      console.log(chalk.bold.green(`\nSuccess! Playable audio file exported.`));
      console.log(`${chalk.dim('Path:')} ${chalk.cyan(outputPath)}`);
      console.log(`${chalk.dim('Audio Info:')} 8000Hz Sample Rate | Mono | 8-bit PCM`);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.log(chalk.red(`Failed to write file: ${errMsg}`));
    }

    await pause();
  }
}
