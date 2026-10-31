import 'server-only';
import { gentlePathDemoStrings as copy } from '@/strings';
import { users } from './demoFixtures';
import type { Resource } from '@/modules/portal/models/resource';
import type { DemoPortalState } from './models/demoPortalState';
import { JournalEmotionSchema } from '@/modules/portal/models/journalEmotion';
import { ChildSupportDetailsSchema } from '@/modules/portal/models/childSupportDetails';

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
    children: users.flatMap((user, index) => [
      {
        id: `child-${index + 1}`,
        userId: user.id,
        name: copy.childName,
        dateOfBirth: '2020-06-15',
        gender: 'NON_BINARY' as const,
        supportNotes: copy.childSupportNotes,
        supportDetails: ChildSupportDetailsSchema.parse(
          copy.childSupportDetails,
        ),
      },
      {
        id: `child-${index + 1}-younger`,
        userId: user.id,
        name: copy.youngerChildName,
        dateOfBirth: '2023-02-08',
        gender: null,
        supportNotes: '',
        supportDetails: ChildSupportDetailsSchema.parse({
          communication: copy.youngerChildCommunication,
        }),
      },
    ]),
    journals: users.flatMap((user, userIndex) =>
      copy.journalSeeds.map((seed, index) => ({
        id: `journal-${userIndex + 1}-${index + 1}`,
        userId: user.id,
        childId:
          index === 5
            ? null
            : `child-${userIndex + 1}${index === 4 ? '-younger' : ''}`,
        title: seed.title,
        body: seed.body,
        emotions:
          index === 0
            ? ['grateful' as const, 'hopeful' as const]
            : index === 1
              ? ['calm' as const]
              : index === 3
                ? ['tired' as const, 'hopeful' as const]
                : index === 4
                  ? ['overwhelmed' as const]
                  : [],
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
    observations: users.flatMap((user, index) =>
      (
        [
          'emerging',
          'often',
          'not_yet',
          'stopped',
          'often',
          'emerging',
        ] as const
      ).map((response, position) => ({
        userId: user.id,
        childId: `child-${index + 1}`,
        milestoneId: `milestone-${position + 1}`,
        response,
        observedAt: daysAgo(position + 1),
      })),
    ),
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
  const state = (globalPortal.gentlePathPortalState ??= createPortalState());
  // Upgrade retained development records without resetting private drafts or edits.
  for (const child of state.children) {
    child.gender ??= null;
    child.supportDetails = ChildSupportDetailsSchema.parse(
      child.supportDetails ?? {},
    );
  }
  for (const entry of state.journals) {
    if (Array.isArray(entry.emotions)) continue;
    const legacyEmotion = JournalEmotionSchema.safeParse(
      'emotion' in entry ? entry.emotion : undefined,
    );
    entry.emotions = legacyEmotion.success ? [legacyEmotion.data] : [];
    Reflect.deleteProperty(entry, 'emotion');
  }
  return state;
}

export function resetDemoPortalState() {
  globalPortal.gentlePathPortalState = createPortalState();
}
