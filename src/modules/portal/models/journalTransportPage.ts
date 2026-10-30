import { editorialPageSchema } from '@/modules/editorial/models/editorialPage';
import { JournalTransportSchema } from './journalTransport';

export const JournalTransportPageSchema = editorialPageSchema(
  JournalTransportSchema,
);
