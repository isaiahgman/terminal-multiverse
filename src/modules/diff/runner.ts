import chalk from 'chalk';
import { clearScreen, printHeader, prompt, pause, selectMenuOption } from '../../utils/cli.js';
import { computeDiff, alignSideBySide, DiffItem } from './core.js';

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
    const diff = computeDiff(textA, textB);
    const diffOutput = viewMode === 'unified' ? renderUnifiedDiff(diff) : renderSideBySideDiff(diff);

    const subtitleText = 
      `${chalk.bold('Active Comparison Source:')} ${chalk.yellow(currentPresetName)}\n` +
      `${chalk.bold('View Mode:')}               ${chalk.magenta(viewMode === 'side-by-side' ? 'Side-by-Side' : 'Unified Line-by-Line')}\n\n` +
      diffOutput;

    const menuOptions = [
      { name: 'Toggle View Mode', description: 'Switch between Side-by-Side and Unified' },
      { name: 'Load a Preset', description: 'Choose a pre-defined code, poetry, or JSON comparison' },
      { name: 'Enter Custom Texts', description: 'Input your own text blocks A and B manually' }
    ];

    const idx = await selectMenuOption(
      '🔍 Visual Diff Checker',
      subtitleText,
      menuOptions
    );

    if (idx === menuOptions.length) {
      running = false;
      break;
    }

    switch (idx) {
      case 0: {
        viewMode = viewMode === 'side-by-side' ? 'unified' : 'side-by-side';
        break;
      }
      case 1: {
        const keys = Object.keys(PRESETS);
        const presetOptions = keys.map((key) => ({
          name: PRESETS[key].name,
          description: 'Compare preset text pair'
        }));

        const presetIdx = await selectMenuOption(
          '🔍 Visual Diff - Select Preset',
          'Choose a preset text pair to view.',
          presetOptions
        );

        if (presetIdx < keys.length) {
          const key = keys[presetIdx];
          textA = PRESETS[key].textA;
          textB = PRESETS[key].textB;
          currentPresetName = PRESETS[key].name;
        }
        break;
      }
      case 2: {
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
    }
  }
}

function renderUnifiedDiff(diff: DiffItem[]): string {
  let output = chalk.gray('┌' + '─'.repeat(78) + '┐\n');
  for (const item of diff) {
    if (item.type === 'unchanged') {
      const lineNumStr = item.oldLineNumber?.toString().padStart(4, ' ') || '    ';
      output += chalk.gray(`│ ${lineNumStr}   ${item.value.padEnd(70, ' ').substring(0, 70)} │\n`);
    } else if (item.type === 'removed') {
      const lineNumStr = item.oldLineNumber?.toString().padStart(4, ' ') || '    ';
      const formatted = `│ ${lineNumStr} - ${item.value.padEnd(70, ' ').substring(0, 70)} │\n`;
      output += chalk.red(formatted);
    } else if (item.type === 'added') {
      const lineNumStr = item.newLineNumber?.toString().padStart(4, ' ') || '    ';
      const formatted = `│ ${lineNumStr} + ${item.value.padEnd(70, ' ').substring(0, 70)} │\n`;
      output += chalk.green(formatted);
    }
  }
  output += chalk.gray('└' + '─'.repeat(78) + '┘');
  return output;
}

function renderSideBySideDiff(diff: DiffItem[]): string {
  const aligned = alignSideBySide(diff);
  const colWidth = 36; // Left and Right halves are 36 chars wide

  let output = chalk.gray('┌' + '─'.repeat(colWidth + 2) + '┬' + '─'.repeat(colWidth + 2) + '┐\n');
  output +=
    chalk.gray('│') +
    chalk.bold.yellow(' Original Text'.padEnd(colWidth + 2, ' ')) +
    chalk.gray('│') +
    chalk.bold.yellow(' Modified Text'.padEnd(colWidth + 2, ' ')) +
    chalk.gray('│\n');
  output += chalk.gray('├' + '─'.repeat(colWidth + 2) + '┼' + '─'.repeat(colWidth + 2) + '┤\n');

  for (const row of aligned) {
    const leftStr = formatSideColumn(row.left, colWidth);
    const rightStr = formatSideColumn(row.right, colWidth);

    output +=
      chalk.gray('│ ') +
      leftStr +
      chalk.gray(' │ ') +
      rightStr +
      chalk.gray(' │\n');
  }
  output += chalk.gray('└' + '─'.repeat(colWidth + 2) + '┴' + '─'.repeat(colWidth + 2) + '┘');
  return output;
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
