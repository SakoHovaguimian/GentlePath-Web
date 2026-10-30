import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { GentlePathBrand } from '@/components/GentlePathBrand';
import { buttonClassName } from '@/components/ui';
import { gentlePathLandingStrings, strings } from '@/strings';

const copy = strings.notFoundPage;

export const metadata: Metadata = {
  title: copy.metadataTitle,
  description: copy.description,
};

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-primary">
      <header className="mx-auto w-full max-w-6xl px-6 py-6 sm:px-10">
        <Link
          href="/"
          className="gp-brand-link rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
          aria-label={gentlePathLandingStrings.homeLabel}
        >
          <GentlePathBrand />
        </Link>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-6 pt-4 pb-16 text-center sm:pt-0 sm:pb-20">
        <Image
          src="/gentlepath/off-the-path.png"
          width={1536}
          height={1024}
          alt={copy.illustrationAlt}
          sizes="(max-width: 640px) calc(100vw - 48px), 480px"
          preload
          className="mb-6 h-auto w-full max-w-120 rounded-2xl"
        />
        <p className="mb-3 text-sm font-semibold tracking-widest text-tertiary">
          {copy.eyebrow}
        </p>
        <h1 className="font-display text-3xl font-normal text-primary sm:text-4xl">
          {copy.title}
        </h1>
        <p className="mt-4 max-w-108 text-base text-tertiary">
          {copy.description}
        </p>
        <div className="mt-8 flex w-full max-w-sm flex-col items-stretch justify-center gap-3 sm:w-auto sm:max-w-none sm:flex-row">
          <Link href="/dashboard" className={buttonClassName()}>
            {strings.app.backToWorkspace}
          </Link>
          <Link href="/" className={buttonClassName('secondary')}>
            {copy.homeAction}
          </Link>
        </div>
      </main>
    </div>
  );
}
