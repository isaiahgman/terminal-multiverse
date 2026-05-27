import chalk from 'chalk';
import { clearScreen, printHeader, prompt, pause } from '../../utils/cli.js';
import { computeDiff, alignSideBySide, DiffItem, SideBySideLine } from './core.js';

interface DiffPreset {
  name: string;
  textA: string;
  textB: string;
}

const PRESETS: Record<string, DiffPreset> = {
  code: {
    name: 'Code Refactoring (TypeScript)',
    textA: `function calculateTotal(price, tax) {\n  const total = price + (price * tax);\n  return total;\n}`,
    textB: `// Calculate total price including tax\nfunction calculateTotal(price: number, tax: number): number {\n  return price * (1 + tax);\n}`,
  },
  poetry: {
    name: 'Poem Revision (Robert Frost)',
    textA: `The woods are lovely, dark and deep,\nBut I have promises to keep,\nAnd miles to go before I sleep.`,
    textB: `The woods are lovely, dark and deep,\nBut I have promises to keep,\nAnd miles to go before I sleep,\nAnd dreams to chase before I sleep.`,
  },
  json: {
    name: 'JSON Configuration Update',
    textA: `{\n  "name": "myapp",\n  "version": "1.0.0",\n  "debug": true\n}`,
    textB: `{\n  "name": "myapp",\n  "version": "1.1.0",\n  "debug": false,\n  "theme": "dark"\n}`,
  },
};

export async function run(): Promise<void> {
  let running = true;
  let textA = PRESETS.code.textA;
  let textB = PRESETS.code.textB;
  let currentPresetName = PRESETS.code.name;
  let viewMode: 'side-by-side' | 'unified' = 'side-by-side';

  while (running) {
    clearScreen();
    printHeader('🔍 Visual Diff Checker', 'Compare text blocks and identify added, removed, or modified lines.');

    console.log(`${chalk.bold('Active Comparison Source:')} ${chalk.yellow(currentPresetName)}`);
    console.log(`${chalk.bold('View Mode:')}               ${chalk.magenta(viewMode === 'side-by-side' ? 'Side-by-Side' : 'Unified Line-by-Line')}`);
    console.log();

    // Render diff
    const diff = computeDiff(textA, textB);

    if (viewMode === 'unified') {
      renderUnifiedDiff(diff);
    } else {
      renderSideBySideDiff(diff);
    }

    console.log(`\n${chalk.bold('Menu Options:')}`);
    console.log(`  ${chalk.cyan('1.')} Toggle View Mode (Side-by-Side / Unified)`);
    console.log(`  ${chalk.cyan('2.')} Load a Preset Comparison`);
    console.log(`  ${chalk.cyan('3.')} Enter Custom Text A and Text B`);
    console.log(`  ${chalk.cyan('q.')} Return to Main Menu\n`);

    const selection = await prompt('Select an option: ');
    const choice = selection.trim().toLowerCase();

    if (choice === 'q') {
      running = false;
      break;
    }

    switch (choice) {
      case '1': {
        viewMode = viewMode === 'side-by-side' ? 'unified' : 'side-by-side';
        break;
      }
      case '2': {
        clearScreen();
        printHeader('🔍 Visual Diff - Select Preset', 'Choose a preset text pair to view.');
        const keys = Object.keys(PRESETS);
        keys.forEach((key, idx) => {
          console.log(`  ${chalk.cyan(idx + 1)}. ${PRESETS[key].name}`);
        });
        console.log(`  ${chalk.cyan('b.')} Back\n`);

        const presetChoice = await prompt('Select preset: ');
        const cleanChoice = presetChoice.trim().toLowerCase();
        if (cleanChoice === 'b') {
          break;
        }
        const idx = parseInt(cleanChoice) - 1;
        if (!isNaN(idx) && idx >= 0 && idx < keys.length) {
          const key = keys[idx];
          textA = PRESETS[key].textA;
          textB = PRESETS[key].textB;
          currentPresetName = PRESETS[key].name;
        } else {
          console.log(chalk.red('\nInvalid selection. Press Enter to retry.'));
          await pause();
        }
        break;
      }
      case '3': {
        clearScreen();
        printHeader('🔍 Visual Diff - Enter Text A', 'Enter original text. Type :done on a new line when finished.');
        const linesA: string[] = [];
        let readingA = true;
        while (readingA) {
          const line = await prompt(`${linesA.length + 1}> `);
          if (line === ':done') {
            readingA = false;
          } else {
            linesA.push(line);
          }
        }

        clearScreen();
        printHeader('🔍 Visual Diff - Enter Text B', 'Enter new modified text. Type :done on a new line when finished.');
        const linesB: string[] = [];
        let readingB = true;
        while (readingB) {
          const line = await prompt(`${linesB.length + 1}> `);
          if (line === ':done') {
            readingB = false;
          } else {
            linesB.push(line);
          }
        }

        textA = linesA.join('\n');
        textB = linesB.join('\n');
        currentPresetName = 'Custom Text Entry';
        console.log(chalk.green('\nCustom text updated successfully!'));
        await pause();
        break;
      }
      default:
        console.log(chalk.red('\nInvalid choice. Press Enter to retry.'));
        await pause();
        break;
    }
  }
}

