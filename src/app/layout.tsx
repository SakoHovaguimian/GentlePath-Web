import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import localFont from 'next/font/local';
import './globals.css';
import { getEffectiveRuntime } from '@/services/demo/demoRuntime';
import { RuntimeProvider } from '@/providers/RuntimeProvider';
import { AnalyticsProvider } from '@/services/analytics/components/AnalyticsProvider';
import { CookieConsentControls } from '@/services/privacy/components/CookieConsentControls';
import { gentlePathLandingStrings, strings } from '@/strings';
import { ThemeScript } from '@/components/ui';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.PORTAL_APP_ORIGIN ||
      `http://localhost:${process.env.PORT || 3001}`,
  ),
  title: {
    default: gentlePathLandingStrings.metadata.title,
    template: `%s | ${strings.app.name}`,
  },
  description: gentlePathLandingStrings.metadata.description,
  icons: {
    icon: [
      { url: '/gentlepath/app-icon.svg', type: 'image/svg+xml' },
      { url: '/gentlepath/favicon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/gentlepath/app-icon.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: '/gentlepath/favicon-32.png',
    apple: {
      url: '/gentlepath/apple-touch-icon.png',
      sizes: '180x180',
      type: 'image/png',
    },
  },
  openGraph: {
    type: 'website',
    siteName: gentlePathLandingStrings.brandTitle,
    title: gentlePathLandingStrings.metadata.title,
    description: gentlePathLandingStrings.metadata.description,
    images: [
      {
        url: '/gentlepath/share-preview.png',
        width: 1200,
        height: 630,
        alt: gentlePathLandingStrings.metadata.previewAlt,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: gentlePathLandingStrings.metadata.title,
    description: gentlePathLandingStrings.metadata.description,
    images: ['/gentlepath/share-preview.png'],
  },
};

const bodyFont = localFont({
  src: [
    {
      path: '../../public/gentlepath/fonts/dm-sans-400-normal.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/gentlepath/fonts/dm-sans-500-normal.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/gentlepath/fonts/dm-sans-600-normal.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/gentlepath/fonts/dm-sans-700-normal.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-body',
  display: 'swap',
});
const headingFont = localFont({
  src: [
    {
      path: '../../public/gentlepath/fonts/lora-400-normal.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/gentlepath/fonts/lora-400-italic.ttf',
      weight: '400',
      style: 'italic',
    },
  ],
  variable: '--font-display',
  display: 'swap',
  adjustFontFallback: false,
});

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const runtimeConfig = await getEffectiveRuntime();

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      data-theme="light"
      data-accent="brand"
      suppressHydrationWarning
    >
      <body
        className={`${bodyFont.variable} ${headingFont.variable} bg-primary text-primary antialiased`}
      >
        <ThemeScript />
        <RuntimeProvider config={runtimeConfig}>
          <AnalyticsProvider />
          {children}
          <CookieConsentControls />
        </RuntimeProvider>
      </body>
    </html>
  );
}
