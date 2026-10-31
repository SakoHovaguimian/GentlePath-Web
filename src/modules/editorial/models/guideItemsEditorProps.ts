import type { GuideDraftItem } from './guideDraftItem';
import type { EditorialFormErrors } from './editorialFormErrors';

export interface GuideItemsEditorProps {
  items: GuideDraftItem[];
  errors: EditorialFormErrors;
  disabled: boolean;
  onUploadStateChange: (busy: boolean) => void;
  onChangeAction: (items: GuideDraftItem[]) => void;
}
