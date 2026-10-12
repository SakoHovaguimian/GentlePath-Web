import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

// Native controls are implemented once, inside the shared component library.
const primitives = new Set(['button', 'input', 'select', 'textarea', 'table']);
function files(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    if (file === path.join('src', 'components', 'ui')) return [];
    return entry.isDirectory()
      ? files(file)
      : file.endsWith('.tsx')
        ? [file]
        : [];
  });
}

let failures = 0;
for (const file of files('src')) {
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  function visit(node) {
    if (
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
      primitives.has(node.tagName.getText(source))
    ) {
      const { line } = source.getLineAndCharacterOfPosition(
        node.getStart(source),
      );
      console.error(
        `${file}:${line + 1}: Use an internal component from src/components/ui for <${node.tagName.getText(source)}>.`,
      );
      failures++;
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
}
if (failures) process.exitCode = 1;
else console.log('Shared UI component check passed.');
