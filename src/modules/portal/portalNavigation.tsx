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
      href: '/documents',
      label: navigationCopy.documents,
      icon: <UiIcon name="folder" />,
    },
    {
      href: '/saved',
      label: navigationCopy.saved,
      icon: <UiIcon name="checklist" />,
    },
    {
      href: '/guides',
      label: navigationCopy.guides,
      icon: <UiIcon name="leaf" />,
      sectionLabel: copy.navigation.exploreGroup,
    },
    {
      href: '/community',
      label: navigationCopy.community,
      icon: <UiIcon name="chat" />,
    },
    {
      href: '/polls',
      label: navigationCopy.polls,
      icon: <UiIcon name="chart" />,
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
      icon: <UiIcon name="globe" />,
    },
    ...(canManagePlatform(role)
      ? [
          {
            href: '/admin/settings',
            label: copy.navigation.system,
            icon: <UiIcon name="settings" />,
          },
          {
            href: '/admin/ai-usage',
            label: navigationCopy.aiUsage,
            icon: <UiIcon name="code" />,
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
      sectionLabel: adminArea ? copy.navigation.exploreGroup : undefined,
    },
    {
      href: '/notifications',
      label: navigationCopy.notifications,
      icon: <UiIcon name="bell" />,
    },
    {
      href: '/settings/account',
      label: navigationCopy.account,
      icon: <UiIcon name="user" />,
    },
    {
      href: '/help',
      label: navigationCopy.help,
      icon: <UiIcon name="file" />,
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
