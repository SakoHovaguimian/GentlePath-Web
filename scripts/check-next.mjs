import path from 'node:path';
import ts from 'typescript';
import { createTSPlugin } from 'next/dist/server/typescript/index.js';

// tsc does not load editor plugins. Run Next's installed plugin as well so
// client-boundary and route diagnostics cannot pass the command-line checks.
const root = process.cwd();
const config = ts.readConfigFile('tsconfig.json', ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
const host = {
  ...ts.sys,
  getScriptFileNames: () => parsed.fileNames,
  getScriptVersion: () => '0',
  getScriptSnapshot: (file) => {
    const source = ts.sys.readFile(file);
    return source === undefined
      ? undefined
      : ts.ScriptSnapshot.fromString(source);
  },
  getCompilationSettings: () => parsed.options,
  getCurrentDirectory: () => root,
  getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
  getCanonicalFileName: (file) => file,
  getNewLine: () => ts.sys.newLine,
};
const service = ts.createLanguageService(host);
const plugin = createTSPlugin({ typescript: ts }).create({
  languageService: service,
  config: { name: 'next', enabled: true },
  project: {
    getCurrentDirectory: () => root,
    projectService: { logger: { info() {} } },
  },
});

try {
  const diagnostics = [
    ...(config.error ? [config.error] : []),
    ...parsed.errors,
    ...parsed.fileNames
      .filter((file) => file.startsWith(`${path.join(root, 'src')}${path.sep}`))
      .flatMap((file) => plugin.getSemanticDiagnostics(file)),
  ].filter(
    (diagnostic) =>
      diagnostic.category === ts.DiagnosticCategory.Error ||
      diagnostic.category === ts.DiagnosticCategory.Warning,
  );
  if (diagnostics.length) {
    console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, host));
    process.exitCode = 1;
  } else {
    console.log('Next.js editor check passed with no warnings.');
  }
} finally {
  service.dispose();
}
