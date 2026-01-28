import * as vscode from 'vscode';

interface SortBlock {
  startLine: number;
  endLine: number;
}

export function activate(context: vscode.ExtensionContext) {
  // Register the on-save listener
  const saveDisposable = vscode.workspace.onWillSaveTextDocument((event) => {
    const config = vscode.workspace.getConfiguration('autoSort');
    if (!config.get<boolean>('enabled', true)) {
      return;
    }

    const document = event.document;
    const edit = sortDocument(document);
    if (edit) {
      event.waitUntil(Promise.resolve([edit]));
    }
  });

  // Register manual sort command
  const commandDisposable = vscode.commands.registerCommand('autoSort.sortNow', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('No active editor found');
      return;
    }

    const edit = sortDocument(editor.document);
    if (edit) {
      const workspaceEdit = new vscode.WorkspaceEdit();
      workspaceEdit.set(editor.document.uri, [edit]);
      vscode.workspace.applyEdit(workspaceEdit).then((success) => {
        if (success) {
          vscode.window.showInformationMessage('Auto Sort: Lines sorted successfully');
        }
      });
    } else {
      vscode.window.showInformationMessage('Auto Sort: No sortable blocks found');
    }
  });

  context.subscriptions.push(saveDisposable, commandDisposable);
}

function sortDocument(document: vscode.TextDocument): vscode.TextEdit | undefined {
  const config = vscode.workspace.getConfiguration('autoSort');
  const startMarker = config.get<string>('startMarker', '# <auto-sort begin>');
  const endMarker = config.get<string>('endMarker', '# <auto-sort end>');
  const caseSensitive = config.get<boolean>('caseSensitive', false);

  const text = document.getText();
  const lines = text.split('\n');

  // Find all sort blocks
  const blocks = findSortBlocks(lines, startMarker, endMarker);

  if (blocks.length === 0) {
    return undefined;
  }

  // Sort each block
  let modified = false;
  for (const block of blocks) {
    const blockLines = lines.slice(block.startLine + 1, block.endLine);
    const sortedLines = sortLines(blockLines, caseSensitive);

    // Check if sorting changed anything
    const changed = blockLines.some((line, i) => line !== sortedLines[i]);
    if (changed) {
      modified = true;
      // Replace the lines in the array
      for (let i = 0; i < sortedLines.length; i++) {
        lines[block.startLine + 1 + i] = sortedLines[i];
      }
    }
  }

  if (!modified) {
    return undefined;
  }

  // Create a single edit that replaces the entire document
  const fullRange = new vscode.Range(
    document.positionAt(0),
    document.positionAt(text.length)
  );

  return vscode.TextEdit.replace(fullRange, lines.join('\n'));
}

function findSortBlocks(lines: string[], startMarker: string, endMarker: string): SortBlock[] {
  const blocks: SortBlock[] = [];
  let currentStart: number | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check for start marker (supports various comment styles: #, //, --, /*, <!--, etc.)
    if (containsMarker(line, startMarker)) {
      currentStart = i;
    } else if (containsMarker(line, endMarker) && currentStart !== null) {
      blocks.push({
        startLine: currentStart,
        endLine: i,
      });
      currentStart = null;
    }
  }

  return blocks;
}

function containsMarker(line: string, marker: string): boolean {
  // Normalize whitespace: collapse multiple spaces to single space and trim
  const normalizeLine = line.trim().replace(/\s+/g, ' ').toLowerCase();
  const normalizeMarker = marker.trim().replace(/\s+/g, ' ').toLowerCase();
  return normalizeLine === normalizeMarker;
}

function sortLines(lines: string[], caseSensitive: boolean): string[] {
  // Split into blocks separated by empty lines
  const blocks: string[][] = [];
  let currentBlock: string[] = [];

  for (const line of lines) {
    if (line.trim() === '') {
      // Empty line - save current block and start new one
      if (currentBlock.length > 0) {
        blocks.push(currentBlock);
        currentBlock = [];
      }
      blocks.push([line]); // Keep empty line as its own "block"
    } else {
      currentBlock.push(line);
    }
  }

  // Don't forget the last block
  if (currentBlock.length > 0) {
    blocks.push(currentBlock);
  }

  // Sort each non-empty block individually
  const sortedBlocks = blocks.map((block) => {
    // Skip sorting if it's just an empty line
    if (block.length === 1 && block[0].trim() === '') {
      return block;
    }
    return [...block].sort((a, b) => {
      const aVal = caseSensitive ? a : a.toLowerCase();
      const bVal = caseSensitive ? b : b.toLowerCase();
      return aVal.localeCompare(bVal);
    });
  });

  // Flatten back to single array
  return sortedBlocks.flat();
}

export function deactivate() {}
