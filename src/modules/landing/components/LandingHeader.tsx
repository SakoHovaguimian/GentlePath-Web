'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { GentlePathBrand } from '@/components/GentlePathBrand';
import { Button, IconMenu, UiIcon } from '@/components/ui';
import { gentlePathLandingStrings as copy } from '@/strings';
import { LandingThemeToggle } from './LandingThemeToggle';

export function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header
      className="gp-public-header"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && menuOpen) {
          closeMenu();
          menuButton.current?.focus();
        }
      }}
    >
      <div className="gp-container gp-header-inner">
        <Link href="/" className="gp-brand-link" aria-label={copy.homeLabel}>
          <GentlePathBrand />
        </Link>
        <nav className="gp-desktop-nav" aria-label={copy.mainNavigationLabel}>
          <Link href="/#support">{copy.navigation.supportLabel}</Link>
          <Link href="/#features">{copy.navigation.featuresLabel}</Link>
          <Link href="/#our-purpose">{copy.navigation.purposeLabel}</Link>
          <Link href="/#contact">{copy.navigation.contactLabel}</Link>
        </nav>
        <div className="gp-header-actions">
          <IconMenu
            label={copy.navigation.accountAction}
            triggerLabel={copy.navigation.accountAction}
            icon="user"
            className="gp-account-access"
            items={[
              {
                id: 'signup',
                label: copy.navigation.createAccountAction,
                icon: 'arrowRight',
                href: '/signup',
              },
              {
                id: 'login',
                label: copy.navigation.loginAction,
                icon: 'user',
                href: '/login',
              },
            ]}
          />
          <Button
            ref={menuButton}
            variant="ghost"
            className="gp-mobile-toggle"
            aria-label={
              menuOpen
                ? copy.navigation.closeMenuAction
                : copy.navigation.openMenuAction
            }
            aria-expanded={menuOpen}
            aria-controls="gentlepath-public-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <UiIcon name={menuOpen ? 'close' : 'menu'} />
          </Button>
          <LandingThemeToggle />
        </div>
      </div>
      <nav
        id="gentlepath-public-navigation"
        className="gp-mobile-nav"
        hidden={!menuOpen}
        aria-label={copy.mobileNavigationLabel}
      >
        <Link href="/#support" onClick={closeMenu}>
          {copy.navigation.supportLabel}
        </Link>
        <Link href="/#features" onClick={closeMenu}>
          {copy.navigation.featuresLabel}
        </Link>
        <Link href="/#our-purpose" onClick={closeMenu}>
          {copy.navigation.purposeLabel}
        </Link>
        <Link href="/#contact" onClick={closeMenu}>
          {copy.navigation.contactLabel}
        </Link>
        <Link href="/blog" onClick={closeMenu}>
          {copy.navigation.blogLabel}
        </Link>
      </nav>
    </header>
  );
}
