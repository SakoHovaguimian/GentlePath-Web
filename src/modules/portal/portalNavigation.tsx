import { UiIcon, type AppSidebarItem } from '@/components/ui';
import type { UserRole } from '@/models/userRole';
import {
  canManageContent,
  canManagePlatform,
} from '@/services/auth/permissions';
import { gentlePathPortalStrings as copy } from '@/strings';
import { gentlePathWorkspaceStrings } from '@/strings';

const navigationCopy = gentlePathWorkspaceStrings.navigation;

export function portalNavigation(
  role: UserRole,
  adminArea: boolean,
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
      href: '/documents',
      label: navigationCopy.documents,
      icon: <UiIcon name="folder" />,
    },
    {
      href: '/community',
      label: navigationCopy.community,
      icon: <UiIcon name="chat" />,
      activePaths: ['/community', '/polls'],
      sectionLabel: copy.navigation.exploreGroup,
    },
    {
      href: '/guides',
      label: navigationCopy.guides,
      icon: <UiIcon name="leaf" />,
    },
    {
      href: '/tips',
      label: navigationCopy.tips,
      icon: <UiIcon name="sun" />,
    },
    {
      href: '/discounts',
      label: navigationCopy.discounts,
      icon: <UiIcon name="tag" />,
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
      sectionLabel: navigationCopy.peopleGroup,
      icon: <UiIcon name="user" />,
    },
    {
      href: '/admin/moderation',
      label: copy.navigation.moderation,
      icon: <UiIcon name="checklist" />,
    },
    {
      href: '/admin/blog',
      label: copy.navigation.publishing,
      icon: <UiIcon name="file" />,
      sectionLabel: navigationCopy.contentGroup,
    },
    {
      href: '/admin/guides',
      label: navigationCopy.editorial,
      icon: <UiIcon name="layers" />,
    },
    {
      href: '/admin/milestones',
      label: navigationCopy.milestoneAdmin,
      icon: <UiIcon name="leaf" />,
    },
    {
      href: '/admin/commercial',
      label: navigationCopy.commercial,
      sectionLabel: navigationCopy.platformGroup,
      icon: <UiIcon name="globe" />,
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
      ? [administration[0], family[0], ...administration.slice(1)]
      : canManageContent(role)
        ? [administration[0], ...family]
        : family),
    {
      href: '/help',
      label: navigationCopy.help,
      ...(adminArea ? { sectionLabel: navigationCopy.supportGroup } : {}),
      icon: <UiIcon name="file" />,
    },
    {
      href: '/settings/appearance',
      label: copy.navigation.appearance,
      icon: <UiIcon name="settings" />,
      placement: 'bottom',
    },
    {
      href: '/',
      label: copy.navigation.public,
      icon: <UiIcon name="arrowRight" />,
    },
  ];
}
