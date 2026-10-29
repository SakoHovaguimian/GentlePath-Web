'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import {
  Button,
  Field,
  FileInput,
  Input,
  Message,
  UiIcon,
} from '@/components/ui';
import { useServiceContainer } from '@/providers/AppProviders';
import { DomainError } from '@/errors/domainErrors';
import { gentlePathBlogBuilderStrings as copy } from '@/strings';
import type { BlogImage } from '../../models/blogImage';
import { BlogImageUrlSchema } from '../../models/blogContentUrl';
import { blogImageMimeTypes } from '../../models/blogMedia';
import styles from '../../Blog.module.css';

interface BlogImageFieldsProps {
  image: BlogImage;
  fieldId: string;
  disabled: boolean;
  errorKeys?: string[];
  errorId?: string;
  onChangeAction: (image: BlogImage) => void;
  onUploadStateChangeAction: (busy: boolean) => void;
}
export function BlogImageFields({
  image,
  fieldId,
  disabled,
  errorKeys = [],
  errorId,
  onChangeAction,
  onUploadStateChangeAction,
}: BlogImageFieldsProps) {
  const { blogService } = useServiceContainer();
  const picker = useRef<HTMLInputElement>(null);
  const controller = useRef<AbortController | null>(null);
  const [uploading, setUploading] = useState(false);
  const [failure, setFailure] = useState('');
  useEffect(() => () => controller.current?.abort(), []);
  const upload = async (file?: File) => {
    if (!file || disabled || uploading) return;
    controller.current = new AbortController();
    setUploading(true);
    onUploadStateChangeAction(true);
    setFailure('');
    try {
      const media = await blogService.uploadImage(
        file,
        controller.current.signal,
      );
      onChangeAction({ ...image, src: media.url });
    } catch (error) {
      if (!controller.current.signal.aborted)
        setFailure(
          error instanceof DomainError
            ? error.message
            : copy.uploadErrorDescription,
        );
    } finally {
      setUploading(false);
      onUploadStateChangeAction(false);
      if (picker.current) picker.current.value = '';
    }
  };
  const validImage = BlogImageUrlSchema.safeParse(image.src).success;
  return (
    <div className="grid min-w-0 gap-4" aria-busy={uploading}>
      {validImage && (
        <Image
          src={image.src}
          alt={image.alt}
          width={600}
          height={400}
          unoptimized
          className={styles.builderImagePreview}
        />
      )}
      <div className="flex flex-wrap items-center gap-3">
        <FileInput
          ref={picker}
          id={`${fieldId}-file`}
          accept={blogImageMimeTypes.join(',')}
          disabled={disabled || uploading}
          aria-label={copy.upload}
          onChange={(event) => void upload(event.target.files?.[0])}
        />
        <Button
          variant="secondary"
          disabled={disabled}
          loading={uploading}
          onClick={() => picker.current?.click()}
        >
          <UiIcon name="plus" />
          {image.src ? copy.replaceUpload : copy.upload}
        </Button>
      </div>
      <p className="m-0 text-sm text-tertiary">{copy.uploadHint}</p>
      {failure && (
        <Message
          intent="danger"
          title={copy.uploadErrorTitle}
          description={failure}
        />
      )}
      <Field labelText={copy.imageUrlLabel}>
        <Input
          id={`${fieldId}-src`}
          aria-invalid={errorKeys.includes('src')}
          aria-describedby={errorKeys.includes('src') ? errorId : undefined}
          type="url"
          autoComplete="off"
          disabled={disabled || uploading}
          value={image.src}
          maxLength={2000}
          onChange={(event) => {
            setFailure('');
            onChangeAction({ ...image, src: event.target.value });
          }}
        />
      </Field>
      <Field labelText={copy.imageAltLabel}>
        <Input
          id={`${fieldId}-alt`}
          aria-invalid={errorKeys.includes('alt')}
          disabled={disabled || uploading}
          value={image.alt}
          maxLength={500}
          aria-describedby={`${fieldId}-alt-hint${errorKeys.includes('alt') && errorId ? ` ${errorId}` : ''}`}
          onChange={(event) =>
            onChangeAction({ ...image, alt: event.target.value })
          }
        />
      </Field>
      <p id={`${fieldId}-alt-hint`} className="m-0 text-sm text-tertiary">
        {copy.imageAltHint}
      </p>
      <Field labelText={copy.captionLabel}>
        <Input
          id={`${fieldId}-caption`}
          aria-invalid={errorKeys.includes('caption')}
          aria-describedby={errorKeys.includes('caption') ? errorId : undefined}
          disabled={disabled || uploading}
          value={image.caption}
          maxLength={1000}
          onChange={(event) =>
            onChangeAction({ ...image, caption: event.target.value })
          }
        />
      </Field>
    </div>
  );
}
