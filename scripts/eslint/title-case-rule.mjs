import { titleCaseViolations } from '../title-case.mjs';

const titleCaseRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require title case for UI copy in the central catalog.',
    },
    schema: [],
    messages: {
      titleCase: '{{key}} must use title case. Expected: {{expected}}',
    },
  },
  create(context) {
    return {
      Program() {
        for (const violation of titleCaseViolations(context.sourceCode.text)) {
          context.report({
            loc: { line: violation.line, column: violation.column - 1 },
            messageId: 'titleCase',
            data: { key: violation.key, expected: violation.expected },
          });
        }
      },
    };
  },
};

export default titleCaseRule;
