import 'server-only';
import {
  gentlePathExpandedResourceCatalogue,
  gentlePathDemoStrings,
  gentlePathEditorialStrings,
  gentlePathPortalStrings,
} from '@/strings';
import type { EditorialResource } from '../models/editorialResource';
import type { DemoResourceCollectionSeed } from '../models/demoResourceCollectionSeed';

const copy = gentlePathPortalStrings.resources;
const tags = copy.demoTags;

export const demoResourceCatalogueVersion = 2;

export const demoResourceCollectionSeeds = [
  {
    id: '38000000-0000-4000-8000-000000000001',
    category: 'everyday',
    content: copy.demoCollections.everyday,
    tags: [tags.routines, tags.choices],
    resources: [
      copy.demoResources.morningChoices,
      copy.demoResources.homeLandingSpot,
      copy.demoResources.flexibleWeekend,
    ],
  },
  {
    id: '38000000-0000-4000-8000-000000000002',
    category: 'communication',
    content: copy.demoCollections.communication,
    tags: [tags.communication, tags.AAC, tags.choices],
    resources: [
      copy.demoResources.communicationWait,
      copy.demoResources.communicationPreferences,
      copy.demoResources.AACEveryday,
    ],
  },
  {
    id: '38000000-0000-4000-8000-000000000003',
    category: 'education',
    content: copy.demoCollections.school,
    tags: [tags.school, tags.advocacy, tags.planning],
    resources: [
      copy.demoResources.schoolStrengths,
      copy.demoResources.schoolFollowUp,
      copy.demoResources.classroomChange,
    ],
  },
  {
    id: '38000000-0000-4000-8000-000000000004',
    category: 'everyday',
    content: copy.demoCollections.transitions,
    tags: [tags.transitions, tags.routines, tags.planning],
    resources: [
      copy.demoResources.transitionWarnings,
      copy.demoResources.leavingPlay,
      copy.demoResources.planChanges,
    ],
  },
  {
    id: '38000000-0000-4000-8000-000000000005',
    category: 'everyday',
    content: copy.demoCollections.sensory,
    tags: [tags.sensory, tags.accessibility, tags.choices],
    resources: [
      copy.demoResources.soundComfort,
      copy.demoResources.comfortCorner,
      copy.demoResources.clothingComfort,
      copy.demoResources.movementBreaks,
    ],
  },
  {
    id: '38000000-0000-4000-8000-000000000006',
    category: 'communication',
    content: copy.demoCollections.play,
    tags: [tags.play, tags.interests, tags.connection],
    resources: [
      copy.demoResources.followInterest,
      copy.demoResources.parallelPlay,
      copy.demoResources.playInvitations,
      copy.demoResources.interestNotebook,
    ],
  },
  {
    id: '38000000-0000-4000-8000-000000000007',
    category: 'wellbeing',
    content: copy.demoCollections.evenings,
    tags: [tags.rest, tags.routines, tags.caregivers],
    resources: [
      copy.demoResources.eveningAnchors,
      copy.demoResources.sleepObservations,
      copy.demoResources.bedtimeChoices,
      copy.demoResources.nighttimeSupport,
    ],
  },
  {
    id: '38000000-0000-4000-8000-000000000008',
    category: 'everyday',
    content: copy.demoCollections.mealtimes,
    tags: [tags.mealtimes, tags.sensory, tags.choices],
    resources: [
      copy.demoResources.mealtimePredictability,
      copy.demoResources.foodPreferences,
      copy.demoResources.sharedMealRoles,
      copy.demoResources.mealsAway,
    ],
  },
  {
    id: '38000000-0000-4000-8000-000000000009',
    category: 'everyday',
    content: copy.demoCollections.outings,
    tags: [tags.appointments, tags.accessibility, tags.planning],
    resources: [
      copy.demoResources.appointmentQuestions,
      copy.demoResources.outingBag,
      copy.demoResources.quietVisit,
      copy.demoResources.visitDebrief,
    ],
  },
  {
    id: '38000000-0000-4000-8000-000000000010',
    category: 'wellbeing',
    content: copy.demoCollections.caregivers,
    tags: [tags.caregivers, tags.rest, tags.community],
    resources: [
      copy.demoResources.askForHelp,
      copy.demoResources.caregiverEnergy,
      copy.demoResources.supportCircle,
    ],
  },
  {
    id: '38000000-0000-4000-8000-000000000011',
    category: 'wellbeing',
    content: copy.demoCollections.family,
    tags: [tags.connection, tags.siblings, tags.strengths],
    resources: [
      copy.demoResources.siblingTime,
      copy.demoResources.familyCommunication,
      copy.demoResources.celebrateStrengths,
    ],
  },
  {
    id: '38000000-0000-4000-8000-000000000012',
    category: 'education',
    content: copy.demoCollections.planning,
    tags: [tags.planning, tags.documents, tags.advocacy, tags.community],
    resources: [
      copy.demoResources.documentFolder,
      copy.demoResources.serviceQuestions,
      copy.demoResources.followUpPlan,
      copy.demoResources.communityOptions,
    ],
  },
  ...gentlePathExpandedResourceCatalogue,
] as const satisfies readonly DemoResourceCollectionSeed[];

