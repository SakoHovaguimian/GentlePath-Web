import type { CommercialEntity } from './commercialEntity';
export interface CommercialFormField {
  key: string;
  label: string;
  kind?:
    | 'text'
    | 'textarea'
    | 'url'
    | 'email'
    | 'datetime'
    | 'number'
    | 'select'
    | 'boolean'
    | 'platforms'
    | 'reference';
  options?: Readonly<Record<string, string>>;
  reference?: CommercialEntity;
  optional?: boolean;
  max?: number;
  min?: number;
  createOnly?: boolean;
  editOnly?: boolean;
}
export type CommercialFormValues = Record<string, string | boolean | string[]>;
