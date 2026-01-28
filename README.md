# Auto Sort

A VS Code extension that automatically sorts lines between markers on save.

## Usage

Add markers to your file to define sortable regions:

```python
# <auto-sort begin>
banana
apple
cherry
# <auto-sort end>
```

When you save the file, lines between the markers will be sorted alphabetically:

```python
# <auto-sort begin>
apple
banana
cherry
# <auto-sort end>
```

### Block Sorting

Empty lines act as separators. Each block is sorted individually:

```python
# <auto-sort begin>
banana
apple

zebra
mango
# <auto-sort end>
```

Result:

```python
# <auto-sort begin>
apple
banana

mango
zebra
# <auto-sort end>
```

## Commands

- **Auto Sort: Sort Current File** - Manually trigger sorting via Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `autoSort.enabled` | `true` | Enable/disable auto-sorting on save |
| `autoSort.startMarker` | `# <auto-sort begin>` | Start marker text |
| `autoSort.endMarker` | `# <auto-sort end>` | End marker text |
| `autoSort.caseSensitive` | `false` | Case-sensitive sorting |

## Installation

### From Source

```bash
git clone <repository-url>
cd auto-sort
npm install
npm run compile
```

Then press `F5` in VS Code to launch the Extension Development Host.

### Package as VSIX

```bash
npm install -g @vscode/vsce
vsce package
```

Install the generated `.vsix` file via `Extensions: Install from VSIX...` command.

## License

MIT
