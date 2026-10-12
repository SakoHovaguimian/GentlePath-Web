import { Children, Fragment, isValidElement, type ReactNode } from 'react';
import type { SelectOption } from '../models/selectOption';

function textContent(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) =>
      isValidElement<{ children?: ReactNode }>(child)
        ? textContent(child.props.children)
        : String(child),
    )
    .join('');
}

// Keep existing option authoring; the shared Select owns the rendered collection.
export function selectOptions(children: ReactNode): SelectOption[] {
  return Children.toArray(children).flatMap((child) => {
    if (
      !isValidElement<{
        children?: ReactNode;
        value?: string | number;
        disabled?: boolean;
      }>(child)
    )
      return [];
    if (child.type === Fragment) return selectOptions(child.props.children);
    if (child.type !== 'option') return [];
    const label = textContent(child.props.children);
    return [
      {
        value: String(child.props.value ?? label),
        label,
        disabled: child.props.disabled ?? false,
      },
    ];
  });
}
