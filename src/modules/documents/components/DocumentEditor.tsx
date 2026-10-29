import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  Button,
  DropZone,
  Field,
  FileInput,
  Input,
  Modal,
  Select,
  Spinner,
  UiIcon,
} from '@/components/ui';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { useUnsavedFormGuard } from '@/providers/useUnsavedFormGuard';
import { gentlePathDocumentStrings as copy } from '@/strings';
import type { ChildProfile } from '@/modules/portal/models/childProfile';
import { MutationError } from '@/modules/portal/components/MutationError';
import {
  DocumentMetadataInputSchema,
  type CareDocument,
  type DocumentMetadataInput,
} from '../models/careDocument';
import { DocumentTypeSchema } from '../models/documentType';
import {
  documentFileAccept,
  validateDocumentFileSelection,
} from '../services/documentFileValidation';
import { useUpdateDocument, useUploadDocument } from '../hooks';

const noChild = '';

export function DocumentEditor({
  document: existing,
  childrenProfiles,
  childrenError,
  onClose,
}: {
  document?: CareDocument;
  childrenProfiles: ChildProfile[];
  childrenError?: Error | null;
  onClose: () => void;
}) {
  const [input, setInput] = useState<DocumentMetadataInput>(() => ({
    title: existing?.title ?? '',
    documentType: existing?.documentType ?? 'OTHER',
    childId: existing?.childId ?? null,
  }));
  const initialInput = useRef(input);
  const [file, setFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<Record<string, string>>({});
  const [cancelled, setCancelled] = useState(false);
  const [uploadId, setUploadId] = useState(() => crypto.randomUUID());
  const fileInput = useRef<HTMLInputElement>(null);
  const chooseButton = useRef<HTMLButtonElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const dirty = useRef(false);
  const busy = useRef(false);
  const confirmLeave = useUnsavedFormGuard(dirty, busy);
  const upload = useUploadDocument();
  const update = useUpdateDocument();
  const mutation = existing ? update : upload;
  const { showToast } = usePresentationService();
  useEffect(() => () => abortRef.current?.abort(), []);

  function change<Key extends keyof DocumentMetadataInput>(
    key: Key,
    value: DocumentMetadataInput[Key],
  ) {
    const next = { ...input, [key]: value };
    dirty.current =
      Boolean(file) ||
      JSON.stringify(next) !== JSON.stringify(initialInput.current);
    setInput(next);
    setValidation((current) => ({ ...current, [key]: '' }));
    mutation.reset();
  }
  function choose(files: FileList | null) {
    if (!files?.length || busy.current) return;
    mutation.reset();
    setCancelled(false);
    if (files.length !== 1) {
      setValidation((current) => ({
        ...current,
        file: copy.validation.singleFileDescription,
      }));
      return;
    }
    const candidate = files[0];
    try {
      validateDocumentFileSelection(candidate);
      setFile(candidate);
      setUploadId(crypto.randomUUID());
      dirty.current = true;
      setValidation((current) => ({ ...current, file: '' }));
    } catch (error) {
      setValidation((current) => ({
        ...current,
        file:
          error instanceof Error
            ? error.message
            : copy.validation.fileTypeDescription,
      }));
    }
  }
  function dismiss() {
    void confirmLeave().then((allowed) => {
      if (allowed) onClose();
    });
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const parsed = DocumentMetadataInputSchema.safeParse(input);
    const issues: Record<string, string> = {};
    if (!parsed.success)
      for (const issue of parsed.error.issues)
        issues[String(issue.path[0])] = issue.message;
    if (!existing && !file)
      issues.file = copy.validation.fileRequiredDescription;
    setValidation(issues);
    if (Object.keys(issues).length) {
      if (issues.file) chooseButton.current?.focus();
      else
        event.currentTarget
          .querySelector<HTMLElement>(`[name="${Object.keys(issues)[0]}"]`)
          ?.focus();
      return;
    }
    if (!parsed.success) return;
    busy.current = true;
    setCancelled(false);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      if (existing)
        await update.mutateAsync({ id: existing.id, input: parsed.data });
      else if (file)
        await upload.mutateAsync({
          file,
          input: parsed.data,
          uploadId,
          signal: controller.signal,
        });
      dirty.current = false;
      void showToast({
        title: existing ? copy.updatedTitle : copy.uploadedTitle,
        intent: 'success',
      });
      onClose();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setCancelled(true);
        upload.reset();
      }
      // Keep the selected file and all metadata for correction or retry.
    } finally {
      busy.current = false;
      abortRef.current = null;
    }
  }

  return (
    <Modal
      open
      title={existing ? copy.editTitle : copy.uploadTitle}
      description={copy.formDescription}
      icon={<UiIcon name="file" />}
      onDismiss={dismiss}
    >
      <form noValidate onSubmit={submit} className="grid gap-5">
        {!existing && (
          <div className="grid gap-2">
            <p className="m-0 text-sm font-medium text-secondary">
              {copy.fileLabel}
            </p>
            <DropZone disabled={mutation.isPending} onFiles={choose}>
              <FileInput
                ref={fileInput}
                accept={documentFileAccept}
                disabled={mutation.isPending}
                aria-label={copy.chooseFileAction}
                aria-invalid={Boolean(validation.file)}
                aria-describedby="document-file-help document-file-validation"
                onChange={(event) => {
                  choose(event.target.files);
                  event.target.value = '';
                }}
              />
              <UiIcon name="file" className="size-8 text-brand-secondary" />
              <div className="grid min-w-0 flex-1 gap-1">
                <p className="m-0 text-sm text-secondary wrap-anywhere">
                  {file?.name ?? copy.dropHint}
                </p>
                <p
                  id="document-file-help"
                  className="m-0 text-xs text-tertiary"
                >
                  {file ? copy.fileSizeDescription(file.size) : copy.fileHint}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  ref={chooseButton}
                  variant="secondary"
                  disabled={mutation.isPending}
                  aria-describedby="document-file-help document-file-validation"
                  onClick={() => fileInput.current?.click()}
                >
                  {file ? copy.replaceFileAction : copy.chooseFileAction}
                </Button>
                {file && (
                  <Button
                    variant="ghost"
                    disabled={mutation.isPending}
                    onClick={() => {
                      setFile(null);
                      dirty.current =
                        JSON.stringify(input) !==
                        JSON.stringify(initialInput.current);
                      setValidation((current) => ({ ...current, file: '' }));
                      mutation.reset();
                      chooseButton.current?.focus();
                    }}
                  >
                    {copy.removeFileAction}
                  </Button>
                )}
              </div>
            </DropZone>
            <p className="m-0 text-xs text-tertiary">{copy.fileHint}</p>
            <p
              id="document-file-validation"
              className="m-0 text-sm text-error-primary"
              role={validation.file ? 'alert' : undefined}
            >
              {validation.file}
            </p>
          </div>
        )}
        {existing && (
          <div className="grid gap-1 rounded-xl border border-secondary bg-secondary_subtle p-4">
            <p className="m-0 text-sm font-medium text-primary wrap-anywhere">
              {existing.fileName}
            </p>
            <p className="m-0 text-xs text-tertiary">
              {copy.immutableFileHint}
            </p>
          </div>
        )}
        <Field labelText={copy.titleLabel}>
          <Input
            name="title"
            value={input.title}
            maxLength={300}
            placeholder={copy.titlePlaceholder}
            aria-invalid={Boolean(validation.title)}
            aria-describedby={
              validation.title ? 'document-metadata-validation' : undefined
            }
            onChange={(event) => change('title', event.target.value)}
            disabled={mutation.isPending}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field labelText={copy.categoryLabel}>
            <Select
              name="documentType"
              value={input.documentType}
              disabled={mutation.isPending}
              aria-invalid={Boolean(validation.documentType)}
              aria-describedby={
                validation.documentType
                  ? 'document-metadata-validation'
                  : undefined
              }
              onValueChange={(value) =>
                change('documentType', DocumentTypeSchema.parse(value))
              }
            >
              {Object.entries(copy.categories).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field labelText={copy.childLabel}>
            <Select
              name="childId"
              value={input.childId ?? ''}
              disabled={mutation.isPending}
              aria-invalid={Boolean(validation.childId)}
              aria-describedby={
                validation.childId ? 'document-metadata-validation' : undefined
              }
              onValueChange={(value) => change('childId', value || null)}
            >
              <option value={noChild}>{copy.personalOption}</option>
              {childrenProfiles.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
              {existing?.childId &&
                !childrenProfiles.some(
                  (child) => child.id === existing.childId,
                ) && (
                  <option value={existing.childId}>{copy.childLabel}</option>
                )}
            </Select>
          </Field>
        </div>
        {Object.entries(validation).some(
          ([key, value]) => key !== 'file' && value,
        ) && (
          <p
            id="document-metadata-validation"
            role="alert"
            className="m-0 text-sm text-error-primary"
          >
            {Object.entries(validation)
              .filter(([key]) => key !== 'file')
              .map(([, value]) => value)
              .filter(Boolean)
              .join(' ')}
          </p>
        )}
        <MutationError error={childrenError} />
        <MutationError error={mutation.error} />
        {cancelled && (
          <p role="status" className="m-0 text-sm text-secondary">
            {copy.cancelledHint}
          </p>
        )}
        {!existing && mutation.isPending && (
          <div
            role="status"
            aria-live="polite"
            className="grid gap-2 rounded-xl bg-secondary_subtle p-4"
          >
            <p className="m-0 flex items-center gap-2 text-sm font-medium text-primary">
              <Spinner className="size-4" />
              {copy.uploadingTitle}
            </p>
            <p className="m-0 text-xs text-secondary">{copy.uploadingHint}</p>
          </div>
        )}
        <div className="flex flex-wrap justify-end gap-3 border-t border-secondary pt-5">
          {!existing && mutation.isPending ? (
            <Button
              variant="secondary"
              onClick={() => abortRef.current?.abort()}
            >
              {copy.cancelUploadAction}
            </Button>
          ) : (
            <Button
              variant="secondary"
              disabled={mutation.isPending}
              onClick={dismiss}
            >
              {copy.cancelAction}
            </Button>
          )}
          <Button type="submit" loading={mutation.isPending}>
            {existing ? copy.saveAction : copy.uploadAction}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
