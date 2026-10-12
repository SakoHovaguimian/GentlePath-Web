import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import titleCaseRule from './scripts/eslint/title-case-rule.mjs';
export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    files: ['src/strings.ts'],
    plugins: { copy: { rules: { 'title-case': titleCaseRule } } },
    rules: { 'copy/title-case': 'error' },
  },
  globalIgnores(['.next/**', 'node_modules/**', 'next-env.d.ts']),
]);
