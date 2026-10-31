import type { Resource } from './resource';

export interface ResourceCardProps {
  resource: Resource;
  onSave?: (resource: Resource) => void;
  busy?: boolean;
  headingLevel?: 'h2' | 'h3';
}
