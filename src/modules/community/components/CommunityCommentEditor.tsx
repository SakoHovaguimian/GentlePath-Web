import { useRef, useState, type FormEvent } from 'react';
import { Button, Card, Field, Modal, TextArea } from '@/components/ui';
import { useUnsavedFormGuard } from '@/providers/useUnsavedFormGuard';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { MutationError } from '@/modules/portal/components/MutationError';
import { gentlePathCommunityStrings as copy } from '@/strings';
import {
  CommunityCommentInputSchema,
  type CommunityComment,
} from '../models/communityComment';
import { useSaveCommunityComment } from '../hooks';

interface CommunityCommentEditorProps {
  postId: string;
  comment?: CommunityComment;
  onClose?: () => void;
  onSaved: () => void;
  disabled?: boolean;
}
export function CommunityCommentEditor({
  postId,
  comment,
  onClose,
  onSaved,
  disabled = false,
}: CommunityCommentEditorProps) {
  const [body, setBody] = useState(comment?.body ?? '');
  const [validation, setValidation] = useState('');
  const dirty = useRef(false);
  const busy = useRef(false);
  const confirmLeave = useUnsavedFormGuard(dirty, busy);
  const mutation = useSaveCommunityComment();
  const { showToast } = usePresentationService();
  const errorId = comment
    ? 'community-comment-edit-validation'
    : 'community-comment-validation';
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
    if (busy.current || disabled) return;
    const parsed = CommunityCommentInputSchema.safeParse({ body });
    if (!parsed.success) {
      setValidation(copy.validation.comment);
      event.currentTarget.querySelector<HTMLElement>('[name="body"]')?.focus();
      return;
    }
    busy.current = true;
    try {
      await mutation.mutateAsync({
        postId,
        input: parsed.data,
        id: comment?.id,
      });
      dirty.current = false;
      setBody('');
      void showToast({
        title: comment ? copy.updatedComment : copy.createdComment,
        intent: 'success',
      });
      onSaved();
      onClose?.();
    } catch {
      /* The comment stays in the form for retry. */
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
          disabled={mutation.isPending || disabled}
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
        <Button type="submit" loading={mutation.isPending} disabled={disabled}>
          {comment ? copy.saveComment : copy.publishComment}
        </Button>
      </div>
    </form>
  );
  return comment ? (
    <Modal
      open
      title={copy.editComment}
      description={copy.editCommentDescription}
      onDismiss={close}
    >
      {form}
    </Modal>
  ) : (
    <Card className="p-5 sm:p-6">{form}</Card>
  );
}
