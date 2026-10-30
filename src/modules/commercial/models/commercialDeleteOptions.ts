import type { RefObject } from 'react';
import type { CommercialEntity, CommercialRecord } from './commercialEntity';

export interface CommercialDeleteOptions {
  entity: CommercialEntity;
  record?: CommercialRecord;
  dirty: RefObject<boolean>;
  busy: RefObject<boolean>;
  onDeleted: () => void;
}
