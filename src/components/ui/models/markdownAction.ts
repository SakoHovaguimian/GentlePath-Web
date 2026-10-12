export type MarkdownAction =
  | 'bold'
  | 'italic'
  | 'strike'
  | 'link'
  | 'bullet'
  | 'numbered'
  | 'task'
  | 'quote'
  | 'inlineCode'
  | 'codeBlock'
  | 'table'
  | 'divider'
  | 'footnote'
  | 'heading1'
  | 'heading2'
  | 'heading3';

export type { MarkdownSelection } from './markdownSelection';
