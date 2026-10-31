'use client';

import { useState } from 'react';
import { ThemeToggle } from '@/modules/settings/components/ThemeToggle';
import { PresentationProvider } from '@/presentation/PresentationProvider';
import { createPublicThemePreferenceService } from '@/publicClientContainer';
import { ThemePreferenceProvider } from '@/providers/ThemePreferenceProvider';

export function LandingThemeToggle() {
  const [service] = useState(createPublicThemePreferenceService);

  return (
    <ThemePreferenceProvider service={service}>
      <PresentationProvider>
        <span className="gp-theme-toggle">
          <ThemeToggle />
        </span>
      </PresentationProvider>
    </ThemePreferenceProvider>
  );
}
