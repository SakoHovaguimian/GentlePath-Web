'use client';

import { useState } from 'react';
import { Button, IconButton, ReorderableList, UiIcon } from '@/components/ui';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { gentlePathBlogBuilderStrings as copy } from '@/strings';
import { BlogContentSchema, type BlogContent } from '../../models/blogContent';
import {
  BlogContentTypeSchema,
  type BlogContentType,
} from '../../models/blogContentType';
import { createBlogContent } from '../../content/createBlogContent';
import { BlogBlockFields } from './BlogBlockFields';
import styles from '../../Blog.module.css';

interface BlogContentBuilderProps {
  content: BlogContent[];
  disabled: boolean;
  showErrors: boolean;
  onChangeAction: (content: BlogContent[]) => void;
  onUploadStateChangeAction: (busy: boolean) => void;
}
export function BlogContentBuilder({
  content,
  disabled,
  showErrors,
  onChangeAction,
  onUploadStateChangeAction,
}: BlogContentBuilderProps) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const presentation = usePresentationService();
  const add = (contentType: BlogContentType) => {
    const block = createBlogContent(contentType);
    onChangeAction([...content, block]);
    setPaletteOpen(false);
    requestAnimationFrame(() => {
      const target = document.getElementById(`blog-block-${block.id}`);
      target?.scrollIntoView({ block: 'nearest' });
      (
        (target?.querySelector('input, textarea') ||
          target?.querySelector('button')) as HTMLElement | null
      )?.focus();
    });
  };
  const remove = async (block: BlogContent) => {
    const confirmed = await presentation.showAlert({
      title: copy.removeTitle,
      description: copy.removeDescription,
      confirmLabel: copy.remove,
      cancelLabel: copy.keep,
      tone: 'warning',
    });
    if (confirmed)
      onChangeAction(content.filter((item) => item.id !== block.id));
  };
  return (
    <div id="blog-content" tabIndex={-1} className={styles.builder}>
      {content.length === 0 ? (
        <div className={styles.builderEmpty}>
          <UiIcon name="layers" className="size-8 text-brand-secondary" />
          <h3>{copy.emptyTitle}</h3>
          <p>{copy.emptyDescription}</p>
        </div>
      ) : (
        <ReorderableList
          items={content}
          disabled={disabled}
          label={copy.contentLabel}
          handleLabel={(block) => copy.moveLabel(copy.types[block.contentType])}
          upLabel={(block) => copy.moveUpLabel(copy.types[block.contentType])}
          downLabel={(block) =>
            copy.moveDownLabel(copy.types[block.contentType])
          }
          onMove={(id, targetId) => {
            const next = [...content];
            const from = next.findIndex((item) => item.id === id);
            const to = next.findIndex((item) => item.id === targetId);
            if (from < 0 || to < 0) return;
            next.splice(to, 0, next.splice(from, 1)[0]);
            onChangeAction(next);
          }}
          renderItem={(block, index, controls, handle) => {
            const result = showErrors
              ? BlogContentSchema.safeParse(block)
              : null;
            const invalid = result && !result.success;
            return (
              <div
                id={`blog-block-${block.id}`}
                className={styles.builderBlock}
              >
                <div className={styles.builderBlockHeader}>
                  <div className="flex min-w-0 items-center gap-2">
                    {handle}
                    <h3>
                      {copy.blockLabel(
                        index + 1,
                        copy.types[block.contentType],
                      )}
                    </h3>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {controls}
                    <IconButton
                      label={copy.removeLabel(copy.types[block.contentType])}
                      variant="ghost"
                      disabled={disabled}
                      onClick={() => void remove(block)}
                    >
                      <UiIcon name="trash" />
                    </IconButton>
                  </div>
                </div>
                <div
                  className="grid min-w-0 gap-4"
                  aria-describedby={
                    invalid ? `blog-block-${block.id}-error` : undefined
                  }
                >
                  <BlogBlockFields
                    block={block}
                    disabled={disabled}
                    errorPaths={
                      invalid
                        ? result.error.issues.map((issue) =>
                            issue.path.slice(1).join('.'),
                          )
                        : []
                    }
                    onUploadStateChangeAction={onUploadStateChangeAction}
                    onChangeAction={(next) =>
                      onChangeAction(
                        content.map((item) =>
                          item.id === block.id ? next : item,
                        ),
                      )
                    }
                  />
                  {invalid && (
                    <p
                      id={`blog-block-${block.id}-error`}
                      role="alert"
                      className="m-0 text-sm text-error-primary"
                    >
                      {result.error.issues[0]?.message || copy.invalidBlock}
                    </p>
                  )}
                </div>
              </div>
            );
          }}
        />
      )}
      <Button
        variant="secondary"
        disabled={disabled || content.length >= 100}
        aria-expanded={paletteOpen}
        aria-controls="blog-block-palette"
        onClick={() => setPaletteOpen(!paletteOpen)}
      >
        <UiIcon name="plus" />
        {copy.addBlock}
      </Button>
      {content.length >= 100 && (
        <p className="m-0 text-sm text-tertiary">{copy.tooManyBlocks}</p>
      )}
      {paletteOpen && (
        <div
          id="blog-block-palette"
          className={styles.builderPalette}
          role="group"
          aria-label={copy.paletteTitle}
        >
          <p className="col-span-full m-0 text-sm text-tertiary">
            {copy.paletteDescription}
          </p>
          {BlogContentTypeSchema.options.map((type) => (
            <Button
              key={type}
              variant="secondary"
              className={styles.builderPaletteButton}
              disabled={disabled}
              onClick={() => add(type)}
            >
              <span>{copy.types[type]}</span>
              <span>{copy.typeDescriptions[type]}</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
