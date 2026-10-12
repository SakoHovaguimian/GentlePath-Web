import { UiIcon, type IconName } from '@/components/ui';
import { strings } from '@/strings';
import { ShowcaseSection } from './ShowcaseSection';

const copy = strings.componentLibrary;
const colors = [
  { label: copy.colorLabels.primary, token: '--color-accent' },
  { label: copy.colorLabels.softGreen, token: '--color-bg-brand-primary' },
  { label: copy.colorLabels.surface, token: '--color-bg-primary' },
  { label: copy.colorLabels.border, token: '--color-border-secondary' },
  { label: copy.colorLabels.text, token: '--color-text-primary' },
  { label: copy.colorLabels.muted, token: '--color-text-tertiary' },
  { label: copy.colorLabels.success, token: '--color-success-600' },
  { label: copy.colorLabels.warning, token: '--color-warning-500' },
  { label: copy.colorLabels.error, token: '--color-error-500' },
];
const corners = [0, 6, 10, 14, 20, 28];
const icons: IconName[] = ['home', 'box', 'tag', 'user', 'settings', 'search'];

export function FoundationsShowcase() {
  return (
    <ShowcaseSection
      id="foundations"
      title={copy.foundations}
      description={copy.foundationsHint}
      icon="home"
    >
      <div className="grid gap-3">
        <h4 className="m-0 text-sm font-medium text-primary">{copy.colors}</h4>
        <div className="grid grid-cols-3 gap-x-2 gap-y-4 sm:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-9">
          {colors.map(({ label, token }) => (
            <div key={token} className="grid justify-items-start gap-2">
              <span
                aria-hidden="true"
                className="size-10 rounded-full border border-secondary shadow-xs"
                style={{ backgroundColor: `var(${token})` }}
              />
              <span className="text-xs text-secondary">{label}</span>
            </div>
          ))}
        </div>
        <p className="m-0 text-xs text-tertiary">{copy.accessibleGreen}</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid content-start gap-3">
          <h4 className="m-0 text-sm font-medium text-primary">
            {copy.radius}
          </h4>
          <div className="flex flex-wrap gap-3">
            {corners.map((radius, index) => (
              <div key={radius} className="grid justify-items-center gap-1">
                <span
                  aria-hidden="true"
                  className="size-9 border border-secondary bg-secondary_subtle"
                  style={{ borderRadius: radius }}
                />
                <span className="text-xs text-secondary">
                  {copy.radiusLabels[index]}
                </span>
                <span className="text-xs text-tertiary">
                  {copy.pixels(radius)}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid content-start gap-3">
          <h4 className="m-0 text-sm font-medium text-primary">
            {copy.spacing}
          </h4>
          <div className="flex min-h-16 flex-wrap items-end gap-3">
            {[4, 8, 16, 24, 32, 48].map((space) => (
              <div key={space} className="grid justify-items-center gap-1">
                <span
                  aria-hidden="true"
                  className="block rounded-sm bg-brand-secondary"
                  style={{
                    width: Math.max(space, 8),
                    height: Math.max(space, 8),
                  }}
                />
                <span className="text-xs text-tertiary">{space}</span>
              </div>
            ))}
          </div>
          <p className="m-0 text-xs text-tertiary">{copy.spacingHint}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-secondary pt-4">
        {icons.map((icon) => (
          <span
            key={icon}
            className="rounded-md border border-secondary p-1.5 text-secondary"
          >
            <UiIcon name={icon} />
          </span>
        ))}
        <p className="m-0 text-xs text-tertiary">{copy.iconsHint}</p>
      </div>
      <div>
        <h4 className="m-0 text-sm font-medium text-primary">
          {copy.typography}
        </h4>
        <p className="m-0 mt-1 text-xs text-tertiary">{copy.typographyHint}</p>
      </div>
      <div>
        <h4 className="m-0 text-sm font-medium text-primary">{copy.motion}</h4>
        <p className="m-0 mt-1 text-xs text-tertiary">{copy.motionHint}</p>
        <p className="m-0 mt-1 text-xs text-tertiary">
          {copy.reducedMotionHint}
        </p>
      </div>
    </ShowcaseSection>
  );
}
