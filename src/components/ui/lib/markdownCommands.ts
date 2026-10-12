import { strings } from '@/strings';
import type {
  MarkdownAction,
  MarkdownSelection,
} from '../models/markdownAction';

export function applyMarkdownAction(
  action: MarkdownAction,
  selection: MarkdownSelection,
): MarkdownSelection {
  const { value, start, end } = selection;
  const copy = strings.markdownEditor;
  const selected = value.slice(start, end);
  function replace(
    text: string,
    from = start,
    to = end,
    offset = 0,
    length = text.length,
  ) {
    return {
      value: value.slice(0, from) + text + value.slice(to),
      start: from + offset,
      end: from + offset + length,
    };
  }
  function wrap(
    before: string,
    after = before,
    fallback: string = copy.sampleText,
  ) {
    const text = selected || fallback;
    // Applying emphasis again to the same selection removes it.
    if (
      start >= before.length &&
      value.slice(start - before.length, start) === before &&
      value.slice(end, end + after.length) === after
    )
      return replace(text, start - before.length, end + after.length);
    return replace(
      before + text + after,
      start,
      end,
      before.length,
      text.length,
    );
  }
  function block(text: string) {
    const before =
      start > 0 ? (value.slice(0, start).endsWith('\n\n') ? '' : '\n\n') : '';
    const after =
      end < value.length
        ? value.slice(end).startsWith('\n\n')
          ? ''
          : '\n\n'
        : '';
    return replace(
      before + text + after,
      start,
      end,
      before.length,
      text.length,
    );
  }
  switch (action) {
    case 'bold':
      return wrap('**');
    case 'italic':
      return wrap('*');
    case 'strike':
      return wrap('~~');
    case 'inlineCode':
      return wrap('`', '`', copy.sampleCode);
    case 'link': {
      const text = selected || copy.sampleLink;
      const prefix = `[${text}](`;
      return replace(
        prefix + copy.sampleUrl + ')',
        start,
        end,
        prefix.length,
        copy.sampleUrl.length,
      );
    }
    case 'codeBlock': {
      const text = selected || copy.sampleCode;
      const fence = '`'.repeat(
        Math.max(
          3,
          ...[...text.matchAll(/`+/g)].map((match) => match[0].length + 1),
        ),
      );
      return block(`${fence}\n${text}\n${fence}`);
    }
    case 'table':
      return block(copy.sampleTable);
    case 'divider':
      return block('---');
    case 'footnote': {
      const count =
        Math.max(
          0,
          ...[...value.matchAll(/\[\^(\d+)\]/g)].map((match) =>
            Number(match[1]),
          ),
        ) + 1;
      const reference = `[^${count}]`;
      const text = selected || copy.sampleText;
      const definition = `\n\n${reference}: ${copy.sampleFootnote}`;
      const next = replace(text + reference);
      return {
        value: next.value + definition,
        start:
          next.value.length + definition.length - copy.sampleFootnote.length,
        end: next.value.length + definition.length,
      };
    }
    default: {
      const from = start === 0 ? 0 : value.lastIndexOf('\n', start - 1) + 1;
      const nextBreak = value.indexOf('\n', end > start ? end - 1 : end);
      const to = nextBreak === -1 ? value.length : nextBreak;
      const lines = (value.slice(from, to) || copy.sampleText).split('\n');
      const formatted = lines
        .map((line, index) => {
          const text = line.replace(
            /^(?:#{1,6}\s+|>\s*|-\s+(?:\[[ xX]\]\s+)?|\d+\.\s+)/,
            '',
          );
          const prefix =
            action === 'bullet'
              ? '- '
              : action === 'numbered'
                ? `${index + 1}. `
                : action === 'task'
                  ? '- [ ] '
                  : action === 'quote'
                    ? '> '
                    : '#'.repeat(Number(action.slice(-1))) + ' ';
          return prefix + text;
        })
        .join('\n');
      return replace(formatted, from, to);
    }
  }
}
