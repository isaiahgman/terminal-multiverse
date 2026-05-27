import chalk from 'chalk';
import { clearScreen, printHeader, prompt, pause } from '../../utils/cli.js';
import { encryptString, EnigmaConfig } from './core.js';

export async function run(): Promise<void> {
  // Default configuration
  let config: EnigmaConfig = {
    rotors: ['I', 'II', 'III'],
    positions: ['A', 'A', 'A'],
    plugboard: '',
    reflector: 'B',
  };

  let running = true;

  while (running) {
    clearScreen();
    printHeader('🔐 Enigma Machine Simulator', 'A simulated 3-rotor Enigma I/M3 encryption machine.');

    console.log(`${chalk.bold('Current Configuration:')}`);
    console.log(`  ${chalk.yellow('Rotors:')} Left: ${config.rotors[0]} | Middle: ${config.rotors[1]} | Right: ${config.rotors[2]}`);
    console.log(`  ${chalk.yellow('Rotor Positions:')} [ ${config.positions.join(' ')} ]`);
    console.log(`  ${chalk.yellow('Plugboard:')} ${config.plugboard || chalk.dim('None (direct wiring)')}`);
    console.log(`  ${chalk.yellow('Reflector:')} Reflector ${config.reflector}`);
    console.log();

    console.log(`${chalk.bold('Menu Options:')}`);
    console.log(`  ${chalk.cyan('1.')} Configure Rotors (Select I, II, III order)`);
    console.log(`  ${chalk.cyan('2.')} Set Initial Positions (e.g., AAA)`);
    console.log(`  ${chalk.cyan('3.')} Set Plugboard Pairs (e.g., AB CD EF)`);
    console.log(`  ${chalk.cyan('4.')} Encrypt / Decrypt a Message`);
    console.log(`  ${chalk.cyan('5.')} Reset Positions to Initial (or set new ones)`);
    console.log(`  ${chalk.cyan('q.')} Return to Main Menu\n`);

    const choice = await prompt('Select an option: ');
    const normalizedChoice = choice.trim().toLowerCase();

    if (normalizedChoice === 'q') {
      running = false;
      break;
    }

    switch (normalizedChoice) {
      case '1': {
        clearScreen();
        printHeader('🔐 Enigma - Configure Rotors', 'Choose the rotors for Left, Middle, and Right positions.');
        console.log('Available Rotors: I, II, III');
        console.log('Example input: I II III  (Left: I, Middle: II, Right: III)\n');
        const rotorInput = await prompt('Enter 3 rotor names separated by space: ');
        const rotors = rotorInput.toUpperCase().trim().split(/\s+/);
        if (
          rotors.length === 3 &&
          rotors.every((r) => ['I', 'II', 'III'].includes(r))
        ) {
          config.rotors = rotors as [string, string, string];
          console.log(chalk.green('\nRotors configured successfully!'));
        } else {
          console.log(chalk.red('\nInvalid rotors configuration. Must be three values of I, II, or III.'));
        }
        await pause();
        break;
      }

      case '2': {
        clearScreen();
        printHeader('🔐 Enigma - Set Initial Positions', 'Set the starting letter for each rotor (A-Z).');
        const posInput = await prompt('Enter 3-letter starting position (e.g., AAA): ');
        const cleanPos = posInput.toUpperCase().trim();
        if (cleanPos.length === 3 && /^[A-Z]{3}$/.test(cleanPos)) {
          config.positions = [cleanPos[0], cleanPos[1], cleanPos[2]];
          console.log(chalk.green('\nRotor starting positions set!'));
        } else {
          console.log(chalk.red('\nInvalid positions. Must be exactly 3 alphabetic letters.'));
        }
        await pause();
        break;
      }

      case '3': {
        clearScreen();
        printHeader('🔐 Enigma - Set Plugboard Pairs', 'Map pairs of letters to swap them. Letters cannot be reused.');
        console.log('Format: space-separated pairs of letters, e.g., "AB CD EF"');
        console.log('Leave empty to clear all plugboard connections.\n');
        const pbInput = await prompt('Enter plugboard pairs: ');
        try {
          // Just validating using the parse function
          const cleanPb = pbInput.toUpperCase().trim();
          // We call encryptString with empty string just to trigger plugboard parsing/validation
          encryptString('', { ...config, plugboard: cleanPb });
          config.plugboard = cleanPb;
          console.log(chalk.green('\nPlugboard wiring updated!'));
        } catch (e: any) {
          console.log(chalk.red(`\nError: ${e.message}`));
        }
        await pause();
        break;
      }

      case '4': {
        clearScreen();
        printHeader('🔐 Enigma - Encrypt / Decrypt Message', 'Enigma is symmetric; running the ciphertext through the same setup decrypts it.');
        const plaintext = await prompt('Enter message to process: ');
        if (!plaintext) {
          console.log(chalk.yellow('\nEmpty message. Operation cancelled.'));
          await pause();
          break;
        }

        console.log(chalk.dim('\nProcessing...'));
        const result = encryptString(plaintext, config);
        
        console.log('\n----------------------------------------');
        console.log(`${chalk.bold('Input Text:')}  ${plaintext}`);
        console.log(`${chalk.bold('Result:    ')}  ${chalk.greenBright(result.ciphertext)}`);
        console.log(`\n${chalk.dim(`Final rotor positions: [ ${result.finalPositions.join(' ')} ]`)}`);
        console.log('----------------------------------------');

        const keepPositions = await prompt('\nApply final rotor positions for subsequent runs? (y/N): ');
        if (keepPositions.toLowerCase().startsWith('y')) {
          config.positions = result.finalPositions;
          console.log(chalk.green('Positions updated.'));
        } else {
          console.log(chalk.yellow('Positions reverted to original configuration.'));
        }
        await pause();
        break;
      }

      case '5': {
        clearScreen();
        printHeader('🔐 Enigma - Reset Rotor Positions', 'Reset positions back to A A A.');
        config.positions = ['A', 'A', 'A'];
        console.log(chalk.green('\nRotor positions reset to A A A.'));
        await pause();
        break;
      }

      default:
        console.log(chalk.red('\nInvalid choice. Press Enter to try again.'));
        await pause();
        break;
    }
  }
}
