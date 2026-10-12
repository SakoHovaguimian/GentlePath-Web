import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { displayLiteral, sourceFile } from './string-literals.mjs';
import { titleCaseViolations } from './title-case.mjs';
function files(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory()
        ? files(path.join(dir, entry.name))
        : /\.tsx?$/.test(entry.name)
          ? [path.join(dir, entry.name)]
          : [],
    );
}
let failures = 0;
for (const violation of titleCaseViolations(
  fs.readFileSync('src/strings.ts', 'utf8'),
)) {
  console.error(
    `src/strings.ts:${violation.line}: ${violation.key} must use title case. Expected: ${violation.expected}`,
  );
  failures++;
}
for (const file of files('src')) {
  if (file === path.join('src', 'strings.ts')) continue;
  const source = fs.readFileSync(file, 'utf8');
  const sf = sourceFile(file, source);
  function visit(node) {
    if (displayLiteral(node)) {
      const { line } = sf.getLineAndCharacterOfPosition(node.getStart(sf));
      console.error(
        `${file}:${line + 1}: Move display copy into src/strings.ts.`,
      );
      failures++;
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
}
if (failures) process.exitCode = 1;
else console.log('Display strings check passed.');
