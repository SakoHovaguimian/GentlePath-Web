import { useRef, useState, type FormEvent } from 'react';
import {
  BookmarkButton,
  Button,
  Field,
  DatePicker,
  Input,
  Modal,
  Select,
  TextArea,
  UiIcon,
} from '@/components/ui';
import { useUnsavedFormGuard } from '@/providers/useUnsavedFormGuard';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { gentlePathPortalStrings as copy } from '@/strings';
import {
  ChildProfileInputSchema,
  type ChildProfile,
  type ChildProfileInput,
} from '../models/childProfile';
import { useSaveChild } from '../hooks';
import { ChildSupportDetailsSchema } from '../models/childSupportDetails';
import { ChildGenderSchema } from '../models/childGender';
import type { ChildSupportDetails } from '../models/childSupportDetails';
import { childSupportQuestions } from '../childSupportQuestions';
import { MutationError } from './MutationError';

const unsetGenderChoice = '';

export function ChildProfileEditor({
  child,
  onClose,
  onRemove,
  removing = false,
  removalError,
}: {
  child?: ChildProfile;
  onClose: () => void;
  onRemove?: () => Promise<boolean>;
  removing?: boolean;
  removalError?: Error | null;
}) {
  const [input, setInput] = useState<ChildProfileInput>({
    name: child?.name ?? '',
    dateOfBirth: child?.dateOfBirth ?? '',
    gender: child?.gender ?? null,
    supportNotes: child?.supportNotes ?? '',
    supportDetails:
      child?.supportDetails ?? ChildSupportDetailsSchema.parse({}),
  });
  const [validation, setValidation] = useState<Record<string, string>>({});
  const mutation = useSaveChild();
  const { showToast } = usePresentationService();
  const dirty = useRef(false);
  const busy = useRef(false);
  const confirmLeave = useUnsavedFormGuard(dirty, busy);
  const pending = mutation.isPending || removing;
  function change<Key extends keyof ChildProfileInput>(
    key: Key,
    value: ChildProfileInput[Key],
  ) {
    dirty.current = true;
    setInput((current) => ({ ...current, [key]: value }));
    setValidation((current) => ({ ...current, [key]: '' }));
  }
  function changeSupport(key: keyof ChildSupportDetails, value: string) {
    dirty.current = true;
    setInput((current) => ({
      ...current,
      supportDetails: { ...current.supportDetails, [key]: value },
    }));
    setValidation((current) => ({
      ...current,
      [`supportDetails.${key}`]: '',
    }));
  }
  function dismiss() {
    void confirmLeave().then((allowed) => {
      if (allowed) onClose();
    });
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const parsed = ChildProfileInputSchema.safeParse(input);
    if (!parsed.success) {
      setValidation(
        Object.fromEntries(
          parsed.error.issues.map((issue) => [
            issue.path.join('.'),
            issue.message,
          ]),
        ),
      );
      event.currentTarget
        .querySelector<HTMLElement>(
          parsed.error.issues[0].path[0] === 'dateOfBirth'
            ? '[data-field-name="dateOfBirth"] [role="spinbutton"]'
            : parsed.error.issues[0].path[0] === 'gender'
              ? '[data-field-name="gender"]'
              : `[name="${parsed.error.issues[0].path.join('.')}"]`,
        )
        ?.focus();
      return;
    }
    busy.current = true;
    try {
      await mutation.mutateAsync({ input: parsed.data, id: child?.id });
      dirty.current = false;
      void showToast({ title: copy.family.created, intent: 'success' });
      onClose();
    } catch {
      /* Keep the draft. */
    } finally {
      busy.current = false;
    }
  }
  return (
    <Modal
      open
      title={child ? copy.family.editTitle : copy.family.newTitle}
      description={copy.family.formDescription}
      onDismiss={dismiss}
    >
      <form noValidate onSubmit={submit} className="grid gap-5">
        <Field labelText={copy.family.nameLabel}>
          <Input
            name="name"
            value={input.name}
            maxLength={100}
            onChange={(event) => change('name', event.target.value)}
            aria-invalid={Boolean(validation.name)}
            aria-describedby={validation.name ? 'child-validation' : undefined}
            disabled={pending}
          />
        </Field>
        <DatePicker
          label={copy.family.birthDateLabel}
          className="gp-family-editor__birth"
          name="dateOfBirth"
          value={input.dateOfBirth}
          max={new Date().toISOString().slice(0, 10)}
          onValueChange={(date) => change('dateOfBirth', date)}
          invalid={Boolean(validation.dateOfBirth)}
          describedBy={validation.dateOfBirth ? 'child-validation' : undefined}
          disabled={pending}
        />
        <Field labelText={copy.family.genderLabel}>
          <Select
            data-field-name="gender"
            name="gender"
            value={input.gender ?? ''}
            onValueChange={(value) =>
              change('gender', value ? ChildGenderSchema.parse(value) : null)
            }
            aria-invalid={Boolean(validation.gender)}
            aria-describedby={
              validation.gender ? 'child-validation' : undefined
            }
            disabled={pending}
          >
            <option value={unsetGenderChoice}>
              {copy.family.genderPlaceholder}
            </option>
            {ChildGenderSchema.options.map((gender) => (
              <option key={gender} value={gender}>
                {copy.family.genders[gender]}
              </option>
            ))}
          </Select>
        </Field>
        <section className="grid gap-5" aria-labelledby="child-support-title">
          <div className="grid gap-2">
            <h2 id="child-support-title" className="m-0 text-lg text-primary">
              {copy.family.supportTitle}
            </h2>
            <p className="m-0 text-sm leading-6 text-secondary">
              {copy.family.supportHint}
            </p>
          </div>
          <Field labelText={copy.family.notesLabel}>
            <TextArea
              name="supportNotes"
              value={input.supportNotes}
              autoGrow
              maxLength={2000}
              leadingIcon={<UiIcon name="leaf" className="size-4" />}
              placeholder={copy.family.notesPlaceholder}
              onChange={(event) => change('supportNotes', event.target.value)}
              aria-invalid={Boolean(validation.supportNotes)}
              aria-describedby={
                validation.supportNotes ? 'child-validation' : undefined
              }
              disabled={pending}
            />
          </Field>
          {childSupportQuestions.map(({ key, icon }) => (
            <Field key={key} labelText={copy.family.questions[key].label}>
              <TextArea
                name={`supportDetails.${key}`}
                value={input.supportDetails[key]}
                autoGrow
                maxLength={2000}
                leadingIcon={<UiIcon name={icon} className="size-4" />}
                placeholder={copy.family.questions[key].placeholder}
                onChange={(event) => changeSupport(key, event.target.value)}
                aria-invalid={Boolean(validation[`supportDetails.${key}`])}
                aria-describedby={
                  validation[`supportDetails.${key}`]
                    ? 'child-validation'
                    : undefined
                }
                disabled={pending}
              />
            </Field>
          ))}
        </section>
        {Object.values(validation).some(Boolean) && (
          <p
            id="child-validation"
            role="alert"
            className="text-sm text-error-primary"
          >
            {Object.values(validation).filter(Boolean).join(' ')}
          </p>
        )}
        <MutationError error={mutation.error} />
        <MutationError error={removalError} />
        <div className="flex flex-wrap justify-end gap-3 border-t border-secondary pt-5">
          {child && onRemove && (
            <Button
              variant="destructive"
              className="mr-auto"
              disabled={pending}
              onClick={() => {
                if (busy.current) return;
                busy.current = true;
                void onRemove()
                  .then((removed) => {
                    if (!removed) return;
                    dirty.current = false;
                    onClose();
                  })
                  .finally(() => {
                    busy.current = false;
                  });
              }}
            >
              <UiIcon name="trash" className="size-4" />
              {copy.family.deleteAction}
            </Button>
          )}
          <Button variant="secondary" onClick={dismiss} disabled={pending}>
            {copy.common.cancel}
          </Button>
          <BookmarkButton
            type="submit"
            loading={mutation.isPending}
            disabled={removing}
          >
            {copy.family.save}
          </BookmarkButton>
        </div>
      </form>
    </Modal>
  );
}
