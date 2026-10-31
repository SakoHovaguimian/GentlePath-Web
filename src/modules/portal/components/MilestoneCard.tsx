import { Badge, Card, CardOpenButton, QueryBoundary } from '@/components/ui';
import { gentlePathMilestoneAdminStrings as copy } from '@/strings';
import { SavedContentButton } from '@/modules/engagement/components/SavedContentButton';
import type { MilestoneGuidance } from '@/modules/milestone-admin/models/milestoneGuidance';
import { useMilestoneObservations } from '@/modules/milestone-admin/hooks';
import { formatMilestoneDate } from '@/modules/milestone-admin/formatMilestoneDate';
import type { MilestoneDetailsSection } from '../models/milestoneDetailsSection';
import { MilestoneProgressSelect } from './MilestoneProgressSelect';
import { MilestoneCoverImage } from './MilestoneCoverImage';

export function MilestoneCard({
  milestone,
  childId,
  onOpen,
}: {
  milestone: MilestoneGuidance;
  childId: string;
  onOpen: (section: MilestoneDetailsSection) => void;
}) {
  const query = useMilestoneObservations({
    child_id: childId,
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
        <CardOpenButton
          type="button"
          className="gp-milestone-card__open"
          aria-label={copy.openMilestone(milestone.milestone)}
          onClick={() => onOpen('information')}
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
                {
                  id: 'history',
                  icon: 'clock',
                  label: copy.observationHistory,
                },
              ]}
              onMenuAction={(action) => {
                if (
                  action === 'tips' ||
                  action === 'information' ||
                  action === 'history'
                )
                  onOpen(action);
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
            <QueryBoundary query={query} loadingMessage={copy.observationLoad}>
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
