import { DirectoryFilters, Field, Select } from '@/components/ui';
import { gentlePathNotificationInboxStrings as copy } from '@/strings';
import type { NotificationInboxQuery } from '../models/notificationInboxQuery';

const anyCategory = '';
const ascendingOrder = 'asc';
const descendingOrder = 'desc';

export function NotificationDirectoryFilters({
  query,
  update,
}: {
  query: NotificationInboxQuery;
  update: (values: Record<string, string | undefined>) => void;
}) {
  return (
    <DirectoryFilters
      id="notification-search"
      value={{
        query: query.query ?? '',
        status: query.read === undefined ? undefined : String(query.read),
      }}
      onChange={(value) =>
        update({
          query: value.query.trim().slice(0, 200) || undefined,
          read: value.status,
          offset: undefined,
        })
      }
      statuses={[
        { value: String(false), label: copy.readStatuses.unread },
        { value: String(true), label: copy.readStatuses.read },
      ]}
      copy={{
        search: copy.searchLabel,
        placeholder: copy.searchPlaceholder,
        clear: copy.clearSearchAction,
        status: copy.readLabel,
        allStatuses: copy.allReadStatuses,
      }}
      layout="stackedSearch"
      additionalFilters={
        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          <Field labelText={copy.categoryLabel}>
            <Select
              value={query.category ?? ''}
              onValueChange={(category) =>
                update({ category: category || undefined, offset: undefined })
              }
            >
              <option value={anyCategory}>{copy.allCategories}</option>
              {Object.entries(copy.categories).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field labelText={copy.sortLabel}>
            <Select
              value={query.sortOrder}
              onValueChange={(sortOrder) =>
                update({
                  sortOrder: sortOrder === 'asc' ? 'asc' : undefined,
                  offset: undefined,
                })
              }
            >
              <option value={descendingOrder}>{copy.newestOption}</option>
              <option value={ascendingOrder}>{copy.oldestOption}</option>
            </Select>
          </Field>
        </div>
      }
    />
  );
}
