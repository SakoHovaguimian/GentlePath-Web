'use client';

import Image from 'next/image';
import { Field, Input, Select, SplitSection, TextArea } from '@/components/ui';
import { gentlePathBlogStrings as copy } from '@/strings';
import type { BlogMutationInput } from '../models/blogArticle';
import { BlogCategorySchema } from '../models/blogCategory';
import { BlogCoverSchema, blogCoverAssets } from '../models/blogCover';
import type { BlogFormErrors } from '../models/blogFormErrors';
import styles from '../../portal/Admin.module.css';

export function BlogArticleFields({
  form,
  errors,
  disabled,
  onChangeAction,
}: {
  form: BlogMutationInput;
  errors: BlogFormErrors;
  disabled: boolean;
  onChangeAction: (form: BlogMutationInput) => void;
}) {
  const update = <Key extends keyof BlogMutationInput>(
    key: Key,
    value: BlogMutationInput[Key],
  ) => onChangeAction({ ...form, [key]: value });
  const error = (key: keyof BlogMutationInput) =>
    errors[key] && (
      <p
        id={`blog-${key}-error`}
        role="alert"
        className="m-0 text-sm text-error-primary"
      >
        {errors[key]}
      </p>
    );
  return (
    <SplitSection
      id="blog-details"
      title={copy.articleDetails}
      description={copy.articleDetailsDescription}
    >
      <div className="grid gap-1.5">
        <Field labelText={copy.titleLabel}>
          <Input
            id="blog-title"
            value={form.title}
            maxLength={140}
            disabled={disabled}
            autoComplete="off"
            placeholder={copy.titlePlaceholder}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? 'blog-title-error' : undefined}
            onChange={(event) => {
              const title = event.target.value;
              const previousSlug = form.title
                .toLowerCase()
                .normalize('NFKD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '')
                .slice(0, 100);
              const slug =
                !form.revision && (!form.slug || form.slug === previousSlug)
                  ? title
                      .toLowerCase()
                      .normalize('NFKD')
                      .replace(/[\u0300-\u036f]/g, '')
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/^-|-$/g, '')
                      .slice(0, 100)
                  : form.slug;
              onChangeAction({ ...form, title, slug });
            }}
          />
        </Field>
        {error('title')}
      </div>
      <div className="grid gap-1.5">
        <Field labelText={copy.slugLabel}>
          <Input
            id="blog-slug"
            value={form.slug}
            maxLength={100}
            disabled={disabled}
            autoCapitalize="none"
            autoComplete="off"
            spellCheck={false}
            aria-invalid={Boolean(errors.slug)}
            aria-describedby={
              errors.slug ? 'blog-slug-error blog-slug-hint' : 'blog-slug-hint'
            }
            onChange={(event) => update('slug', event.target.value)}
          />
        </Field>
        <p id="blog-slug-hint" className="m-0 text-xs text-tertiary">
          {copy.slugHint}
        </p>
        {error('slug')}
      </div>
      <div className="grid gap-1.5">
        <Field labelText={copy.descriptionLabel}>
          <TextArea
            id="blog-description"
            value={form.description}
            maxLength={350}
            rows={3}
            disabled={disabled}
            placeholder={copy.descriptionPlaceholder}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={
              errors.description ? 'blog-description-error' : undefined
            }
            onChange={(event) => update('description', event.target.value)}
          />
        </Field>
        {error('description')}
      </div>
      <div className="grid gap-1.5">
        <Field labelText={copy.authorLabel}>
          <Input
            id="blog-author"
            value={form.author}
            maxLength={100}
            disabled={disabled}
            autoComplete="name"
            aria-invalid={Boolean(errors.author)}
            aria-describedby={errors.author ? 'blog-author-error' : undefined}
            onChange={(event) => update('author', event.target.value)}
          />
        </Field>
        {error('author')}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field labelText={copy.categoryLabel}>
          <Select
            id="blog-category"
            value={form.category}
            disabled={disabled}
            onValueChange={(value) => {
              const category = BlogCategorySchema.safeParse(value).data;
              if (category) update('category', category);
            }}
          >
            {BlogCategorySchema.options.map((value) => (
              <option key={value} value={value}>
                {copy.categories[value]}
              </option>
            ))}
          </Select>
        </Field>
        <Field labelText={copy.coverLabel}>
          <Select
            id="blog-cover"
            value={form.cover}
            disabled={disabled}
            onValueChange={(value) => {
              const cover = BlogCoverSchema.safeParse(value).data;
              if (cover) update('cover', cover);
            }}
          >
            {BlogCoverSchema.options.map((value) => (
              <option key={value} value={value}>
                {copy.coverOptions[value]}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className={styles.editorCover} data-cover={form.cover}>
        <Image
          src={blogCoverAssets[form.cover]}
          alt={copy.decorativeAlt}
          width={180}
          height={140}
          sizes="120px"
        />
        <p>
          <span>{copy.coverLabel}</span>
          {copy.coverOptions[form.cover]}
        </p>
      </div>
    </SplitSection>
  );
}
