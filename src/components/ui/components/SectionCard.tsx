import type { ComponentProps } from 'react';
import { Card } from './Card';
import { FormSection } from './FormSection';

export function SectionCard({
  className,
  ...props
}: ComponentProps<typeof FormSection>) {
  return (
    <Card className={className}>
      <FormSection {...props} />
    </Card>
  );
}
