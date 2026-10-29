import 'server-only';
import { gentlePathDemoStrings as copy } from '@/strings';
import { users } from './demoFixtures';
import type { Resource } from '@/modules/portal/models/resource';
import type { DemoPortalState } from './models/demoPortalState';

const globalPortal = globalThis as typeof globalThis & {
  gentlePathPortalState?: DemoPortalState;
};
const daysAgo = (days: number) =>
  new Date(Date.now() - days * 86400000).toISOString();

function createPortalState(): DemoPortalState {
  const categories: Resource['category'][] = [
    'everyday',
    'education',
    'communication',
    'wellbeing',
    'everyday',
    'wellbeing',
  ];
  const formats: Resource['format'][] = [
    'guide',
    'toolkit',
    'article',
    'guide',
    'toolkit',
    'article',
  ];
  return {
    children: users.map((user, index) => ({
      id: `child-${index + 1}`,
      userId: user.id,
      name: copy.childName,
      dateOfBirth: '2020-06-15',
      supportNotes: copy.childNotes,
    })),
    journals: users.flatMap((user, userIndex) =>
      copy.journalSeeds.map((seed, index) => ({
        id: `journal-${userIndex + 1}-${index + 1}`,
        userId: user.id,
        childId: `child-${userIndex + 1}`,
        title: seed.title,
        body: seed.body,
        emotion:
          index === 0
            ? ('grateful' as const)
            : index === 1
              ? ('calm' as const)
              : ('hopeful' as const),
        createdAt: daysAgo(index + 1),
        updatedAt: daysAgo(index + 1),
      })),
    ),
    resources: copy.resourceSeeds.map((seed, index) => ({
      id: `resource-${index + 1}`,
      ...seed,
      category: categories[index],
      format: formats[index],
      readMinutes: 3 + index,
      saved: false,
      ratings: { count: 0, average: null },
    })),
    milestones: copy.milestoneSeeds.map((seed, index) => ({
      id: `milestone-${index + 1}`,
      ...seed,
      response: null,
      observedAt: null,
    })),
    observations: users.map((user, index) => ({
      userId: user.id,
      childId: `child-${index + 1}`,
      milestoneId: 'milestone-1',
      response: 'emerging',
      observedAt: daysAgo(1),
    })),
    favorites: new Map(
      users.map((user) => [user.id, new Set(['resource-1', 'resource-4'])]),
    ),
    reports: copy.reportSeeds.map((seed, index) => ({
      id: `report-${index + 1}`,
      ...seed,
      status: 'open',
      createdAt: daysAgo(index + 1),
      resolutionNote: '',
      reviewerId: null,
      reviewedAt: null,
    })),
    settings: {
      communityEnabled: true,
      registrationsEnabled: true,
      maintenanceMode: false,
      resourceReviewRequired: true,
    },
  };
}

export function getDemoPortalState(): DemoPortalState {
  return (globalPortal.gentlePathPortalState ??= createPortalState());
}

export function resetDemoPortalState() {
  globalPortal.gentlePathPortalState = createPortalState();
}
