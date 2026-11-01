'use client';

import { useSearchParams } from 'next/navigation';
import {
  Badge,
  Button,
  NavigationLink,
  Page,
  PageHeader,
  QueryBoundary,
  UiIcon,
} from '@/components/ui';
import {
  gentlePathEditorialDiscoveryStrings as copy,
  gentlePathMilestoneAdminStrings as milestoneCopy,
  gentlePathPortalStrings as portalCopy,
} from '@/strings';
import { useMilestoneGuidanceDetail } from '@/modules/milestone-admin/hooks';
import { SavedContentButton } from '@/modules/engagement/components/SavedContentButton';
import { MilestoneCoverImage } from './components/MilestoneCoverImage';
import { MilestoneAnchorSync } from './components/MilestoneAnchorSync';
import { MilestoneFamilyContext } from './components/MilestoneFamilyContext';
import { MilestoneTips } from './components/MilestoneTips';
import { MilestoneRelatedContent } from './components/MilestoneRelatedContent';
import { MilestoneContentSection } from './components/MilestoneContentSection';
import { milestoneListReturnPath } from './milestoneReaderPath';
import './styles/portal.css';
import './styles/resources.css';
import '@/modules/community/styles/community.css';
import '@/modules/polls/styles/polls.css';
import './styles/milestone-detail.css';

export function MilestoneDetailScreen({ id }: { id: string }) {
  const query = useMilestoneGuidanceDetail(id);
  const params = useSearchParams();
  const returnTo = milestoneListReturnPath(params.get('returnTo'));
  const readerPath = `/milestones/${encodeURIComponent(id)}${params.size ? `?${params}` : ''}`;
  const jumps = [
    { id: 'information', label: copy.informationTitle },
    { id: 'progress', label: copy.privateProgressTitle },
    { id: 'tips', label: copy.familyTipsTitle },
    { id: 'posts', label: copy.discussion },
    { id: 'questions', label: copy.question },
    { id: 'polls', label: copy.polls },
    { id: 'guides', label: copy.guides },
    { id: 'resources', label: copy.resources },
    { id: 'collections', label: copy.collections },
    { id: 'articles', label: copy.articles },
  ];
  return (
    <Page className="gp-portal-page gp-milestone-detail">
      <QueryBoundary
        query={query}
        loadingMessage={milestoneCopy.loadingMilestones}
      >
        {(milestone) => (
          <>
            <MilestoneAnchorSync />
            <div className="gp-milestone-detail__header">
              <MilestoneCoverImage
                key={milestone.image_url ?? 'fallback'}
                src={milestone.image_url}
                variant="header"
                title={milestone.milestone}
              />
              <PageHeader
                title={milestone.milestone}
                eyebrow={portalCopy.milestones.title}
                meta={milestone.tags.map((tag) => (
                  <Badge key={tag} intent="brand">
                    {tag}
                  </Badge>
                ))}
                action={
                  <>
                    <SavedContentButton
                      contentType="MILESTONE"
                      contentId={milestone.id}
                    />
                    <Button asChild variant="secondary">
                      <NavigationLink
                        href={`/community?compose=1&kind=QUESTION&milestone=${encodeURIComponent(milestone.id)}&returnTo=${encodeURIComponent(readerPath)}`}
                      >
                        {copy.askQuestion}
                      </NavigationLink>
                    </Button>
                  </>
                }
              />
            </div>
            <Button asChild variant="ghost" className="justify-self-start">
              <NavigationLink href={returnTo}>
                <UiIcon name="chevronLeft" />
                {copy.backToMilestones}
              </NavigationLink>
            </Button>
            <nav
              aria-label={copy.jumpNavigation}
              className="gp-milestone-detail__navigation"
            >
              <span className="text-sm font-semibold text-primary">
                {copy.jumpNavigation}
              </span>
              <div className="flex min-w-0 flex-wrap gap-x-4 gap-y-2">
                {jumps.map((jump) => (
                  <NavigationLink
                    key={jump.id}
                    href={`#${jump.id}`}
                    className="text-sm text-brand-secondary underline underline-offset-4 hover:text-primary focus-visible:outline-2 focus-visible:outline-brand"
                  >
                    {jump.label}
                  </NavigationLink>
                ))}
              </div>
            </nav>
            <MilestoneContentSection
              id="information"
              title={copy.informationTitle}
            >
              <p className="m-0 whitespace-pre-wrap text-secondary wrap-anywhere">
                {milestone.information}
              </p>
              {milestone.observation_guidance && (
                <div className="grid gap-2">
                  <h3 className="m-0 text-base font-semibold text-primary">
                    {milestoneCopy.observationGuidanceLabel}
                  </h3>
                  <p className="m-0 whitespace-pre-wrap text-secondary wrap-anywhere">
                    {milestone.observation_guidance}
                  </p>
                </div>
              )}
            </MilestoneContentSection>
            <MilestoneContentSection
              id="progress"
              title={copy.privateProgressTitle}
              description={copy.privateProgressDescription}
            >
              <div id="history">
                <MilestoneFamilyContext milestone={milestone} />
              </div>
            </MilestoneContentSection>
            <MilestoneContentSection id="tips" title={copy.familyTipsTitle}>
              <MilestoneTips
                key={milestone.id}
                milestoneId={milestone.id}
                pageSize={3}
              />
            </MilestoneContentSection>
            <MilestoneRelatedContent
              key={milestone.id}
              milestoneId={milestone.id}
              returnTo={readerPath}
            />
          </>
        )}
      </QueryBoundary>
    </Page>
  );
}
