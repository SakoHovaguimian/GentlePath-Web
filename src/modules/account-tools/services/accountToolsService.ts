import type { ApiClientInterface } from '@/services/api/apiClientInterface';
import { validateInput } from '@/utils/validateInput';
import {
  AccountDeletionSchema,
  type AccountDeletion,
} from '../models/accountDeletion';
import { AccountDeviceSchema } from '../models/accountDevice';
import {
  AccountDeviceQuerySchema,
  type AccountDeviceQuery,
} from '../models/accountDeviceQuery';
import { accountToolsPageSchema } from '../models/accountToolsPage';
import {
  AccountToolsPagingSchema,
  type AccountToolsPaging,
} from '../models/accountToolsPaging';
import { NotificationDeliverySchema } from '../models/notificationDelivery';
import { NotificationDeliveryAttemptSchema } from '../models/notificationDeliveryAttempt';
import {
  NotificationDeliveryQuerySchema,
  type NotificationDeliveryQuery,
} from '../models/notificationDeliveryQuery';
import {
  AIUsageEventSchema,
  AIUsageEventInputSchema,
  type AIUsageEventInput,
} from '../models/aiUsageEvent';
import { AIUsageQuerySchema, type AIUsageQuery } from '../models/aiUsageQuery';
import {
  LegalInformationSchema,
  LegalContextSchema,
  type LegalContext,
} from '../models/legalInformation';
import { FrequentlyAskedQuestionsSchema } from '../models/frequentlyAskedQuestions';
import { accountToolsQueryParams } from '../accountToolsQueryParams';

const base = '/portal/account-tools';
const admin = '/admin/account-tools';
export class AccountToolsService {
  constructor(private readonly api: ApiClientInterface) {}

  async deleteAccount(input: AccountDeletion) {
    await this.api.request(`${base}/account`, {
      method: 'DELETE',
      body: validateInput(AccountDeletionSchema, input),
    });
  }
  async devices(query: AccountDeviceQuery, signal?: AbortSignal) {
    return accountToolsPageSchema(AccountDeviceSchema).parse(
      await this.api.request(
        `${base}/devices?${accountToolsQueryParams(validateInput(AccountDeviceQuerySchema, query))}`,
        { signal },
      ),
    );
  }
  async removeDevice(id: string) {
    await this.api.request(`${base}/devices/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }
  async deliveries(query: NotificationDeliveryQuery, signal?: AbortSignal) {
    return accountToolsPageSchema(NotificationDeliverySchema).parse(
      await this.api.request(
        `${admin}/deliveries?${accountToolsQueryParams(validateInput(NotificationDeliveryQuerySchema, query))}`,
        { signal },
      ),
    );
  }
  async deliveryAttempts(
    id: string,
    paging: AccountToolsPaging,
    signal?: AbortSignal,
  ) {
    return accountToolsPageSchema(NotificationDeliveryAttemptSchema).parse(
      await this.api.request(
        `${admin}/deliveries/${encodeURIComponent(id)}/attempts?${accountToolsQueryParams(validateInput(AccountToolsPagingSchema, paging))}`,
        { signal },
      ),
    );
  }
  async aiUsage(query: AIUsageQuery, signal?: AbortSignal) {
    return accountToolsPageSchema(AIUsageEventSchema).parse(
      await this.api.request(
        `${admin}/ai-usage?${accountToolsQueryParams(validateInput(AIUsageQuerySchema, query))}`,
        { signal },
      ),
    );
  }
  async saveAIUsage(input: AIUsageEventInput, id?: string) {
    return AIUsageEventSchema.parse(
      await this.api.request(
        `${admin}/ai-usage${id ? `/${encodeURIComponent(id)}` : ''}`,
        {
          method: id ? 'PATCH' : 'POST',
          body: validateInput(AIUsageEventInputSchema, input),
        },
      ),
    );
  }
  async deleteAIUsage(id: string) {
    await this.api.request(`${admin}/ai-usage/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }
  async legal(context: LegalContext, signal?: AbortSignal) {
    return LegalInformationSchema.parse(
      await this.api.request(
        `${base}/legal?${accountToolsQueryParams({ context: LegalContextSchema.parse(context) })}`,
        { signal },
      ),
    );
  }
  async faq(signal?: AbortSignal) {
    return FrequentlyAskedQuestionsSchema.parse(
      await this.api.request(`${base}/faq`, { signal }),
    );
  }
}