function renderUnifiedDiff(diff: DiffItem[]): void {
  console.log(chalk.gray('┌' + '─'.repeat(78) + '┐'));
  for (const item of diff) {
    if (item.type === 'unchanged') {
      const lineNumStr = item.oldLineNumber?.toString().padStart(4, ' ') || '    ';
      console.log(chalk.gray(`│ ${lineNumStr}   ${item.value.padEnd(70, ' ').substring(0, 70)} │`));
    } else if (item.type === 'removed') {
      const lineNumStr = item.oldLineNumber?.toString().padStart(4, ' ') || '    ';
      const formatted = `│ ${lineNumStr} - ${item.value.padEnd(70, ' ').substring(0, 70)} │`;
      console.log(chalk.red(formatted));
    } else if (item.type === 'added') {
      const lineNumStr = item.newLineNumber?.toString().padStart(4, ' ') || '    ';
      const formatted = `│ ${lineNumStr} + ${item.value.padEnd(70, ' ').substring(0, 70)} │`;
      console.log(chalk.green(formatted));
    }
  }
  console.log(chalk.gray('└' + '─'.repeat(78) + '┘'));
}

function renderSideBySideDiff(diff: DiffItem[]): void {
  const aligned = alignSideBySide(diff);
  const colWidth = 36; // Left and Right halves are 36 chars wide

  console.log(chalk.gray('┌' + '─'.repeat(colWidth + 2) + '┬' + '─'.repeat(colWidth + 2) + '┐'));
  console.log(
    chalk.gray('│') +
      chalk.bold.yellow(' Original Text'.padEnd(colWidth + 2, ' ')) +
      chalk.gray('│') +
      chalk.bold.yellow(' Modified Text'.padEnd(colWidth + 2, ' ')) +
      chalk.gray('│')
  );
  console.log(chalk.gray('├' + '─'.repeat(colWidth + 2) + '┼' + '─'.repeat(colWidth + 2) + '┤'));

  for (const row of aligned) {
    const leftStr = formatSideColumn(row.left, colWidth);
    const rightStr = formatSideColumn(row.right, colWidth);

    console.log(
      chalk.gray('│ ') +
        leftStr +
        chalk.gray(' │ ') +
        rightStr +
        chalk.gray(' │')
    );
  }
  console.log(chalk.gray('└' + '─'.repeat(colWidth + 2) + '┴' + '─'.repeat(colWidth + 2) + '┘'));
}

function formatSideColumn(
  side: { lineNumber: number; value: string; type: 'removed' | 'added' | 'unchanged' } | undefined,
  width: number
): string {
  if (!side) {
    return ' '.repeat(width);
  }

  const prefix = `[${side.lineNumber}] `.padStart(6, ' '); // Line number prefix
  const remainingWidth = width - prefix.length;
  
  let val = side.value;
  if (val.length > remainingWidth) {
    val = val.substring(0, remainingWidth - 3) + '...';
  } else {
    val = val.padEnd(remainingWidth, ' ');
  }

  const combined = prefix + val;

  if (side.type === 'removed') {
    return chalk.red(combined);
  } else if (side.type === 'added') {
    return chalk.green(combined);
  } else {
    return chalk.dim(combined);
  }
}
