import {
  Badge,
  Button,
  Card,
  IconButton,
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
  onEdit,
  onDelete,
}: {
  document: CareDocument;
  childName?: string;
  downloading: boolean;
  deleting: boolean;
  onDownload: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <IconTile intent="brand">
          <UiIcon name="file" className="size-6" />
        </IconTile>
        <Badge intent="neutral">{copy.formats[document.mimeType]}</Badge>
      </div>
      <div className="grid min-w-0 gap-2">
        <h2 className="m-0 font-display text-xl font-normal text-primary wrap-anywhere">
          {document.title}
        </h2>
        <p className="m-0 text-xs text-tertiary wrap-anywhere">
          {document.fileName}
        </p>
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <Badge intent="brand">{copy.categories[document.documentType]}</Badge>
        <Badge intent={document.childId ? 'purple' : 'neutral'}>
          {document.childId && <UiIcon name="user" className="size-3.5" />}
          {document.childId
            ? (childName ?? copy.childLabel)
            : copy.personalLabel}
        </Badge>
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
        <Button
          variant="secondary"
          loading={downloading}
          disabled={deleting}
          aria-label={copy.downloadLabel(document.title)}
          onClick={onDownload}
        >
          <UiIcon name="arrowUp" className="size-4 rotate-180" />
          {copy.downloadAction}
        </Button>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            disabled={deleting || downloading}
            aria-label={copy.editLabel(document.title)}
            onClick={onEdit}
          >
            {copy.editAction}
          </Button>
          <IconButton
            variant="destructive"
            disabled={deleting || downloading}
            label={copy.deleteLabel(document.title)}
            onClick={onDelete}
          >
            <UiIcon name="trash" className="size-4" />
          </IconButton>
        </div>
      </div>
    </Card>
  );
}
