'use client';
import { PublicImageField } from '@/services/media/components/PublicImageField';
import { useId, useRef, useState, type FormEvent } from 'react';
import {
  BookmarkButton,
  Button,
  Field,
  FormActions,
  Input,
  Message,
  Modal,
  PageSection,
  TextArea,
} from '@/components/ui';
import { useUnsavedFormGuard } from '@/providers/useUnsavedFormGuard';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { MutationError } from '@/modules/portal/components/MutationError';
import {
  gentlePathMilestoneAdminStrings as copy,
  gentlePathPortalStrings as portalCopy,
} from '@/strings';
import { MilestoneGuidanceInputSchema } from '../models/milestoneGuidance';
import type { MilestoneGuidanceEditorProps } from '../models/milestoneGuidanceEditorProps';
import type { ResponseOptionDraft } from '../models/responseOptionDraft';
import {
  useHideMilestoneGuidance,
  useRestoreMilestoneGuidance,
  useSaveMilestoneGuidance,
} from '../hooks';
import { ResponseOptionEditor } from './ResponseOptionEditor';
export function MilestoneGuidanceEditor({
  milestone,
  onClose,
}: MilestoneGuidanceEditorProps) {
  const formId = useId();
  const [imageUrl, setImageUrl] = useState(milestone?.image_url ?? '');
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState(milestone?.milestone ?? '');
  const [information, setInformation] = useState(milestone?.information ?? '');
  const [guidance, setGuidance] = useState(
    milestone?.observation_guidance ?? '',
  );
  const [tags, setTags] = useState(milestone?.tags.join(', ') ?? '');
  const [options, setOptions] = useState<ResponseOptionDraft[]>(() =>
    (milestone
      ? (milestone.response_options ?? [])
      : Object.entries(portalCopy.milestones.responses).map(
          ([value, label], position) => ({
            id: crypto.randomUUID(),
            value,
            label,
            position,
            deleted: false,
          }),
        )
    )
      .filter((option) => !option.deleted)
      .map((option) => ({
        id: option.id,
        value: option.value,
        label: option.label,
        existing: Boolean(milestone),
      })),
  );
  const [validation, setValidation] = useState<Record<string, string>>({});
  const dirty = useRef(false),
    busy = useRef(false);
  const leave = useUnsavedFormGuard(dirty, busy);
  const save = useSaveMilestoneGuidance();
  const remove = useHideMilestoneGuidance();
  const restore = useRestoreMilestoneGuidance();
  const [confirming, setConfirming] = useState(false);
  const pending =
    save.isPending ||
    remove.isPending ||
    restore.isPending ||
    confirming ||
    uploading;
  const { showAlert, showToast } = usePresentationService();
  const dismiss = () => {
    void leave().then((allowed) => {
      if (allowed) onClose();
    });
  };
  const change = (action: () => void) => {
    dirty.current = true;
    setValidation({});
    action();
  };
  async function restoreMilestone() {
    if (!milestone || busy.current || !(await leave())) return;
    busy.current = true;
    try {
      await restore.mutateAsync(milestone.id);
      dirty.current = false;
      void showToast({ title: copy.restoredMilestone, intent: 'success' });
      onClose();
    } catch {
      /* Keep the editor open for retry. */
    } finally {
      busy.current = false;
    }
  }
  async function hideMilestone() {
    if (!milestone || busy.current) return;
    busy.current = true;
    setConfirming(true);
    try {
      if (
        !(await showAlert({
          title: copy.hideMilestoneTitle,
          description: copy.hideMilestoneDescription(milestone.milestone),
          tone: 'danger',
          confirmLabel: copy.hideMilestone,
          cancelLabel: copy.cancel,
        }))
      )
        return;
      await remove.mutateAsync(milestone.id);
      dirty.current = false;
      void showToast({ title: copy.hiddenMilestone, intent: 'success' });
      onClose();
    } catch {
      /* Keep all guidance edits available for recovery. */
    } finally {
      busy.current = false;
      setConfirming(false);
    }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const result = MilestoneGuidanceInputSchema.safeParse({
      milestone: name,
      image_url: imageUrl.trim() || null,
      information,
      observation_guidance: guidance.trim() || null,
      tags: tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      response_options: options.map((option) => ({
        ...(option.existing ? { id: option.id } : {}),
        value: option.value,
        label: option.label,
      })),
    });
    if (!result.success) {
      setValidation(
        Object.fromEntries(
          result.error.issues.map((issue) => [
            issue.path.join('.'),
            issue.message,
          ]),
        ),
      );
      const first = event.currentTarget.elements.namedItem(
        result.error.issues[0].path.join('.'),
      );
      if (first instanceof HTMLElement) first.focus();
      else
        event.currentTarget
          .querySelector<HTMLElement>('[name^="response_options."]')
          ?.focus();
      return;
    }
    busy.current = true;
    try {
      await save.mutateAsync({ input: result.data, id: milestone?.id });
      dirty.current = false;
      void showToast({ title: copy.savedMilestone, intent: 'success' });
      onClose();
    } catch {
      /* Keep every draft field available for recovery. */
    } finally {
      busy.current = false;
    }
  }
  const invalid = (key: string) => ({
    'aria-invalid': Boolean(validation[key]),
    'aria-describedby': validation[key] ? 'milestone-validation' : undefined,
  });
  return (
    <Modal
      open
      title={milestone ? copy.editMilestone : copy.newMilestone}
      description={copy.guidanceDescription}
      onDismiss={dismiss}

      footer={
        <FormActions variant="inline" sticky={false}>
          {milestone && (
            <Button
              variant={milestone.hidden ? 'secondary' : 'destructive'}
              className="sm:mr-auto"
              disabled={pending}
              onClick={() =>
                void (milestone.hidden ? restoreMilestone() : hideMilestone())
              }
            >
              {milestone.hidden ? copy.restoreMilestone : copy.hideMilestone}
            </Button>
          )}
          <Button variant="secondary" disabled={pending} onClick={dismiss}>
            {copy.cancel}
          </Button>
          <BookmarkButton
            type="submit"
            form={formId}
            loading={save.isPending}
            disabled={
              remove.isPending || restore.isPending || confirming || uploading
            }
          >
            {copy.saveMilestone}
          </BookmarkButton>
        </FormActions>
      }
    >
      <form
        id={formId}
        noValidate
        onSubmit={submit}
        className="grid min-w-0 gap-7"
      >
        <Field labelText={copy.milestoneLabel}>
          <Input
            name="milestone"
            value={name}
            maxLength={500}
            disabled={pending}
            {...invalid('milestone')}
            onChange={(event) => change(() => setName(event.target.value))}
          />
        </Field>
        <PublicImageField
          id="milestone-image"
          value={imageUrl}
          label={copy.imageLabel}
          disabled={pending}
          error={validation.image_url}
          onChange={(url) => change(() => setImageUrl(url))}
          onUploadStateChange={(active) => {
            busy.current = active;
            setUploading(active);
          }}
        />
        <Field labelText={copy.informationLabel}>
          <TextArea
            name="information"
            value={information}
            maxLength={20000}
            disabled={pending}
            {...invalid('information')}
            onChange={(event) =>
              change(() => setInformation(event.target.value))
            }
          />
        </Field>
        <Field labelText={copy.observationGuidanceLabel}>
          <TextArea
            name="observation_guidance"
            value={guidance}
            maxLength={20000}
            disabled={pending}
            {...invalid('observation_guidance')}
            onChange={(event) => change(() => setGuidance(event.target.value))}
          />
        </Field>
        <div className="grid gap-2">
          <Field labelText={copy.tagsLabel}>
            <Input
              name="tags"
              value={tags}
              disabled={pending}
              {...invalid('tags')}
              aria-describedby={
                validation.tags ? 'milestone-validation' : 'milestone-tags-hint'
              }
              onChange={(event) => change(() => setTags(event.target.value))}
            />
          </Field>
          <p id="milestone-tags-hint" className="m-0 text-xs text-tertiary">
            {copy.tagsHint}
          </p>
        </div>
        <PageSection
          id="response-options"
          title={copy.optionsTitle}
          description={copy.optionsDescription}
        >
          <Message
            id="response-option-history"
            title={copy.optionsHistoryTitle}
            description={copy.optionsHistoryDescription}
            intent="neutral"
          />
          <ResponseOptionEditor
            options={options}
            disabled={pending}
            validation={validation}
            onChange={(next) => change(() => setOptions(next))}
          />
        </PageSection>
        {Object.keys(validation).length > 0 && (
          <p
            id="milestone-validation"
            role="alert"
            className="m-0 text-sm text-error-primary"
          >
            {[...new Set(Object.values(validation))].join(' ')}
          </p>
        )}
        <MutationError error={save.error ?? remove.error ?? restore.error} />
      </form>
    </Modal>
  );
}
