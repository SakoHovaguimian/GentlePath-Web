'use client';

import {
  Button as AriaButton,
  ColorArea,
  ColorPicker,
  ColorSlider,
  ColorSwatch,
  ColorThumb,
  Dialog,
  DialogTrigger,
  Popover,
  SliderTrack,
} from 'react-aria-components';
import { strings } from '@/strings';
import type { ColorInputProps } from '../models/colorInputProps';
import { Button } from './Button';
import { UiIcon } from './UiIcon';

export function ColorInput({
  label,
  value,
  onChange,
  disabled,
  ...props
}: ColorInputProps) {
  const copy = strings.ui.colorInput;
  return (
    <DialogTrigger>
      <AriaButton
        {...props}
        isDisabled={disabled}
        className="ui-input flex min-h-12 w-full min-w-0 cursor-pointer items-center gap-3 rounded-lg border border-[var(--color-control-border)] bg-primary px-4 py-2.5 text-left text-sm text-primary outline-none hover:border-primary focus-visible:border-brand focus-visible:ring-4 focus-visible:ring-brand/12 aria-invalid:border-error aria-invalid:focus-visible:ring-error/12 disabled:cursor-not-allowed disabled:border-secondary disabled:bg-disabled_subtle disabled:text-disabled"
      >
        {value ? (
          <ColorSwatch
            color={value}
            className="size-5 shrink-0 rounded border border-secondary"
          />
        ) : (
          <span className="size-5 shrink-0 rounded border border-secondary bg-secondary_subtle" />
        )}
        <span className="min-w-0 flex-1 font-mono wrap-anywhere">
          {value || copy.choose}
        </span>
        <UiIcon name="chevronDown" className="size-4 text-tertiary" />
      </AriaButton>
      <Popover
        offset={6}
        className="ui-popover z-[100] w-72 max-w-[calc(100vw-1.5rem)] rounded-xl border border-secondary bg-primary p-4 shadow-[var(--dashboard-shell-shadow-lg)]"
      >
        <Dialog aria-label={label} className="outline-none">
          {({ close }) => (
            <ColorPicker
              defaultValue={value || undefined}
              onChange={(color) => onChange(color.toString('hex'))}
            >
              {({ color }) => (
                <div className="grid gap-4">
                  <ColorArea
                    aria-label={copy.saturationBrightness}
                    colorSpace="hsb"
                    xChannel="saturation"
                    yChannel="brightness"
                    className="h-44 w-full rounded-lg border border-secondary"
                  >
                    <ColorThumb className="size-5 rounded-full border-2 border-primary shadow-xs data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-brand" />
                  </ColorArea>
                  <ColorSlider
                    aria-label={copy.hue}
                    colorSpace="hsb"
                    channel="hue"
                    className="flex min-h-11 items-center"
                  >
                    <SliderTrack className="h-4 w-full rounded-full">
                      <ColorThumb className="top-1/2 size-5 rounded-full border-2 border-primary shadow-xs data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-brand" />
                    </SliderTrack>
                  </ColorSlider>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-sm text-primary">
                      {color.toString('hex')}
                    </span>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        onChange(color.toString('hex'));
                        close();
                      }}
                    >
                      {copy.done}
                    </Button>
                  </div>
                </div>
              )}
            </ColorPicker>
          )}
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}
