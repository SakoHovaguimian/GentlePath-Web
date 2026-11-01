import { DirectoryFilters, Field, Select } from '@/components/ui';
import { gentlePathPortalStrings as copy } from '@/strings';
import type { Resource } from '../models/resource';
import { resourceSortOptions } from '../models/resourceSort';
import { useResourceDirectory } from '../useResourceDirectory';

const allTags = '';

export function ResourceFilters({
  resources,
  directory,
}: {
  resources: Resource[];
  directory: ReturnType<typeof useResourceDirectory>;
}) {
  const tags = [
    ...new Set(resources.flatMap((resource) => resource.tags)),
  ].sort((left, right) => left.localeCompare(right, 'en-US'));
  // Retain a linked/previously selected tag even when its results are empty.
  if (directory.tag && !tags.includes(directory.tag)) tags.push(directory.tag);
  return (
    <DirectoryFilters
      id="resource-search"
      value={{
        query: directory.query,
        status: directory.category || undefined,
      }}
      onChange={(value) =>
        directory.update({
          query: value.query,
          status: value.status,
          offset: undefined,
        })
      }
      statuses={Object.entries(copy.resources.categories).map(
        ([value, label]) => ({
          value,
          label,
        }),
      )}
      copy={{
        search: copy.common.search,
        placeholder:
          directory.mode === 'collections'
            ? copy.resources.collectionSearchPlaceholder
            : copy.resources.searchPlaceholder,
        clear: copy.common.clear,
        status: copy.common.category,
        allStatuses: copy.common.allCategories,
      }}
      additionalFilters={
        <>
          <Field labelText={copy.resources.tagLabel}>
            <Select
              value={directory.tag}
              className="@4xl:w-40"
              onValueChange={(tag) =>
                directory.update({ tag: tag || undefined, offset: undefined })
              }
            >
              <option value={allTags}>{copy.resources.allTags}</option>
              {tags.map((tag) => (
                <option key={tag} value={tag}>
                  {copy.resources.categories[
                    tag as keyof typeof copy.resources.categories
                  ] ?? tag}
                </option>
              ))}
            </Select>
          </Field>
          <Field labelText={copy.resources.sortLabel}>
            <Select
              value={directory.sort}
              className="@4xl:w-44"
              onValueChange={(sort) =>
                directory.update({ sort, offset: undefined })
              }
            >
              {resourceSortOptions.map((sort) => (
                <option key={sort} value={sort}>
                  {copy.resources.sortOptions[sort]}
                </option>
              ))}
            </Select>
          </Field>
        </>
      }
    />
  );
}
