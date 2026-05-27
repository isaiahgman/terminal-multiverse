import chalk from 'chalk';
import boxen from 'boxen';
import readline from 'readline';

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
