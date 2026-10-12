'use client';
import { useState, type ComponentProps } from 'react';
import { Input } from './Input';
import { strings } from '@/strings';
import { Button } from './Button';
export function PasswordInput(
  props: Omit<ComponentProps<typeof Input>, 'type'>,
) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? 'text' : 'password'}
        className={`pr-32 ${props.className || ''}`}
      />
      <Button
        variant="ghost"
        type="button"
        disabled={props.disabled}
        aria-pressed={visible}
        aria-label={
          visible ? strings.auth.hidePassword : strings.auth.showPassword
        }
        className="absolute right-1 top-1/2 -translate-y-1/2 px-2 text-xs"
        onClick={() => setVisible((value) => !value)}
      >
        {visible ? strings.auth.hidePassword : strings.auth.showPassword}
      </Button>
    </div>
  );
}
