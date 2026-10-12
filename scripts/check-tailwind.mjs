import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { __unstable__loadDesignSystem } from '@tailwindcss/node';

// Use the project's actual theme/plugins and the same canonicalization API
// used by Tailwind IntelliSense, rather than a list of guessed replacements.
const stylesheet = path.resolve('src/app/globals.css');
const system = await __unstable__loadDesignSystem(
  fs.readFileSync(stylesheet, 'utf8'),
  { base: path.dirname(stylesheet) },
);
const canonical = new Map();
const helpers = new Set(['cn', 'clsx', 'twMerge', 'buttonClassName']);

function files(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory()
      ? files(file)
      : /\.[cm]?[jt]sx?$/.test(file)
        ? [file]
        : [];
  });
}

function isClassLiteral(node) {
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (ts.isJsxAttribute(parent))
      return /className$/i.test(parent.name.getText());
    if (
      ts.isPropertyAssignment(parent) &&
      /classNames?$/i.test(parent.name.getText().replace(/^['"]|['"]$/g, ''))
    )
      return true;
    if (
      ts.isCallExpression(parent) &&
      ts.isIdentifier(parent.expression) &&
      helpers.has(parent.expression.text)
    )
      return true;
    if (
      ts.isVariableDeclaration(parent) &&
      /class|styles|variants/i.test(parent.name.getText())
    )
      return true;
    if (
      ts.isFunctionDeclaration(parent) &&
      /className/i.test(parent.name?.text ?? '')
    )
      return true;
  }
  return false;
}

let failures = 0;
for (const file of files('src')) {
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  function visit(node) {
    if (
      (ts.isStringLiteral(node) ||
        ts.isNoSubstitutionTemplateLiteral(node) ||
        ts.isTemplateHead(node) ||
        ts.isTemplateMiddle(node) ||
        ts.isTemplateTail(node)) &&
      isClassLiteral(node)
    ) {
      for (const match of node.text.matchAll(/\S+/g)) {
        const candidate = match[0];
        if (!canonical.has(candidate)) {
          canonical.set(
            candidate,
            system.canonicalizeCandidates([candidate], { rem: 16 })[0],
          );
        }
        const replacement = canonical.get(candidate);
        if (replacement === candidate) continue;
        const { line } = source.getLineAndCharacterOfPosition(
          node.getStart(source),
        );
        console.error(
          `${file}:${line + 1}: Use ${replacement} instead of ${candidate}.`,
        );
        failures++;
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
}
if (failures) process.exitCode = 1;
else console.log('Tailwind canonical class check passed with no warnings.');
