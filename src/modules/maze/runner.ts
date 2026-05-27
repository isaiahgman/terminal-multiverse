import chalk from 'chalk';
import { clearScreen, printHeader, prompt, pause } from '../../utils/cli.js';
import { generateMaze, solveMazeBFS } from './core.js';

export async function run(): Promise<void> {
  let running = true;
  while (running) {
    clearScreen();
    printHeader('🕸️ Maze Generator & Solver', 'Procedural maze creation and visual search-algorithm solver.');

    console.log(`${chalk.bold('Options:')}`);
    console.log(`  ${chalk.cyan('1')}. Animate Maze Solving (BFS Search)`);
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

    const width = 45;
    const height = 19;

    console.log(chalk.yellow('\nGenerating perfect maze...'));
    const maze = generateMaze(width, height);

    const start: [number, number] = [1, 1];
    const end: [number, number] = [width - 2, height - 2];

    // Ensure start/end are open paths
    maze[start[1]][start[0]] = 0;
    maze[end[1]][end[0]] = 0;

    console.log(chalk.yellow('Computing BFS shortest path...'));
    const { path: solutionPath, visited } = solveMazeBFS(maze, start, end);

    clearScreen();
    console.log(chalk.cyan('Maze ready!'));
    console.log(chalk.dim('We will animate the BFS expansion searching the corridors, then trace the final path.'));
    await pause('Press Enter to start solver animation...');

    // Animation variables
    let visitedCount = 0;
    const visitedSet = new Set<string>();

    const wasRaw = process.stdin.isRaw;
    process.stdin.setRawMode(true);
    process.stdin.resume();

    let interrupted = false;
    const handleKey = (data: Buffer) => {
      const key = data.toString();
      if (key === 'q' || key === '\u0003') {
        interrupted = true;
      }
    };
    process.stdin.on('data', handleKey);

    // 1. Animate the search frontier expansion
    while (visitedCount < visited.length && !interrupted) {
      clearScreen();
      console.log(chalk.bold.magenta('🕸️ BFS Solver: Exploring Corridors...'));
      console.log(chalk.dim('Controls: Press [q] to stop | Light blue denotes searched paths.'));

      // Add a chunk of visited cells to show expansion
      const chunkSize = Math.max(1, Math.floor(visited.length / 40));
      for (let i = 0; i < chunkSize && visitedCount < visited.length; i++) {
        const [vx, vy] = visited[visitedCount];
        visitedSet.add(`${vx},${vy}`);
        visitedCount++;
      }

      // Render grid
      let frameText = '';
      for (let y = 0; y < height; y++) {
        let row = '';
        for (let x = 0; x < width; x++) {
          if (x === start[0] && y === start[1]) {
            row += chalk.bold.green('S'); // Start
          } else if (x === end[0] && y === end[1]) {
            row += chalk.bold.red('E'); // End
          } else if (maze[y][x] === 1) {
            row += chalk.gray('█'); // Wall
          } else if (visitedSet.has(`${x},${y}`)) {
            row += chalk.blueBright('.'); // Explored frontier
          } else {
            row += ' '; // Unexplored path
          }
        }
        frameText += row + '\n';
      }
      console.log(frameText);

      await new Promise((resolve) => setTimeout(resolve, 30));
    }

    // 2. Animate the final path trace
    if (!interrupted && solutionPath.length > 0) {
      const pathSet = new Set<string>();
      for (let i = 0; i < solutionPath.length && !interrupted; i++) {
        clearScreen();
        console.log(chalk.bold.green('🕸️ BFS Solver: Shortest Path Found!'));
        console.log(chalk.dim(`Path Length: ${solutionPath.length} steps`));

        const [px, py] = solutionPath[i];
        pathSet.add(`${px},${py}`);

        let frameText = '';
        for (let y = 0; y < height; y++) {
          let row = '';
          for (let x = 0; x < width; x++) {
            if (x === start[0] && y === start[1]) {
              row += chalk.bold.green('S');
            } else if (x === end[0] && y === end[1]) {
              row += chalk.bold.red('E');
            } else if (pathSet.has(`${x},${y}`)) {
              row += chalk.bold.yellow('x'); // Final path
            } else if (maze[y][x] === 1) {
              row += chalk.gray('█');
            } else if (visitedSet.has(`${x},${y}`)) {
              row += chalk.dim('.');
            } else {
              row += ' ';
            }
          }
          frameText += row + '\n';
        }
        console.log(frameText);

        await new Promise((resolve) => setTimeout(resolve, 20));
      }
    }

    // Cleanup stdin
    process.stdin.off('data', handleKey);
    process.stdin.setRawMode(wasRaw);
    process.stdin.pause();

    if (interrupted) {
      console.log(chalk.red('\nAnimation interrupted.'));
    }

    await pause();
  }
}
