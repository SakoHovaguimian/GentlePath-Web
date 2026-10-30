'use client';
import { useEffect, useRef, useState } from 'react';
import {
  Badge,
  Button,
  DataTable,
  EmptyState,
  Message,
  MobileRecordRow,
  Page,
  PageHeader,
  QueryBoundary,
  ResponsiveSectionNavigation,
  UiIcon,
} from '@/components/ui';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { MutationError } from '@/modules/portal/components/MutationError';
import { gentlePathMilestoneAdminStrings as copy } from '@/strings';
import styles from '@/modules/portal/Admin.module.css';
import {
  useDeleteFamilyTip,
  useFamilyTips,
  useMilestoneChoices,
} from './hooks';
import type { FamilyTip } from './models/familyTip';
import { useMilestoneDirectory } from './useMilestoneDirectory';
import { formatMilestoneDate } from './formatMilestoneDate';
import { MilestoneDirectoryFilters } from './components/MilestoneDirectoryFilters';
import { MilestonePagination } from './components/MilestonePagination';
import { FamilyTipEditor } from './components/FamilyTipEditor';
import { FamilyTipReader } from './components/FamilyTipReader';
import { FamilyTipCard } from './components/FamilyTipCard';
import { FamilyTipsDirectory } from './components/FamilyTipsDirectory';
import { useSessionState } from '@/providers/AppProviders';
import '@/modules/portal/styles/portal.css';
import { TipReviewEditor } from './components/TipReviewEditor';
const approvedScope = 'approved';
const ownScope = 'mine';
interface FamilyTipsScreenProps {
  staff?: boolean;
}
export function FamilyTipsScreen({ staff = false }: FamilyTipsScreenProps) {
  const directory = useMilestoneDirectory();
  const { session } = useSessionState();
  const scope = staff ? 'review' : directory.scope;
  const query = useFamilyTips(scope, {
    ...directory.query,
    approval_status:
      scope === 'approved' ? undefined : directory.query.approval_status,
  });
  const milestones = useMilestoneChoices();
  const [editor, setEditor] = useState<FamilyTip | 'new' | null>(null);
  const [reader, setReader] = useState<FamilyTip | null>(null);
  const [review, setReview] = useState<FamilyTip | null>(null);
  const [confirming, setConfirming] = useState(false);
  const busy = useRef(false);
  const remove = useDeleteFamilyTip();
  const { showAlert, showToast } = usePresentationService();
  const name = (id: string) =>
    milestones.data?.find((item) => item.id === id)?.milestone ??
    copy.milestoneLabel;
  useEffect(() => {
    if (
      query.data &&
      !query.data.data.length &&
      query.data.page.offset > 0 &&
      !query.isFetching
    )
      directory.update({
        offset: Math.max(0, query.data.page.offset - query.data.page.limit),
      });
  }, [query.data, query.isFetching, directory]);
  async function deleteTip(tip: FamilyTip) {
    if (busy.current) return;
    busy.current = true;
    setConfirming(true);
    try {
      if (
        !(await showAlert({
          title: copy.deleteTipTitle,
          description: copy.deleteTipDescription,
          tone: 'danger',
          confirmLabel: copy.deleteTip,
          cancelLabel: copy.cancel,
        }))
      )
        return;
      await remove.mutateAsync(tip.id);
      void showToast({ title: copy.tipDeleted, intent: 'success' });
    } catch {
      /* Inline recovery keeps the list available. */
    } finally {
      busy.current = false;
      setConfirming(false);
    }
  }
  const status = (tip: FamilyTip) => (
    <Badge
      dot
      intent={
        tip.approval_status === 'APPROVED'
          ? 'success'
          : tip.approval_status === 'REJECTED'
            ? 'warning'
            : 'neutral'
      }
    >
      {copy.statuses[tip.approval_status]}
    </Badge>
  );
  const actions = (tip: FamilyTip) => (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="secondary"
        onClick={() => (staff ? setReview(tip) : setReader(tip))}
      >
        {staff ? copy.reviewTip : copy.readTip}
      </Button>
      {scope === 'mine' && (
        <>
          <Button
            variant="ghost"
            disabled={remove.isPending || confirming}
            onClick={() => setEditor(tip)}
          >
            {copy.editTip}
          </Button>
          <Button
            variant="destructive"
            disabled={remove.isPending || confirming}
            onClick={() => void deleteTip(tip)}
          >
            {copy.deleteTip}
          </Button>
        </>
      )}
    </div>
  );
  const filtered = Boolean(
    directory.query.query ||
    directory.query.milestone_id ||
    directory.query.approval_status ||
    directory.query.tag,
  );
  return (
    <Page>
      <div className={styles.intro} data-tone={staff ? 'lilac' : 'sunlight'}>
        <PageHeader
          title={staff ? copy.reviewTitle : copy.tipsTitle}
          description={staff ? copy.reviewDescription : copy.tipsDescription}
          action={
            !staff && (
              <Button
                disabled={!milestones.data?.length}
                onClick={() => setEditor('new')}
              >
                <UiIcon name="plus" />
                {copy.submitTip}
              </Button>
            )
          }
        />
      </div>
      {!staff && (
        <ResponsiveSectionNavigation
          value={directory.scope}
          onValueChange={(view) =>
            directory.update({
              view: view === 'mine' ? 'mine' : '',
              approval_status: undefined,
              offset: 0,
            })
          }
          label={copy.tipsTitle}
          tabs={[
            { value: approvedScope, label: copy.approvedTips },
            { value: ownScope, label: copy.ownTips },
          ]}
        />
      )}
      {!staff && (
        <Message
          title={copy.publicPrivacyTitle}
          description={copy.publicPrivacyDescription}
          intent="neutral"
        />
      )}
      <MutationError error={remove.error} />
      <QueryBoundary query={milestones} loadingMessage={copy.loadingMilestones}>
        {(choices) => (
          <FamilyTipsDirectory
            staff={staff}
            busy={query.isFetching}
            busyLabel={copy.loadingTips}
            toolbar={
              <MilestoneDirectoryFilters
                tips
                statuses={scope !== 'approved'}
                milestones={choices}
                tags={choices.flatMap((milestone) => milestone.tags)}
                query={directory.query}
                onChange={directory.update}
              />
            }
            footer={
              query.data && (
                <MilestonePagination
                  page={query.data}
                  busy={query.isFetching}
                  onNavigate={(offset) => directory.update({ offset })}
                />
              )
            }
          >
            <QueryBoundary
              query={query}
              loadingMessage={copy.loadingTips}
              inset={staff}
            >
              {(page) =>
                !page.data.length ? (
                  <EmptyState
                    variant="plain"
                    icon="leaf"
                    title={
                      filtered
                        ? copy.noResultsTitle
                        : staff
                          ? copy.emptyReviewTitle
                          : scope === 'mine'
                            ? copy.emptyOwnTitle
                            : copy.emptyTipsTitle
                    }
                    description={
                      filtered
                        ? copy.noResultsDescription
                        : staff
                          ? copy.emptyReviewDescription
                          : scope === 'mine'
                            ? copy.emptyOwnDescription
                            : copy.emptyTipsDescription
                    }
                    action={
                      filtered ? (
                        <Button
                          variant="secondary"
                          onClick={() =>
                            directory.update({
                              query: '',
                              milestone_id: '',
                              approval_status: undefined,
                              tag: '',
                              offset: 0,
                            })
                          }
                        >
                          {copy.resetFilters}
                        </Button>
                      ) : !staff && choices.length > 0 ? (
                        <Button onClick={() => setEditor('new')}>
                          {copy.submitTip}
                        </Button>
                      ) : undefined
                    }
                  />
                ) : staff ? (
                  <DataTable
                    embedded
                    caption={copy.tipCaption}
                    rows={page.data}
                    getRowKey={(tip) => tip.id}
                    renderMobileRow={(tip) => (
                      <MobileRecordRow
                        title={name(tip.milestone_id)}
                        description={tip.message}
                        summary={status(tip)}
                        footer={actions(tip)}
                      />
                    )}
                    columns={[
                      {
                        key: 'message',
                        header: copy.messageLabel,
                        render: (tip) => (
                          <div className="grid max-w-lg gap-2">
                            <span className="font-medium text-primary">
                              {name(tip.milestone_id)}
                            </span>
                            <p className="m-0 line-clamp-3 text-sm text-secondary wrap-anywhere">
                              {tip.message}
                            </p>
                          </div>
                        ),
                      },
                      {
                        key: 'author',
                        header: copy.authorLabel,
                        render: (tip) =>
                          tip.author
                            ? copy.authorName(
                                tip.author.first_name,
                                tip.author.last_name,
                              )
                            : copy.unavailableAuthor,
                      },
                      {
                        key: 'status',
                        header: copy.statusLabel,
                        render: status,
                      },
                      {
                        key: 'submitted',
                        header: copy.submittedLabel,
                        render: (tip) => (
                          <time dateTime={tip.created_at}>
                            {formatMilestoneDate(tip.created_at)}
                          </time>
                        ),
                      },
                      {
                        key: 'review',
                        header: copy.reviewTitle,
                        render: actions,
                      },
                    ]}
                  />
                ) : (
                  <div className="grid min-w-0 gap-5 lg:grid-cols-2">
                    {page.data.map((tip) => (
                      <FamilyTipCard
                        key={tip.id}
                        tip={tip}
                        milestone={name(tip.milestone_id)}
                        owned={Boolean(
                          tip.user_id && tip.user_id === session?.user.id,
                        )}
                        busy={remove.isPending || confirming}
                        onRead={() => setReader(tip)}
                        onEdit={() => setEditor(tip)}
                        onDelete={() => void deleteTip(tip)}
                      />
                    ))}
                  </div>
                )
              }
            </QueryBoundary>
          </FamilyTipsDirectory>
        )}
      </QueryBoundary>
      {editor && milestones.data && (
        <FamilyTipEditor
          tip={editor === 'new' ? undefined : editor}
          milestones={milestones.data}
          initialMilestoneId={directory.query.milestone_id || undefined}
          onClose={() => setEditor(null)}
        />
      )}
      {reader && (
        <FamilyTipReader
          tip={reader}
          milestone={name(reader.milestone_id)}
          onClose={() => setReader(null)}
        />
      )}
      {review && (
        <TipReviewEditor
          tip={review}
          milestone={name(review.milestone_id)}
          onClose={() => setReview(null)}
        />
      )}
    </Page>
  );
}
