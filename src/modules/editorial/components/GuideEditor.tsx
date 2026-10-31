'use client';

import { PublicImageField } from '@/services/media/components/PublicImageField';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  FormActions,
  Input,
  Message,
  Page,
  PageHeader,
  SectionStack,
  SplitSection,
  TextArea,
  UiIcon,
  BookmarkButton,
} from '@/components/ui';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { useGuardedNavigate } from '@/providers/useGuardedNavigate';
import { DomainError } from '@/errors/domainErrors';
import { gentlePathEditorialStrings as copy } from '@/strings';
import type { Guide } from '../models/guide';
import { createGuideDraft } from '../models/guideDraft';
import {
  focusEditorialError,
  validateGuideDraft,
} from '../services/validateEditorialDraft';
import { useEditorialDraft } from '../useEditorialDraft';
import { useEditorialMutations } from '../hooks';
import { EditorField } from './EditorField';
import { GuideItemsEditor } from './GuideItemsEditor';

export function GuideEditor({ initialGuide }: { initialGuide?: Guide }) {
  const router = useRouter();
  const navigate = useGuardedNavigate();
  const presentation = usePresentationService();
  const mutations = useEditorialMutations();
  const [guide, setGuide] = useState(initialGuide);
  const [confirming, setConfirming] = useState(false);
  const [uploading, setUploading] = useState(false);
  const busy = mutations.isPending || confirming || uploading;
  const draft = useEditorialDraft(() => createGuideDraft(initialGuide), busy);
  const { form, errors } = draft;
  const uploadStateChanged = (pending: boolean) => {
    if (pending) draft.lock();
    else draft.release();
    setUploading(pending);
  };
  const failure = (error: unknown) =>
    draft.setFailure(
      error instanceof DomainError && error.status < 500
        ? error.message
        : copy.errorDescription,
    );
  const save = async () => {
    if (busy || draft.isBusy()) return;
    const result = validateGuideDraft(form);
    draft.setErrors(result.errors);
    draft.setFailure('');
    if (!result.data) {
      focusEditorialError(result.errors);
      return;
    }
    if (!draft.lock()) return;
    try {
      const saved = await mutations.saveGuide.mutateAsync({
        id: guide?.id,
        input: result.data,
      });
      setGuide(saved);
      draft.accept(createGuideDraft(saved));
      void presentation.showToast({
        title: copy.savedTitle,
        intent: 'success',
      });
      if (!guide) router.replace(`/admin/guides/${saved.id}`);
    } catch (error) {
      failure(error);
    } finally {
      draft.release();
    }
  };
  const remove = async () => {
    if (!guide || busy || !draft.lock()) return;
    setConfirming(true);
    try {
      const confirmed = await presentation.showAlert({
        title: copy.deleteGuideTitle,
        description: copy.deleteGuideDescription(guide.title),
        confirmLabel: copy.deleteGuide,
        cancelLabel: copy.cancel,
        tone: 'danger',
      });
      if (!confirmed) return;
      await mutations.deleteGuide.mutateAsync(guide.id);
      draft.allowNavigation();
      void presentation.showToast({
        title: copy.deletedTitle,
        intent: 'success',
      });
      router.push('/admin/guides');
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
        title={guide ? copy.editGuide : copy.newGuide}
        description={copy.formDescription}
        breadcrumbs={[
          { label: copy.adminGuidesTitle, href: '/admin/guides' },
          { label: guide ? copy.editGuide : copy.newGuide },
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
            id="guide-details"
            title={copy.formTitle}
            description={copy.formDescription}
          >
            <div className="grid min-w-0 gap-4">
              <EditorField
                id="editorial-title"
                label={copy.titleLabel}
                error={errors.title}
              >
                <Input
                  value={form.title}
                  maxLength={500}
                  disabled={busy}
                  onChange={(event) =>
                    draft.update({ ...form, title: event.target.value })
                  }
                />
              </EditorField>
              <EditorField
                id="editorial-description"
                label={copy.descriptionLabel}
                error={errors.description}
              >
                <TextArea
                  value={form.description}
                  maxLength={20000}
                  disabled={busy}
                  onChange={(event) =>
                    draft.update({ ...form, description: event.target.value })
                  }
                />
              </EditorField>
              <PublicImageField
                id="editorial-image_url"
                label={copy.imageLabel}
                value={form.imageUrl}
                error={errors.image_url}
                disabled={busy}
                onChange={(imageUrl) => draft.update({ ...form, imageUrl })}
                onUploadStateChange={uploadStateChanged}
              />
            </div>
          </SplitSection>
          <SplitSection
            id="guide-steps"
            bare
            title={copy.itemsTitle}
            description={copy.itemsDescription}
          >
            <GuideItemsEditor
              items={form.items}
              disabled={busy}
              onUploadStateChange={uploadStateChanged}
              errors={errors}
              onChangeAction={(items) => draft.update({ ...form, items })}
            />
          </SplitSection>
        </SectionStack>
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
            onClick={() => void navigate('/admin/guides')}
          >
            {copy.backToGuides}
          </Button>
          <BookmarkButton
            saved={Boolean(draft.notice) && !draft.dirty}
            type="submit"
            loading={mutations.saveGuide.isPending}
            disabled={busy}
          >
            {copy.saveGuide}
          </BookmarkButton>
        </FormActions>
        {guide && (
          <div className="flex flex-wrap justify-between gap-3 border-t border-secondary pt-5">
            <Button
              variant="destructive"
              loading={mutations.deleteGuide.isPending}
              disabled={busy}
              onClick={() => void remove()}
            >
              <UiIcon name="trash" />
              {copy.deleteGuide}
            </Button>
            <Button
              variant="ghost"
              disabled={busy}
              onClick={() => void navigate(`/guides/${guide.id}`)}
            >
              {copy.openGuide}
              <UiIcon name="arrowRight" />
            </Button>
          </div>
        )}
      </form>
    </Page>
  );
}
