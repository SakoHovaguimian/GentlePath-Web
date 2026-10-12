'use client';

import { strings } from '@/strings';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePresentationService } from '@/presentation/PresentationProvider';
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  Input,
} from '@/components/ui';
import {
  useDeleteFeatureRequest,
  useFeatureRequest,
  useUpdateFeatureRequest,
} from './hooks';

export function FeatureRequestDetailScreen({
  featureRequestId,
}: {
  featureRequestId: string;
}) {
  const router = useRouter();
  const presentation = usePresentationService();
  const { data, isPending, isError, refetch } =
    useFeatureRequest(featureRequestId);
  const updateMutation = useUpdateFeatureRequest(featureRequestId);
  const deleteMutation = useDeleteFeatureRequest(featureRequestId);
  const [message, setMessage] = useState<string | null>(null);

  if (isPending) {
    return (
      <Card>{strings.ui.featureRequestDetailScreen.loadingFeatureRequest}</Card>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title={strings.ui.featureRequestDetailScreen.featureRequestUnavailable}
        description={
          strings.ui.featureRequestDetailScreen.weCouldNotLoadThisRequest
        }
        onRetry={() => void refetch()}
      />
    );
  }

  if (!data) {
    return (
      <EmptyState
        title={strings.ui.featureRequestDetailScreen.missingFeatureRequest}
        description={
          strings.ui.featureRequestDetailScreen
            .thisFeatureRequestCouldNotBeFound
        }
      />
    );
  }

  const currentMessage = message ?? data.message;

  return (
    <Card className="grid gap-5">
      <div className="grid gap-2">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-brand-secondary">
          {strings.ui.featureRequestDetailScreen.requestDetail}
        </p>
        <h1 className="m-0 text-2xl font-semibold tracking-tight text-primary">
          {strings.ui.featureRequestDetailScreen.featureRequestDetail}
        </h1>
      </div>
      <form
        noValidate
        onSubmit={async (event) => {
          event.preventDefault();
          if (!currentMessage.trim() || updateMutation.isPending) return;
          updateMutation.mutate(
            { message: currentMessage },
            {
              onSuccess: () => {
                setMessage(null);
                void presentation.showToast({
                  title: strings.ui.featureRequestDetailScreen.requestUpdated,
                  intent: 'success',
                });
              },
            },
          );
        }}
        className="grid gap-3"
      >
        <Field labelText={strings.ui.featureRequestDetailScreen.message}>
          <Input
            value={currentMessage}
            onChange={(event) => setMessage(event.target.value)}
          />
        </Field>
        <div className="flex flex-wrap gap-3">
          <Button
            type="submit"
            disabled={
              updateMutation.isPending ||
              deleteMutation.isPending ||
              !currentMessage.trim()
            }
          >
            {updateMutation.isPending
              ? strings.common.saving
              : strings.ui.featureRequestDetailScreen.saveChanges}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={deleteMutation.isPending || updateMutation.isPending}
            onClick={async () => {
              const confirmed = await presentation.showAlert({
                title: strings.ui.featureRequestDetailScreen.deleteThisRequest,
                description:
                  strings.ui.featureRequestDetailScreen
                    .thisRequestWillBeRemovedFromYourQueue,
                confirmLabel:
                  strings.ui.featureRequestDetailScreen.deleteRequest,
                cancelLabel: strings.ui.featureRequestDetailScreen.keepRequest,
                tone: 'danger',
              });
              if (confirmed)
                deleteMutation.mutate(undefined, {
                  onSuccess: () => router.push('/feature-requests'),
                });
            }}
          >
            {strings.ui.featureRequestDetailScreen.deleteRequest}
          </Button>
        </div>
        {(updateMutation.isError || deleteMutation.isError) && (
          <p role="alert" className="text-sm text-error-primary">
            {updateMutation.error?.message || deleteMutation.error?.message}
          </p>
        )}
      </form>
    </Card>
  );
}
