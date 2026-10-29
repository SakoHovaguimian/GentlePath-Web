import { UiIcon, type AppSidebarItem } from '@/components/ui';
import type { UserRole } from '@/models/userRole';
import {
  canManageContent,
  canManagePlatform,
} from '@/services/auth/permissions';
import { gentlePathPortalStrings as copy } from '@/strings';

export function portalNavigation(
  role: UserRole,
  adminArea: boolean,
  developer: boolean,
): AppSidebarItem[] {
  const family: AppSidebarItem[] = [
    {
      href: '/dashboard',
      label: copy.navigation.home,
      icon: <UiIcon name="home" />,
    },
    {
      href: '/journal',
      label: copy.navigation.journal,
      icon: <UiIcon name="file" />,
    },
    {
      href: '/family',
      label: copy.navigation.family,
      icon: <UiIcon name="user" />,
    },
    {
      href: '/milestones',
      label: copy.navigation.milestones,
      icon: <UiIcon name="leaf" />,
    },
    {
      href: '/resources',
      label: copy.navigation.resources,
      icon: <UiIcon name="layers" />,
    },
    {
      href: '/saved',
      label: copy.navigation.saved,
      icon: <UiIcon name="checklist" />,
    },
  ];
  const administration: AppSidebarItem[] = [
    {
      href: '/admin',
      label: copy.navigation.admin,
      icon: <UiIcon name="grid" />,
    },
    {
      href: '/admin/users',
      label: copy.navigation.users,
      icon: <UiIcon name="user" />,
    },
    {
      href: '/admin/blog',
      label: copy.navigation.publishing,
      icon: <UiIcon name="file" />,
    },
    {
      href: '/admin/moderation',
      label: copy.navigation.moderation,
      icon: <UiIcon name="lock" />,
    },
    ...(canManagePlatform(role)
      ? [
          {
            href: '/admin/settings',
            label: copy.navigation.system,
            icon: <UiIcon name="settings" />,
          },
        ]
      : []),
  ];
  return [
    ...(adminArea && canManageContent(role)
      ? [...administration, family[0]]
      : [...family, ...(canManageContent(role) ? [administration[0]] : [])]),
    {
      href: '/blog',
      label: copy.navigation.blog,
      icon: <UiIcon name="globe" />,
      sectionLabel: copy.navigation.exploreGroup,
    },
    {
      href: '/settings/appearance',
      label: copy.navigation.appearance,
      icon: <UiIcon name="settings" />,
      placement: 'bottom',
    },
    ...(developer
      ? [
          {
            href: '/dev-settings',
            label: copy.navigation.developer,
            icon: <UiIcon name="code" />,
          },
        ]
      : []),
    {
      href: '/',
      label: copy.navigation.public,
      icon: <UiIcon name="arrowRight" />,
    },
  ];
}
