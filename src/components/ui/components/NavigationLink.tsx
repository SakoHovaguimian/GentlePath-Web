'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import type { ComponentProps } from 'react';
import type { NavigationPermission } from '../models/navigationPermission';

type NavigationLinkProps = Omit<
  ComponentProps<typeof Link>,
  'href' | 'onNavigate'
> & {
  href: string;
  beforeNavigate?: NavigationPermission;
  navigate?: (href: string) => void;
};

export function NavigationLink({
  href,
  beforeNavigate,
  navigate,
  ...props
}: NavigationLinkProps) {
  const router = useRouter();
  return (
    <Link
      {...props}
      href={href as Route}
      onNavigate={(event) => {
        const allowed = beforeNavigate?.(href) ?? true;
        if (typeof allowed !== 'boolean') {
          event.preventDefault();
          void allowed.then((confirmed) => {
            if (confirmed) {
              if (navigate) navigate(href);
              else router.push(href as Route);
            }
          });
        } else if (!allowed) {
          event.preventDefault();
        } else if (navigate) {
          event.preventDefault();
          navigate(href);
        }
        // Clean forms use Link's own push and prefetch behavior synchronously.
      }}
    />
  );
}
