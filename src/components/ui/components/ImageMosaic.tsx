'use client';

import Image from 'next/image';
import { useRef, useState, type ReactNode } from 'react';
import { strings } from '@/strings';
import type { ImageMosaicItem } from '../models/imageMosaicItem';
import { cn } from '../lib/cn';
import { ImagePreview } from './ImagePreview';
import { UiIcon } from './UiIcon';

function MosaicTile({
  item,
  featured,
  paired,
  disabled,
  onPreview,
}: {
  item: ImageMosaicItem;
  featured: boolean;
  paired: boolean;
  disabled?: boolean;
  onPreview: () => void;
}) {
  const [failedSrc, setFailedSrc] = useState<string>();
  return (
    <li
      className={cn(
        'grid min-w-0',
        featured && 'col-span-2',
        (featured || paired) && 'row-span-2',
      )}
    >
      <button
        type="button"
        className="ui-image-mosaic-tile group relative block w-full cursor-pointer overflow-hidden rounded-2xl border border-secondary bg-secondary_subtle outline-none transition duration-200 hover:border-brand hover:shadow-(--dashboard-shell-shadow-lg) focus-visible:ring-4 focus-visible:ring-brand active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
        disabled={disabled}
        aria-label={strings.mediaEditor.preview(item.title)}
        onClick={onPreview}
      >
        {item.src && failedSrc !== item.src ? (
          <Image
            unoptimized
            fill
            src={item.src}
            alt={item.alt}
            sizes="(max-width: 768px) 66vw, 40vw"
            onError={() => setFailedSrc(item.src)}
            className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.04] motion-safe:group-focus-visible:scale-[1.04]"
          />
        ) : (
          <span className="grid h-full place-content-center text-tertiary">
            <UiIcon name="file" className="size-8" />
          </span>
        )}
      </button>
    </li>
  );
}

interface ImageMosaicProps<T extends ImageMosaicItem> {
  items: T[];
  label: string;
  disabled?: boolean;
  renderDetails?: (item: T, index: number) => ReactNode;
  renderActions?: (item: T, index: number) => ReactNode;
}

export function ImageMosaic<T extends ImageMosaicItem>({
  items,
  label,
  disabled,
  renderDetails,
  renderActions,
}: ImageMosaicProps<T>) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const list = useRef<HTMLOListElement>(null);
  const selectedIndex = items.findIndex((item) => item.id === selectedId);
  const selected = items[selectedIndex];
  return (
    <div className="@container min-w-0">
      <ol
        ref={list}
        tabIndex={-1}
        aria-label={label}
        className={cn(
          'ui-image-mosaic m-0 grid list-none grid-cols-3 gap-2 p-0 outline-none focus-visible:ring-4 focus-visible:ring-brand @xl:grid-cols-4 @3xl:grid-cols-5 @3xl:gap-3',
          items.length === 1 && 'grid-cols-2 @xl:grid-cols-2 @3xl:grid-cols-2',
          items.length === 2 && 'grid-cols-3 @xl:grid-cols-3 @3xl:grid-cols-3',
        )}
      >
        {items.map((item, index) => (
          <MosaicTile
            key={item.id}
            item={item}
            featured={index % 7 === 0}
            paired={items.length === 2}
            disabled={disabled}
            onPreview={() => {
              setSelectedId(item.id);
              setPreviewOpen(true);
            }}
          />
        ))}
      </ol>
      <ImagePreview
        image={selected ?? null}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        fallbackFocus={list}
        details={
          selected ? renderDetails?.(selected, selectedIndex) : undefined
        }
        actions={
          selected ? renderActions?.(selected, selectedIndex) : undefined
        }
      />
    </div>
  );
}
