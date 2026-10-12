'use client';

import { useState } from 'react';
import { Chip, SelectionTile, UiIcon, type IconName } from '@/components/ui';
import { strings } from '@/strings';
import { useListMotion } from '@/components/ui/lib/useListMotion';
import { ShowcaseSection } from './ShowcaseSection';
const copy = strings.componentLibrary;
const tiles: {
  key: keyof typeof copy.categoryLabels;
  icon: IconName;
  selected?: boolean;
  disabled?: boolean;
}[] = [
  { key: 'flower', icon: 'leaf', selected: true },
  { key: 'edibles', icon: 'file' },
  { key: 'extracts', icon: 'code', selected: true },
  { key: 'topicals', icon: 'layers', selected: true },
  { key: 'accessories', icon: 'bag', selected: true },
  { key: 'cbd', icon: 'info', selected: true },
  { key: 'cookies', icon: 'file' },
  { key: 'gummies', icon: 'bag', selected: true },
  { key: 'bongs', icon: 'globe' },
  { key: 'vapes', icon: 'settings', selected: true },
  { key: 'liquids', icon: 'layers', selected: true },
  { key: 'hardCandies', icon: 'user', selected: true },
  { key: 'preRolls', icon: 'settings' },
  { key: 'jello', icon: 'lock', disabled: true },
];

export function TilesShowcase() {
  const [selected, setSelected] = useState<string[]>(
    tiles.filter((tile) => tile.selected).map((tile) => tile.key),
  );
  const listRef = useListMotion<HTMLUListElement>();
  return (
    <ShowcaseSection
      id="tiles"
      title={copy.tiles}
      description={copy.tilesHint}
      icon="tag"
    >
      <fieldset className="grid gap-2 sm:grid-cols-2">
        <legend className="sr-only">{copy.categories}</legend>
        {tiles.map((tile) => (
          <SelectionTile
            key={tile.key}
            label={copy.categoryLabels[tile.key]}
            icon={<UiIcon name={tile.icon} />}
            disabled={tile.disabled}
            checked={selected.includes(tile.key)}
            onChange={(event) =>
              setSelected((current) =>
                event.target.checked
                  ? [...current, tile.key]
                  : current.filter((key) => key !== tile.key),
              )
            }
          />
        ))}
      </fieldset>
      <ul
        ref={listRef}
        aria-label={copy.selectedCategories}
        className="m-0 flex list-none flex-wrap gap-2 p-0"
      >
        {tiles
          .filter((tile) => selected.includes(tile.key))
          .map((tile) => (
            <li key={tile.key} data-motion-key={tile.key}>
              <Chip
                selected
                icon={<UiIcon name={tile.icon} className="size-4" />}
              >
                {copy.categoryLabels[tile.key]}
              </Chip>
            </li>
          ))}
      </ul>
    </ShowcaseSection>
  );
}
