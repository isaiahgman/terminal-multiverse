# Project Context: Terminal Multiverse

## Core Architecture
- The application is a unified interactive Node.js terminal app written in TypeScript.
- Renders to standard output (stdout) with color utilities (`chalk`) and UI framing (`boxen`).
- Interactive prompts must use Node's native `readline` or a simple async prompt loop to keep dependencies lightweight and robust.
- The project follows a modular module structure:
  ```
  src/
    index.ts            # Entrypoint & central menu router
    utils/              # Shared CLI helpers (color, console clear, border frames)
    modules/            # Self-contained features
      <feature>/
        core.ts         # Pure functions (side-effect free, testable)
        runner.ts       # Interactive input/output loop
        __tests__/
          core.test.ts  # Unit tests for the core logic
  ```

## Development Standards
- **Strict TypeScript:** No implicit `any`, explicit types required for exports.
- **Pure Logic Separation:** Core functions MUST NOT write to standard output or read standard input directly. They should take inputs as parameters and return raw data/structures. The runner translates these to terminal frames.
- **Testing:** Every core file must have >90% code coverage using Vitest.
- **Styling Guidelines:** The terminal outputs should feel premium. Use high-contrast color palettes, styled title headers using `boxen`, neat alignment, and clear instruction indicators (e.g. `[Enter] to submit`, `[q] to quit`).
- **Git Flow:** Strict pre-commit testing and linting checks using husky and lint-staged.
- **Local Pre-flight Checks:** Before staging, committing, or pushing code, you MUST run `npm run lint` and `npx prettier --check "src/**/*.ts"` (or `npm run format`) locally. Under no circumstances should unverified or failing code be pushed to origin, wasting CI resources.

## GitHub Pull Request Workflow & Branching
- **Branching Policy:** For every new request, feature, bug, or design thought, a new branch MUST be created from `main`. Address the issue on that branch and create a separate Pull Request, rather than combining unrelated changes into a single branch or PR.
  - **Branch Naming:** Branch names should be a very short, concise phrase covering what the branch and PR is doing. All lower case, no punctuation (e.g., `migrateagentsmd`).
  - **Commit Messages:** Commit messages should be very short, concise phrases as well. All lower case, no punctuation (e.g., `migrate agents context`).
- **Branch Protection & Merging Rules:**
  - The `main` branch is strictly protected. Direct pushes to `main` are prohibited.
  - Pull Requests MUST NOT be merged unless all status checks (TypeScript compilation, ESLint, Prettier formatting, and Vitest runs) have passed in the CI pipeline.
  - Never use administrator bypass options (e.g. `--admin` flag) to force-merge a Pull Request while checks are failing or pending.
- **Pull Request Description Formatting:** All Pull Request descriptions in this repository MUST be formatted exactly with the following two main headers:
  - `## Summary`
  - `## Changes`
- Do not use other heading hierarchies or alternative names for these sections.
