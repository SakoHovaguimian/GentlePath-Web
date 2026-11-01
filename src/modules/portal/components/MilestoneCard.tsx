import { Badge, Card, NavigationLink, QueryBoundary } from '@/components/ui';
import { gentlePathMilestoneAdminStrings as copy } from '@/strings';
import { SavedContentButton } from '@/modules/engagement/components/SavedContentButton';
import type { MilestoneGuidance } from '@/modules/milestone-admin/models/milestoneGuidance';
import { useMilestoneObservations } from '@/modules/milestone-admin/hooks';
import { formatMilestoneDate } from '@/modules/milestone-admin/formatMilestoneDate';
import { milestoneReaderPath } from '../milestoneReaderPath';
import { useGuardedNavigate } from '@/providers/useGuardedNavigate';
import { useNavigationGuard } from '@/providers/NavigationGuardProvider';
import { MilestoneProgressSelect } from './MilestoneProgressSelect';
import { MilestoneCoverImage } from './MilestoneCoverImage';

export function MilestoneCard({
  milestone,
  childId,
  returnTo,
}: {
  milestone: MilestoneGuidance;
  childId?: string;
  returnTo: string;
}) {
  const navigate = useGuardedNavigate();
  const { confirmNavigation } = useNavigationGuard();
  const href = milestoneReaderPath(milestone.id, childId, returnTo);
  const query = useMilestoneObservations({
    child_id: childId ?? '',
    milestone_id: milestone.id,
    limit: 1,
    offset: 0,
  });
  return (
    <>
      <Card className="gp-milestone-card">
        {milestone.image_url && (
          <MilestoneCoverImage
            key={milestone.image_url}
            src={milestone.image_url}
          />
        )}
        <NavigationLink
          className="gp-milestone-card__open"
          aria-label={copy.openMilestone(milestone.milestone)}
          href={href}
          beforeNavigate={confirmNavigation}
        />
        <div className="gp-milestone-card__heading">
          <div className="flex min-w-0 flex-wrap gap-1">
            {milestone.tags.map((tag) => (
              <Badge key={tag} intent="brand">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="gp-milestone-card__control">
            <SavedContentButton
              contentType="MILESTONE"
              contentId={milestone.id}
              variant="menu"
              menuLabel={copy.milestoneActions}
              menuItems={[
                { id: 'tips', icon: 'leaf', label: copy.browseMilestoneTips },
                {
                  id: 'information',
                  icon: 'info',
                  label: copy.informationLabel,
                },
                ...(childId
                  ? [
                      {
                        id: 'history',
                        icon: 'clock' as const,
                        label: copy.observationHistory,
                      },
                    ]
                  : []),
              ]}
              onMenuAction={(action) => {
                if (
                  action === 'tips' ||
                  action === 'information' ||
                  action === 'history'
                )
                  void navigate(
                    milestoneReaderPath(
                      milestone.id,
                      childId,
                      returnTo,
                      action,
                    ),
                  );
              }}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <h2 className="wrap-anywhere">{milestone.milestone}</h2>
          <p className="m-0 line-clamp-2 whitespace-pre-wrap text-sm leading-6 text-secondary wrap-anywhere">
            {milestone.information}
          </p>
        </div>
        <div className="gp-milestone-card__footer">
          <div className="gp-milestone-card__control min-w-0 flex-1">
            {childId && (
              <QueryBoundary
                query={query}
                loadingMessage={copy.observationLoad}
              >
                {(page) => (
                  <div className="grid gap-2">
                    <MilestoneProgressSelect
                      milestone={milestone}
                      childId={childId}
                      latest={page.data[0]}
                    />
                    {page.data[0] && (
                      <time
                        dateTime={page.data[0].observed_at}
                        className="text-xs text-tertiary"
                      >
                        {formatMilestoneDate(page.data[0].observed_at)}
                      </time>
                    )}
                  </div>
                )}
              </QueryBoundary>
            )}
          </div>
          <div className="gp-milestone-card__control">
            <SavedContentButton
              contentType="MILESTONE"
              contentId={milestone.id}
              variant="ghost"
            />
          </div>
        </div>
      </Card>
    </>
  );
}
