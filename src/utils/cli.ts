import chalk from 'chalk';
import boxen from 'boxen';
import readline from 'readline';

// Initialize keypress event emission on process.stdin once at the top level
readline.emitKeypressEvents(process.stdin);

export function clearScreen(): void {
  // Clear the screen and reset cursor to home position
  process.stdout.write('\x1Bc');
}

export function printHeader(title: string, subtitle?: string): void {
  const content = subtitle ? `${chalk.bold.cyan(title)}\n${chalk.dim(subtitle)}` : chalk.bold.cyan(title);
  console.log(
    boxen(content, {
      padding: 1,
      margin: { top: 1, bottom: 1, left: 0, right: 0 },
      borderStyle: 'double',
      borderColor: 'magenta',
      float: 'left',
    })
  );
}

export function prompt(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export function pause(message: string = 'Press Enter to continue...'): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(chalk.dim(`\n${message}`), () => {
      rl.close();
      resolve();
    });
  });
}

export function selectMenuOption(
  title: string,
  subtitle: string,
  options: { name: string; description: string }[]
): Promise<number> {
  const count = options.length;
  const isTTY = typeof process.stdin.setRawMode === 'function';

  if (!isTTY) {
    // Non-TTY fallback: render as static list and prompt for number
    clearScreen();
    printHeader(title, subtitle);
    console.log(chalk.bold.magenta('Available Systems:'));
    options.forEach((opt, idx) => {
      console.log(`  ${chalk.cyan(String(idx + 1).padStart(2, ' '))}. ${chalk.bold.white(opt.name)} - ${chalk.dim(opt.description)}`);
    });
    console.log(`  ${chalk.cyan(' q')}. ${chalk.bold.red('Exit Console')}\n`);

    return new Promise(async (resolve) => {
      const selection = await prompt('Enter selection: ');
      if (selection.toLowerCase() === 'q') {
        resolve(count);
      } else {
        const idx = parseInt(selection, 10) - 1;
        if (isNaN(idx) || idx < 0 || idx >= count) {
          console.log(chalk.red('Invalid selection. Press Enter to retry.'));
          await pause();
          resolve(await selectMenuOption(title, subtitle, options)); // retry recursively
        } else {
          resolve(idx);
        }
      }
    });
  }

  // TTY implementation: Arrow Key navigation
  return new Promise((resolve) => {
    let selectedIdx = 0;

    const wasRaw = process.stdin.isRaw;
    process.stdin.setRawMode(true);
    process.stdin.resume();

    function renderMenu(isFirst: boolean = false): void {
      if (!isFirst) {
        const linesToMove = count + 2;
        process.stdout.write(`\x1B[${linesToMove}A\r\x1B[J`);
      }

      console.log(chalk.bold.magenta('Available Systems (Use ↑/↓ to navigate, Enter to run):'));
      options.forEach((opt, idx) => {
        if (idx === selectedIdx) {
          console.log(
            `  ${chalk.cyan('➔')} ${chalk.bold.green(opt.name)} - ${chalk.green(opt.description)}`
          );
        } else {
          console.log(
            `    ${chalk.white(opt.name)} - ${chalk.dim(opt.description)}`
          );
        }
      });

      if (selectedIdx === count) {
        console.log(`  ${chalk.cyan('➔')} ${chalk.bold.red('Exit Console')}`);
      } else {
        console.log(`    ${chalk.white('Exit Console')}`);
      }
    }

    clearScreen();
    printHeader(title, subtitle);
    renderMenu(true);

    const handleKeypress = (_str: string, key: { name: string; ctrl: boolean }): void => {
      if (key && key.ctrl && key.name === 'c') {
        cleanup();
        process.exit(0);
      }

      if (key && key.name === 'up') {
        selectedIdx = (selectedIdx - 1 + (count + 1)) % (count + 1);
        renderMenu();
      } else if (key && key.name === 'down') {
        selectedIdx = (selectedIdx + 1) % (count + 1);
        renderMenu();
      } else if (key && (key.name === 'return' || key.name === 'enter')) {
        cleanup();
        resolve(selectedIdx);
      } else if (key && key.name === 'q') {
        cleanup();
        resolve(count);
      }
    };

    function cleanup(): void {
      process.stdin.removeListener('keypress', handleKeypress);
      process.stdin.setRawMode(wasRaw);
      process.stdin.pause();
    }

    process.stdin.on('keypress', handleKeypress);
  });
}
