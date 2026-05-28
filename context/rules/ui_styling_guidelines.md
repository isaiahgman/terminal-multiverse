# UI Styling Guidelines for the Multiverse

These guidelines standardize the terminal output across all agents and interfaces in the multiverse.

## Chalk Color Palette

*   **Primary/Success**: `chalk.green` or `chalk.greenBright`
*   **Warning**: `chalk.yellow` or `chalk.yellowBright`
*   **Error**: `chalk.red` or `chalk.redBright`
*   **Info/Muted**: `chalk.gray` or `chalk.dim`
*   **Highlight/Key Info**: `chalk.cyan` or `chalk.cyanBright`

## Boxen Configuration

When wrapping content in boxes, use the following standard configurations to ensure consistent padding and borders.

### Standard Box
```javascript
const boxenOptions = {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'cyan',
};
```

### Error Box
```javascript
const errorBoxenOptions = {
    padding: 1,
    margin: 1,
    borderStyle: 'double',
    borderColor: 'red',
};
```

## Menu Alignments

*   **Prefixes**: Use consistent prefixes like `>` or `*` for selectable items.
*   **Alignment**: Align text left, ensuring equal spacing between the prefix and the menu item name.
*   **Spacing**: Add an empty line between distinct menu groups for readability.
