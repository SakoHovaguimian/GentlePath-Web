'use client';

import Image from 'next/image';
import { useRef, useState, type ReactNode, type RefObject } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { strings } from '@/strings';
import type { ImageMosaicItem } from '../models/imageMosaicItem';
import { IconButton } from './IconButton';
import { UiIcon } from './UiIcon';

interface ImagePreviewProps {
  image: ImageMosaicItem | null;
  open?: boolean;
  onClose: () => void;
  details?: ReactNode;
  actions?: ReactNode;
  fallbackFocus?: RefObject<HTMLElement | null>;
}

export function ImagePreview({
  image,
  open = Boolean(image),
  onClose,
  details,
  actions,
  fallbackFocus,
}: ImagePreviewProps) {
  const returnFocus = useRef<HTMLElement | null>(null);
  const [failedSrc, setFailedSrc] = useState<string>();
  return (
    <Dialog.Root
      open={open && Boolean(image)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="ui-backdrop fixed inset-0 z-80 bg-(--dashboard-shell-overlay) backdrop-blur-sm" />
        <Dialog.Content
          data-side="right"
          onOpenAutoFocus={() => {
            returnFocus.current =
              document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            const target = returnFocus.current?.isConnected
              ? returnFocus.current
              : fallbackFocus?.current;
            target?.focus();
          }}
          className="ui-sheet fixed inset-y-0 right-0 z-90 flex w-full max-w-6xl flex-col overflow-y-auto border-l border-secondary bg-primary shadow-(--dashboard-shell-shadow-lg) outline-none sm:w-[94vw] sm:rounded-l-3xl"
        >
          <div className="flex items-start gap-4 border-b border-secondary p-5 sm:p-6">
            <div className="min-w-0 flex-1">
              <Dialog.Title className="m-0 text-xl font-semibold text-primary wrap-anywhere">
                {image?.title}
              </Dialog.Title>
              <Dialog.Description className="m-0 mt-1 text-sm text-secondary">
                {strings.mediaEditor.imageDetailsDescription}
              </Dialog.Description>
            </div>
            <IconButton
              variant="ghost"
              label={strings.mediaEditor.close}
              onClick={onClose}
            >
              <UiIcon name="close" />
            </IconButton>
          </div>
          <div className="grid min-h-0 flex-1 content-start lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="relative m-3 grid min-h-64 place-items-center overflow-hidden rounded-2xl bg-secondary_subtle sm:m-6 sm:min-h-96 lg:min-h-[65dvh]">
              {image?.src && failedSrc !== image.src ? (
                <Image
                  unoptimized
                  fill
                  src={image.src}
                  alt={image.alt}
                  sizes="(max-width: 1024px) 90vw, 65vw"
                  onError={() => setFailedSrc(image.src)}
                  className="object-contain p-4"
                />
              ) : (
                <div className="grid place-content-center gap-3 p-6 text-center text-tertiary">
                  {image?.src ? (
                    <p role="alert" className="m-0 text-sm">
                      {strings.mediaEditor.previewFailed}
                    </p>
                  ) : (
                    image?.fallback
                  )}
                </div>
              )}
            </div>
            <div className="grid min-w-0 content-start gap-6 p-5 lg:border-l lg:border-secondary lg:p-6">
              {image?.caption && (
                <p className="m-0 text-sm text-tertiary wrap-anywhere">
                  {image.caption}
                </p>
              )}
              {details}
              {actions && (
                <div className="border-t border-secondary pt-5">{actions}</div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
