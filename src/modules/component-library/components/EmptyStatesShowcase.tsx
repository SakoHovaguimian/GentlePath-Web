'use client';

import {
  Button,
  DataPanel,
  EmptyState,
  ErrorState,
  UiIcon,
} from '@/components/ui';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { strings } from '@/strings';
import { ShowcaseSection } from './ShowcaseSection';

export function EmptyStatesShowcase() {
  const copy = strings.componentLibrary;
  const { showToast } = usePresentationService();
  return (
    <ShowcaseSection
      id="empty-states"
      title={copy.emptyStates}
      description={copy.emptyStatesHint}
      icon="box"
    >
      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        <div className="grid min-w-0 content-start gap-3">
          <h3 className="m-0 text-sm font-semibold text-primary">
            {copy.emptyStandalone}
          </h3>
          <EmptyState
            icon="store"
            title={strings.componentLibrary.emptyTitle}
            description={strings.componentLibrary.emptyHint}
          />
        </div>
        <div className="grid min-w-0 content-start gap-3">
          <h3 className="m-0 text-sm font-semibold text-primary">
            {copy.emptyWithAction}
          </h3>
          <EmptyState
            title={copy.emptyTitle}
            description={copy.emptyHint}
            action={
              <Button
                onClick={() =>
                  void showToast({
                    title: copy.successTitle,
                    description: copy.actionPreviewHint,
                    intent: 'success',
                  })
                }
              >
                <UiIcon name="plus" />
                {copy.create}
              </Button>
            }
          />
        </div>
      </div>
      <div className="grid min-w-0 gap-3">
        <h3 className="m-0 text-sm font-semibold text-primary">
          {copy.emptyEmbedded}
        </h3>
        <DataPanel>
          <EmptyState
            variant="plain"
            title={copy.emptyTitle}
            description={copy.emptyHint}
          />
        </DataPanel>
      </div>
      <div className="grid min-w-0 gap-3">
        <h3 className="m-0 text-sm font-semibold text-primary">
          {strings.ui.states.error}
        </h3>
        <ErrorState
          title={strings.ui.queryBoundary.somethingWentWrong}
          description={strings.ui.queryBoundary.loadFailureDescription}
          onRetry={() =>
            void showToast({
              title: copy.successTitle,
              description: copy.actionPreviewHint,
              intent: 'success',
            })
          }
        />
      </div>
    </ShowcaseSection>
  );
}
