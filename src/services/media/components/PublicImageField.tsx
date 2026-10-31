'use client';
import { Button, Field, FileInput, Input, UiIcon } from '@/components/ui';
import { isPublicImageReference } from '@/models/publicImageUrl';
import { strings } from '@/strings';
import { publicImageMimeTypes } from '../models/publicImage';
import type { PublicImageFieldProps } from '../models/publicImageFieldProps';
import { usePublicImageUpload } from '../usePublicImageUpload';
import { PublicImagePreview } from './PublicImagePreview';

export function PublicImageField({
  id,
  value,
  label,
  disabled,
  error,
  onChange,
  onUploadStateChange,
}: PublicImageFieldProps) {
  const {
    picker,
    trigger,
    uploading,
    failure: uploadFailure,
    clearFailure,
    upload,
    cancel,
  } = usePublicImageUpload({
    disabled,
    onUploaded: onChange,
    onUploadStateChange,
  });
  const failure = error || uploadFailure;
  return (
    <div className="grid min-w-0 gap-3" aria-busy={uploading}>
      <Field labelText={label}>
        <Input
          id={id}
          name="image_url"
          type="url"
          value={value}
          maxLength={1000}
          disabled={disabled || uploading}
          aria-invalid={Boolean(failure)}
          aria-describedby={`${id}-hint${failure ? ` ${id}-error` : ''}`}
          onChange={(event) => {
            clearFailure();
            onChange(event.target.value);
          }}
        />
      </Field>
      {isPublicImageReference(value) && (
        <PublicImagePreview key={value} src={value} />
      )}
      <div className="flex flex-wrap gap-2">
        <FileInput
          ref={picker}
          id={`${id}-file`}
          accept={publicImageMimeTypes.join(',')}
          disabled={disabled || uploading}
          tabIndex={-1}
          aria-hidden="true"
          onChange={(event) => void upload(event.target.files?.[0])}
        />
        <Button
          ref={trigger}
          variant="secondary"
          disabled={disabled && !uploading}
          loading={uploading}
          onClick={() => picker.current?.click()}
        >
          <UiIcon name="image" />
          {value ? strings.media.replaceImage : strings.media.uploadImage}
        </Button>
        {uploading ? (
          <Button key="cancel" variant="ghost" onClick={cancel}>
            {strings.media.cancelImageUpload}
          </Button>
        ) : (
          value && (
            <Button
              key="remove"
              variant="destructive"
              disabled={disabled}
              onClick={() => {
                clearFailure();
                onChange('');
              }}
            >
              <UiIcon name="trash" />
              {strings.media.removeImage}
            </Button>
          )
        )}
      </div>
      <p id={`${id}-hint`} className="m-0 text-xs text-tertiary">
        {strings.media.imageUploadHint}
      </p>
      {failure && (
        <p
          id={`${id}-error`}
          role="alert"
          className="m-0 text-sm text-error-primary"
        >
          {failure}
        </p>
      )}
    </div>
  );
}
