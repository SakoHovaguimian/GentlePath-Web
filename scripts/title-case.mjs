import ts from 'typescript';
import { sourceFile } from './string-literals.mjs';

// UI title case capitalizes every word, including articles and prepositions.
// Keep canonical product names and units intact; do not lowercase acronyms.
const preservedWords = new Set([
  'iOS',
  'iPadOS',
  'macOS',
  'watchOS',
  'tvOS',
  'npm',
  'ms',
]);
const words = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu;
const titleRole =
  /(?:title|label|heading|header|caption|action|cta|button|column)s?$/i;
const sentenceRole =
  /(?:description|hint|help|body|guidance|placeholder|alt|paragraph|explanation)s?$/i;
const dataRole = /^(?:sample|example|syntax)|(?:sample|example)$/i;

export function titleCase(value) {
  return value.replace(words, (word) =>
    preservedWords.has(word)
      ? word
      : word[0].toLocaleUpperCase('en-US') + word.slice(1),
  );
}

function copyStyle(property, source, inherited) {
  const comments = source.slice(property.getFullStart(), property.getStart());
  const annotation = comments.match(
    /@(sentence|preserve|title)-case:[ \t]+\S[^\r\n]*/,
  );
  if (annotation) return annotation[1];
  if (inherited !== 'title') return inherited;
  const key = property.name.getText().replace(/^['"]|['"]$/g, '');
  if (titleRole.test(key)) return 'title';
  if (sentenceRole.test(key)) return 'sentence';
  if (dataRole.test(key)) return 'preserve';
  return 'title';
}

// Inspect only authored output expressions. Function arguments such as locale
// codes, join separators, and replaceAll patterns are not display copy.
export function titleCaseViolations(source, file = 'src/strings.ts') {
  const sf = sourceFile(file, source);
  const violations = [];
  function literal(node, keyPath) {
    const expected = titleCase(node.text);
    if (expected === node.text) return;
    const start = node.getStart(sf);
    const { line, character } = sf.getLineAndCharacterOfPosition(start);
    violations.push({
      key: keyPath.join('.'),
      value: node.text,
      expected,
      line: line + 1,
      column: character + 1,
      start,
      end: node.end,
    });
  }
  function visit(node, keyPath, style) {
    if (ts.isPropertyAssignment(node)) {
      const key = node.name.getText(sf).replace(/^['"]|['"]$/g, '');
      visit(
        node.initializer,
        [...keyPath, key],
        copyStyle(node, source, style),
      );
    } else if (ts.isObjectLiteralExpression(node)) {
      ts.forEachChild(node, (child) => visit(child, keyPath, style));
    } else if (style !== 'title') {
      return;
    } else if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node)
    ) {
      literal(node, keyPath);
    } else if (ts.isTemplateExpression(node)) {
      literal(node.head, keyPath);
      for (const span of node.templateSpans) {
        visit(span.expression, keyPath, style);
        literal(span.literal, keyPath);
      }
    } else if (ts.isConditionalExpression(node)) {
      visit(node.whenTrue, keyPath, style);
      visit(node.whenFalse, keyPath, style);
    } else if (ts.isBinaryExpression(node)) {
      if (node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
        visit(node.left, keyPath, style);
        visit(node.right, keyPath, style);
      }
    } else if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
      visit(node.body, keyPath, style);
    } else if (ts.isReturnStatement(node)) {
      if (node.expression) visit(node.expression, keyPath, style);
    } else if (
      ts.isArrayLiteralExpression(node) ||
      ts.isAsExpression(node) ||
      ts.isSatisfiesExpression(node) ||
      ts.isParenthesizedExpression(node) ||
      ts.isBlock(node) ||
      ts.isIfStatement(node)
    ) {
      ts.forEachChild(node, (child) => visit(child, keyPath, style));
    }
  }
  for (const statement of sf.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (
        !declaration.initializer ||
        !(
          ['strings', 'labels'].includes(declaration.name.getText(sf)) ||
          declaration.name.getText(sf).endsWith('Strings')
        )
      )
        continue;
      visit(declaration.initializer, [declaration.name.getText(sf)], 'title');
    }
  }
  return violations;
}
