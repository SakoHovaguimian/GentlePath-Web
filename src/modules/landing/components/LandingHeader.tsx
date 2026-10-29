'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { GentlePathBrand } from '@/components/GentlePathBrand';
import { Button, UiIcon } from '@/components/ui';
import { gentlePathLandingStrings as copy } from '@/strings';

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
          <Link href="/#your-family">{copy.navigation.familyLabel}</Link>
          <Link href="/blog">{copy.navigation.blogLabel}</Link>
        </nav>
        <div className="gp-header-actions">
          <Link href="/login" className="gp-login-link">
            {copy.navigation.loginAction}
          </Link>
          <Button asChild className="gp-button gp-header-signup">
            <Link href="/signup">
              {copy.navigation.signupAction}
              <UiIcon name="arrowRight" />
            </Link>
          </Button>
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
        <Link href="/#your-family" onClick={closeMenu}>
          {copy.navigation.familyLabel}
        </Link>
        <Link href="/blog" onClick={closeMenu}>
          {copy.navigation.blogLabel}
        </Link>
        <Link href="/login" onClick={closeMenu}>
          {copy.navigation.loginAction}
        </Link>
        <Button asChild className="gp-button">
          <Link href="/signup" onClick={closeMenu}>
            {copy.navigation.signupAction}
            <UiIcon name="arrowRight" />
          </Link>
        </Button>
      </nav>
    </header>
  );
}
