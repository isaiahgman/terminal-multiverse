import chalk from 'chalk';
import { clearScreen, printHeader, prompt, pause, selectMenuOption, hideCursor, showCursor, cursorToHome, enterAlternateBuffer, exitAlternateBuffer } from '../../utils/cli.js';
import { generateMaze, solveMazeBFS } from './core.js';

export async function run(): Promise<void> {
  let running = true;
  while (running) {
    const menuOptions = [
      { name: 'Animate Maze Solving (BFS Search)', description: 'Generate a maze and animate the shortest path finder' }
    ];

    const idx = await selectMenuOption(
      '🕸️ Maze Generator & Solver',
      'Procedural maze creation and visual search-algorithm solver.',
      menuOptions
    );

    if (idx === menuOptions.length) {
      running = false;
      break;
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

    hideCursor();
    enterAlternateBuffer();
    clearScreen();

    // 1. Animate the search frontier expansion
    while (visitedCount < visited.length && !interrupted) {
      cursorToHome();
      let frameText = chalk.bold.magenta('🕸️ BFS Solver: Exploring Corridors...\n');
      frameText += chalk.dim('Controls: Press [q] to stop | Light blue denotes searched paths.\n\n');

      // Add a chunk of visited cells to show expansion
      const chunkSize = Math.max(1, Math.floor(visited.length / 40));
      for (let i = 0; i < chunkSize && visitedCount < visited.length; i++) {
        const [vx, vy] = visited[visitedCount];
        visitedSet.add(`${vx},${vy}`);
        visitedCount++;
      }

      // Render grid
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
      process.stdout.write(frameText);

      await new Promise((resolve) => setTimeout(resolve, 30));
    }

    // 2. Animate the final path trace
    if (!interrupted && solutionPath.length > 0) {
      const pathSet = new Set<string>();
      for (let i = 0; i < solutionPath.length && !interrupted; i++) {
        cursorToHome();
        let frameText = chalk.bold.green('🕸️ BFS Solver: Shortest Path Found!\n');
        frameText += chalk.dim(`Path Length: ${solutionPath.length} steps\n\n`);

        const [px, py] = solutionPath[i];
        pathSet.add(`${px},${py}`);

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
        process.stdout.write(frameText);

        await new Promise((resolve) => setTimeout(resolve, 20));
      }
    }

    exitAlternateBuffer();
    showCursor();

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
