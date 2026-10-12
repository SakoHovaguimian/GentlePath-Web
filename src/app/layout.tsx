import type { Metadata } from 'next';
import './globals.css';
import { getRuntimeConfig } from '@/config/environment';
import { RuntimeProvider } from '@/providers/RuntimeProvider';
import { AnalyticsProvider } from '@/services/analytics/components/AnalyticsProvider';
import { CookieConsentControls } from '@/services/privacy/components/CookieConsentControls';
import { strings } from '@/strings';
export const metadata: Metadata = {
  title: { default: strings.app.name, template: `%s | ${strings.app.name}` },
  description: strings.app.description,
};
import type { ReactNode } from 'react';
import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';
import { ThemeScript } from '@/components/ui';

const bodyFont = IBM_Plex_Sans({ subsets: ['latin'], variable: '--font-body' });
const headingFont = IBM_Plex_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
});
const monoFont = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      data-theme="light"
      data-accent="aqua"
      suppressHydrationWarning
    >
      <body
        className={`${bodyFont.variable} ${headingFont.variable} ${monoFont.variable} bg-primary text-primary antialiased`}
      >
        <ThemeScript />
        <RuntimeProvider config={getRuntimeConfig()}>
          <AnalyticsProvider />
          {children}
          <CookieConsentControls />
        </RuntimeProvider>
      </body>
    </html>
  );
}
