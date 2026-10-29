'use client';
import { useRef, useState, type FormEvent } from 'react';
import {
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
import { gentlePathMilestoneAdminStrings as copy } from '@/strings';
import {
  MilestoneGuidanceInputSchema,
  type MilestoneGuidance,
} from '../models/milestoneGuidance';
import type { ResponseOptionDraft } from '../models/responseOptionDraft';
import { useSaveMilestoneGuidance } from '../hooks';
import { ResponseOptionEditor } from './ResponseOptionEditor';
interface MilestoneGuidanceEditorProps {
  milestone?: MilestoneGuidance;
  onClose: () => void;
}
export function MilestoneGuidanceEditor({
  milestone,
  onClose,
}: MilestoneGuidanceEditorProps) {
  const [name, setName] = useState(milestone?.milestone ?? '');
  const [information, setInformation] = useState(milestone?.information ?? '');
  const [guidance, setGuidance] = useState(
    milestone?.observation_guidance ?? '',
  );
  const [tags, setTags] = useState(milestone?.tags.join(', ') ?? '');
  const [options, setOptions] = useState<ResponseOptionDraft[]>(() =>
    (milestone?.response_options ?? [])
      .filter((option) => !option.deleted)
      .map((option) => ({
        id: option.id,
        value: option.value,
        label: option.label,
        existing: true,
      })),
  );
  const [validation, setValidation] = useState<Record<string, string>>({});
  const dirty = useRef(false),
    busy = useRef(false);
  const leave = useUnsavedFormGuard(dirty, busy);
  const save = useSaveMilestoneGuidance();
  const { showToast } = usePresentationService();
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
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const result = MilestoneGuidanceInputSchema.safeParse({
      milestone: name,
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
    >
      <form noValidate onSubmit={submit} className="grid min-w-0 gap-7">
        <Field labelText={copy.milestoneLabel}>
          <Input
            name="milestone"
            value={name}
            maxLength={500}
            disabled={save.isPending}
            {...invalid('milestone')}
            onChange={(event) => change(() => setName(event.target.value))}
          />
        </Field>
        <Field labelText={copy.informationLabel}>
          <TextArea
            name="information"
            value={information}
            maxLength={20000}
            rows={6}
            disabled={save.isPending}
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
            rows={4}
            disabled={save.isPending}
            {...invalid('observation_guidance')}
            onChange={(event) => change(() => setGuidance(event.target.value))}
          />
        </Field>
        <div className="grid gap-2">
          <Field labelText={copy.tagsLabel}>
            <Input
              name="tags"
              value={tags}
              disabled={save.isPending}
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
            disabled={save.isPending}
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
        <MutationError error={save.error} />
        <FormActions variant="inline" sticky={false}>
          <Button
            variant="secondary"
            disabled={save.isPending}
            onClick={dismiss}
          >
            {copy.cancel}
          </Button>
          <Button type="submit" loading={save.isPending}>
            {copy.saveMilestone}
          </Button>
        </FormActions>
      </form>
    </Modal>
  );
}
