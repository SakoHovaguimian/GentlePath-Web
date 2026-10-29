import type { ApiClientInterface } from '@/services/api/apiClientInterface';
import { ApiError } from '@/errors/domainErrors';
import { gentlePathEditorialStrings as copy } from '@/strings';
import { validateInput } from '@/utils/validateInput';
import {
  GuideSchema,
  GuideInputSchema,
  GuideItemsInputSchema,
  type GuideInput,
} from '../models/guide';
import { GuideOrderSchema, type GuideOrder } from '../models/guideOrder';
import type { GuideItemInput } from '../models/guideItem';
import {
  EditorialResourceSchema,
  EditorialResourceInputSchema,
  type EditorialResourceInput,
} from '../models/editorialResource';
import { editorialPageSchema } from '../models/editorialPage';
import {
  editorialQueryParams,
  type EditorialQuery,
} from '../models/editorialQuery';

const read = '/portal/editorial';
const write = '/admin/editorial';

export class EditorialService {
  constructor(private readonly api: ApiClientInterface) {}
  async guides(query: EditorialQuery, signal?: AbortSignal) {
    return editorialPageSchema(GuideSchema).parse(
      await this.api.request(`${read}/guides?${editorialQueryParams(query)}`, {
        signal,
      }),
    );
  }
  async guide(id: string, signal?: AbortSignal) {
    return GuideSchema.parse(
      await this.api.request(`${read}/guides/${encodeURIComponent(id)}`, {
        signal,
      }),
    );
  }
  async saveGuide(input: GuideInput, id?: string) {
    return GuideSchema.parse(
      await this.api.request(
        `${write}/guides${id ? `/${encodeURIComponent(id)}` : ''}`,
        {
          method: id ? 'PUT' : 'POST',
          body: validateInput(GuideInputSchema, input),
        },
      ),
    );
  }
  async replaceGuideItems(id: string, items: GuideItemInput[]) {
    return GuideSchema.parse(
      await this.api.request(
        `${write}/guides/${encodeURIComponent(id)}/items`,
        {
          method: 'PUT',
          body: validateInput(GuideItemsInputSchema, { items }),
        },
      ),
    );
  }
  async reorderGuideItems(id: string, input: GuideOrder) {
    return GuideSchema.parse(
      await this.api.request(
        `${write}/guides/${encodeURIComponent(id)}/items/order`,
        { method: 'PUT', body: validateInput(GuideOrderSchema, input) },
      ),
    );
  }
  async deleteGuide(id: string) {
    await this.api.request(`${write}/guides/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }
  async resources(query: EditorialQuery, signal?: AbortSignal) {
    return editorialPageSchema(EditorialResourceSchema).parse(
      await this.api.request(
        `${read}/resources?${editorialQueryParams(query)}`,
        { signal },
      ),
    );
  }
  async resource(id: string, signal?: AbortSignal) {
    return EditorialResourceSchema.parse(
      await this.api.request(`${read}/resources/${encodeURIComponent(id)}`, {
        signal,
      }),
    );
  }
  async saveResource(input: EditorialResourceInput, id?: string) {
    return EditorialResourceSchema.parse(
      await this.api.request(
        `${write}/resources${id ? `/${encodeURIComponent(id)}` : ''}`,
        {
          method: id ? 'PUT' : 'POST',
          body: validateInput(EditorialResourceInputSchema, input),
        },
      ),
    );
  }
  async deleteResource(id: string) {
    await this.api.request(`${write}/resources/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }
  async collections(signal?: AbortSignal) {
    const data = [];
    let offset = 0;
    for (let pageNumber = 0; pageNumber < 1000; pageNumber++) {
      const result = await this.resources(
        { query: '', type: 'COLLECTION', limit: 100, offset },
        signal,
      );
      data.push(...result.data);
      if (!result.page.hasMore || result.page.nextOffset === null) return data;
      if (result.page.nextOffset <= offset)
        throw new ApiError(copy.validation.libraryDescription, 502);
      offset = result.page.nextOffset;
    }
    throw new ApiError(copy.validation.libraryDescription, 502);
  }
}
