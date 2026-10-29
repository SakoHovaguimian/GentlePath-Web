'use client';

import { DirectoryFilters, Field, Select } from '@/components/ui';
import { gentlePathBlogStrings as copy } from '@/strings';
import { BlogCategorySchema } from '../models/blogCategory';
import { BlogStatusSchema } from '../models/blogStatus';
import type { BlogQuery } from '../models/blogQuery';

const allStatusesValue = '';

export function BlogFilters({
  query,
  onChangeAction,
  admin = false,
}: {
  query: BlogQuery;
  onChangeAction: (query: BlogQuery) => void;
  admin?: boolean;
}) {
  return (
    <DirectoryFilters
      id={admin ? 'admin-blog-search' : 'journal-search'}
      value={{ query: query.query, status: query.category }}
      onChange={(value) =>
        onChangeAction({
          ...query,
          query: value.query,
          category: value.status,
          offset: 0,
        })
      }
      statuses={BlogCategorySchema.options.map((value) => ({
        value,
        label: copy.categories[value],
      }))}
      copy={{
        search: copy.searchLabel,
        placeholder: admin
          ? copy.adminSearchPlaceholder
          : copy.searchPlaceholder,
        clear: copy.clearSearch,
        status: copy.categoryLabel,
        allStatuses: copy.allCategories,
      }}
      additionalFilters={
        admin ? (
          <Field labelText={copy.statusLabel} orientation="inline">
            <Select
              value={query.status || ''}
              onValueChange={(value) =>
                onChangeAction({
                  ...query,
                  status: BlogStatusSchema.safeParse(value).data,
                  offset: 0,
                })
              }
            >
              <option value={allStatusesValue}>{copy.allStatuses}</option>
              {BlogStatusSchema.options.map((value) => (
                <option key={value} value={value}>
                  {copy.statuses[value]}
                </option>
              ))}
            </Select>
          </Field>
        ) : undefined
      }
    />
  );
}
