import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
import { clearScreen, printHeader, prompt, pause } from './cli.js';

async function main(): Promise<void> {
  clearScreen();
  printHeader(
    '🛠️ Per-Repo Context Initializer',
    'Bootstraps a repository with standardized code guidelines and PR preferences, and submits a setup PR.'
  );

  // 1. Verify environment
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
  } catch {
    console.error(chalk.red('Error: Current directory is not a Git repository. Run "git init" first.'));
    await pause();
    process.exit(1);
  }

  try {
    execSync('gh auth status', { stdio: 'ignore' });
  } catch {
    console.error(chalk.red('Error: GitHub CLI ("gh") is not authenticated. Run "gh auth login" first.'));
    await pause();
    process.exit(1);
  }

  // 2. Gather preferences
  const projName = await prompt('Project Name (default "terminal-multiverse"): ') || 'terminal-multiverse';
  const projDesc = await prompt('Project Description: ') || 'A software engineering workspace.';
  
  console.log(chalk.cyan('\nWriting standard project context template...'));

  const contextTemplate = `# Project Context: ${projName}

## Core Architecture
- Description: ${projDesc}
- Codebases should maintain a modular structure where business logic (pure functions) is strictly separated from presentation layers.

## Development Standards
- **Strict Linting:** Format files on commit, enforce ESLint checks.
- **Pure Functions:** Core utilities must remain side-effect free and testable.
- **Testing:** Comprehensive unit test coverage using modern test runners.

## GitHub Pull Request Workflow
- All Pull Request descriptions in this repository MUST be formatted exactly with the following two main headers:
  - \`## Summary\`
  - \`## Changes\`
- Do not use other heading hierarchies or alternative names for these sections.
`;

  const contextPath = path.join(process.cwd(), '.project-context');
  fs.writeFileSync(contextPath, contextTemplate);
  console.log(chalk.green(`✓ Successfully generated .project-context at: ${contextPath}`));

  const makePr = await prompt('\nDo you want to stage, commit, push, and create a Pull Request on GitHub? (y/n, default y): ');
  if (makePr.toLowerCase() === 'n') {
    console.log(chalk.yellow('\nSetup completed locally. Exiting...'));
    await pause();
    return;
  }

  // 3. Automate Git / GitHub PR
  try {
    const branchName = 'setup/project-context';
    console.log(chalk.yellow(`\nCreating branch "${branchName}"...`));
    execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });

    console.log(chalk.yellow('Staging .project-context...'));
    execSync('git add .project-context', { stdio: 'inherit' });

    console.log(chalk.yellow('Committing configuration...'));
    execSync('git commit -m "chore: initialize project context configurations"', { stdio: 'inherit' });

    console.log(chalk.yellow('Pushing branch to remote origin...'));
    execSync(`git push origin ${branchName}`, { stdio: 'inherit' });

    console.log(chalk.yellow('Creating Pull Request on GitHub...'));
    
    const prBody = `## Summary
Initializes the per-repository context configuration containing coding guidelines and pull request formatting workflows.

## Changes
- Generated \`.project-context\` file in the root directory.`;

    // Write PR body to temp file to prevent escape characters issues in shell
    const tempPrBodyPath = path.join(process.cwd(), '.temp-pr-body.md');
    fs.writeFileSync(tempPrBodyPath, prBody);

    const prCreateCmd = `gh pr create --title "chore: initialize project context configuration" --body-file="${tempPrBodyPath}"`;
    const prUrl = execSync(prCreateCmd).toString().trim();
    
    // Clean up temp file
    fs.unlinkSync(tempPrBodyPath);

    console.log(chalk.bold.green(`\nPR Created Successfully! 🎉`));
    console.log(`URL: ${chalk.cyan(prUrl)}`);

    // Switch back to main
    console.log(chalk.dim('\nReturning local branch to main...'));
    execSync('git checkout main', { stdio: 'ignore' });

  } catch (error: any) {
    console.error(chalk.red(`\nAn error occurred during PR pipeline: ${error.message}`));
  }

  await pause();
}

main().catch((err) => {
  console.error(chalk.red('Fatal:'), err);
  process.exit(1);
});
