import { useEffect, useRef, useState } from 'react';
import { useServiceContainer } from '@/providers/AppProviders';
import { DomainError } from '@/errors/domainErrors';
import { gentlePathBlogBuilderStrings as copy } from '@/strings';

export function useBlogImageUpload({
  disabled,
  onUploaded,
  onUploadStateChange,
}: {
  disabled: boolean;
  onUploaded: (url: string) => void;
  onUploadStateChange: (busy: boolean) => void;
}) {
  const { blogService } = useServiceContainer();
  const picker = useRef<HTMLInputElement>(null);
  const controller = useRef<AbortController | null>(null);
  const [uploading, setUploading] = useState(false);
  const [failure, setFailure] = useState('');
  useEffect(() => () => controller.current?.abort(), []);
  const upload = async (file?: File) => {
    if (!file || disabled || controller.current) return;
    const active = new AbortController();
    controller.current = active;
    setUploading(true);
    onUploadStateChange(true);
    setFailure('');
    try {
      const media = await blogService.uploadImage(file, active.signal);
      if (!active.signal.aborted) onUploaded(media.url);
    } catch (error) {
      if (!active.signal.aborted)
        setFailure(
          error instanceof DomainError
            ? error.message
            : copy.uploadErrorDescription,
        );
    } finally {
      controller.current = null;
      setUploading(false);
      onUploadStateChange(false);
      if (picker.current) picker.current.value = '';
    }
  };
  return { picker, uploading, failure, setFailure, upload };
}