const originalCollectionIndexes = [0, 2, 1, 9, 3, 10] as const;
const originalFormats = [
  'guide',
  'toolkit',
  'article',
  'guide',
  'toolkit',
  'article',
] as const;

export function createDemoResourceCatalogue(
  reviewer: string,
  now: string,
): EditorialResource[] {
  const daysAgo = (days: number) =>
    new Date(Date.parse(now) - days * 86400000).toISOString();
  const createResource = (
    content: { title: string; description: string; body: string },
    id: string,
    collection: DemoResourceCollectionSeed,
    format: 'guide' | 'toolkit' | 'article',
    minutes: number,
    age: number,
  ): EditorialResource => ({
    id,
    content_type: 'RESOURCE',
    version: 1,
    milestone_ids: [`milestone-${(age % 3) + 1}`],
    state_codes: age % 5 === 0 ? ['CA'] : age % 7 === 0 ? ['NY'] : [],
    official_source_url: age % 2 === 0 ? 'https://www.ed.gov/' : null,
    verified_at: age % 4 === 0 ? now : null,
    title: content.title,
    description: content.description,
    parent_id: collection.id,
    type:
      format === 'guide'
        ? 'GUIDE'
        : format === 'toolkit'
          ? 'TOOLKIT'
          : 'ARTICLE',
    format: 'WEB_PAGE',
    tags: [...collection.tags],
    url: null,
    resource_details: {
      source_name: gentlePathEditorialStrings.demo.sourceName,
      source_url: gentlePathEditorialStrings.demo.sourceUrl,
      source_published_at: daysAgo(age).slice(0, 10),
      reviewed_at: now,
      reviewed_by_user_id: reviewer,
      additional_properties: {
        family_category: collection.category,
        estimated_minutes: minutes,
        body: content.body,
      },
    },
    created_at: daysAgo(age),
    updated_at: daysAgo(Math.max(0, age - 3)),
    ratings: { count: 0, average: null },
    children_count: 0,
  });
  const resources = gentlePathDemoStrings.resourceSeeds.map((content, index) =>
    createResource(
      content,
      `resource-${index + 1}`,
      demoResourceCollectionSeeds[originalCollectionIndexes[index]],
      originalFormats[index],
      3 + index,
      index + 1,
    ),
  );
  let index = 0;
  for (const collection of demoResourceCollectionSeeds) {
    for (const content of collection.resources) {
      resources.push(
        createResource(
          content,
          `resource-${index + 7}`,
          collection,
          (['article', 'guide', 'toolkit'] as const)[index % 3],
          3 + ((index * 5) % 14),
          10 + ((index * 7) % 97),
        ),
      );
      index++;
    }
  }
  return [
    ...demoResourceCollectionSeeds.map(
      (collection, index): EditorialResource => ({
        id: collection.id,
        content_type: 'RESOURCE',
        version: 1,
        milestone_ids: [`milestone-${(index % 3) + 1}`],
        state_codes: [],
        official_source_url: null,
        verified_at: null,
        title: collection.content.title,
        description: collection.content.description,
        parent_id: null,
        type: 'COLLECTION',
        format: null,
        tags: [...collection.tags],
        url: null,
        resource_details: {
          source_name: null,
          source_url: null,
          source_published_at: null,
          reviewed_at: now,
          reviewed_by_user_id: reviewer,
          additional_properties: { family_category: collection.category },
        },
        created_at: daysAgo(4 + index * 6),
        updated_at: daysAgo(index % 5),
        ratings: { count: 0, average: null },
        children_count: resources.filter(
          (resource) => resource.parent_id === collection.id,
        ).length,
      }),
    ),
    ...resources,
  ];
}
