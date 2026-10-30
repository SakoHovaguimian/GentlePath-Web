import type { IconMenuItem } from '@/components/ui/models/iconMenuItem';
import { SavedContentButton } from '@/modules/engagement/components/SavedContentButton';
import { gentlePathCommunityStrings as copy } from '@/strings';
import type { CommunityPostMenuAction } from '../models/communityPostMenuAction';

export function CommunityPostMenu({
  contentId,
  own,
  writable,
  busy,
  onHide,
  onReport,
  onEdit,
  onDelete,
}: {
  contentId: string;
  own: boolean;
  writable: boolean;
  busy: boolean;
  onHide: () => void;
  onReport: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const items: IconMenuItem<CommunityPostMenuAction>[] = [
    { id: 'hide', icon: 'close', label: copy.hidePost },
    {
      id: 'report',
      icon: 'warning',
      label: copy.reportPost,
      disabled: !writable,
    },
  ];
  if (own)
    items.push(
      {
        id: 'edit',
        icon: 'file',
        label: copy.editPost,
        disabled: !writable || busy,
      },
      {
        id: 'delete',
        icon: 'trash',
        label: copy.deletePost,
        variant: 'destructive',
        disabled: !writable || busy,
      },
    );

  return (
    <SavedContentButton
      contentType="POST"
      contentId={contentId}
      variant="menu"
      menuLabel={copy.postActions}
      menuItems={items}
      onMenuAction={(action) => {
        if (action === 'hide') onHide();
        else if (action === 'report') onReport();
        else if (action === 'edit') onEdit();
        else if (action === 'delete') onDelete();
      }}
    />
  );
}
