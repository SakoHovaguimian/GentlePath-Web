import { useState } from 'react';
import { Button, Field, Input, Select, UiIcon } from '@/components/ui';
import { gentlePathBlogStrings as copy } from '@/strings';
import {
  BlogCategorySchema,
  blogCategoryPresets,
  blogCategoryLabel,
} from '../models/blogCategory';

export function BlogTopicField({
  value,
  categories,
  disabled,
  invalid,
  onChange,
}: {
  value: string;
  categories: string[];
  disabled: boolean;
  invalid: boolean;
  onChange: (value: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [previous, setPrevious] = useState(value);
  const [failure, setFailure] = useState('');
  const choices = [
    ...new Set([
      ...blogCategoryPresets,
      ...categories,
      ...(value ? [value] : []),
    ]),
  ];
  return (
    <div className="grid min-w-0 gap-2">
      {adding ? (
        <>
          <Field labelText={copy.newTopicLabel}>
            <Input
              id="blog-category"
              value={value}
              maxLength={80}
              disabled={disabled}
              aria-invalid={invalid || Boolean(failure)}
              aria-describedby={failure ? 'blog-new-topic-error' : undefined}
              onChange={(event) => {
                setFailure('');
                onChange(event.target.value);
              }}
            />
          </Field>
          {failure && (
            <p
              id="blog-new-topic-error"
              role="alert"
              className="m-0 text-xs text-error-primary"
            >
              {failure}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              disabled={disabled}
              onClick={() => {
                const result = BlogCategorySchema.safeParse(value);
                if (!result.success) {
                  setFailure(copy.invalidTopic);
                  return;
                }
                const match = [...blogCategoryPresets, ...categories].find(
                  (item) =>
                    item.toLocaleLowerCase('en-US') ===
                      result.data.toLocaleLowerCase('en-US') ||
                    blogCategoryLabel(item).toLocaleLowerCase('en-US') ===
                      result.data.toLocaleLowerCase('en-US'),
                );
                onChange(match ?? result.data);
                setAdding(false);
              }}
            >
              {copy.useTopic}
            </Button>
            <Button
              variant="ghost"
              disabled={disabled}
              onClick={() => {
                onChange(previous);
                setAdding(false);
                setFailure('');
              }}
            >
              {copy.cancelTopic}
            </Button>
          </div>
        </>
      ) : (
        <>
          <Field labelText={copy.categoryLabel}>
            <Select
              id="blog-category"
              value={value}
              disabled={disabled}
              aria-invalid={invalid}
              aria-describedby={invalid ? 'blog-category-error' : undefined}
              onValueChange={onChange}
            >
              {choices.map((category) => (
                <option key={category} value={category}>
                  {blogCategoryLabel(category)}
                </option>
              ))}
            </Select>
          </Field>
          <Button
            variant="ghost"
            className="justify-self-start px-2 py-1"
            disabled={disabled}
            onClick={() => {
              setPrevious(value);
              onChange('');
              setAdding(true);
              requestAnimationFrame(() =>
                document.getElementById('blog-category')?.focus(),
              );
            }}
          >
            <UiIcon name="plus" className="size-4" />
            {copy.addTopic}
          </Button>
        </>
      )}
    </div>
  );
}
