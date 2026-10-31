'use client';
import { DirectoryFilters, Field, MultiSelect, Select } from '@/components/ui';
import { gentlePathMilestoneAdminStrings as copy } from '@/strings';
import { milestoneQueryTags } from '../models/milestoneAdminQuery';
import type { MilestoneDirectoryFiltersProps } from '../models/milestoneDirectoryFiltersProps';
import { TipApprovalStatusSchema } from '../models/tipApprovalStatus';
import { MilestoneProgressStateSchema } from '../models/milestoneProgressState';
const allMilestonesChoice = '';
const allTagsChoice = '';
export function MilestoneDirectoryFilters({
  query,
  onChange,
  tips = false,
  statuses = false,
  milestones,
  tags = [],
  progress = false,
  multipleTags = false,
}: MilestoneDirectoryFiltersProps) {
  const selectedTags = milestoneQueryTags(query);
  const tagOptions = [...new Set([...tags, ...selectedTags])].sort((a, b) =>
    a.localeCompare(b, 'en-US'),
  );
  return (
    <div className="grid min-w-0 gap-3">
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
            {progress && (
              <Field labelText={copy.progressLabel}>
                <MultiSelect
                  value={query.progress?.split(',') ?? []}
                  options={MilestoneProgressStateSchema.options.map(
                    (value) => ({
                      value,
                      label: copy.progressStates[value],
                    }),
                  )}
                  label={copy.progressLabel}
                  placeholder={copy.allProgressStates}
                  selectionLabel={copy.progressSelection}
                  clearLabel={copy.clearProgress}
                  onValueChange={(values) =>
                    onChange({ progress: values.join(','), offset: 0 })
                  }
                />
              </Field>
            )}
            {milestones && (
              <Field labelText={copy.milestoneLabel}>
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
            <Field labelText={multipleTags ? copy.tagsLabel : copy.tagLabel}>
              {multipleTags ? (
                <MultiSelect
                  value={selectedTags}
                  options={tagOptions.map((tag) => ({
                    value: tag,
                    label: tag,
                  }))}
                  label={copy.tagsLabel}
                  placeholder={copy.allTags}
                  selectionLabel={copy.tagSelection}
                  clearLabel={copy.clearTags}
                  maxSelections={30}
                  aria-describedby="milestone-tag-filter-hint"
                  onValueChange={(values) =>
                    onChange({
                      tags: values.length ? values : undefined,
                      tag: undefined,
                      offset: 0,
                    })
                  }
                />
              ) : (
                <Select
                  value={query.tag}
                  onValueChange={(value) => onChange({ tag: value, offset: 0 })}
                >
                  <option value={allTagsChoice}>{copy.allTags}</option>
                  {tagOptions.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field labelText={copy.pageSizeLabel}>
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
      {multipleTags && (
        <p id="milestone-tag-filter-hint" className="m-0 text-xs text-tertiary">
          {copy.tagFilterHint}
        </p>
      )}
    </div>
  );
}
