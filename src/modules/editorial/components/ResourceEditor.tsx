'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  DescriptionList,
  FormActions,
  Message,
  Page,
  PageHeader,
  SectionStack,
  SplitSection,
  UiIcon,
} from '@/components/ui';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { useGuardedNavigate } from '@/providers/useGuardedNavigate';
import { DomainError } from '@/errors/domainErrors';
import { gentlePathEditorialStrings as copy } from '@/strings';
import { formatBlogDate } from '@/modules/blog/formatBlogDate';
import type { EditorialResource } from '../models/editorialResource';
import { createResourceDraft } from '../models/resourceDraft';
import {
  focusEditorialError,
  validateResourceDraft,
} from '../services/validateEditorialDraft';
import { useEditorialDraft } from '../useEditorialDraft';
import { useEditorialMutations } from '../hooks';
import { ResourceFields } from './ResourceFields';
import { SourceFields } from './SourceFields';
import { MetadataField } from './MetadataField';

interface Props {
  initialResource?: EditorialResource;
  collections: EditorialResource[];
  parentId?: string;
}
export function ResourceEditor({
  initialResource,
  collections,
  parentId,
}: Props) {
  const router = useRouter();
  const navigate = useGuardedNavigate();
  const presentation = usePresentationService();
  const mutations = useEditorialMutations();
  const [resource, setResource] = useState(initialResource);
  const [confirming, setConfirming] = useState(false);
  const busy = mutations.isPending || confirming;
  const draft = useEditorialDraft(
    () => ({
      ...createResourceDraft(initialResource),
      ...(!initialResource && parentId ? { parentId } : {}),
    }),
    busy,
  );
  const { form, errors } = draft;
  const failure = (error: unknown) =>
    draft.setFailure(
      error instanceof DomainError && error.status < 500
        ? error.message
        : copy.errorDescription,
    );
  const save = async () => {
    if (busy || draft.isBusy()) return;
    const result = validateResourceDraft(form);
    draft.setErrors(result.errors);
    draft.setFailure('');
    if (!result.data) {
      focusEditorialError(result.errors);
      return;
    }
    if (!draft.lock()) return;
    try {
      const saved = await mutations.saveResource.mutateAsync({
        id: resource?.id,
        input: result.data,
      });
      setResource(saved);
      draft.accept(createResourceDraft(saved));
      void presentation.showToast({
        title: copy.savedTitle,
        intent: 'success',
      });
      if (!resource) router.replace(`/admin/resources/${saved.id}`);
    } catch (error) {
      failure(error);
    } finally {
      draft.release();
    }
  };
  const remove = async () => {
    if (!resource || busy || !draft.lock()) return;
    setConfirming(true);
    try {
      const confirmed = await presentation.showAlert({
        title: copy.deleteResourceTitle,
        description: copy.deleteResourceDescription(resource.title),
        confirmLabel: copy.deleteResource,
        cancelLabel: copy.cancel,
        tone: 'danger',
      });
      if (!confirmed) return;
      await mutations.deleteResource.mutateAsync(resource.id);
      draft.allowNavigation();
      void presentation.showToast({
        title: copy.deletedTitle,
        intent: 'success',
      });
      router.push('/admin/resources');
    } catch (error) {
      failure(error);
    } finally {
      draft.release();
      setConfirming(false);
    }
  };
  return (
    <Page aria-busy={busy}>
      <PageHeader
        title={resource ? copy.editResource : copy.newResource}
        description={copy.resourceFormDescription}
        breadcrumbs={[
          { label: copy.resourcesTitle, href: '/admin/resources' },
          { label: resource ? copy.editResource : copy.newResource },
        ]}
        onNavigate={(href) => void navigate(href)}
      />
      <form
        noValidate
        className="grid min-w-0 gap-7"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <SectionStack>
          <SplitSection
            id="resource-details"
            title={copy.resourceFormTitle}
            description={copy.resourceFormDescription}
          >
            <ResourceFields
              form={form}
              resource={resource}
              collections={collections}
              errors={errors}
              disabled={busy}
              onChangeAction={draft.update}
            />
          </SplitSection>
          <SplitSection
            id="resource-source"
            title={copy.sourceTitle}
            description={copy.sourceDescription}
          >
            <SourceFields
              value={form}
              prefix="resource_details"
              errors={errors}
              disabled={busy}
              onChangeAction={(source) => draft.update({ ...form, ...source })}
            />
          </SplitSection>
          <SplitSection
            id="resource-review"
            title={copy.reviewTitle}
            description={copy.reviewDescription}
          >
            <div className="grid min-w-0 gap-4">
              {resource && (
                <Card>
                  <DescriptionList
                    items={[
                      {
                        label: copy.reviewedLabel,
                        value: formatBlogDate(
                          resource.resource_details.reviewed_at,
                        ),
                      },
                      {
                        label: copy.reviewerLabel,
                        value: resource.resource_details.reviewed_by_user_id,
                      },
                    ]}
                  />
                </Card>
              )}
              <MetadataField
                id="editorial-resource_details-additional_properties"
                value={form.metadataText}
                error={errors['resource_details.additional_properties']}
                disabled={busy}
                onChangeAction={(metadataText) =>
                  draft.update({ ...form, metadataText })
                }
              />
            </div>
          </SplitSection>
        </SectionStack>
        {resource?.type === 'COLLECTION' && (
          <Card className="grid gap-3">
            <h2 className="m-0 font-display text-xl font-normal text-primary">
              {copy.childrenTitle}
            </h2>
            <p className="m-0 text-sm text-secondary">
              {copy.collectionChildCount(resource.children_count ?? 0)}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                disabled={busy}
                onClick={() =>
                  void navigate(
                    `/admin/resources?parent_id=${encodeURIComponent(resource.id)}`,
                  )
                }
              >
                {copy.childrenTitle}
              </Button>
              <Button
                variant="secondary"
                disabled={busy}
                onClick={() =>
                  void navigate(
                    `/admin/resources/new?parent_id=${encodeURIComponent(resource.id)}`,
                  )
                }
              >
                <UiIcon name="plus" />
                {copy.newResource}
              </Button>
            </div>
          </Card>
        )}
        {Object.keys(errors).length > 0 && (
          <Message title={copy.validationTitle} intent="danger" />
        )}
        {draft.failure && (
          <Message
            title={copy.errorTitle}
            description={draft.failure}
            intent="danger"
          />
        )}
        {draft.notice && (
          <Message
            title={copy.savedTitle}
            description={draft.notice}
            intent="success"
          />
        )}
        <FormActions
          description={draft.dirty ? copy.unsavedHint : copy.readyHint}
          live
        >
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => void navigate('/admin/resources')}
          >
            {copy.backToResources}
          </Button>
          <Button
            type="submit"
            loading={mutations.saveResource.isPending}
            disabled={busy}
          >
            {copy.saveResource}
          </Button>
        </FormActions>
        {resource && (
          <div className="flex flex-wrap justify-between gap-3 border-t border-secondary pt-5">
            <Button
              variant="destructive"
              loading={mutations.deleteResource.isPending}
              disabled={busy}
              onClick={() => void remove()}
            >
              <UiIcon name="trash" />
              {copy.deleteResource}
            </Button>
            <Button
              variant="ghost"
              disabled={busy}
              onClick={() => void navigate(`/resources/${resource.id}`)}
            >
              {copy.openResource}
              <UiIcon name="arrowRight" />
            </Button>
          </div>
        )}
      </form>
    </Page>
  );
}
