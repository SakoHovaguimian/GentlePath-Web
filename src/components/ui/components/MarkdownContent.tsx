'use client';

import { useId } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { strings } from '@/strings';
import styles from './MarkdownContent.module.css';

// Share rendering between previews and saved legal readers. Never fetch embeds.
export function MarkdownContent({ value }: { value: string }) {
  const id = useId();
  const prefix = `markdown-${id.replace(/[^a-zA-Z0-9]/g, '')}-`;
  return (
    <div
      className={`${styles.content} min-w-0 text-base font-normal text-primary wrap-anywhere`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        remarkRehypeOptions={{
          clobberPrefix: prefix,
          footnoteLabel: strings.markdownEditor.footnotes,
          footnoteBackLabel: strings.markdownEditor.footnoteBackLabel,
        }}
        urlTransform={(url) =>
          /^(?:https?:\/\/|mailto:|#)/i.test(url) ? url : ''
        }
        components={{
          h1: ({ children }) => <h3 className={styles.heading1}>{children}</h3>,
          h2: ({ children, id }) => (
            <h4
              id={id === 'footnote-label' ? `${prefix}footnote-label` : id}
              className={styles.heading2}
            >
              {children}
            </h4>
          ),
          h3: ({ children }) => <h5 className={styles.heading3}>{children}</h5>,
          h4: ({ children }) => <h6>{children}</h6>,
          h5: ({ children }) => <h6>{children}</h6>,
          h6: ({ children }) => <h6>{children}</h6>,
          a: ({ href, children, id, ...props }) =>
            href ? (
              <a
                href={href}
                id={id}
                target={href.startsWith('#') ? undefined : '_blank'}
                rel="noopener noreferrer"
                aria-label={props['aria-label']}
                aria-describedby={
                  props['aria-describedby'] === 'footnote-label'
                    ? `${prefix}footnote-label`
                    : props['aria-describedby']
                }
              >
                {children}
              </a>
            ) : (
              <span>{children}</span>
            ),
          img: ({ src, alt }) =>
            typeof src === 'string' && src ? (
              <a href={src} target="_blank" rel="noopener noreferrer">
                {strings.markdownEditor.imageReference(alt ?? '')}
              </a>
            ) : (
              <span>{alt}</span>
            ),
          table: ({ children }) => (
            <div
              role="region"
              aria-label={strings.markdownEditor.tableRegion}
              tabIndex={0}
              className={styles.tableRegion}
            >
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {value}
      </ReactMarkdown>
    </div>
  );
}
