# 🌌 Terminal Multiverse

An interactive terminal sandbox containing 11 distinct mathematical, visual, and cryptographic simulation modules. Written in strictly typed **TypeScript (ESM)** targeting modern Node.js environments.

---

## 🚀 Features

The application operates as a unified console router. Run the startup script and select from 11 distinct modules:

1. **🌿 L-System Fractal Garden:** Procedural organic structure engine mapping formal grammars onto an ASCII canvas. Customize depth, angle decay, and step sizes.
2. **🦠 Conway's Game of Life:** Interactive cellular automata simulation loops running on toroidal grids with preset glider and oscillator structures.
3. **🕶️ 3D Ray Marcher:** Real-time 3D camera ray tracer with ASCII rendering and Lambertian shading. Render rotating donuts (torus) and bloby objects (displaced spheres).
4. **📐 Chaos Game Fractal Generator:** Emergent geometric Sierpinski fractals and golden ratio webs plotted via random midpoint navigation between attractors.
5. **✍️ Markov Chain Text Generator:** Generates procedural nonsense text utilizing n-gram transition maps compiled from text corpus presets (Shakespeare, Lewis Carroll, Tech Startup Buzzwords).
6. **🔊 Morse WAV Audio Exporter:** Translates strings to Morse code and encodes the sine wave tone signals into playable 8-bit PCM `.wav` binary files.
7. **🕸️ Maze Generator & Solver:** Generates perfect mazes using Depth-First Search (DFS) recursive backtracker, and animates the Breadth-First Search (BFS) solver pathfinding.
8. **📈 Fourier Waveform Synthesizer:** Synthesizes square, sawtooth, triangle, and custom waveforms by summing sinusoidal harmonic frequencies.
9. **🔑 Enigma Cipher Machine:** Symmetric cryptography emulator of WWI-era rotor encryption, implementing double-stepping and reflector swaps.
10. **📊 Collatz Conjecture Plotter:** Computes the $3n+1$ sequences and plots dynamic line/bar trajectory heights on a terminal graph.
11. **🔍 Visual Diff Comparison:** Compares text blocks side-by-side or line-by-line using Longest Common Subsequence (LCS) diffing.

---

## 📁 Repository Structure

```
terminal-multiverse/
├── .eslintrc.json           # ESLint configuration
├── .prettierrc              # Prettier style settings
├── .project-context         # Persistent workspace guidelines and styles
├── tsconfig.json            # Strict TypeScript configuration
├── package.json             # NPM dependencies & test/build scripts
├── .github/
│   └── workflows/
│       └── ci.yml           # GitHub Actions automated checking pipeline
└── src/
    ├── index.ts             # Entrypoint & module selector console
    ├── utils/
    │   └── cli.ts           # Boxen/Chalk CLI prompt wrappers
    └── modules/
        ├── types.ts         # Module specifications
        ├── lsystem/         # 1. L-System Fractal Garden
        ├── life/            # 2. Conway's Game of Life
        ├── raymarcher/      # 3. 3D Ray Marcher
        ├── chaos/           # 4. Chaos Game Fractal
        ├── markov/          # 5. Markov Chain Text Generator
        ├── morse/           # 6. Morse WAV Audio Exporter
        ├── maze/            # 7. Maze Generator & Solver
        ├── fourier/         # 8. Fourier Waveform Synthesizer
        ├── enigma/          # 9. Enigma Cipher Machine
        ├── collatz/         # 10. Collatz Graph Plotter
        └── diff/            # 11. Visual Diff Comparison
```

Every module implements a clean separation of concerns:
* `core.ts`: Contains **pure functions** only. Side-effect free, 100% testable logic.
* `runner.ts`: Exposes a `run(): Promise<void>` function handling interactive CLI input and rendering.
* `__tests__/core.test.ts`: Automated unit tests covering all edge cases.

---

## ⚙️ Setup & Installation

### Prerequisites
* [Node.js](https://nodejs.org/) (v20 or higher recommended)
* npm (v10 or higher)

### Install dependencies
```bash
npm install
```

### Start the Console
```bash
npm run start
```

### Run the Test Suite
```bash
npm run test
```

### Build to JavaScript
```bash
npm run build
```

---

## 🧪 Development Standards

* **Code Styling:** Enforced via Prettier and ESLint. Formatting checks run automatically.
* **TypeScript Resolution:** Uses `NodeNext` ESM module resolution. All local relative imports must end with `.js` extensions (e.g. `import { helper } from './util.js'`).
* **CI/CD:** Pushes and PRs trigger GitHub Actions to run tests, checks, and verify builds.
* **Pre-commit Hooks:** Husky and `lint-staged` run automatic formatters and linters on modified files before commits are finalized.
