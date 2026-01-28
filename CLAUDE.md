# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
npm install          # Install dependencies
npm run compile      # Compile TypeScript to JavaScript (outputs to out/)
npm run watch        # Watch mode for development
npm run lint         # Run ESLint
vsce package         # Package as .vsix for distribution
vsce publish         # Publish to VS Code Marketplace
```

## Testing the Extension

1. Open the project in VS Code
2. Press `F5` to launch Extension Development Host
3. In the new VS Code window, create a file with sort markers and save to test

## Architecture

This is a VS Code extension with a single entry point:

- **src/extension.ts** - All extension logic in one file:
  - `activate()` - Registers `onWillSaveTextDocument` listener and `autoSort.sortNow` command
  - `sortDocument()` - Main logic that finds markers and applies sorted edits
  - `findSortBlocks()` - Locates start/end marker pairs in document
  - `containsMarker()` - Matches lines against markers (whitespace-normalized, case-insensitive)
  - `sortLines()` - Sorts lines within a block; empty lines act as sub-block separators

Configuration is defined in `package.json` under `contributes.configuration` with settings for markers, case sensitivity, and enable/disable.

## Default Markers

```
# <auto-sort begin>
# <auto-sort end>
```

Lines between markers are sorted alphabetically on save. Empty lines within a block act as separators—each sub-block is sorted independently.
