import { useRef, useState, type FormEvent } from 'react';
import { Button, Card, Field, Modal, TextArea } from '@/components/ui';
import { useUnsavedFormGuard } from '@/providers/useUnsavedFormGuard';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { MutationError } from '@/modules/portal/components/MutationError';
import { gentlePathPollStrings as copy } from '@/strings';
import {
  PollCommentInputSchema,
  type PollComment,
} from '../models/pollComment';
import { useSavePollComment } from '../hooks';

export function PollCommentEditor({
  pollId,
  comment,
  writable,
  onClose,
  onSaved,
}: {
  pollId: string;
  comment?: PollComment;
  writable: boolean;
  onClose?: () => void;
  onSaved: () => void;
}) {
  const [body, setBody] = useState(comment?.body ?? '');
  const [validation, setValidation] = useState('');
  const dirty = useRef(false);
  const busy = useRef(false);
  const confirmLeave = useUnsavedFormGuard(dirty, busy);
  const mutation = useSavePollComment();
  const { showToast } = usePresentationService();
  const errorId = comment
    ? 'poll-comment-edit-validation'
    : 'poll-comment-validation';
  function close() {
    void confirmLeave().then((allowed) => {
      if (!allowed) return;
      dirty.current = false;
      if (onClose) onClose();
      else {
        setBody('');
        setValidation('');
        mutation.reset();
      }
    });
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current || !writable) return;
    const input = PollCommentInputSchema.safeParse({ body });
    if (!input.success) {
      setValidation(copy.validation.commentDescription);
      event.currentTarget.querySelector<HTMLElement>('[name="body"]')?.focus();
      return;
    }
    busy.current = true;
    try {
      await mutation.mutateAsync({
        pollId,
        input: input.data,
        id: comment?.id,
      });
      dirty.current = false;
      setBody('');
      void showToast({ title: copy.commentSaved, intent: 'success' });
      onSaved();
      onClose?.();
    } catch {
      /* Keep the comment draft. */
    } finally {
      busy.current = false;
    }
  }
  const form = (
    <form noValidate onSubmit={submit} className="grid gap-4">
      <Field labelText={copy.commentLabel}>
        <TextArea
          name="body"
          rows={comment ? 6 : 4}
          maxLength={20000}
          value={body}
          placeholder={copy.commentPlaceholder}
          disabled={mutation.isPending || !writable}
          aria-invalid={Boolean(validation)}
          aria-describedby={validation ? errorId : undefined}
          onChange={(event) => {
            dirty.current = true;
            setBody(event.target.value);
            setValidation('');
          }}
        />
      </Field>
      {validation && (
        <p id={errorId} role="alert" className="m-0 text-sm text-error-primary">
          {validation}
        </p>
      )}
      <MutationError error={mutation.error} />
      <div className="flex flex-wrap justify-end gap-3">
        {(comment || body) && (
          <Button
            variant="secondary"
            disabled={mutation.isPending}
            onClick={close}
          >
            {copy.cancel}
          </Button>
        )}
        <Button type="submit" loading={mutation.isPending} disabled={!writable}>
          {comment ? copy.save : copy.postComment}
        </Button>
      </div>
    </form>
  );
  return comment ? (
    <Modal
      open
      title={copy.editComment}
      description={copy.discussionDescription}
      onDismiss={close}
    >
      {form}
    </Modal>
  ) : (
    <Card>{form}</Card>
  );
}
