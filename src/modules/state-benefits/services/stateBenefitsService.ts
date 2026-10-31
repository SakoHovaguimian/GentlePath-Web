import { z } from 'zod';
import type { ApiClientInterface } from '@/services/api/apiClientInterface';
import { StateBenefitProgramSchema } from '../models/stateBenefitProgram';

export class StateBenefitsService {
  constructor(private readonly api: ApiClientInterface) {}

  async programs(signal?: AbortSignal) {
    return z
      .array(StateBenefitProgramSchema)
      .parse(await this.api.request('/portal/state-benefits', { signal }));
  }
  async program(id: string, signal?: AbortSignal) {
    return StateBenefitProgramSchema.parse(
      await this.api.request(
        `/portal/state-benefits/${encodeURIComponent(id)}`,
        { signal },
      ),
    );
  }
}
