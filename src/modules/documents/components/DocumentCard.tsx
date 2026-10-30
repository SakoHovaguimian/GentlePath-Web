import {
  Badge,
  Button,
  Card,
  CardOpenButton,
  IconMenu,
  IconTile,
  UiIcon,
} from '@/components/ui';
import { gentlePathDocumentStrings as copy } from '@/strings';
import type { CareDocument } from '../models/careDocument';

const numericYear = 'numeric';

export function DocumentCard({
  document,
  childName,
  downloading,
  deleting,
  onDownload,
  onPreview,
  onEdit,
  onDelete,
}: {
  document: CareDocument;
  childName?: string;
  downloading: boolean;
  deleting: boolean;
  onDownload: () => void;
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="relative flex min-w-0 flex-col gap-4 hover:border-brand focus-within:border-brand">
      <div className="flex items-center justify-between gap-3">
        <IconTile intent="brand">
          <UiIcon name="file" className="size-6" />
        </IconTile>
        <IconMenu
          label={copy.actionsLabel(document.title)}
          disabled={deleting || downloading}
          items={[
            { id: 'edit', label: copy.editAction, icon: 'file' },
            { id: 'preview', label: copy.previewAction, icon: 'image' },
            { id: 'download', label: copy.downloadAction, icon: 'download' },
            {
              id: 'delete',
              label: copy.deleteAction,
              icon: 'trash',
              variant: 'destructive',
            },
          ]}
          onAction={(id) =>
            id === 'edit'
              ? onEdit()
              : id === 'preview'
                ? onPreview()
                : id === 'download'
                  ? onDownload()
                  : onDelete()
          }
        />
      </div>
      <div className="grid min-w-0 gap-2">
        <h2 className="m-0 font-display text-xl font-normal text-primary wrap-anywhere">
          <CardOpenButton
            type="button"
            className="ui-card-open cursor-pointer text-start outline-none"
            disabled={deleting || downloading}
            aria-label={copy.editLabel(document.title)}
            onClick={onEdit}
          >
            {document.title}
          </CardOpenButton>
        </h2>
        <p className="m-0 text-xs text-tertiary wrap-anywhere">
          {document.fileName}
        </p>
      </div>
      <div className="mt-auto grid gap-1 pt-2 text-xs text-tertiary">
        <p className="m-0">
          {copy.uploadedDescription(
            new Date(document.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: numericYear,
            }),
          )}
        </p>
        <p className="m-0">{copy.fileSizeDescription(document.sizeBytes)}</p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-secondary pt-4">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <Badge intent="neutral">{copy.formats[document.mimeType]}</Badge>
          <Badge intent="brand">{copy.categories[document.documentType]}</Badge>
          <Badge intent={document.childId ? 'purple' : 'neutral'}>
            {document.childId && <UiIcon name="user" className="size-3.5" />}
            {document.childId
              ? (childName ?? copy.childLabel)
              : copy.personalLabel}
          </Badge>
        </div>
        <Button
          variant="ghost"
          className="relative z-10 ms-auto gap-1.5 px-2"
          loading={downloading}
          disabled={deleting}
          aria-label={copy.downloadLabel(document.title)}
          onClick={onDownload}
        >
          <UiIcon name="download" className="size-4" />
          {copy.downloadAction}
        </Button>
      </div>
    </Card>
  );
}
