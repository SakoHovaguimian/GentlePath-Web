'use client';
import { useEffect, useRef, useState } from 'react';
import { useServiceContainer } from '@/providers/AppProviders';
import { DomainError } from '@/errors/domainErrors';
import { strings } from '@/strings';
import type { PublicImageUploadOptions } from './models/publicImageUploadOptions';

export function usePublicImageUpload({
  disabled,
  onUploaded,
  onUploadStateChange,
}: PublicImageUploadOptions) {
  const { publicImageService } = useServiceContainer();
  const picker = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const [uploading, setUploading] = useState(false);
  const [failure, setFailure] = useState('');
  useEffect(() => {
    if (uploading || !restoreFocus.current) return;
    restoreFocus.current = false;
    if (document.activeElement === document.body) trigger.current?.focus();
  }, [uploading]);
  useEffect(
    () => () => {
      controller.current?.abort();
      controller.current = null;
    },
    [],
  );
  async function upload(file?: File) {
    if (!file || disabled || controller.current) return;
    const active = new AbortController();
    controller.current = active;
    setUploading(true);
    onUploadStateChange(true);
    setFailure('');
    try {
      const media = await publicImageService.upload(file, active.signal);
      if (!active.signal.aborted) onUploaded(media.url);
    } catch (error) {
      if (!active.signal.aborted)
        setFailure(
          error instanceof DomainError
            ? error.message
            : strings.media.imageUploadError,
        );
    } finally {
      if (controller.current === active) {
        controller.current = null;
        setUploading(false);
        onUploadStateChange(false);
        if (picker.current) picker.current.value = '';
      }
    }
  }
  return {
    picker,
    trigger,
    uploading,
    failure,
    clearFailure: () => setFailure(''),
    upload,
    cancel: () => {
      restoreFocus.current = true;
      controller.current?.abort();
    },
  };
}
