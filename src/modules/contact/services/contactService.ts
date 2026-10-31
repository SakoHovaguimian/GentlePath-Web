import type { ApiClientInterface } from '@/services/api/apiClientInterface';
import {
  ContactRequestSchema,
  type ContactRequest,
} from '../models/contactRequest';
import { ContactReceiptSchema } from '../models/contactReceipt';

export class ContactService {
  constructor(private readonly api: ApiClientInterface) {}

  async send(input: ContactRequest) {
    return ContactReceiptSchema.parse(
      await this.api.request('/contact', {
        method: 'POST',
        body: ContactRequestSchema.parse(input),
      }),
    );
  }
}
