import type { ReactNode } from 'react';
import { LandingHeader } from '@/modules/landing/components/LandingHeader';
import { LandingFooter } from '@/modules/landing/components/LandingFooter';

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div className="gp-public">
      <LandingHeader />
      {children}
      <LandingFooter />
    </div>
  );
}
