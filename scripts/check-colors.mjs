import fs from 'node:fs';
import path from 'node:path';

const themeFile = path.join('src', 'app', 'theme.css');
const themeTokens = new Set(
  [...fs.readFileSync(themeFile, 'utf8').matchAll(/(--[\w-]+)\s*:/g)].map(
    (match) => match[1],
  ),
);
const literalColor =
  /#[\da-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\s*\(/i;
const fixedPaletteUtility =
  /\b(?:bg|text|border|ring|outline|fill|stroke|shadow|from|via|to)-(?:white|black|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(?:-\d+)?(?=[\s/'"`]|$)/;

function sourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory()
      ? sourceFiles(file)
      : /\.(?:css|[cm]?[jt]sx?)$/.test(entry.name)
        ? [file]
        : [];
  });
}

function colorViolations(file) {
  return fs
    .readFileSync(file, 'utf8')
    .split('\n')
    .flatMap((line, index) => {
      const failures = [];
      if (literalColor.test(line) || fixedPaletteUtility.test(line)) {
        failures.push(
          `${file}:${index + 1}: Use a semantic color token from src/app/theme.css.`,
        );
      }
      for (const match of line.matchAll(
        /var\((--(?:color-|landing-|dashboard-shell-)[\w-]+)/g,
      )) {
        if (!themeTokens.has(match[1])) {
          failures.push(
            `${file}:${index + 1}: Define ${match[1]} in src/app/theme.css.`,
          );
        }
      }
      return failures;
    });
}

const failures = sourceFiles('src')
  .filter((file) => file !== themeFile)
  .flatMap(colorViolations);

if (failures.length) {
  failures.forEach((failure) => console.error(failure));
  process.exitCode = 1;
} else {
  console.log('Theme color check passed.');
}
