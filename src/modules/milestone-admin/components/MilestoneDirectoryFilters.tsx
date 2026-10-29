'use client';
import { DirectoryFilters, Field, Select } from '@/components/ui';
import { gentlePathMilestoneAdminStrings as copy } from '@/strings';
import type { MilestoneAdminQuery } from '../models/milestoneAdminQuery';
import { TipApprovalStatusSchema } from '../models/tipApprovalStatus';
const allMilestonesChoice = '';
const allTagsChoice = '';
interface MilestoneDirectoryFiltersProps {
  query: MilestoneAdminQuery;
  onChange: (values: Record<string, string | number | undefined>) => void;
  tips?: boolean;
  statuses?: boolean;
  milestones?: Array<{ id: string; milestone: string }>;
  tags?: string[];
}
export function MilestoneDirectoryFilters({
  query,
  onChange,
  tips = false,
  statuses = false,
  milestones,
  tags = [],
}: MilestoneDirectoryFiltersProps) {
  return (
    <DirectoryFilters
      id={tips ? 'family-tips-search' : 'milestone-guidance-search'}
      value={{ query: query.query, status: query.approval_status ?? '' }}
      statuses={TipApprovalStatusSchema.options.map((value) => ({
        value,
        label: copy.statuses[value],
      }))}
      showStatus={statuses}
      onChange={(value) =>
        onChange({
          query: value.query,
          approval_status: value.status,
          offset: 0,
        })
      }
      copy={{
        search: copy.searchLabel,
        placeholder: tips ? copy.searchTips : copy.searchMilestones,
        clear: copy.clearSearch,
        status: copy.statusLabel,
        allStatuses: copy.allStatuses,
      }}
      additionalFilters={
        <>
          {milestones && (
            <Field labelText={copy.milestoneLabel} orientation="inline">
              <Select
                value={query.milestone_id}
                onValueChange={(value) =>
                  onChange({ milestone_id: value, offset: 0 })
                }
              >
                <option value={allMilestonesChoice}>
                  {copy.allMilestones}
                </option>
                {milestones.map((milestone) => (
                  <option key={milestone.id} value={milestone.id}>
                    {milestone.milestone}
                  </option>
                ))}
              </Select>
            </Field>
          )}
          <Field labelText={copy.tagLabel} orientation="inline">
            <Select
              value={query.tag}
              onValueChange={(value) => onChange({ tag: value, offset: 0 })}
            >
              <option value={allTagsChoice}>{copy.allTags}</option>
              {[...new Set([...tags, ...(query.tag ? [query.tag] : [])])]
                .sort((a, b) => a.localeCompare(b, 'en-US'))
                .map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
            </Select>
          </Field>
          <Field labelText={copy.pageSizeLabel} orientation="inline">
            <Select
              value={String(query.limit)}
              onValueChange={(value) =>
                onChange({ limit: Number(value), offset: 0 })
              }
            >
              {[9, 25, 50, 100].map((limit) => (
                <option key={limit} value={String(limit)}>
                  {limit}
                </option>
              ))}
            </Select>
          </Field>
        </>
      }
    />
  );
}
