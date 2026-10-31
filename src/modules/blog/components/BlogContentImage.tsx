'use client';
import Image from 'next/image';
import type { ComponentProps } from 'react';
import { useRuntimeConfig } from '@/providers/RuntimeProvider';
import { resolveDemoMediaUrl } from '@/services/demo/demoMedia';

export function BlogContentImage({
  src,
  alt,
  ...props
}: ComponentProps<typeof Image> & { src: string }) {
  const { demoMode } = useRuntimeConfig();
  return (
    <Image {...props} alt={alt} src={resolveDemoMediaUrl(src, demoMode)} />
  );
}
