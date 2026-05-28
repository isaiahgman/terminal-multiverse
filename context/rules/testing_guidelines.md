# Testing Guidelines

To achieve >90% Vitest coverage, follow these guidelines:

1. **Target Pure Functions**: Tests should primarily focus on pure functions located in `core.ts` files.
2. **Mock Dependencies**: Mock any external dependencies or side-effect-heavy modules where necessary to ensure tests remain isolated and fast.
3. **Ignore Visual Side-effects**: Ignore visual side-effects and complex setups found in `runner.ts`. Focus on the underlying logic rather than UI or runner mechanics.
